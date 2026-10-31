// Quiz Night Faz 2, oda modu (issue #252; backend #253, frontend #254). PRD v9: KK-113 (ayrıca KK-111, KK-114 oda kısmı, KK-70).
// SÖZLEŞME (backend #253 için) — src/oda/oda.ts (saf; Date.now, Math.random, ağ yok, KK-40). Mevcut odalarla aynı altyapı (lobi, kod,
// katılım, kop/don/ayril, silinmeli) KK-70 gereği AYNEN; yalnız yeni oda türü eklenir:
//   OdaTuru = 'ok-mu-nok' | 'on-on-ama' | 'quiz-night'
//   odaKur({ kod, kurucuAd, kurucuKimlik?, tohum, simdi, tur: 'quiz-night', quiz: QuizPaketi })      (quiz-night'ta `deste` verilmez)
//       QuizPaketi = { id, ad, unvanlar: string[4], sorular: Soru[] }  (Soru: src/games/quiz-night/quiz.ts; havuz fazladan alan
//       taşıyabilir: content/quiz JSON'unda `kaynaklar`, `uyum` var — bunlar HİÇBİR görünümde/mesajda yer almaz)
//       Sorular = turSec(quiz.sorular, tohum) (Faz 1 saf kuralı: 3 kolay, 4 orta, 3 zor, kolaydan zora, şıklar karışık, tohumlu).
//   SORU_MS değişmez (15 sn, diğer odalar). Quiz Night için süre: export const QUIZ_SORU_MS = 20_000.
//   Olay (yeni): { tip: 'cevapla', kimlik, sik: 0|1|2|3 }   — quiz odasında `sik`, OK mu NOK mu odasında `oy`; yanlış türde ya da
//       0–3 tam sayı olmayan `sik` → hata.kod 'gecersiz'. Cevap KİLİTLENİR: ikinci cevapla → 'gecersiz', durum değişmez.
//       Süre bitince (simdi − baslangic ≥ QUIZ_SORU_MS) gelen cevap → 'sure-doldu'. `puanla` quiz odasında 'gecersiz'.
//   Akış: lobi → soru (cevap toplanır) → açıklama → 'sonraki' → soru … → 'bitti' (10. açıklamadan sonra 'sonraki').
//       Açıklamaya geçiş: bağlı herkes cevapladıysa BEKLEMEDEN; ya da { tip: 'zaman' } ile süre dolunca. Açıklama süresiz bekler.
//       Cevap vermeyen ya da kopukken kaçırılan oyuncu o soruda YANLIŞ sayılır (null). 'sonraki' yalnızca açıklamadayken ve yalnızca
//       yetkiliye (kuran bağlıysa kuran, değilse oyuncu sırasıyla ilk bağlı oyuncu, KK-68): başkası 'yetkisiz', açıklama dışında 'gecersiz'.
//   gorunum(durum, kimlik, simdi) quiz odasında:
//       tur: 'quiz-night', asama, kod, oyuncular, toplam, cevapladi (adlar), baslatGorunur, baslatAktif  (mevcut alanlar aynı)
//       soruNo (1…10), kalanMs (soru aşamasında sunucu saatine göre; açıklamada undefined),
//       soru: { id, metin, secenekler, zorluk }  — `dogru`, `kaynaklar`, `uyum`, `tur` ALANI YOK (KK-66 gibi)
//       benimSikkim: number | null   — yalnızca KENDİ kilitli şıkkı
//       aciklama?: { dogru: number; secimler: Record<ad, number | null> } — yalnızca açıklamada, HER TELEFONDA AYNI (null = cevapsız)
//       sonrakiGorunur: boolean  — yalnızca açıklamada ve yalnızca yetkilide true
//     Açıklamadan önce hiçbir alanda başkasının şıkkı ve doğru şık yoktur (cevapladi yalnız ADLARI söyler).
//   quizFinal(durum): { paket: string /* ad */, siralama: { ad, dogru, katsayi, sira }[], sorular: { id, dogru, secimler }[] }
//       siralama = Faz 1 turSonucu ile aynı biçim ve kural (KK-114): doğru sayısı azalan, eşitse zorluk katsayılı toplam, o da eşitse
//       aynı sıra. sonucSatirlari / paylasimKarti (arayuz.ts) bu `siralama`yı DOĞRUDAN alır (KK-111). Ayrılanlar siralama'da yoktur.
import { describe, expect, it } from 'vitest';
import * as odaModulu from './oda';

