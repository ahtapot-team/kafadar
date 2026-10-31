// Quiz Night Faz 1 ekran sözleşmesi (issue #224 öncesi; tasarım #221 C · Karma, PR #231). PRD v9: KK-107…KK-112, KK-109.
// Arayüz test aracı yok (Semih 1C): testID/kaynak sözleşmesi + saf kural testleri; dokunma, titreşim ve paylaşım telefonda insanlarca
// doğrulanır (docs/GERCEK-CIHAZ-KONTROL.md). Saf kurallar `arayuz.ts` (arayuz.kabul.test.ts), kalıcılık `onceki.ts` (aşağıda).
// SÖZLEŞME (frontend #224 için):
//   testID'ler (ekranlarda geçmeli; "-" ile biten önek, sonuna indeks/id eklenir):
//     mod seçimi (KK-107): quiz-mod-tek, quiz-mod-grup (Faz 1'de oda testID'leri YOK: quiz-mod-oda-kur / quiz-mod-oda-katil)
//     paket seçimi (KK-108): quiz-koken-tumu, quiz-koken-tr, quiz-koken-yabanci, quiz-paket- (her kart), quiz-paket-notu
//     soru (KK-110): quiz-ilerleme ("3/10"), quiz-zorluk, quiz-soru, quiz-sik- (0..3)
//     grup (KK-112): quiz-goster ("Cevabı göster"), quiz-kim- (her oyuncu çipi), quiz-sonraki
//     sonuç (KK-111/112): quiz-sonuc, quiz-birinci (🏆 kartı, en üstte), quiz-sira- (satırlar), quiz-tekrar, quiz-baska-paket,
//                         quiz-paylas, quiz-kart (9:16 paylaşım kartı)
//   Ekran kodu saf kuralları kullanır: gorunenModlar, paketSuz, sikRengi (tek), grupSikRengi (grup), cevapKilitle, SONRAKI_BEKLEME_MS,
//   sonucSatirlari, paylasimKarti (arayuz.ts); turSec, durumGecerliMi (quiz.ts); uygulamaPaketi (src/icerik/quiz.ts).
//   Kayıttan okurken `durumGecerliMi` kullanılır (KK-14). Uygulama kodu `kaynaklar`/`uyum` alanlarını kullanmaz.
//   Kalıcılık (KK-109) — src/games/quiz-night/onceki.ts (React yok; Depo = src/core/kayit.ts):
//     ONCEKI_ANAHTAR(paketId) = `kafadar:quiz-onceki:${paketId}`
//     oncekiKaydet(depo, paketId, sorular: { id: string }[]): Promise<void>   yalnız SON turun id'leri (üzerine yazar)
//     oncekiOku(depo, paketId): Promise<string[]>   kayıt yok / bozuk / dizi değil → []; paketler birbirinden ayrı
//     Tur bitince (sonuç aşamasına geçerken) oncekiKaydet; yeni tur/Tekrar'da oncekiOku → turSec(havuz, tohum, onceki).
import { describe, expect, it } from 'vitest';
import type { Depo } from '../../core/kayit';
import { depoYap, dosyaIcerik, kaynaklar } from '../../test/yardimci';

type Onceki = {
  ONCEKI_ANAHTAR(paketId: string): string;
  oncekiKaydet(d: Depo, paketId: string, s: { id: string }[]): Promise<void>;
  oncekiOku(d: Depo, paketId: string): Promise<string[]>;
};
const yol = './onceki';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as Onceki;

