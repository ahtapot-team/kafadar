// Quiz Night Faz 2, oda protokolü ve sunucu (issue #252, backend #253). PRD v9: KK-113 (ayrıca KK-70).
// SÖZLEŞME (src/oda/mesaj.ts, sunucu/src):
//   acilisOku: ?islem=kur&ad=Ali&oyun=quiz-night&paket=<quiz paket id'si> → { islem:'kur', ad, paket, oyun:'quiz-night' }
//   İstemci → sunucu: { t:'cevapla', sik: 0|1|2|3 } → Olay { tip:'cevapla', kimlik, sik }; { t:'cevapla', oy:'OK'|'NOK' } aynen sürer;
//     sik 0–3 tam sayı değilse (4, -1, 1.5, '1', null) null.
//   Sunucu → istemci: tamam{tur:'quiz-night'} | gorunum | final (quiz için quizFinal çıktısı) | hata. Bilinmeyen quiz paketi → hata 'tanimsiz'.
//   Sunucu content/quiz paketlerini pakete katar (üç paket); `kaynaklar`/`uyum` istemciye gitmez.
//   Smoke: sunucu/test/quiz.ts, .github/workflows/sunucu-smoke.yml içinde çalışır.
import { describe, expect, it } from 'vitest';
import * as mesaj from './mesaj';
import { dosyaIcerik } from '../test/yardimci';

type Api = {
  acilisOku(q: URLSearchParams): unknown;
  mesajiOlayaCevir(m: unknown, kimlik: string): unknown;
};
const M = mesaj as unknown as Api;
const q = (s: string) => new URLSearchParams(s);

describe('KK-113: protokol', () => {
  it('quiz odası kurma adresi okunur', () => {
    expect(
      M.acilisOku(q('islem=kur&ad=Ali&oyun=quiz-night&paket=hababam-sinifi')),
    ).toEqual({
      islem: 'kur',
      ad: 'Ali',
      paket: 'hababam-sinifi',
      oyun: 'quiz-night',
    });
  });

  it('mevcut kurma adresleri değişmez (KK-70)', () => {
    expect(M.acilisOku(q('islem=kur&ad=Ali&paket=cift'))).toMatchObject({
      oyun: 'ok-mu-nok',
      paket: 'cift',
    });
    expect(
      M.acilisOku(q('islem=kur&ad=Ali&oyun=on-on-ama&paket=gundelik')),
    ).toMatchObject({ oyun: 'on-on-ama' });
  });

  it('{t:"cevapla", sik} şık olayına çevrilir; 0 geçerli', () => {
    expect(M.mesajiOlayaCevir({ t: 'cevapla', sik: 2 }, 'k1')).toEqual({
      tip: 'cevapla',
      kimlik: 'k1',
      sik: 2,
    });
    expect(M.mesajiOlayaCevir({ t: 'cevapla', sik: 0 }, 'k1')).toEqual({
      tip: 'cevapla',
      kimlik: 'k1',
      sik: 0,
    });
  });

  it('geçersiz şık mesajı reddedilir (null)', () => {
    for (const sik of [4, -1, 1.5, '1', null, undefined, Number.NaN])
      expect(M.mesajiOlayaCevir({ t: 'cevapla', sik }, 'k1')).toBeNull();
    expect(M.mesajiOlayaCevir({ t: 'cevapla' }, 'k1')).toBeNull();
  });

  it('OK mu NOK mu cevabı ve diğer mesajlar aynen çalışır (KK-70)', () => {
    expect(M.mesajiOlayaCevir({ t: 'cevapla', oy: 'OK' }, 'k1')).toEqual({
      tip: 'cevapla',
      kimlik: 'k1',
      oy: 'OK',
    });
    expect(M.mesajiOlayaCevir({ t: 'sonraki' }, 'k1')).toEqual({
      tip: 'sonraki',
      kimlik: 'k1',
    });
    expect(M.mesajiOlayaCevir({ t: 'puanla', puan: 4 }, 'k1')).toMatchObject({
      tip: 'puanla',
    });
  });
});

describe('KK-113: sunucu kabuğu ve smoke bağlantısı (kaynak sözleşmesi)', () => {
  const sunucu = () =>
    ['worker.ts', 'oda-do.ts', 'ortak.ts']
      .map((d) => dosyaIcerik(`sunucu/src/${d}`))
      .join('\n');

  it('sunucu quiz-night odasını ve content/quiz paketlerini tanır', () => {
    const k = sunucu();
    expect(k).toMatch(/quiz-night/);
    expect(k).toMatch(/content\/quiz/);
  });

  it('smoke betiği var ve sunucu-smoke iş akışında çalışır', () => {
    expect(dosyaIcerik('sunucu/test/quiz.ts')).toMatch(/quiz-night/);
    expect(dosyaIcerik('.github/workflows/sunucu-smoke.yml')).toMatch(
      /sunucu\/test\/quiz\.ts/,
    );
  });
});