// tsc, .ts uzantılı oyun modüllerini doğrudan içe aktarmayı reddeder; Faz 1 testleri gibi dinamik içe aktarılır.

type Zorluk = 'kolay' | 'orta' | 'zor';
type Soru = {
  id: string;
  metin: string;
  secenekler: string[];
  dogru: number;
  zorluk: Zorluk;
  tur: 'olay' | 'dunya';
  kaynaklar?: { ad: string; url: string }[];
  uyum?: number;
};
type QuizPaketi = {
  id: string;
  ad: string;
  unvanlar: string[];
  sorular: Soru[];
};
type Kimlik = string;
type Olay =
  | { tip: 'katil'; ad: string }
  | { tip: 'baslat' | 'kop' | 'don' | 'ayril' | 'sonraki'; kimlik: Kimlik }
  | { tip: 'cevapla'; kimlik: Kimlik; sik: number }
  | { tip: 'puanla'; kimlik: Kimlik; puan: number }
  | { tip: 'cevapla'; kimlik: Kimlik; oy: 'OK' | 'NOK' }
  | { tip: 'zaman' };
type Durum = { tur: string };
type Sonuc = {
  durum: Durum;
  hata?: { kod: string; mesaj: string };
  kimlik?: Kimlik;
  ad?: string;
};
type Gorunum = {
  tur?: string;
  asama: string;
  oyuncular: { ad: string; bagli: boolean }[];
  toplam: number;
  cevapladi: string[];
  soruNo?: number;
  kalanMs?: number;
  soru?: { id: string; metin: string; secenekler: string[]; zorluk: Zorluk };
  benimSikkim?: number | null;
  aciklama?: { dogru: number; secimler: Record<string, number | null> };
  sonrakiGorunur?: boolean;
};
type Satir = { ad: string; dogru: number; katsayi: number; sira: number };
type Final = {
  paket: string;
  siralama: Satir[];
  sorular: {
    id: string;
    dogru: number;
    secimler: Record<string, number | null>;
  }[];
};
type OdaApi = {
  odaKur(s: {
    kod: string;
    kurucuAd: string;
    tohum: number;
    simdi: number;
    tur: 'quiz-night' | 'ok-mu-nok';
    quiz?: QuizPaketi;
    deste?: unknown;
  }): { durum: Durum; kimlik: Kimlik };
  isle(d: Durum, o: Olay, simdi: number): Sonuc;
  gorunum(d: Durum, kimlik: Kimlik, simdi: number): Gorunum;
  quizFinal(d: Durum): Final;
  silinmeli(d: Durum, simdi: number): boolean;
  QUIZ_SORU_MS: number;
  BOSTA_MS: number;
};
type QuizModulu = {
  turSec(h: Soru[], tohum: number): Soru[];
  unvanSec(u: string[], puan: number): string;
};
type ArayuzModulu = {
  sonucSatirlari(s: Satir[], u: string[]): { ad: string; birinci: boolean }[];
  paylasimKarti(g: {
    mod: 'grup';
    paket: string;
    sonuc: Satir[];
    unvanlar: string[];
  }): { kupa: boolean; adlar: string[]; paket: string; unvan: string };
};
const yolQuiz = '../games/quiz-night/quiz';
const yolArayuz = '../games/quiz-night/arayuz';
const { turSec, unvanSec } = (await import(
  /* @vite-ignore */ yolQuiz
)) as unknown as QuizModulu;
const { sonucSatirlari, paylasimKarti } = (await import(
  /* @vite-ignore */ yolArayuz
)) as unknown as ArayuzModulu;
const O = odaModulu as unknown as OdaApi;

