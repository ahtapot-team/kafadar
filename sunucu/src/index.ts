// Oda sunucusu: ince kabuk. Kurallar src/oda/oda.ts'te (saf); burada yalnızca ağ, saat, kimlik ve saklama var.
//
// Tek WebSocket: GET /ws?islem=kur&ad=Ali&paket=arkadas|cift|aile
//                GET /ws?islem=katil&kod=ABCD&ad=Ali
//                GET /ws?islem=don&kod=ABCD&kimlik=<belirteç>        (yeniden bağlanma)
// sunucu → istemci (JSON, `t` alanı):
//   {t:'tamam', kod, kimlik, ad}          kur/katil/don başarısı (ad: "Ali 2" çözülmüş)
//   {t:'gorunum', gorunum, simdi}         her durum değişiminde, kişiye özel; simdi = sunucu saati (ms)
//   {t:'final', final}                    yalnızca oyun bitince
//   {t:'hata', hata:{kod,mesaj}}          Türkçe mesaj; bağlanma hatasında soket kapanır, oyun içi hatada açık kalır
// istemci → sunucu: {t:'baslat'} | {t:'cevapla', oy:'OK'|'NOK'} | {t:'ayril'}
import { DurableObject } from 'cloudflare:workers';
import type { Deste } from '../../src/core/deste';
import {
  BOSTA_MS,
  type Olay,
  type OdaDurum,
  SORU_MS,
  denemeSiniri,
  final,
  gorunum,
  isle,
  kodUret,
  odaKur,
  silinmeli,
} from '../../src/oda/oda';
import aile from '../../content/decks/aile.json';
import arkadas from '../../content/decks/arkadas.json';
import cift from '../../content/decks/cift.json';

type Env = {
  ODA: DurableObjectNamespace<Oda>;
  SINIR: DurableObjectNamespace<Sinir>;
};

const DESTELER: Record<string, Deste> = { arkadas, cift, aile };
const gonder = (ws: WebSocket, govde: object) => ws.send(JSON.stringify(govde));

// Tarayıcılar yükseltme öncesi HTTP hata gövdesini okuyamaz; hata bir WS çerçevesi olarak gider, sonra soket kapanır.
function hataSoketi(kod: string, mesaj: string): Response {
  const { 0: istemci, 1: sunucu } = new WebSocketPair();
  sunucu.accept();
  gonder(sunucu, { t: 'hata', hata: { kod, mesaj } });
  sunucu.close(1000, 'hata');
  return new Response(null, { status: 101, webSocket: istemci });
}

// Kriptografik rastgelelik (oda kodu, tohum, oyuncu belirteci): yalnızca burada üretilir.
const rastgele = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

export default {
  async fetch(istek: Request, env: Env): Promise<Response> {
    const url = new URL(istek.url);
    if (url.pathname !== '/ws')
      return new Response('Kafadar oda sunucusu', { status: 200 });
    const q = url.searchParams;
    const islem = q.get('islem');

    if (islem === 'kur') {
      const deste = DESTELER[q.get('paket') ?? 'arkadas'];
      if (!deste) return hataSoketi('tanimsiz', 'Bilinmeyen deste.');
      for (let i = 0; i < 5; i++) {
        const kod = kodUret(rastgele);
        const kimlik = crypto.randomUUID();
        const oda = env.ODA.get(env.ODA.idFromName(kod));
        const yanit = await oda.fetch('https://oda/kur', {
          method: 'POST',
          body: JSON.stringify({
            kod,
            kurucuAd: q.get('ad') ?? '',
            kurucuKimlik: kimlik,
            deste,
            tohum: Math.floor(rastgele() * 2 ** 32),
          }),
        });
        if (yanit.status === 200)
          return oda.fetch(
            `https://oda/ws?islem=don&kod=${kod}&kimlik=${kimlik}`,
            istek,
          );
      }
      return hataSoketi('dolu', 'Oda kurulamadı, tekrar deneyin.');
    }

    if (islem !== 'katil' && islem !== 'don')
      return hataSoketi('tanimsiz', 'Geçersiz istek.');
    const kod = (q.get('kod') ?? '').toUpperCase();
    // Kod denemeleri istemci IP'sine göre hız sınırlıdır (KK-30). Yalnızca ISKALAYAN denemeler sayılır:
    // aynı Wi-Fi'daki (aynı IP) 12 oyuncunun katılışı engellenmesin. Belirteçle yeniden bağlanma sayılmaz.
    const ip = istek.headers.get('CF-Connecting-IP') ?? 'bilinmiyor';
    const sinir = env.SINIR.get(env.SINIR.idFromName(ip));
    if (islem === 'katil' && !(await sinir.dene(ip)))
      return hataSoketi(
        'cok-deneme',
        'Çok fazla kod denediniz. Biraz bekleyin.',
      );
    if (!/^[A-Z2-9]{4}$/.test(kod))
      return hataSoketi('kapali', 'Oda bulunamadı.');
    const oda = env.ODA.get(env.ODA.idFromName(kod));
    if (islem === 'katil' && (await oda.varMi())) await sinir.iade(ip);
    return oda.fetch(`https://oda/ws?${q.toString()}`, istek);
  },
};

