// Quiz Night Faz 1 (issue #222): içerik şeması denetimi — KK-115, KK-117. `npm run icerik` (CI) bu denetimi çalıştırır.
// SÖZLEŞME (backend #223 için):
//   content/quiz/<paket>.json → { id, ad, emoji, koken:'tr'|'yabanci', unvanlar:[4 metin],
//       sorular:[{ id, metin, secenekler:[4], dogru:0–3, zorluk:'kolay'|'orta'|'zor', tur:'olay'|'dunya',
//                  kaynaklar:[{ ad, url }] (≥4), uyum: sayı (≥0.75) }] }
//   src/icerik/quiz.ts (Node doğrudan çalıştırır: içe aktarmalar .ts uzantılı, React yok)
//       → quizHatalari(dosya: unknown): string[]   boş dizi = geçerli; biçim bozuksa atmaz, hata döndürür
//       → uygulamaPaketi(dosya): aynı paket, soruların yalnızca { id, metin, secenekler, dogru, zorluk, tur } alanlarıyla
//         (`kaynaklar` ve `uyum` uygulama paketine GİRMEZ)
//   scripts/icerik-dogrula.ts → content/quiz/*.json dosyalarını quizHatalari ile denetler (hata varsa 1 ile çıkar); kaynak URL'leri
//       ağdan DENETLENMEZ (CI çevrimdışı çalışır)
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../kabul';

const kabulQuiz = BEKLEYEN.quiz ? it.fails : it;

type Zorluk = 'kolay' | 'orta' | 'zor';
type Soru = {
  id: string;
  metin: string;
  secenekler: string[];
  dogru: number;
  zorluk: Zorluk;
  tur: string;
  kaynaklar: { ad: string; url: string }[];
  uyum: number;
};
type Paket = {
  id: string;
  ad: string;
  emoji: string;
  koken: string;
  unvanlar: string[];
  sorular: Soru[];
};
type QuizDogrula = {
  quizHatalari(dosya: unknown): string[];
  uygulamaPaketi(dosya: unknown): { sorular: Record<string, unknown>[] };
};
const yol = './quiz';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as QuizDogrula;

const soru = (i: number, zorluk: Zorluk, tur = 'dunya'): Soru => ({
  id: `q-${i}`,
  metin: `Soru numara ${i}?`,
  secenekler: [`a${i}`, `b${i}`, `c${i}`, `d${i}`],
  dogru: i % 4,
  zorluk,
  tur,
  kaynaklar: [1, 2, 3, 4].map((n) => ({
    ad: `Kaynak ${n}`,
    url: `https://ornek.test/${i}/${n}`,
  })),
  uyum: 1,
});
// Geçerli taban: 24 soru (8/8/8), 8'i olay (< 12).
const taban = (kolay = 8, orta = 8, zor = 8, olay = 8): Paket => {
  const z: Zorluk[] = [
    ...Array<Zorluk>(kolay).fill('kolay'),
    ...Array<Zorluk>(orta).fill('orta'),
    ...Array<Zorluk>(zor).fill('zor'),
  ];
  return {
    id: 'deneme',
    ad: 'Deneme',
    emoji: '🎬',
    koken: 'tr',
    unvanlar: ['Yabancı', 'Seyirci', 'Hayran', 'Baş hayran'],
    sorular: z.map((zz, i) => soru(i + 1, zz, i < olay ? 'olay' : 'dunya')),
  };
};
const boz = (f: (p: Paket) => void, p = taban()) => {
  f(p);
  return p;
};
const gecerli = async (p: Paket) => (await yukle()).quizHatalari(p);
const gecersiz = async (p: unknown) =>
  expect((await yukle()).quizHatalari(p).length).toBeGreaterThan(0);

describe('KK-115: paket alanları', () => {
  kabulQuiz('KK-115: geçerli paket hatasız', async () => {
    expect(await gecerli(taban())).toEqual([]);
  });

  kabulQuiz(
    'KK-115: koken yalnız tr ya da yabanci; id/ad/emoji boş olamaz',
    async () => {
      await gecersiz(boz((p) => (p.koken = 'ingiliz')));
      await gecersiz(boz((p) => (p.koken = '')));
      expect(await gecerli(boz((p) => (p.koken = 'yabanci')))).toEqual([]);
      for (const alan of ['id', 'ad', 'emoji'] as const)
        await gecersiz(boz((p) => (p[alan] = '  ')));
    },
  );

  kabulQuiz('KK-115: tam 4 unvan, her biri dolu', async () => {
    await gecersiz(boz((p) => (p.unvanlar = ['a', 'b', 'c'])));
    await gecersiz(boz((p) => (p.unvanlar = ['a', 'b', 'c', 'd', 'e'])));
    await gecersiz(boz((p) => (p.unvanlar = ['a', 'b', '', 'd'])));
    await gecersiz(
      boz(
        (p) => ((p as unknown as { unvanlar?: unknown }).unvanlar = undefined),
      ),
    );
  });
});

