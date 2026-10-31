// Quiz Night kategorileri (issue #262; PRD v10, backend #263): içerik şeması ve ilk içerik — KK-120, KK-125.
// SÖZLEŞME (backend #263 için) — src/icerik/quiz.ts (React yok), content/quiz/*.json:
//   paket.kategori: 'dizi-film' | 'muzik' | 'spor' (ZORUNLU; eksik ya da başka değer → quizHatalari hata verir)
//   paket.koken: 'tr' | 'yabanci' YALNIZ dizi-film paketinde bulunur ve orada zorunludur; muzik/spor paketinde bulunmaz
//   paket.baslik: isteğe bağlı metin, en çok 40 karakter ("baslik" yoksa başlık "Ne kadar <ad> fanısın?")
//   muzik ve spor paketlerinde `olay` sorusu yoktur (hepsi `dunya`); dizi-film için KK-115 kuralı (olay < yarı) aynen sürer
//   uygulamaPaketi(dosya): `kategori` ve (varsa) `baslik` alanlarını da taşır; `koken` yalnız dizi-film paketinde çıkar
//   Mevcut 3 paket (ask-i-memnu, hababam-sinifi, prison-break) kategori:'dizi-film' olur (koken'leri aynen kalır).
//   KK-125 ilk içerik: Spor 3 paket (Galatasaray, Fenerbahçe, Beşiktaş), Müzik 4 paket (Manifest, Emircan İğrek, BLOK3,
//   Mabel Matiz); paket emojileri (tasarım #270): Galatasaray/Fenerbahçe/Beşiktaş ⚽, Manifest 💃, Emir Can İğrek 🎸,
//   BLOK3 🎤, Mabel Matiz 🎶; her pakette 24 soru (8 kolay, 8 orta, 8 zor) ve 4 unvan. (Bir paket kaynak yetersizliğiyle çıkarılırsa PRD
//   gruba sorulur; o zaman bu testin listesi QA'ca güncellenir.)
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../kabul';

const kabulIcerik = BEKLEYEN.quizKategoriIcerik ? it.fails : it;

type Dosya = Record<string, unknown>;
type DogrulaApi = {
  quizHatalari(d: unknown): string[];
  uygulamaPaketi(d: unknown): Record<string, unknown>;
};
const yol = './quiz';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as DogrulaApi;