// Her oda bir Durable Object: durum depoda, WebSocket'ler hibernation API ile (boştaki oda süre tüketmez).
export class Oda extends DurableObject<Env> {
  async varMi() {
    return (await this.yukle()) !== undefined;
  }
  private yukle() {
    return this.ctx.storage.get<OdaDurum>('d');
  }
  private async kaydet(d: OdaDurum) {
    await this.ctx.storage.put('d', d);
    // Sıradaki uyanma: soru süresi dolunca ya da boşta/bitiş silme zamanı (hangisi önceyse).
    const silme =
      (d.asama === 'bitti' ? (d.bitis ?? d.sonEtkinlik) : d.sonEtkinlik) +
      BOSTA_MS;
    const sure = d.asama === 'soru' ? d.baslangic + SORU_MS : Infinity;
    await this.ctx.storage.setAlarm(Math.min(silme, sure) + 1);
  }
  private yayinla(d: OdaDurum) {
    const simdi = Date.now();
    for (const ws of this.ctx.getWebSockets()) {
      const [kimlik] = this.ctx.getTags(ws);
      gonder(ws, { t: 'gorunum', gorunum: gorunum(d, kimlik, simdi), simdi });
      if (d.asama === 'bitti') gonder(ws, { t: 'final', final: final(d) });
    }
  }

  async fetch(istek: Request): Promise<Response> {
    const url = new URL(istek.url);
    if (url.pathname === '/kur') {
      if (await this.yukle()) return new Response('var', { status: 409 });
      const s = (await istek.json()) as Parameters<typeof odaKur>[0] & {
        kurucuKimlik: string;
      };
      const { durum } = odaKur({ ...s, simdi: Date.now() });
      await this.kaydet(durum);
      return new Response('ok');
    }

    const d = await this.yukle();
    if (!d) return hataSoketi('kapali', 'Oda bulunamadı ya da kapandı.');
    const simdi = Date.now();
    const verilen = url.searchParams.get('kimlik');
    const sonuc = verilen
      ? isle(d, { tip: 'don', kimlik: verilen }, simdi)
      : isle(
          d,
          {
            tip: 'katil',
            ad: url.searchParams.get('ad') ?? '',
            kimlik: crypto.randomUUID(),
          },
          simdi,
        );
    if (sonuc.hata) return hataSoketi(sonuc.hata.kod, sonuc.hata.mesaj);
    const kimlik = verilen ?? sonuc.kimlik!;
    const { 0: istemci, 1: sunucu } = new WebSocketPair();
    this.ctx.acceptWebSocket(sunucu, [kimlik]);
    const ad = sonuc.durum.oyuncular.find((p) => p.kimlik === kimlik)?.ad;
    gonder(sunucu, { t: 'tamam', kod: d.kod, kimlik, ad });
    await this.kaydet(sonuc.durum);
    this.yayinla(sonuc.durum);
    return new Response(null, { status: 101, webSocket: istemci });
  }

  async webSocketMessage(ws: WebSocket, mesaj: string | ArrayBuffer) {
    const [kimlik] = this.ctx.getTags(ws);
    let m: { t?: string; oy?: string };
    try {
      m = JSON.parse(String(mesaj));
    } catch {
      return;
    }
    let olay: Olay;
    if (m.t === 'baslat') olay = { tip: 'baslat', kimlik };
    else if (m.t === 'ayril') olay = { tip: 'ayril', kimlik };
    else if (m.t === 'cevapla' && (m.oy === 'OK' || m.oy === 'NOK'))
      olay = { tip: 'cevapla', kimlik, oy: m.oy };
    else return;
    const d = await this.yukle();
    if (!d) return;
    const s = isle(d, olay, Date.now());
    if (s.hata) return gonder(ws, { t: 'hata', hata: s.hata });
    await this.kaydet(s.durum);
    this.yayinla(s.durum);
  }

  private async kopar(ws: WebSocket) {
    const [kimlik] = this.ctx.getTags(ws);
    const baska = this.ctx.getWebSockets(kimlik).some((x) => x !== ws);
    const d = await this.yukle();
    if (!d || baska) return;
    const s = isle(d, { tip: 'kop', kimlik }, Date.now());
    if (s.hata) return;
    await this.kaydet(s.durum);
    this.yayinla(s.durum);
  }
  webSocketClose(ws: WebSocket) {
    return this.kopar(ws);
  }
  webSocketError(ws: WebSocket) {
    return this.kopar(ws);
  }

  // Soru süresi dolunca ilerletir; boşta/bitmiş oda 1 saat sonra tamamen silinir (KK-39).
  async alarm() {
    const d = await this.yukle();
    if (!d) return;
    const simdi = Date.now();
    if (silinmeli(d, simdi)) {
      for (const ws of this.ctx.getWebSockets()) ws.close(1000, 'Oda kapandı');
      await this.ctx.storage.deleteAlarm();
      await this.ctx.storage.deleteAll();
      return;
    }
    const s = isle(d, { tip: 'zaman' }, simdi);
    await this.kaydet(s.durum);
    this.yayinla(s.durum);
  }
}

// Kod denemesi sayacı: IP başına bir nesne (KK-30).
export class Sinir extends DurableObject<Env> {
  // Denemeyi sayar; sınır aşıldıysa false.
  async dene(ip: string): Promise<boolean> {
    const s = denemeSiniri(await this.ctx.storage.get('k'), ip, Date.now());
    await this.ctx.storage.put('k', s.kayit);
    await this.ctx.storage.setAlarm(Date.now() + 120_000);
    return s.izin;
  }
  // Var olan odaya katılım ıskalama değildir: son denemeyi geri alır.
  async iade(ip: string) {
    const kayit = ((await this.ctx.storage.get('k')) ?? {}) as Record<
      string,
      number[]
    >;
    kayit[ip]?.pop();
    await this.ctx.storage.put('k', kayit);
  }
  async alarm() {
    await this.ctx.storage.deleteAll();
  }
}