const T0 = 1_000_000;
const SURE = 20_000;
const havuz: Soru[] = (['kolay', 'orta', 'zor'] as const).flatMap((z, zi) =>
  Array.from({ length: 8 }, (_, i) => ({
    id: `${z}-${i}`,
    metin: `${z} soru ${i}?`,
    secenekler: [0, 1, 2, 3].map((s) => `${z}${i}-şık${s}`),
    dogru: (i + zi) % 4,
    zorluk: z,
    tur: i % 2 ? ('olay' as const) : ('dunya' as const),
    kaynaklar: [{ ad: 'Kaynak', url: 'https://ornek.invalid/gizli-kaynak' }],
    uyum: 0.91,
  })),
);
const PAKET: QuizPaketi = {
  id: 'deneme',
  ad: 'Deneme Dizisi',
  unvanlar: ['Yeni gelen', 'Seyirci', 'Fan', 'Efsane'],
  sorular: havuz,
};
const TOHUM = 7;
const TUR = turSec(havuz, TOHUM); // odanın soruları (sözleşme: turSec(quiz.sorular, tohum))

type Oda = { d: Durum; id: Kimlik[]; ad: string[] };
function kur(adlar: string[]): Oda {
  const k = O.odaKur({
    kod: '123456',
    kurucuAd: adlar[0],
    tohum: TOHUM,
    simdi: T0,
    tur: 'quiz-night',
    quiz: PAKET,
  });
  expect(k.durum.tur).toBe('quiz-night');
  const o: Oda = { d: k.durum, id: [k.kimlik], ad: [adlar[0]] };
  for (const a of adlar.slice(1)) {
    const s = O.isle(o.d, { tip: 'katil', ad: a }, T0);
    expect(s.hata).toBeUndefined();
    o.d = s.durum;
    o.id.push(s.kimlik!);
    o.ad.push(s.ad!);
  }
  return o;
}
const ok = (d: Durum, olay: Olay, t: number) => {
  const s = O.isle(d, olay, t);
  expect(s.hata, JSON.stringify(olay)).toBeUndefined();
  return s.durum;
};
const hataKodu = (d: Durum, olay: Olay, t: number) => {
  const s = O.isle(d, olay, t);
  expect(JSON.stringify(s.durum)).toBe(JSON.stringify(d)); // hata varsa durum değişmez
  return s.hata?.kod;
};
const basla = (o: Oda, t = T0) =>
  ok(o.d, { tip: 'baslat', kimlik: o.id[0] }, t);
const g = (o: Oda, d: Durum, i: number, t: number) => O.gorunum(d, o.id[i], t);
const cevap = (o: Oda, d: Durum, i: number, sik: number, t: number) =>
  ok(d, { tip: 'cevapla', kimlik: o.id[i], sik }, t);
const sonraki = (o: Oda, d: Durum, t: number, i = 0) =>
  ok(d, { tip: 'sonraki', kimlik: o.id[i] }, t);

// Soru k için doğru şık ve yanlış bir şık (sözleşme: sorular turSec ile aynı).
const dogruSik = (k: number) => TUR[k].dogru;
const yanlisSik = (k: number) => (TUR[k].dogru + 1) % 4;

// Bir soruyu oynatır: planda null = cevap yok. Eksik varsa süre dolunca açıklanır. Dönüş: açıklamadaki durum.
function soruOyna(
  o: Oda,
  d: Durum,
  k: number,
  t: number,
  plan: (number | null)[],
) {
  let s = d;
  plan.forEach((sik, i) => {
    if (sik !== null) s = cevap(o, s, i, sik, t + 100 * (i + 1));
  });
  if (plan.some((x) => x === null)) s = ok(s, { tip: 'zaman' }, t + SURE + 1);
  expect(
    g(o, s, 0, t + SURE + 2).aciklama,
    `soru ${k + 1} açıklamada`,
  ).toBeDefined();
  return s;
}
// plan(k, oyuncuNo) → şık | null. Tüm oyunu oynatır; dönüş: bitmiş durum.
function oyna(o: Oda, plan: (k: number, i: number) => number | null) {
  let d = basla(o);
  let t = T0;
  for (let k = 0; k < 10; k++) {
    d = soruOyna(
      o,
      d,
      k,
      t,
      o.id.map((_, i) => plan(k, i)),
    );
    t += SURE + 5000;
    d = sonraki(o, d, t);
  }
  return d;
}

