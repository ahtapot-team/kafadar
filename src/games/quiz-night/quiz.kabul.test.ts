// Quiz Night Faz 1 (issue #222): tur seçimi, puan, unvan, sıralama — saf fonksiyonlar. PRD v9: KK-109, KK-111, KK-112, KK-114.
// SÖZLEŞME (backend #223 için) — src/games/quiz-night/quiz.ts (React yok, Node doğrudan çalıştırır: içe aktarmalar .ts uzantılı):
//   type Soru = { id: string; metin: string; secenekler: string[]; dogru: number; zorluk: 'kolay'|'orta'|'zor'; tur: 'olay'|'dunya' }
//   turSec(havuz: readonly Soru[], tohum: number, onceki?: readonly string[]): Soru[]
//       10 soru: 3 kolay + 4 orta + 3 zor, bu sırayla (kolay→orta→zor); tekrarsız; havuzu DEĞİŞTİRMEZ.
//       Her sorunun `secenekler` sırası karışır, `dogru` yeni sıraya göre güncellenir (doğru şıkkın metni aynı kalır).
//       `onceki` (aynı cihaz+paketin bir önceki turunun soru id'leri) mümkün olduğunca dışlanır; havuz yetmezse eksik kadarı önceki
//       turdan tamamlanır (yine 10 soru, tekrarsız). Aynı (havuz, tohum, onceki) → birebir aynı tur.
//   puan(dogruMu: readonly boolean[]): number          doğru sayısı (yanlış puan düşürmez, hız bonusu yok)
//   unvanSec(unvanlar: readonly string[], puan: number): string   0–3 → [0], 4–6 → [1], 7–9 → [2], 10 → [3]
//   siralama(oyuncular: { ad: string; dogru: number }[]): { ad: string; dogru: number; sira: number }[]
//       doğru sayısına göre azalan; eşit doğru = aynı `sira` (ilk sıra 1); eşitlerde girdi sırası korunur.
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../../kabul';

const kabulQuiz = BEKLEYEN.quizModul ? it.fails : it;

type Zorluk = 'kolay' | 'orta' | 'zor';
type Soru = {
  id: string;
  metin: string;
  secenekler: string[];
  dogru: number;
  zorluk: Zorluk;
  tur: 'olay' | 'dunya';
};
type Quiz = {
  turSec(
    havuz: readonly Soru[],
    tohum: number,
    onceki?: readonly string[],
  ): Soru[];
  puan(dogruMu: readonly boolean[]): number;
  unvanSec(unvanlar: readonly string[], puan: number): string;
  siralama(
    o: { ad: string; dogru: number }[],
  ): { ad: string; dogru: number; sira: number }[];
};
const yol = './quiz';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as Quiz;

const havuzYap = (kolay: number, orta: number, zor: number): Soru[] =>
  (
    [
      ['kolay', kolay],
      ['orta', orta],
      ['zor', zor],
    ] as [Zorluk, number][]
  ).flatMap(([zorluk, n]) =>
    Array.from({ length: n }, (_, i) => ({
      id: `${zorluk}-${i + 1}`,
      metin: `${zorluk} soru ${i + 1}?`,
      secenekler: ['A', 'B', 'C', 'D'].map((h) => `${h}-${zorluk}-${i + 1}`),
      dogru: i % 4,
      zorluk,
      tur: (i % 2 ? 'olay' : 'dunya') as 'olay' | 'dunya',
    })),
  );
const ZORLUKLAR = [
  ...Array(3).fill('kolay'),
  ...Array(4).fill('orta'),
  ...Array(3).fill('zor'),
];
const idler = (t: Soru[]) => t.map((s) => s.id);

