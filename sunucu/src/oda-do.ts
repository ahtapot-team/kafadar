// Her oda bir Durable Object: durum depoda, soketler hibernation API ile (boştaki oda süre tüketmez).
// Protokol (adres, mesajlar): src/oda/mesaj.ts; kurallar: src/oda/oda.ts.
import { DurableObject } from 'cloudflare:workers';
import {
  BOSTA_MS,
  type OdaDurum,
  QUIZ_SORU_MS,
  SORU_MS,
  final,
  gorunum,
  isle,
  odaKur,
  onOnFinal,
  quizFinal,
  silinmeli,
} from '../../src/oda/oda';
import { acilisOku, kimlikMesaji, mesajiOlayaCevir } from '../../src/oda/mesaj';
import { type Ek, type Env, KIMLIK_MS, gonder, hataSoketi } from './ortak';

export class Oda extends DurableObject<Env> {
  async varMi() {
    return (await this.yukle()) !== undefined;
  }
  // Önceki sürümde kurulmuş odalarda yeni alanlar yoktur: OK mu NOK mu odası sayılır.
  private async yukle() {
    const d = await this.ctx.storage.get<OdaDurum>('d');
    if (d) {
      d.tur ??= 'ok-mu-nok';
      d.acik ??= false;
      d.puanlar ??= {};
      d.puanGecmis ??= [];
    }
    return d;
  }
  private async kaydet(d: OdaDurum) {
    await this.ctx.storage.put('d', d);
    await this.alarmKur(d);
  }
  // Sıradaki uyanma: soru süresi dolunca, boşta/bitiş silme zamanı ya da kimlik bekleyen soketin zaman aşımı (hangisi önceyse).
  private alarmKur(d: OdaDurum) {
    const silme =
      (d.asama === 'bitti' ? (d.bitis ?? d.sonEtkinlik) : d.sonEtkinlik) +
      BOSTA_MS;
    // 10/10 ama açıklaması süresiz bekler: o sırada soru süresi alarmı kurulmaz.
    const sure =
      d.asama === 'soru' && !d.acik
        ? d.baslangic + (d.tur === 'quiz-night' ? QUIZ_SORU_MS : SORU_MS)
        : Infinity;
    const bekleyen = this.bekleyenler().map((a) => (a.bas ?? 0) + KIMLIK_MS);
    return this.ctx.storage.setAlarm(Math.min(silme, sure, ...bekleyen) + 1);
  }
  private ek(ws: WebSocket): Ek {
    return (ws.deserializeAttachment() ?? {}) as Ek;
  }
  private bekleyenler() {
    return this.ctx
      .getWebSockets()
      .map((w) => this.ek(w))
      .filter((a) => !a.kimlik && a.bas !== undefined);
  }
  private yayinla(d: OdaDurum) {
    const simdi = Date.now();
    for (const ws of this.ctx.getWebSockets()) {
      const { kimlik } = this.ek(ws);
      if (!kimlik) continue; // henüz kimlik doğrulanmadı
      try {
        gonder(ws, { t: 'gorunum', gorunum: gorunum(d, kimlik, simdi), simdi });
        if (d.asama === 'bitti')
          gonder(ws, {
            t: 'final',
            final:
              d.tur === 'on-on-ama'
                ? onOnFinal(d)
                : d.tur === 'quiz-night'
                  ? quizFinal(d)
                  : final(d),
          });
      } catch {
        /* kapanmakta olan soket: diğerlerine yayın sürsün */
      }
    }
  }
  // Kimlik doğrulanmış soketi odaya bağlar ve ilk durumu yayınlar.
  private async baglandi(ws: WebSocket, d: OdaDurum, kimlik: string) {
    ws.serializeAttachment({ kimlik } satisfies Ek);
    const ad = d.oyuncular.find((p) => p.kimlik === kimlik)?.ad;
    gonder(ws, { t: 'tamam', kod: d.kod, kimlik, ad, tur: d.tur });
    await this.kaydet(d);
    this.yayinla(d);
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
    const acilis = acilisOku(url.searchParams);
    if (!acilis) return hataSoketi('tanimsiz', 'Geçersiz istek.');
    const islem = acilis.islem;
    const { 0: istemci, 1: sunucu } = new WebSocketPair();

    if (islem === 'don') {
      // Belirteç ilk mesajda gelir (adreste değil); gelene kadar yalnızca bekleyen soket.
      this.ctx.acceptWebSocket(sunucu);
      sunucu.serializeAttachment({ bas: simdi } satisfies Ek);
      await this.alarmKur(d);
      return new Response(null, { status: 101, webSocket: istemci });
    }

    // 'kur': kimlik, Worker'ın kendi ürettiği iç başlıktan; 'katil': sunucu burada üretir.
    const ic = istek.headers.get('x-ic-kimlik');
    const sonuc =
      islem === 'kur' && ic
        ? isle(d, { tip: 'don', kimlik: ic }, simdi)
        : isle(
            d,
            {
              tip: 'katil',
              ad: acilis.islem === 'katil' ? acilis.ad : '',
              kimlik: crypto.randomUUID(),
            },
            simdi,
          );
    if (sonuc.hata) return hataSoketi(sonuc.hata.kod, sonuc.hata.mesaj);
    const kimlik = islem === 'kur' && ic ? ic : sonuc.kimlik!;
    this.ctx.acceptWebSocket(sunucu);
    await this.baglandi(sunucu, sonuc.durum, kimlik);
    return new Response(null, { status: 101, webSocket: istemci });
  }