describe('KK-113: oda türü ve lobi (KK-70: mevcut odalarla aynı kurallar)', () => {
  it('quiz odası kurulur; tur durumda ve görünümde "quiz-night"', () => {
    const o = kur(['Ali', 'Ayşe']);
    expect(O.gorunum(o.d, o.id[1], T0).tur).toBe('quiz-night');
    expect(O.QUIZ_SORU_MS).toBe(SURE);
  });

  it('katılım kuralları aynı: 12 kişi sınırı, başladı, "Ali 2", en az 2 oyuncu, yalnız kuran başlatır', () => {
    const dolu = kur(Array.from({ length: 12 }, (_, i) => `P${i}`));
    expect(hataKodu(dolu.d, { tip: 'katil', ad: 'Fazla' }, T0)).toBe('dolu');
    expect(kur(['Ali', 'Ali']).ad).toEqual(['Ali', 'Ali 2']);
    const tek = kur(['Ali']);
    expect(hataKodu(tek.d, { tip: 'baslat', kimlik: tek.id[0] }, T0)).toBe(
      'yetersiz',
    );
    const b = kur(['Ali', 'Ayşe']);
    expect(hataKodu(b.d, { tip: 'baslat', kimlik: b.id[1] }, T0)).toBe(
      'yetkisiz',
    );
    const d = basla(b);
    expect(hataKodu(d, { tip: 'katil', ad: 'Geç' }, T0 + 1)).toBe('basladi');
  });

  it("durum JSON'a çevrilip geri yüklenince oyun kaldığı yerden sürer (KK-40)", () => {
    const o = kur(['Ali', 'Ayşe']);
    let d = basla(o);
    d = cevap(o, d, 0, dogruSik(0), T0 + 500);
    d = JSON.parse(JSON.stringify(d)) as Durum;
    d = cevap(o, d, 1, yanlisSik(0), T0 + 900);
    expect(g(o, d, 0, T0 + 1000).aciklama?.dogru).toBe(dogruSik(0));
  });

  it('boşta kalan oda ve biten oyun BOSTA_MS sonra silinir (KK-39, KK-70)', () => {
    const o = kur(['Ali', 'Ayşe']);
    expect(O.silinmeli(o.d, T0 + O.BOSTA_MS - 60_000)).toBe(false);
    expect(O.silinmeli(o.d, T0 + O.BOSTA_MS + 60_000)).toBe(true);
  });
});