describe('KK-115: havuz', () => {
  kabulQuiz('KK-115: havuz 20–30 soru (19 ve 31 reddedilir)', async () => {
    expect(await gecerli(taban(7, 7, 6))).toEqual([]); // 20
    expect(await gecerli(taban(10, 10, 10))).toEqual([]); // 30
    await gecersiz(taban(7, 6, 6)); // 19
    await gecersiz(taban(11, 10, 10)); // 31
  });

  kabulQuiz(
    'KK-115: her zorluktan en az 6 (5 reddedilir, 6 geçer)',
    async () => {
      expect(await gecerli(taban(6, 9, 9))).toEqual([]);
      await gecersiz(taban(5, 10, 9));
      await gecersiz(taban(9, 5, 10));
      await gecersiz(taban(10, 9, 5));
    },
  );

  kabulQuiz(
    'KK-115: olay sorusu havuzun yarısından azdır (24 soruda 11 geçer, 12 = tam yarı reddedilir)',
    async () => {
      expect(await gecerli(taban(8, 8, 8, 11))).toEqual([]);
      await gecersiz(taban(8, 8, 8, 12));
      await gecersiz(taban(8, 8, 8, 24));
      expect(await gecerli(taban(8, 8, 8, 0))).toEqual([]);
      // 21 soruda yarı 10,5 → 10 geçer, 11 reddedilir
      expect(await gecerli(taban(7, 7, 7, 10))).toEqual([]);
      await gecersiz(taban(7, 7, 7, 11));
    },
  );

  kabulQuiz(
    'KK-115: aynı metinli iki soru olamaz (id farklı olsa da)',
    async () => {
      await gecersiz(boz((p) => (p.sorular[1].metin = p.sorular[0].metin)));
    },
  );
});

describe('KK-115: her soru', () => {
  const sorulu = (f: (s: Soru) => void) => boz((p) => f(p.sorular[3]));

  kabulQuiz('KK-115: benzersiz id', async () => {
    await gecersiz(boz((p) => (p.sorular[1].id = p.sorular[0].id)));
    await gecersiz(sorulu((s) => (s.id = '')));
  });

  kabulQuiz(
    'KK-115: metin en çok 140 karakter (140 geçer, 141 reddedilir), boş olamaz',
    async () => {
      expect(await gecerli(sorulu((s) => (s.metin = 'a'.repeat(140))))).toEqual(
        [],
      );
      await gecersiz(sorulu((s) => (s.metin = 'a'.repeat(141))));
      await gecersiz(sorulu((s) => (s.metin = '   ')));
    },
  );

  kabulQuiz('KK-115: tam 4 şık (3 ve 5 reddedilir)', async () => {
    await gecersiz(sorulu((s) => (s.secenekler = ['a', 'b', 'c'])));
    await gecersiz(sorulu((s) => (s.secenekler = ['a', 'b', 'c', 'd', 'e'])));
  });

  kabulQuiz(
    'KK-115: şık boş olamaz, en çok 40 karakter (40 geçer, 41 reddedilir)',
    async () => {
      await gecersiz(sorulu((s) => (s.secenekler[2] = '')));
      await gecersiz(sorulu((s) => (s.secenekler[2] = '  ')));
      expect(
        await gecerli(sorulu((s) => (s.secenekler[2] = 'x'.repeat(40)))),
      ).toEqual([]);
      await gecersiz(sorulu((s) => (s.secenekler[2] = 'x'.repeat(41))));
    },
  );

  kabulQuiz(
    'KK-115: şıklar birbirinin aynı olamaz (büyük/küçük harf ve boşluk yok sayılır)',
    async () => {
      await gecersiz(
        sorulu((s) => (s.secenekler = ['Evet', 'Hayır', 'Evet', 'Belki'])),
      );
      await gecersiz(
        sorulu((s) => (s.secenekler = ['Evet', 'Hayır', ' evet ', 'Belki'])),
      );
      await gecersiz(
        sorulu((s) => (s.secenekler = ['Ali Veli', 'x', 'y', 'ali  veli'])),
      );
      expect(
        await gecerli(
          sorulu((s) => (s.secenekler = ['Evet', 'Hayır', 'Belki', 'Hiçbiri'])),
        ),
      ).toEqual([]);
    },
  );

  kabulQuiz('KK-115: dogru 0–3 tam sayı', async () => {
    for (const d of [0, 1, 2, 3])
      expect(await gecerli(sorulu((s) => (s.dogru = d)))).toEqual([]);
    await gecersiz(sorulu((s) => (s.dogru = -1)));
    await gecersiz(sorulu((s) => (s.dogru = 4)));
    await gecersiz(sorulu((s) => (s.dogru = 1.5)));
  });

  kabulQuiz(
    'KK-115: zorluk kolay/orta/zor, tur olay/dunya dışına izin yok',
    async () => {
      await gecersiz(
        sorulu((s) => ((s as { zorluk: string }).zorluk = 'çok zor')),
      );
      await gecersiz(sorulu((s) => (s.tur = 'karisik')));
      await gecersiz(sorulu((s) => (s.tur = '')));
    },
  );

  kabulQuiz(
    'KK-115: en az 4 kaynak (3 reddedilir), her kaynakta ad ve url',
    async () => {
      await gecersiz(sorulu((s) => (s.kaynaklar = s.kaynaklar.slice(0, 3))));
      expect(
        await gecerli(
          sorulu((s) =>
            s.kaynaklar.push({ ad: 'Beşinci', url: 'https://ornek.test/5' }),
          ),
        ),
      ).toEqual([]);
      await gecersiz(sorulu((s) => (s.kaynaklar[0].url = '')));
      await gecersiz(sorulu((s) => (s.kaynaklar[0].ad = '')));
      await gecersiz(
        sorulu((s) => ((s as { kaynaklar?: unknown }).kaynaklar = undefined)),
      );
    },
  );

  kabulQuiz(
    'KK-115: uyum en az 0,75 (0,74 reddedilir, 0,75 ve 1 geçer); sayı olmalı',
    async () => {
      expect(await gecerli(sorulu((s) => (s.uyum = 0.75)))).toEqual([]);
      expect(await gecerli(sorulu((s) => (s.uyum = 1)))).toEqual([]);
      await gecersiz(sorulu((s) => (s.uyum = 0.74)));
      await gecersiz(sorulu((s) => (s.uyum = 0)));
      await gecersiz(sorulu((s) => ((s as { uyum?: unknown }).uyum = '0.9')));
      await gecersiz(
        sorulu((s) => ((s as { uyum?: unknown }).uyum = undefined)),
      );
    },
  );
});

