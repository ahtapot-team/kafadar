// Ağ üzerinden uçtan uca deneme: N betikli istemci tek oyun oynar (2–12).
// Kullanım: node sunucu/test/oyun.ts <http-adresi> [oyuncuSayisi=4]   (ör. http://localhost:8787)
import assert from 'node:assert/strict';
import { request as httpIstek } from 'node:http';
import { request as httpsIstek } from 'node:https';

const taban = process.argv[2];
const N = Number(process.argv[3] ?? 4);
assert(taban && N >= 2 && N <= 12, 'kullanım: oyun.ts <adres> [2-12]');

type Hata = { kod: string; mesaj: string };
type Gorunum = { asama: string; soruNo?: number; oyuncular: unknown[] };
type Final = { yuzdeler: unknown[]; kimNeDedi: Record<string, unknown> };
type Istemci = {
  ad: string;
  kimlik: string;
  kod: string;
  ws: WebSocket;
  gorunum?: Gorunum;
  final?: Final;
  hata?: Hata;
  kapandi: boolean;
};

// Bağlanır; ilk 'tamam' ya da 'hata' çerçevesini bekler.
function baglan(sorgu: string, ilk?: object): Promise<Istemci> {
  assert(!sorgu.includes('kimlik'), 'belirteç adreste olmamalı');
  return new Promise((coz) => {
    const ws = new WebSocket(`${taban.replace(/^http/, 'ws')}/ws?${sorgu}`);
    const i: Istemci = { ad: '', kimlik: '', kod: '', ws, kapandi: false };
    if (ilk) ws.onopen = () => ws.send(JSON.stringify(ilk));
    ws.onclose = () => {
      i.kapandi = true;
      coz(i);
    };
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.t === 'tamam') {
        Object.assign(i, { ad: m.ad, kimlik: m.kimlik, kod: m.kod });
        coz(i);
      } else if (m.t === 'gorunum') i.gorunum = m.gorunum;
      else if (m.t === 'final') i.final = m.final;
      else if (m.t === 'hata') {
        i.hata = m.hata;
        coz(i);
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

const kuran = await baglan('islem=kur&ad=Ali&paket=arkadas');
assert.match(kuran.kod, /^\d{6}$/);
const istemciler = [kuran];
for (let i = 1; i < N; i++)
  istemciler.push(await baglan(`islem=katil&kod=${kuran.kod}&ad=Ali`)); // hepsi "Ali": isim kuralı
assert.deepEqual(
  istemciler.map((i) => i.ad),
  ['Ali', ...Array.from({ length: N - 1 }, (_, k) => `Ali ${k + 2}`)],
);
await bekle(() => kuran.gorunum?.oyuncular.length === N);

// Biçimi bozuk kodlar (5/7 hane, harf, boşluk) reddedilir
for (const kotu of ['12345', '1234567', 'ABCD12']) {
  const k = await baglan(`islem=katil&kod=${kotu}&ad=X`);
  assert.equal(k.hata?.kod, 'kapali', kotu);
}
// Yanlış kod: Türkçe hata çerçevesi
const yanlis = await baglan('islem=katil&kod=999999&ad=X');
assert.equal(yanlis.hata?.kod, 'kapali');
assert(yanlis.hata?.mesaj);

// WebSocket olmayan istek 426, bilinmeyen işlem 400 (500 değil)
assert.equal((await fetch(`${taban}/ws`)).status, 426);
const durumKodu = (yol: string) =>
  new Promise<number>((coz, red) => {
    const istek = taban.startsWith('https') ? httpsIstek : httpIstek;
    const r = istek(
      `${taban}${yol}`,
      { headers: { Connection: 'Upgrade', Upgrade: 'websocket' } },
      (y) => coz(y.statusCode ?? 0),
    );
    r.on('error', red).end();
  });
assert.equal(await durumKodu('/ws?islem=yok'), 400);
// Yanlış belirteç: hata çerçevesi
const sahte = await baglan(`islem=don&kod=${kuran.kod}`, {
  t: 'kimlik',
  kimlik: 'yanlis',
});
assert.equal(sahte.hata?.kod, 'tanimsiz');

// Yeniden bağlanma: kopan aynı belirteçle döner
const kopan = istemciler[1];
kopan.ws.close();
// Kapanış el sıkışması tamamlanmalı (tarayıcıda CLOSING'de takılmasın)
await bekle(() => kopan.ws.readyState === WebSocket.CLOSED, 5_000);
await bekle(
  () =>
    kuran.gorunum?.oyuncular.some((o) => !(o as { bagli: boolean }).bagli) ??
    false,
);
istemciler[1] = await baglan(`islem=don&kod=${kuran.kod}`, {
  t: 'kimlik',
  kimlik: kopan.kimlik,
});
assert.equal(istemciler[1].ad, kopan.ad);

kuran.ws.send(JSON.stringify({ t: 'baslat' }));
await bekle(() => kuran.gorunum?.asama === 'soru');
const gec = await baglan(`islem=katil&kod=${kuran.kod}&ad=Gec`);
assert.equal(gec.hata?.kod, 'basladi');

for (let soru = 1; soru <= 10; soru++) {
  await bekle(() => istemciler.every((i) => i.gorunum?.soruNo === soru));
  // Oylar finalden önce hiçbir istemciye gitmez
  for (const i of istemciler) assert(!i.final);
  istemciler.forEach((i, k) =>
    i.ws.send(JSON.stringify({ t: 'cevapla', oy: k % 3 === 0 ? 'NOK' : 'OK' })),
  );
}
await bekle(() =>
  istemciler.every((i) => i.gorunum?.asama === 'bitti' && i.final),
);
const f = kuran.final!;
assert.equal(f.yuzdeler.length, 10);
assert.equal(Object.keys(f.kimNeDedi).length, N);
console.log(
  `TAMAM: ${N} istemci, kod ${kuran.kod}, 10 soru, final ${f.yuzdeler.length} sonuç`,
);
istemciler.forEach((i) => i.ws.close());

// Opt-in (kur sayacını 1 dk doldurur): SINIR_TEST=1 node sunucu/test/oyun.ts <adres>
if (process.env.SINIR_TEST) {
  const sonuclar = [];
  for (let i = 0; i < 8; i++) sonuclar.push(await baglan('islem=kur&ad=Hizli'));
  assert(
    sonuclar.some((i) => i.hata?.kod === 'cok-deneme'),
    'kur hız sınırı yok',
  );
  sonuclar.forEach((i) => i.ws.close());
  console.log('TAMAM: kur hız sınırı');
}