describe('KK-113: soru görünümü, gizlilik, kilitli cevap', () => {
  it('ilk soru turSec ile aynı: kolay, metin ve şıklar aynı; sayaç 20 sn, sunucu saatine göre azalır', () => {
    const o = kur(['Ali', 'Ayşe']);
    const d = basla(o);
    const v = g(o, d, 1, T0);
    expect(v.asama).toBe('soru');
    expect(v.soruNo).toBe(1);
    expect(v.soru).toMatchObject({
      id: TUR[0].id,
      metin: TUR[0].metin,
      secenekler: TUR[0].secenekler,
      zorluk: 'kolay',
    });
    expect(v.kalanMs).toBe(SURE);
    expect(g(o, d, 1, T0 + 8000).kalanMs).toBe(SURE - 8000);
    expect(g(o, d, 1, T0 + SURE + 5000).kalanMs).toBe(0);
    expect(v.toplam).toBe(2);
    expect(v.cevapladi).toEqual([]);
    expect(v.benimSikkim).toBeNull();
  });

  it('doğru şık, kaynaklar ve uyum soru süresince HİÇBİR oyuncunun görünümünde yoktur (KK-66 gibi)', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    d = cevap(o, d, 0, dogruSik(0), T0 + 100);
    d = cevap(o, d, 1, yanlisSik(0), T0 + 200);
    for (let i = 0; i < 3; i++) {
      const v = g(o, d, i, T0 + 300);
      expect(v.aciklama).toBeUndefined();
      expect(v.soru).not.toHaveProperty('dogru');
      expect(JSON.stringify(v)).not.toMatch(
        /dogru|kaynaklar|uyum|gizli-kaynak/,
      );
    }
  });

  it('cevap kilitlenir: ikinci cevap reddedilir, kendi şıkkım görünür, başkasının görünümü yalnız "cevapladi" değişir', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    const onceCan = g(o, d, 2, T0 + 50);
    d = cevap(o, d, 0, 2, T0 + 100);
    expect(
      hataKodu(d, { tip: 'cevapla', kimlik: o.id[0], sik: 3 }, T0 + 200),
    ).toBe('gecersiz');
    expect(g(o, d, 0, T0 + 300).benimSikkim).toBe(2);
    expect(g(o, d, 1, T0 + 300).benimSikkim).toBeNull();
    const sonraCan = g(o, d, 2, T0 + 50);
    expect(sonraCan.cevapladi).toEqual(['Ali']);
    const oncekiGerisi = { ...onceCan, cevapladi: [] as string[] };
    const sonrakiGerisi = { ...sonraCan, cevapladi: [] as string[] };
    expect(sonrakiGerisi).toEqual(oncekiGerisi); // başka hiçbir alan değişmez: kimse başkasının şıkkını görmez
  });

  it('geçersiz şık (4, −1, 1.5), lobide cevap ve yanlış tür mesajı reddedilir', () => {
    const o = kur(['Ali', 'Ayşe']);
    expect(
      O.isle(o.d, { tip: 'cevapla', kimlik: o.id[0], sik: 0 }, T0).hata,
    ).toBeDefined(); // lobi
    const d = basla(o);
    for (const sik of [4, -1, 1.5, Number.NaN])
      expect(
        hataKodu(d, { tip: 'cevapla', kimlik: o.id[0], sik }, T0 + 10),
      ).toBe('gecersiz');
    expect(
      hataKodu(d, { tip: 'cevapla', kimlik: o.id[0], oy: 'OK' }, T0 + 10),
    ).toBe('gecersiz');
    expect(
      hataKodu(d, { tip: 'puanla', kimlik: o.id[0], puan: 5 }, T0 + 10),
    ).toBe('gecersiz');
  });

  it('OK mu NOK mu odasında şıklı cevap geçersizdir (odalar birbirine karışmaz)', () => {
    const k = O.odaKur({
      kod: '654321',
      kurucuAd: 'Ali',
      tohum: 1,
      simdi: T0,
      tur: 'ok-mu-nok',
      deste: {
        deck_id: 't',
        version: 1,
        lang: 'tr',
        cards: Array.from({ length: 30 }, (_, i) => ({
          id: `k${i}`,
          text: `k${i}`,
        })),
      },
    });
    let d = k.durum;
    const katil = O.isle(d, { tip: 'katil', ad: 'Ayşe' }, T0);
    d = ok(katil.durum, { tip: 'baslat', kimlik: k.kimlik }, T0);
    expect(
      O.isle(d, { tip: 'cevapla', kimlik: k.kimlik, sik: 1 }, T0 + 10).hata
        ?.kod,
    ).toBe('gecersiz');
  });

  it('süre sunucu saatine göre: 20 sn dolmadan cevap kabul, dolunca "sure-doldu"; zaman erken gelirse bir şey değişmez', () => {
    const o = kur(['Ali', 'Ayşe']);
    const d = basla(o);
    expect(
      hataKodu(d, { tip: 'cevapla', kimlik: o.id[0], sik: 0 }, T0 + SURE),
    ).toBe('sure-doldu');
    const son = cevap(o, d, 0, 1, T0 + SURE - 1);
    expect(g(o, son, 0, T0 + SURE - 1).benimSikkim).toBe(1);
    const erken = ok(d, { tip: 'zaman' }, T0 + SURE - 1);
    expect(JSON.stringify(erken)).toBe(JSON.stringify(d));
    expect(g(o, erken, 0, T0 + SURE - 1).aciklama).toBeUndefined();
  });
});