const soru = (i: number, zorluk: string, tur = 'dunya') => ({
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
// 24 soru (8/8/8); ilk `olay` tanesi olay türünde.
const paket = (extra: Dosya, olay = 0): Dosya => ({
  id: 'deneme',
  ad: 'Deneme',
  emoji: '🎬',
  unvanlar: ['Yabancı', 'Seyirci', 'Hayran', 'Baş hayran'],
  sorular: Array.from({ length: 24 }, (_, i) =>
    soru(
      i + 1,
      ['kolay', 'orta', 'zor'][Math.floor(i / 8)],
      i < olay ? 'olay' : 'dunya',
    ),
  ),
  ...extra,
});
const dizi = (extra: Dosya = {}, olay = 8) =>
  paket({ kategori: 'dizi-film', koken: 'tr', ...extra }, olay);
const hatali = async (d: unknown) =>
  expect((await yukle()).quizHatalari(d).length).toBeGreaterThan(0);
const temiz = async (d: unknown) =>
  expect((await yukle()).quizHatalari(d)).toEqual([]);

describe('KK-120: kategori alanı', () => {
  kabulIcerik(
    'KK-120: üç kategori geçerli; eksik ya da başka değer reddedilir',
    async () => {
      await temiz(dizi());
      await temiz(paket({ kategori: 'muzik' }));
      await temiz(paket({ kategori: 'spor' }));
      await hatali(paket({ koken: 'tr' })); // kategori yok
      for (const k of ['oyun', 'Muzik', 'dizi', '', null, 3, ['spor']])
        await hatali(paket({ kategori: k }));
    },
  );

  // Zaten geçiyor (KK-115 kuralı): düz `it`; #263 sonrası da geçmeli.
  it('KK-120: dizi-film paketinde koken zorunlu ve tr/yabanci olmalı', async () => {
    await temiz(dizi({ koken: 'yabanci' }));
    await hatali(paket({ kategori: 'dizi-film' }));
    await hatali(dizi({ koken: 'diger' }));
  });

  kabulIcerik(
    'KK-120: koken yalnız dizi-film paketinde bulunur (muzik/spor için tr ya da yabanci de reddedilir)',
    async () => {
      for (const k of ['muzik', 'spor']) {
        await temiz(paket({ kategori: k }));
        await hatali(paket({ kategori: k, koken: 'tr' }));
        await hatali(paket({ kategori: k, koken: 'yabanci' }));
      }
    },
  );

  kabulIcerik(
    'KK-120: baslik isteğe bağlı, en çok 40 karakter (40 geçer, 41 reddedilir)',
    async () => {
      await temiz(dizi({ baslik: 'a'.repeat(40) }));
      await hatali(dizi({ baslik: 'a'.repeat(41) }));
      await temiz(
        paket({ kategori: 'spor', baslik: 'Ne kadar Galatasaraylısın?' }),
      );
    },
  );

  kabulIcerik(
    'KK-120: muzik ve spor paketinde olay sorusu yok (tek olay bile reddedilir); dizi-film için KK-115 kuralı sürer',
    async () => {
      for (const k of ['muzik', 'spor']) {
        await temiz(paket({ kategori: k }, 0));
        await hatali(paket({ kategori: k }, 1));
        await hatali(paket({ kategori: k }, 8));
      }
      await temiz(dizi({}, 11));
      await hatali(dizi({}, 12)); // yarısı = reddedilir (KK-115)
    },
  );

  kabulIcerik(
    'KK-120: uygulama paketi kategori ve baslik taşır; koken yalnız dizi-film için çıkar; kaynaklar/uyum girmez',
    async () => {
      const { uygulamaPaketi } = await yukle();
      const d = uygulamaPaketi(dizi({ baslik: 'Ne kadar X fanısın?' }));
      expect(d).toMatchObject({
        kategori: 'dizi-film',
        koken: 'tr',
        baslik: 'Ne kadar X fanısın?',
      });
      const m = uygulamaPaketi(paket({ kategori: 'muzik' }));
      expect(m.kategori).toBe('muzik');
      expect(m.koken).toBeUndefined();
      expect(m.baslik).toBeUndefined();
      const sorular = (m.sorular as Record<string, unknown>[])[0];
      expect(sorular.kaynaklar).toBeUndefined();
      expect(sorular.uyum).toBeUndefined();
    },
  );
});

const paketleri = (): Dosya[] =>
  readdirSync(new URL('../../content/quiz/', import.meta.url))
    .filter((f) => f.endsWith('.json'))
    .map(
      (f) =>
        JSON.parse(
          readFileSync(
            new URL(`../../content/quiz/${f}`, import.meta.url),
            'utf8',
          ),
        ) as Dosya,
    );

describe('KK-120: gerçek paketler', () => {
  kabulIcerik(
    'KK-120: her paketin kategorisi var; mevcut 3 paket dizi-film ve koken taşır',
    async () => {
      const ps = paketleri();
      for (const p of ps)
        expect(['dizi-film', 'muzik', 'spor'], String(p.id)).toContain(
          p.kategori,
        );
      for (const id of ['ask-i-memnu', 'hababam-sinifi', 'prison-break'])
        expect(ps.find((p) => p.id === id)?.kategori, id).toBe('dizi-film');
      for (const p of ps)
        expect(p.koken === undefined, String(p.id)).toBe(
          p.kategori !== 'dizi-film',
        );
    },
  );

  kabulIcerik(
    'KK-120: tüm gerçek paketler quizHatalari ile geçerli (npm run icerik)',
    async () => {
      const { quizHatalari } = await yukle();
      for (const p of paketleri())
        expect(quizHatalari(p), String(p.id)).toEqual([]);
      expect(paketleri().every((p) => typeof p.kategori === 'string')).toBe(
        true,
      );
    },
  );
});

describe('KK-125: ilk içerik (Spor 3, Müzik 4; her pakette 24 soru 8/8/8 ve 4 unvan)', () => {
  const norm = (t: unknown) => String(t).toLocaleLowerCase('tr');
  const var_ = (kategori: string, ad: string) =>
    paketleri().find(
      (p) => p.kategori === kategori && norm(p.ad).includes(norm(ad)),
    );

  kabulIcerik(
    'KK-125: Spor: Galatasaray, Fenerbahçe, Beşiktaş paketleri var',
    async () => {
      for (const ad of ['Galatasaray', 'Fenerbahçe', 'Beşiktaş'])
        expect(var_('spor', ad), ad).toBeDefined();
      expect(
        paketleri().filter((p) => p.kategori === 'spor').length,
      ).toBeGreaterThanOrEqual(3);
    },
  );

  kabulIcerik(
    'KK-125: Müzik: Manifest, Emircan İğrek, BLOK3, Mabel Matiz paketleri var',
    async () => {
      for (const ad of ['Manifest', 'Emircan İğrek', 'BLOK3', 'Mabel Matiz'])
        expect(var_('muzik', ad), ad).toBeDefined();
      expect(
        paketleri().filter((p) => p.kategori === 'muzik').length,
      ).toBeGreaterThanOrEqual(4);
    },
  );

  kabulIcerik(
    'KK-125: müzik ve spor paketlerinde tam 24 soru (8 kolay, 8 orta, 8 zor) ve 4 unvan',
    async () => {
      const ps = paketleri().filter(
        (p) => p.kategori === 'muzik' || p.kategori === 'spor',
      );
      expect(ps.length).toBeGreaterThanOrEqual(7);
      for (const p of ps) {
        const s = p.sorular as { zorluk: string }[];
        expect(s.length, String(p.id)).toBe(24);
        for (const z of ['kolay', 'orta', 'zor'])
          expect(
            s.filter((x) => x.zorluk === z).length,
            `${String(p.id)} ${z}`,
          ).toBe(8);
        expect((p.unvanlar as unknown[]).length, String(p.id)).toBe(4);
      }
    },
  );

  kabulIcerik(
    'KK-125: paket emojileri tasarımdaki gibi (Spor ⚽; Manifest 💃, İğrek 🎸, BLOK3 🎤, Mabel Matiz 🎶)',
    async () => {
      for (const ad of ['Galatasaray', 'Fenerbahçe', 'Beşiktaş'])
        expect(var_('spor', ad)?.emoji, ad).toBe('⚽');
      const m: [string, string][] = [
        ['Manifest', '💃'],
        ['İğrek', '🎸'],
        ['BLOK3', '🎤'],
        ['Mabel Matiz', '🎶'],
      ];
      for (const [ad, e] of m) expect(var_('muzik', ad)?.emoji, ad).toBe(e);
    },
  );
});
