// Quiz Night Faz 2 oda ekranları (issue #252, frontend #254; tasarım design/221-quiz-night/ekranlar.html "Oda (Faz 2)"). PRD v9: KK-113 (+KK-111, KK-114 oda kısmı).
// Arayüz test aracı yok (Semih 1C): saf kurallar + testID/kaynak sözleşmesi; dokunma/titreşim telefonda insanlarca doğrulanır.
// SÖZLEŞME (frontend #254 için) — src/games/quiz-night/arayuz.ts (React yok):
//   QUIZ_ODA_SURE_MS = 20_000
//   odaSayac(kalanMs): { oran: 0..1 (kalanMs / 20000, sınırlanır), saniye: ceil(kalanMs/1000) (0..20), titret: 0 < kalanMs ≤ 5000 }
//   odaSikRengi(sik, dogru: number | null, benim: number | null): 'kilitli' | 'ok' | 'nok' | 'notr'
//       açıklamadan önce (dogru === null): kendi seçtiğim şık 'kilitli', diğerleri 'notr' (kimse doğruyu/başkasını görmez)
//       açıklamada: doğru şık 'ok'; doğru olmayıp benim seçtiğim 'nok'; kalan 'notr'
//   testID'ler oda ekranı kaynaklarında (src/oyun-ekranlari/quiz/, src/oda-ui/, app/) geçer:
//     quiz-mod-oda-kur, quiz-mod-oda-katil, quiz-sayac, quiz-cevapladi, quiz-kimler- (açıklamada kim neyi seçti), quiz-oda-sonraki
//     (yalnız sonrakiGorunur), quiz-oda-bekle ("Murat sonraki soruyu açacak" — kuran dışı)
//   Ekran kodu görünümden sonrakiGorunur, kalanMs, benimSikkim, aciklama alanlarını okur; oda sonucu quizFinal().siralama'yı
//   sonucSatirlari / paylasimKarti'ya (mod:'grup') verir; süre azalırken titresim kullanılır.
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../../kabul';
import { kaynaklar } from '../../test/yardimci';

type Api = {
  QUIZ_ODA_SURE_MS: number;
  odaSayac(k: number): { oran: number; saniye: number; titret: boolean };
  odaSikRengi(
    sik: number,
    dogru: number | null,
    benim: number | null,
  ): 'kilitli' | 'ok' | 'nok' | 'notr';
};
const yol = './arayuz';
const A = (await import(/* @vite-ignore */ yol)) as unknown as Api;
const kabul = BEKLEYEN.quizOdaEkran ? it.fails : it;

describe('KK-113: oda sayacı', () => {
  kabul('20 sn tam doluyla başlar, oran ve saniye azalır', () => {
    expect(A.QUIZ_ODA_SURE_MS).toBe(20_000);
    expect(A.odaSayac(20_000)).toEqual({ oran: 1, saniye: 20, titret: false });
    expect(A.odaSayac(10_000)).toEqual({
      oran: 0.5,
      saniye: 10,
      titret: false,
    });
    expect(A.odaSayac(9_001).saniye).toBe(10);
  });

  kabul(
    'son 5 saniyede titrer; süre bitince sıfır, aşırı değerler sınırlanır',
    () => {
      expect(A.odaSayac(5_001).titret).toBe(false);
      expect(A.odaSayac(5_000).titret).toBe(true);
      expect(A.odaSayac(1).titret).toBe(true);
      expect(A.odaSayac(0)).toEqual({ oran: 0, saniye: 0, titret: false });
      expect(A.odaSayac(-300)).toEqual({ oran: 0, saniye: 0, titret: false });
      expect(A.odaSayac(99_999).oran).toBe(1);
    },
  );
});

describe('KK-113: oda şık renkleri', () => {
  kabul(
    'açıklamadan önce yalnız kendi şıkkım kilitli görünür, doğru bilinmez',
    () => {
      expect([0, 1, 2, 3].map((i) => A.odaSikRengi(i, null, 2))).toEqual([
        'notr',
        'notr',
        'kilitli',
        'notr',
      ]);
      expect([0, 1, 2, 3].map((i) => A.odaSikRengi(i, null, null))).toEqual([
        'notr',
        'notr',
        'notr',
        'notr',
      ]);
    },
  );

  kabul(
    'açıklamada doğru yeşil, yanlış seçtiğim kırmızı, kalanlar nötr',
    () => {
      expect([0, 1, 2, 3].map((i) => A.odaSikRengi(i, 1, 3))).toEqual([
        'notr',
        'ok',
        'notr',
        'nok',
      ]);
      expect([0, 1, 2, 3].map((i) => A.odaSikRengi(i, 1, 1))).toEqual([
        'notr',
        'ok',
        'notr',
        'notr',
      ]);
      expect([0, 1, 2, 3].map((i) => A.odaSikRengi(i, 2, null))).toEqual([
        'notr',
        'notr',
        'ok',
        'notr',
      ]);
    },
  );
});

describe('KK-113: oda ekranı kaynak sözleşmesi', () => {
  const k = () =>
    ['src/oyun-ekranlari/quiz', 'src/oda-ui', 'app']
      .flatMap((d) => kaynaklar(d))
      .map(({ icerik }) => icerik)
      .join('\n');

  kabul("testID'ler oda ekranlarında geçer", () => {
    const kaynak = k();
    const eksik = [
      'quiz-mod-oda-kur',
      'quiz-mod-oda-katil',
      'quiz-sayac',
      'quiz-cevapladi',
      'quiz-kimler-',
      'quiz-oda-sonraki',
      'quiz-oda-bekle',
    ].filter((t) => !kaynak.includes(t));
    expect(eksik).toEqual([]);
  });

  kabul('ekran görünüm alanlarını ve saf kuralları kullanır', () => {
    const kaynak = k();
    for (const ad of [
      'sonrakiGorunur',
      'kalanMs',
      'benimSikkim',
      'odaSayac',
      'odaSikRengi',
      'quizFinal|siralama',
    ])
      expect(kaynak, ad).toMatch(new RegExp(ad));
    expect(kaynak).toMatch(/titre/i);
  });
});
