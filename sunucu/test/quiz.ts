// Quiz Night odası uçtan uca (issue #252, KK-113): N betikli istemci 10 soru oynar (cevap kilidi, gizlilik, açıklama, kuran "Sonraki", final).
// Kullanım: node sunucu/test/quiz.ts <http-adresi> [oyuncuSayisi=3]
import assert from 'node:assert/strict';

const taban = process.argv[2];
const N = Number(process.argv[3] ?? 3);
assert(taban && N >= 2 && N <= 12, 'kullanım: quiz.ts <adres> [2-12]');

type Gorunum = {
  asama: string;
  tur?: string;
  soruNo?: number;
  kalanMs?: number;
  soru?: { metin: string; secenekler: string[] };
  benimSikkim?: number | null;
  sonrakiGorunur?: boolean;
  aciklama?: { dogru: number; secimler: Record<string, number | null> };
};
type Istemci = {
  ad: string;
  kod: string;
  tur: string;
  ws: WebSocket;
  gorunum?: Gorunum;
  ham: string[];
  final?: {
    paket: string;
    siralama: { ad: string; dogru: number; katsayi: number; sira: number }[];
    sorular: unknown[];
  };
  hata?: { kod: string };
};

function baglan(sorgu: string): Promise<Istemci> {
  return new Promise((coz) => {
    const ws = new WebSocket(`${taban.replace(/^http/, 'ws')}/ws?${sorgu}`);
    const i: Istemci = { ad: '', kod: '', tur: '', ws, ham: [] };
    ws.onclose = () => coz(i);
    ws.onmessage = (e) => {
      i.ham.push(String(e.data));
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
const yolla = (i: Istemci, m: unknown) => i.ws.send(JSON.stringify(m));

// Bilinmeyen quiz paketi reddedilir
const kotu = await baglan('islem=kur&ad=Ali&oyun=quiz-night&paket=yok-boyle');
assert.equal(kotu.hata?.kod, 'tanimsiz', 'bilinmeyen quiz paketi');

const asil = await baglan(
  'islem=kur&ad=Ali&oyun=quiz-night&paket=hababam-sinifi',
);
assert.equal(asil.tur, 'quiz-night');
assert.match(asil.kod, /^\d{6}$/);
const istemciler = [asil];
for (let i = 1; i < N; i++) {
  const c = await baglan(`islem=katil&kod=${asil.kod}&ad=Can`);
  assert.equal(c.tur, 'quiz-night', 'katılan odanın oyununu alır (KK-63)');
  istemciler.push(c);
}
await bekle(() => asil.gorunum?.asama === 'lobi');
yolla(asil, { t: 'baslat' });
await bekle(() => istemciler.every((i) => i.gorunum?.asama === 'soru'));

// Başka oyunun mesajı bu odada reddedilir
yolla(istemciler[1], { t: 'cevapla', oy: 'OK' });
await bekle(() => istemciler[1].hata?.kod === 'gecersiz');
istemciler[1].hata = undefined;
yolla(istemciler[1], { t: 'cevapla', sik: 4 });
await bekle(() => istemciler[1].hata?.kod === 'gecersiz');
istemciler[1].hata = undefined;

for (let soru = 1; soru <= 10; soru++) {
  await bekle(() =>
    istemciler.every((i) => i.gorunum?.soruNo === soru && !i.gorunum.aciklama),
  );
  // Soru sürerken doğru şık, kaynak ve uyum hiçbir telefonda yok
  for (const i of istemciler) {
    const son = i.ham[i.ham.length - 1];
    assert.doesNotMatch(son, /dogru|kaynaklar|uyum/, 'sızıntı yok');
    assert(
      (i.gorunum!.kalanMs ?? 0) > 0 && (i.gorunum!.kalanMs ?? 0) <= 20_000,
    );
  }
  istemciler.forEach((i, k) => yolla(i, { t: 'cevapla', sik: (k + soru) % 4 }));
  await bekle(() => istemciler.every((i) => i.gorunum?.aciklama));
  // Cevap kilitli: ikinci cevap reddedilir
  yolla(istemciler[0], { t: 'cevapla', sik: 3 });
  await bekle(() => istemciler[0].hata?.kod === 'gecersiz');
  istemciler[0].hata = undefined;
  const a = istemciler.map((i) => JSON.stringify(i.gorunum!.aciklama));
  assert(
    a.every((x) => x === a[0]),
    'açıklama her telefonda aynı',
  );
  assert.equal(istemciler[0].gorunum!.benimSikkim, soru % 4);
  // Yalnızca kuranda "Sonraki soru"
  assert.equal(istemciler.filter((i) => i.gorunum?.sonrakiGorunur).length, 1);
  assert.equal(asil.gorunum?.sonrakiGorunur, true);
  yolla(istemciler[1], { t: 'sonraki' });
  await bekle(() => istemciler[1].hata?.kod === 'yetkisiz');
  istemciler[1].hata = undefined;
  yolla(asil, { t: 'sonraki' });
}
await bekle(() =>
  istemciler.every((i) => i.gorunum?.asama === 'bitti' && i.final),
);
const f = asil.final!;
assert.equal(f.sorular.length, 10);
assert.equal(f.siralama.length, N);
assert(f.siralama.every((s) => s.sira >= 1 && s.dogru >= 0 && s.dogru <= 10));
assert.doesNotMatch(JSON.stringify(f), /kaynaklar|uyum/);
console.log(`TAMAM: Quiz Night, ${N} istemci, 10 soru, final ${f.paket}`);
istemciler.forEach((i) => i.ws.close());