// Quiz ekranı dosyaları: yolu "quiz" içeren ya da quiz- testID'si geçen (başka oyunların kaynağı sayılmaz).
const ekranKaynagi = () =>
  [...kaynaklar('app'), ...kaynaklar('src')]
    .filter(
      ({ f, icerik }) =>
        !f.startsWith('src/games/quiz-night/') &&
        !f.startsWith('src/icerik/') &&
        (/quiz/i.test(f) || /['"`]quiz-/.test(icerik)),
    )
    .map(({ icerik }) => icerik)
    .join('\n');

describe('KK-107…KK-112: ekranlar sözleşmedeki testID adlarını kullanır', () => {
  const TESTIDLER = [
    'quiz-mod-tek', // KK-107
    'quiz-mod-grup',
    'quiz-koken-tumu', // KK-108
    'quiz-koken-tr',
    'quiz-koken-yabanci',
    'quiz-paket-',
    'quiz-paket-notu',
    'quiz-ilerleme', // KK-110
    'quiz-zorluk',
    'quiz-soru',
    'quiz-sik-',
    'quiz-goster', // KK-112
    'quiz-kim-',
    'quiz-sonraki',
    'quiz-sonuc', // KK-111
    'quiz-birinci',
    'quiz-sira-',
    'quiz-tekrar',
    'quiz-baska-paket',
    'quiz-paylas',
    'quiz-kart',
  ];

  it('tüm testID adları ekran kaynaklarında geçer', () => {
    const k = ekranKaynagi();
    expect(TESTIDLER.filter((t) => !k.includes(t))).toEqual([]);
  });

  it('KK-107: Faz 1 ekranlarında oda seçenekleri yoktur', () => {
    const k = ekranKaynagi();
    expect(k).not.toMatch(/quiz-mod-oda/);
    expect(k).toMatch(/gorunenModlar/); // mod listesi kuraldan gelir
  });
});

describe('KK-107…KK-112: ekranlar saf kuralları kullanır', () => {
  it('ekran kodu sözleşmedeki kuralları çağırır', () => {
    const k = ekranKaynagi();
    for (const ad of [
      'gorunenModlar',
      'paketSuz',
      'sikRengi',
      'grupSikRengi', // grupta doğru şık göstere kadar belli olmaz (KK-112)
      'cevapKilitle',
      'SONRAKI_BEKLEME_MS',
      'sonucSatirlari',
      'paylasimKarti',
      'turSec',
      'uygulamaPaketi',
      'oncekiKaydet',
      'oncekiOku',
    ])
      expect(k, ad).toContain(ad);
  });

  it('kayıttan okurken durumGecerliMi kullanılır (KK-14)', () => {
    expect(ekranKaynagi()).toMatch(/durumGecerliMi/);
  });

  it('uygulama kodu kaynaklar/uyum alanlarını okumaz (yalnız içerikte durur)', () => {
    const dosyalar = [...kaynaklar('app'), ...kaynaklar('src')].filter(
      ({ f }) =>
        /quiz/i.test(f) &&
        !f.includes('/icerik/') &&
        !f.endsWith('quiz.ts') &&
        !f.endsWith('quiz-dogrula.ts'),
    );
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar)
      expect(icerik, f).not.toMatch(/\.kaynaklar\b|\.uyum\b/);
  });

  it('KK-110: titreşim yalnız tek başına yanlış cevapta (mevcut titresim.ts)', () => {
    const k = ekranKaynagi();
    expect(k).toMatch(/titresim/);
  });

  it('KK-108: paket kartında afiş/logo/dizi yazı tipi için yeni görsel bağımlılığı yok', () => {
    const paket = JSON.parse(dosyaIcerik('package.json')) as {
      dependencies?: Record<string, string>;
    };
    expect(Object.keys(paket.dependencies ?? {}).join(' ')).not.toMatch(
      /quiz|poster|afis/i,
    );
  });
});

describe('KK-109: önceki turun soruları cihazda saklanır', () => {
  it('anahtar pakete özeldir', async () => {
    const { ONCEKI_ANAHTAR } = await yukle();
    expect(ONCEKI_ANAHTAR('ask-i-memnu')).toBe(
      'kafadar:quiz-onceki:ask-i-memnu',
    );
    expect(ONCEKI_ANAHTAR('prison-break')).not.toBe(
      ONCEKI_ANAHTAR('ask-i-memnu'),
    );
  });

  it("kaydedilen id'ler geri okunur; yalnız son tur kalır", async () => {
    const { oncekiKaydet, oncekiOku } = await yukle();
    const depo = depoYap();
    await oncekiKaydet(depo, 'p', [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    expect(await oncekiOku(depo, 'p')).toEqual(['a', 'b', 'c']);
    await oncekiKaydet(depo, 'p', [{ id: 'x' }, { id: 'y' }]);
    expect(await oncekiOku(depo, 'p')).toEqual(['x', 'y']);
  });

  it('paketler birbirini etkilemez', async () => {
    const { oncekiKaydet, oncekiOku } = await yukle();
    const depo = depoYap();
    await oncekiKaydet(depo, 'p1', [{ id: 'a' }]);
    await oncekiKaydet(depo, 'p2', [{ id: 'b' }]);
    expect(await oncekiOku(depo, 'p1')).toEqual(['a']);
    expect(await oncekiOku(depo, 'p2')).toEqual(['b']);
    expect(await oncekiOku(depo, 'p3')).toEqual([]);
  });

  it('kayıt yok, bozuk ya da dizi değilse boş dizi döner (çökmez)', async () => {
    const { oncekiOku, ONCEKI_ANAHTAR } = await yukle();
    const depo = depoYap();
    expect(await oncekiOku(depo, 'p')).toEqual([]);
    for (const bozuk of ['{', 'null', '"x"', '{"a":1}', '[1,2]', '["a",2]']) {
      depo.veri.set(ONCEKI_ANAHTAR('p'), bozuk);
      expect(await oncekiOku(depo, 'p'), bozuk).toEqual([]);
    }
  });
});