describe('KK-109: tur seçimi (tohumlu, saf)', () => {
  kabulQuiz(
    'KK-109: 10 soru; 3 kolay + 4 orta + 3 zor, kolaydan zora',
    async () => {
      const { turSec } = await yukle();
      for (const tohum of [1, 2, 3, 42, 999]) {
        const tur = turSec(havuzYap(8, 8, 8), tohum);
        expect(tur).toHaveLength(10);
        expect(tur.map((s) => s.zorluk)).toEqual(ZORLUKLAR);
      }
    },
  );

  kabulQuiz(
    'KK-109: sorular havuzdan ve tekrarsız (en dar havuz 6/6/6 dahil)',
    async () => {
      const { turSec } = await yukle();
      for (const [k, o, z] of [
        [8, 8, 8],
        [6, 6, 6],
        [10, 10, 10],
      ]) {
        const havuz = havuzYap(k, o, z);
        const kimlikler = new Set(havuz.map((s) => s.id));
        for (const tohum of [1, 7, 123]) {
          const tur = idler(turSec(havuz, tohum));
          expect(new Set(tur).size).toBe(10);
          expect(tur.every((id) => kimlikler.has(id))).toBe(true);
        }
      }
    },
  );

  kabulQuiz(
    'KK-109: aynı tohum aynı turu verir; farklı tohumlar farklı tur verir',
    async () => {
      const { turSec } = await yukle();
      const havuz = havuzYap(9, 9, 9);
      expect(turSec(havuz, 5)).toEqual(turSec(havuz, 5));
      expect(turSec(havuz, 5, ['kolay-1'])).toEqual(
        turSec(havuz, 5, ['kolay-1']),
      );
      const turlar = new Set(
        Array.from({ length: 20 }, (_, i) => idler(turSec(havuz, i)).join()),
      );
      expect(turlar.size).toBeGreaterThan(1);
    },
  );

  kabulQuiz(
    'KK-109: şık sırası karışır; doğru şıkkın metni değişmez, dogru yeni sıraya işaret eder',
    async () => {
      const { turSec } = await yukle();
      const havuz = havuzYap(8, 8, 8);
      const asil = new Map(havuz.map((s) => [s.id, s]));
      let degisen = 0;
      for (let tohum = 0; tohum < 30; tohum++) {
        for (const s of turSec(havuz, tohum)) {
          const o = asil.get(s.id)!;
          expect([...s.secenekler].sort()).toEqual([...o.secenekler].sort());
          expect(s.secenekler[s.dogru]).toBe(o.secenekler[o.dogru]);
          if (s.secenekler.join() !== o.secenekler.join()) degisen++;
        }
      }
      expect(degisen).toBeGreaterThan(0);
    },
  );

  kabulQuiz(
    'KK-109: bir önceki turun soruları sonraki turda gelmez (havuz yetiyorsa)',
    async () => {
      const { turSec } = await yukle();
      const havuz = havuzYap(8, 8, 8); // her zorlukta 8 ≥ 3/4/3 + önceki turdan kalan
      for (const tohum of [1, 2, 3, 50, 77]) {
        const onceki = idler(turSec(havuz, tohum));
        const yeni = turSec(havuz, tohum + 1000, onceki);
        expect(idler(yeni).filter((id) => onceki.includes(id))).toEqual([]);
        expect(yeni.map((s) => s.zorluk)).toEqual(ZORLUKLAR);
      }
    },
  );

  kabulQuiz(
    'KK-109: havuz yetmiyorsa (6/6/6) yine 10 tekrarsız soru, kolay→zor düzeni bozulmaz',
    async () => {
      const { turSec } = await yukle();
      const havuz = havuzYap(6, 6, 6);
      const onceki = idler(turSec(havuz, 1));
      const yeni = turSec(havuz, 2, onceki);
      expect(yeni).toHaveLength(10);
      expect(new Set(idler(yeni)).size).toBe(10);
      expect(yeni.map((s) => s.zorluk)).toEqual(ZORLUKLAR);
    },
  );

  kabulQuiz('KK-109: havuzu değiştirmez (saf)', async () => {
    const { turSec } = await yukle();
    const havuz = havuzYap(8, 8, 8);
    const once = JSON.stringify(havuz);
    turSec(havuz, 9, ['kolay-1']);
    expect(JSON.stringify(havuz)).toBe(once);
  });
});

describe('KK-114: puan = doğru sayısı', () => {
  kabulQuiz(
    'KK-114: puan doğru cevap sayısıdır; yanlış düşürmez, sıra/hız etkilemez',
    async () => {
      const { puan } = await yukle();
      expect(puan([])).toBe(0);
      expect(puan(Array(10).fill(false))).toBe(0);
      expect(puan(Array(10).fill(true))).toBe(10);
      expect(
        puan([true, false, true, false, false, true, true, true, false, true]),
      ).toBe(6);
      expect(puan([false, false, true])).toBe(puan([true, false, false]));
    },
  );
});

describe('KK-111: unvan basamakları 0–3, 4–6, 7–9, 10', () => {
  const unvanlar = ['Yabancı', 'Seyirci', 'Hayran', 'Baş hayran'];
  kabulQuiz('KK-111: sınırlar 3/4, 6/7, 9/10', async () => {
    const { unvanSec } = await yukle();
    const beklenen = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3].map((i) => unvanlar[i]);
    for (let p = 0; p <= 10; p++)
      expect(unvanSec(unvanlar, p)).toBe(beklenen[p]);
    expect(unvanSec(unvanlar, 3)).not.toBe(unvanSec(unvanlar, 4));
    expect(unvanSec(unvanlar, 6)).not.toBe(unvanSec(unvanlar, 7));
    expect(unvanSec(unvanlar, 9)).not.toBe(unvanSec(unvanlar, 10));
  });
});

describe('KK-112: grup sonucu sıralaması', () => {
  kabulQuiz(
    'KK-112: doğru sayısına göre azalan; eşit puanlılar aynı sırada',
    async () => {
      const { siralama } = await yukle();
      const s = siralama([
        { ad: 'Ali', dogru: 5 },
        { ad: 'Ece', dogru: 8 },
        { ad: 'Can', dogru: 5 },
        { ad: 'Zeynep', dogru: 2 },
      ]);
      expect(s.map((x) => x.ad)).toEqual(['Ece', 'Ali', 'Can', 'Zeynep']); // eşitlerde girdi sırası
      expect(s[0].sira).toBe(1);
      expect(s[1].sira).toBe(s[2].sira); // Ali = Can
      expect(s[1].sira).toBeGreaterThan(s[0].sira);
      expect(s[3].sira).toBeGreaterThan(s[2].sira);
    },
  );

  kabulQuiz(
    'KK-112: herkes aynı puandaysa herkes birinci; tek oyuncu birinci',
    async () => {
      const { siralama } = await yukle();
      expect(
        siralama([
          { ad: 'A', dogru: 0 },
          { ad: 'B', dogru: 0 },
        ]).map((x) => x.sira),
      ).toEqual([1, 1]);
      expect(siralama([{ ad: 'A', dogru: 10 }]).map((x) => x.sira)).toEqual([
        1,
      ]);
      expect(siralama([])).toEqual([]);
    },
  );
});