  async webSocketMessage(ws: WebSocket, mesaj: string | ArrayBuffer) {
    let m: unknown;
    try {
      m = JSON.parse(String(mesaj));
    } catch {
      return;
    }
    const { kimlik } = this.ek(ws);

    if (!kimlik) {
      // Bekleyen 'don' soketi: yalnızca {t:'kimlik'} kabul edilir.
      const hataKapat = (kod: string, mesaj: string) => {
        gonder(ws, { t: 'hata', hata: { kod, mesaj } });
        ws.close(1000, 'hata');
      };
      const gelen = kimlikMesaji(m);
      if (gelen === null) return hataKapat('tanimsiz', 'Önce kimlik gönderin.');
      const d = await this.yukle();
      if (!d) return hataKapat('kapali', 'Oda bulunamadı ya da kapandı.');
      const s = isle(d, { tip: 'don', kimlik: gelen }, Date.now());
      if (s.hata) return hataKapat(s.hata.kod, s.hata.mesaj);
      return this.baglandi(ws, s.durum, gelen);
    }

    const olay = mesajiOlayaCevir(m, kimlik);
    if (!olay) {
      // Bozuk Quiz Night şıkkı sessizce yutulmaz: istemci hata alır.
      const x = m as { t?: unknown; sik?: unknown } | null;
      if (x?.t === 'cevapla' && x.sik !== undefined)
        gonder(ws, {
          t: 'hata',
          hata: { kod: 'gecersiz', mesaj: 'Şık 0–3 arasında olmalı.' },
        });
      return;
    }
    const d = await this.yukle();
    if (!d) return;
    const s = isle(d, olay, Date.now());
    if (s.hata) return gonder(ws, { t: 'hata', hata: s.hata });
    await this.kaydet(s.durum);
    this.yayinla(s.durum);
  }

  // Kimlik soket kapanmadan ÖNCE okunmalı (kapanan soketin eki okunamaz).
  private async kopar(ws: WebSocket, kimlik?: string) {
    if (!kimlik) return; // kimliksiz bekleyen soket
    const baska = this.ctx
      .getWebSockets()
      .some((x) => x !== ws && this.ek(x).kimlik === kimlik);
    const d = await this.yukle();
    if (!d || baska) return;
    const s = isle(d, { tip: 'kop', kimlik }, Date.now());
    if (s.hata) return;
    await this.kaydet(s.durum);
    this.yayinla(s.durum);
  }
  // Kapanış el sıkışması sunucuda tamamlanmazsa tarayıcı soketi CLOSING'de takılı kalabilir; kod geçerliyse aynen yansıtılır.
  async webSocketClose(ws: WebSocket, code: number) {
    const { kimlik } = this.ek(ws);
    const gecerli =
      code >= 1000 && code < 5000 && ![1004, 1005, 1006, 1015].includes(code);
    try {
      ws.close(gecerli ? code : 1000, 'kapandı');
    } catch {
      /* zaten kapalı */
    }
    await this.kopar(ws, kimlik);
  }
  async webSocketError(ws: WebSocket) {
    const { kimlik } = this.ek(ws);
    try {
      ws.close(1011, 'hata');
    } catch {
      /* zaten kapalı */
    }
    await this.kopar(ws, kimlik);
  }

  // Soru süresi dolunca ilerletir; kimlik göndermeyen soketi kapatır; boşta/bitmiş oda 1 saat sonra silinir (KK-39).
  async alarm() {
    const d = await this.yukle();
    if (!d) return;
    const simdi = Date.now();
    for (const ws of this.ctx.getWebSockets()) {
      const a = this.ek(ws);
      if (!a.kimlik && a.bas !== undefined && simdi - a.bas >= KIMLIK_MS) {
        gonder(ws, {
          t: 'hata',
          hata: {
            kod: 'tanimsiz',
            mesaj: 'Kimlik gelmedi, bağlantı kapatıldı.',
          },
        });
        ws.close(1000, 'kimlik zaman aşımı');
      }
    }
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
