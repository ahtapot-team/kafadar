// 10/10 ama odası uçtan uca: N betikli istemci 10 kart oynar (puan, açıklama, kuran "Sonraki", final).
// Kullanım: node sunucu/test/onon.ts <http-adresi> [oyuncuSayisi=4]
import assert from 'node:assert/strict';

const taban = process.argv[2];
const N = Number(process.argv[3] ?? 4);
assert(taban && N >= 2 && N <= 12, 'kullanım: onon.ts <adres> [2-12]');

type Gorunum = {
  asama: string;
  tur?: string;
  soruNo?: number;
  benimPuanim?: number | null;
  sonrakiGorunur?: boolean;
  aciklama?: {
    puanlar: Record<string, number | null>;
    ortalama: number | null;
  };
};
type Istemci = {
  ad: string;
  kod: string;
  tur: string;
  ws: WebSocket;
  gorunum?: Gorunum;
  final?: {
    kartlar: unknown[];
    oduller: unknown;
    kisisel: Record<string, unknown>;
  };
  hata?: { kod: string };
};

function baglan(sorgu: string): Promise<Istemci> {
  return new Promise((coz) => {
    const ws = new WebSocket(`${taban.replace(/^http/, 'ws')}/ws?${sorgu}`);
    const i: Istemci = { ad: '', kod: '', tur: '', ws };
    ws.onclose = () => coz(i);
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.t === 'tamam') {
        Object.assign(i, { ad: m.ad, kod: m.kod, tur: m.tur });
        coz(i);
      } else if (m.t === 'gorunum') i.gorunum = m.gorunum;
      else if (m.t === 'final') i.final = m.final;
      else if (m.t === 'hata') {
        i.hata = m.hata;
        if (!i.ad) coz(i);
      }
    };
  });
}
const bekle = async (kosul: () => boolean, ms = 20_000) => {
  const bas = Date.now();
  while (!kosul()) {
    if (Date.now() - bas > ms) throw new Error('zaman aşımı');
    await new Promise((r) => setTimeout(r, 25));
  }
};

const asil = await baglan('islem=kur&ad=Ali&oyun=on-on-ama&paket=gundelik');
assert.equal(asil.tur, 'on-on-ama');
assert.match(asil.kod, /^\d{6}$/);
const istemciler = [asil];
for (let i = 1; i < N; i++) {
  const c = await baglan(`islem=katil&kod=${asil.kod}&ad=Can`);
  assert.equal(c.tur, 'on-on-ama', 'katılan odanın oyununu alır (KK-63)');
  istemciler.push(c);
}
await bekle(() => asil.gorunum?.asama === 'lobi');
asil.ws.send(JSON.stringify({ t: 'baslat' }));
await bekle(() => istemciler.every((i) => i.gorunum?.asama === 'soru'));

// OK mu NOK mu mesajı bu odada reddedilir
istemciler[1].ws.send(JSON.stringify({ t: 'cevapla', oy: 'OK' }));
await bekle(() => istemciler[1].hata?.kod === 'gecersiz');
istemciler[1].hata = undefined;

for (let kart = 1; kart <= 10; kart++) {
  await bekle(() =>
    istemciler.every((i) => i.gorunum?.soruNo === kart && !i.gorunum.aciklama),
  );
  // Açıklamadan önce kimse başkasının puanını görmez
  istemciler.forEach((i, k) =>
    i.ws.send(JSON.stringify({ t: 'puanla', puan: (k * 3 + kart) % 11 })),
  );
  await bekle(() => istemciler.every((i) => i.gorunum?.aciklama));
  const a = istemciler.map((i) => JSON.stringify(i.gorunum!.aciklama));
  assert(
    a.every((x) => x === a[0]),
    'açıklama her telefonda aynı',
  );
  // Yalnızca kuranda "Sonraki kart"
  assert.equal(istemciler.filter((i) => i.gorunum?.sonrakiGorunur).length, 1);
  assert.equal(asil.gorunum?.sonrakiGorunur, true);
  istemciler[1].ws.send(JSON.stringify({ t: 'sonraki' }));
  await bekle(() => istemciler[1].hata?.kod === 'yetkisiz');
  istemciler[1].hata = undefined;
  asil.ws.send(JSON.stringify({ t: 'sonraki' }));
}
await bekle(() =>
  istemciler.every((i) => i.gorunum?.asama === 'bitti' && i.final),
);
const f = asil.final!;
assert.equal(f.kartlar.length, 10);
assert.equal(Object.keys(f.kisisel).length, N);
console.log(
  `TAMAM: 10/10 ama, ${N} istemci, 10 kart, final ${f.kartlar.length} kart`,
);
istemciler.forEach((i) => i.ws.close());