describe('KK-113: açıklama, kuran "Sonraki soru"', () => {
  it('bağlı herkes cevaplayınca beklemeden açıklama; süre göstergesi kalkar, açıklama süresiz bekler', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    d = cevap(o, d, 0, dogruSik(0), T0 + 100);
    d = cevap(o, d, 1, yanlisSik(0), T0 + 200);
    expect(g(o, d, 2, T0 + 250).aciklama).toBeUndefined();
    d = cevap(o, d, 2, dogruSik(0), T0 + 300);
    const v = g(o, d, 2, T0 + 300);
    expect(v.aciklama).toBeDefined();
    expect(v.kalanMs).toBeUndefined();
    expect(v.soruNo).toBe(1);
    const geç = ok(d, { tip: 'zaman' }, T0 + 600_000);
    expect(g(o, geç, 2, T0 + 600_000).aciklama).toBeDefined();
    expect(g(o, geç, 2, T0 + 600_000).soruNo).toBe(1);
  });

  it('açıklamada doğru şık ve kimin neyi seçtiği her telefonda aynıdır; cevapsız null; başkasının şıkkı yalnız şimdi görünür', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    d = cevap(o, d, 0, dogruSik(0), T0 + 100);
    d = cevap(o, d, 1, yanlisSik(0), T0 + 200);
    d = ok(d, { tip: 'zaman' }, T0 + SURE); // Can cevap vermedi
    const a = [0, 1, 2].map((i) => g(o, d, i, T0 + SURE).aciklama);
    expect(a[0]).toEqual({
      dogru: dogruSik(0),
      secimler: { Ali: dogruSik(0), Ayşe: yanlisSik(0), Can: null },
    });
    expect(a[1]).toEqual(a[0]);
    expect(a[2]).toEqual(a[0]);
    expect(g(o, d, 2, T0 + SURE).benimSikkim).toBeNull();
    expect(g(o, d, 1, T0 + SURE).benimSikkim).toBe(yanlisSik(0));
    expect(g(o, d, 0, T0 + SURE).soru).not.toHaveProperty('dogru');
  });

  it('açıklamada cevap değişmez ve yeni cevap kabul edilmez', () => {
    const o = kur(['Ali', 'Ayşe']);
    let d = basla(o);
    d = cevap(o, d, 0, 0, T0 + 100);
    d = cevap(o, d, 1, 1, T0 + 200);
    expect(
      hataKodu(d, { tip: 'cevapla', kimlik: o.id[0], sik: 2 }, T0 + 300),
    ).toBeDefined();
  });

  it('"Sonraki soru" yalnızca açıklamada ve yalnızca kuranda görünür; başkası basarsa "yetkisiz", soru sürerken "gecersiz"', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    expect(hataKodu(d, { tip: 'sonraki', kimlik: o.id[0] }, T0 + 10)).toBe(
      'gecersiz',
    );
    for (let i = 0; i < 3; i++)
      expect(g(o, d, i, T0 + 10).sonrakiGorunur).toBeFalsy();
    d = soruOyna(o, d, 0, T0, [dogruSik(0), yanlisSik(0), null]);
    const gorunur = [0, 1, 2].map(
      (i) => !!g(o, d, i, T0 + SURE + 5).sonrakiGorunur,
    );
    expect(gorunur).toEqual([true, false, false]);
    expect(
      hataKodu(d, { tip: 'sonraki', kimlik: o.id[1] }, T0 + SURE + 5),
    ).toBe('yetkisiz');
  });

  it('kuran ayrılırsa ya da kopsa yetki oyuncu sırasıyla ilk bağlı oyuncuya geçer, dönünce kuran geri alır (KK-68)', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    d = soruOyna(o, d, 0, T0, [dogruSik(0), dogruSik(0), dogruSik(0)]);
    const t = T0 + SURE + 5;
    d = ok(d, { tip: 'kop', kimlik: o.id[0] }, t);
    expect(g(o, d, 1, t).sonrakiGorunur).toBe(true);
    expect(g(o, d, 2, t).sonrakiGorunur).toBe(false);
    d = ok(d, { tip: 'don', kimlik: o.id[0] }, t + 1);
    expect(g(o, d, 0, t + 1).sonrakiGorunur).toBe(true);
    expect(g(o, d, 1, t + 1).sonrakiGorunur).toBe(false);
    d = ok(d, { tip: 'ayril', kimlik: o.id[0] }, t + 2);
    expect(g(o, d, 1, t + 2).sonrakiGorunur).toBe(true);
    d = sonraki(o, d, t + 3, 1); // yeni yetkili ilerletir
    expect(g(o, d, 2, t + 3).soruNo).toBe(2);
  });

  it('"Sonraki soru" bir sonraki soruyu açar: soru numarası artar, sayaç sıfırlanır, açıklama kalkar, şık kilidi açılır', () => {
    const o = kur(['Ali', 'Ayşe']);
    let d = basla(o);
    d = soruOyna(o, d, 0, T0, [dogruSik(0), dogruSik(0)]);
    const t = T0 + 30_000;
    d = sonraki(o, d, t);
    const v = g(o, d, 1, t + 1000);
    expect(v.soruNo).toBe(2);
    expect(v.soru?.metin).toBe(TUR[1].metin);
    expect(v.kalanMs).toBe(SURE - 1000);
    expect(v.aciklama).toBeUndefined();
    expect(v.benimSikkim).toBeNull();
    expect(v.cevapladi).toEqual([]);
    expect(v.sonrakiGorunur).toBeFalsy();
  });
});