describe('KK-115: bozuk biçim atmaz, hata döndürür', () => {
  kabulQuiz('KK-115: null, boş nesne, sorular dizi değil', async () => {
    const { quizHatalari } = await yukle();
    for (const x of [
      null,
      undefined,
      42,
      'x',
      [],
      {},
      { ...taban(), sorular: 'yok' },
      { ...taban(), sorular: [null, 3] },
    ])
      expect(() => quizHatalari(x)).not.toThrow();
    await gecersiz(null);
    await gecersiz({});
    await gecersiz({ ...taban(), sorular: 'yok' });
  });
});

describe('KK-115: uygulama paketi', () => {
  kabulQuiz(
    'KK-115: kaynaklar ve uyum uygulama paketine girmez; oyun alanları kalır',
    async () => {
      const { uygulamaPaketi } = await yukle();
      const p = uygulamaPaketi(taban());
      const json = JSON.stringify(p);
      expect(json).not.toContain('kaynaklar');
      expect(json).not.toContain('uyum');
      expect(json).not.toContain('ornek.test');
      expect(p.sorular).toHaveLength(24);
      expect(Object.keys(p.sorular[0]).sort()).toEqual([
        'dogru',
        'id',
        'metin',
        'secenekler',
        'tur',
        'zorluk',
      ]);
    },
  );
});

describe('KK-115: CI bağlantısı', () => {
  kabulQuiz(
    'KK-115: scripts/icerik-dogrula.ts content/quiz paketlerini quizHatalari ile denetler, ağ kullanmaz',
    () => {
      const k = readFileSync(
        new URL('../../scripts/icerik-dogrula.ts', import.meta.url),
        'utf8',
      );
      expect(k).toMatch(/quizHatalari/);
      expect(k).toMatch(/quiz/);
      expect(k).not.toMatch(/fetch\(|https?\.get|XMLHttpRequest/);
    },
  );
});

describe('KK-117: Faz 1 içerik kümesi', () => {
  const dosyalar = () =>
    readdirSync(new URL('../../content/quiz/', import.meta.url)).filter((f) =>
      f.endsWith('.json'),
    );
  const oku = () =>
    dosyalar().map(
      (f) =>
        JSON.parse(
          readFileSync(
            new URL(`../../content/quiz/${f}`, import.meta.url),
            'utf8',
          ),
        ) as Paket,
    );

  kabulQuiz(
    'KK-117: en az 3 paket; en az biri tr, en az biri yabanci; hepsi geçerli',
    async () => {
      const { quizHatalari } = await yukle();
      const paketler = oku();
      expect(paketler.length).toBeGreaterThanOrEqual(3);
      expect(paketler.some((p) => p.koken === 'tr')).toBe(true);
      expect(paketler.some((p) => p.koken === 'yabanci')).toBe(true);
      for (const p of paketler) expect(quizHatalari(p)).toEqual([]);
      expect(new Set(paketler.map((p) => p.id)).size).toBe(paketler.length);
    },
  );

  kabulQuiz(
    'KK-117: örnek/test paketi content/quiz altında yok (uygulamada görünmesin)',
    () => {
      expect(dosyalar().length).toBeGreaterThan(0); // klasör ve paketler var
      for (const p of oku())
        expect(p.id).not.toMatch(/ornek|örnek|test|deneme/i);
      for (const f of dosyalar())
        expect(f).not.toMatch(/ornek|örnek|test|deneme/i);
    },
  );
});