describe('KK-113: kopukken kaçırılan ve cevapsız sorular yanlış sayılır', () => {
  it('kopuk oyuncuyu beklemeden açıklama; kopukken kaçırdığı soru yanlış (null), döndüğü sorudan itibaren sayılır', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    d = ok(d, { tip: 'kop', kimlik: o.id[2] }, T0 + 50);
    d = cevap(o, d, 0, dogruSik(0), T0 + 100);
    d = cevap(o, d, 1, dogruSik(0), T0 + 200); // bağlı herkes cevapladı → beklemeden açıklama
    const a = g(o, d, 0, T0 + 250).aciklama;
    expect(a?.secimler).toEqual({
      Ali: dogruSik(0),
      Ayşe: dogruSik(0),
      Can: null,
    });
    d = sonraki(o, d, T0 + 300);
    d = ok(d, { tip: 'don', kimlik: o.id[2] }, T0 + 400);
    expect(g(o, d, 2, T0 + 400).soruNo).toBe(2); // geri döndü: güncel soruyu görür
    d = cevap(o, d, 2, dogruSik(1), T0 + 500);
    d = cevap(o, d, 0, dogruSik(1), T0 + 600);
    d = cevap(o, d, 1, dogruSik(1), T0 + 700);
    expect(g(o, d, 2, T0 + 700).aciklama?.secimler.Can).toBe(dogruSik(1));
  });

  it('cevaplamamış oyuncu ayrılınca kalan herkes cevaplamışsa açıklamaya geçilir', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    d = cevap(o, d, 0, 0, T0 + 100);
    d = cevap(o, d, 1, 0, T0 + 200);
    d = ok(d, { tip: 'ayril', kimlik: o.id[2] }, T0 + 300);
    expect(g(o, d, 0, T0 + 300).aciklama).toBeDefined();
  });
});

describe('KK-113, KK-111, KK-114: uçtan uca oyun ve final', () => {
  it('10 soru turSec sırasıyla gelir (3 kolay, 4 orta, 3 zor), her biri açıklanır, 10. "Sonraki"den sonra oyun biter', () => {
    const o = kur(['Ali', 'Ayşe']);
    let d = basla(o);
    let t = T0;
    for (let k = 0; k < 10; k++) {
      const v = g(o, d, 0, t + 10);
      expect(v.asama).toBe('soru');
      expect(v.soruNo).toBe(k + 1);
      expect(v.soru?.metin).toBe(TUR[k].metin);
      expect(v.soru?.zorluk).toBe(TUR[k].zorluk);
      d = soruOyna(o, d, k, t, [dogruSik(k), yanlisSik(k)]);
      t += SURE + 5000;
      d = sonraki(o, d, t);
    }
    expect(g(o, d, 0, t).asama).toBe('bitti');
    expect(TUR.map((s) => s.zorluk)).toEqual([
      ...Array(3).fill('kolay'),
      ...Array(4).fill('orta'),
      ...Array(3).fill('zor'),
    ]);
  });

  it('final: sıralama doğru sayısı, eşitse zorluk katsayılı toplam; cevapsız ve kaçırılan yanlış; unvan Faz 1 kuralıyla', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    const ayse = new Set([0, 1, 2, 3, 4]); // 3 kolay + 2 orta → 5 doğru, katsayı 3 + 4 = 7
    const can = new Set([0, 3, 7, 8, 9]); // 1 kolay + 1 orta + 3 zor → 5 doğru, katsayı 1 + 2 + 9 = 12
    const d = oyna(o, (k, i) => {
      if (i === 0) return dogruSik(k); // Ali hepsi doğru: 10, katsayı 20
      const dogru = (i === 1 ? ayse : can).has(k);
      return dogru ? dogruSik(k) : k % 2 ? yanlisSik(k) : null; // yanlış ya da cevapsız
    });
    const f = O.quizFinal(d);
    expect(f.paket).toBe(PAKET.ad);
    expect(f.siralama).toMatchObject([
      { ad: 'Ali', dogru: 10, katsayi: 20, sira: 1 },
      { ad: 'Can', dogru: 5, katsayi: 12, sira: 2 },
      { ad: 'Ayşe', dogru: 5, katsayi: 7, sira: 3 },
    ]);
    expect(unvanSec(PAKET.unvanlar, 10)).toBe('Efsane');
    expect(f.sorular).toHaveLength(10);
    expect(f.sorular[0]).toMatchObject({
      id: TUR[0].id,
      dogru: dogruSik(0),
      secimler: { Ali: dogruSik(0), Ayşe: dogruSik(0), Can: dogruSik(0) },
    });
    expect(f.sorular[1].secimler.Can).not.toBe(dogruSik(1)); // yanlış sayıldı
  });

  it('doğru sayısı ve katsayı eşitse ortak birincilik: aynı sıra, girdi (katılım) sırası korunur', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    const d = oyna(o, (k, i) => (i < 2 ? dogruSik(k) : yanlisSik(k)));
    const f = O.quizFinal(d);
    expect(f.siralama).toMatchObject([
      { ad: 'Ali', dogru: 10, sira: 1 },
      { ad: 'Ayşe', dogru: 10, sira: 1 },
      { ad: 'Can', dogru: 0, sira: 3 },
    ]);
  });

  it('oda sonucu Faz 1 görünüm kurallarını kullanır: birinci(ler) 🏆, paylaşım kartı birinciyi gösterir (KK-111)', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    const d = oyna(o, (k, i) => (i < 2 ? dogruSik(k) : yanlisSik(k)));
    const f = O.quizFinal(d);
    const satirlar = sonucSatirlari(f.siralama, PAKET.unvanlar);
    expect(satirlar.filter((s) => s.birinci).map((s) => s.ad)).toEqual([
      'Ali',
      'Ayşe',
    ]);
    const kart = paylasimKarti({
      mod: 'grup',
      paket: f.paket,
      sonuc: f.siralama,
      unvanlar: PAKET.unvanlar,
    });
    expect(kart.kupa).toBe(true);
    expect(kart.adlar).toEqual(['Ali', 'Ayşe']);
    expect(kart.paket).toBe(PAKET.ad);
    expect(kart.unvan).toBe('Efsane');
  });

  it('tüm oyun boyunca soru aşamasında doğru şık hiçbir görünümde yok; açıklamada yalnız aciklama.dogru taşır', () => {
    const o = kur(['Ali', 'Ayşe']);
    let d = basla(o);
    let t = T0;
    for (let k = 0; k < 10; k++) {
      for (let i = 0; i < 2; i++) {
        const v = g(o, d, i, t + 10);
        expect(JSON.stringify(v), `soru ${k + 1}`).not.toMatch(
          /dogru|kaynaklar|uyum|gizli-kaynak/,
        );
      }
      d = soruOyna(o, d, k, t, [dogruSik(k), yanlisSik(k)]);
      for (let i = 0; i < 2; i++) {
        const v = g(o, d, i, t + SURE + 10);
        expect(v.soru).not.toHaveProperty('dogru');
        expect(v.aciklama?.dogru).toBe(dogruSik(k));
        expect(JSON.stringify(v)).not.toMatch(/kaynaklar|uyum|gizli-kaynak/);
      }
      t += SURE + 5000;
      d = sonraki(o, d, t);
    }
  });
});
