// Görsel yenileme, paket ekranı (PRD v11, issue #293 → frontend #296): KK-131, KK-132 (ekran), KK-134, KK-135.
// SÖZLEŞME (frontend için) — app/quiz/paket.tsx:
//   Büyük kartlar: quiz-paket-<id> (basılabilir, accessibilityLabel = paketBasligi) · quiz-paket-gorsel-<id> (<Image>, paketin `gorsel` alanı,
//   süs: ekran okuyucudan gizli) · quiz-paket-notu-<id> (not + Türk/Yabancı etiketi, KK-122 kuralları) · kategori deseni (film şeridi / plak /
//   saha çizgisi) kategoriden gelir: quiz-paket-desen-<kategori>. Kulüp rengi, arma, logo yok. Kategori çipleri KK-121 gibi.
//   Emoji yok (ne `p.emoji` ne karakter). Yazılar ≥12 px, tema token'ları, dokunma ≥48.
import { describe, expect, it } from 'vitest';
import { dosyaIcerik } from '../../test/yardimci';

const kabulP = it;
const kod = (t: string) =>
  t
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((s) => s.replace(/(^|\s)\/\/.*$/, '$1'))
    .join('\n');
const paket = () => dosyaIcerik('app/quiz/paket.tsx');

describe('KK-131: büyük paket kartları', () => {
  kabulP(
    'KK-131: kart paketin görselini <Image> ile çizer (quiz-paket-gorsel-<id>), emoji değil',
    () => {
      const k = paket();
      expect(k).toMatch(/<Image\b/);
      expect(k).toMatch(/testID=\{`quiz-paket-gorsel-\$\{/);
      expect(k).toMatch(/\.gorsel\b/);
      expect(k).not.toMatch(/\.emoji\b/);
    },
  );

  kabulP(
    'KK-131: kategori deseni (quiz-paket-desen-<kategori>); başlık, not ve etiket KK-122 kurallarından',
    () => {
      const k = paket();
      expect(k).toMatch(/quiz-paket-desen-/);
      for (const ad of ['paketBasligi', 'paketNotu', 'kokenMetni'])
        expect(k, ad).toContain(ad);
      expect(k).toContain('quiz-paket-notu-');
      expect(k).toContain('Neyin fanısın?');
    },
  );

  kabulP(
    'KK-131: kart büyük (görsel kartın en az 96 px yüksekliğinde/genişliğinde)',
    () => {
      const k = kod(paket());
      const olculer = [
        ...k.matchAll(/(?:width|height|minHeight):\s*(\d+)/g),
      ].map((m) => Number(m[1]));
      expect(olculer.some((n) => n >= 96)).toBe(true);
      expect(k).toMatch(/<Image\b/);
    },
  );

  it('KK-131: kategori çipleri (quiz-kategori-*) ve paket kartları (quiz-paket-<id>) korunur', () => {
    const k = paket();
    expect(k).toContain('quiz-paket-');
    expect(k).toContain('KATEGORI_CIPLERI');
    expect(k).toContain('kategoriSec');
  });
});

describe('KK-134: paket ekranında emoji yok', () => {
  kabulP(
    'KK-134: app/quiz/paket.tsx kodunda emoji karakteri yok, görsel var',
    () => {
      const k = kod(paket());
      expect(k).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(k).not.toMatch(/\bemoji\b/);
      expect(k).toMatch(/<Image\b/);
    },
  );
});

describe('KK-135: paket ekranı erişilebilirliği', () => {
  kabulP('KK-135: yazılar ≥12 px (11 px not kalktı), sabit renk yok', () => {
    const k = kod(paket());
    const boyutlar = [...k.matchAll(/fontSize:\s*(\d+)/g)].map((m) =>
      Number(m[1]),
    );
    for (const n of boyutlar) expect(n).toBeGreaterThanOrEqual(12);
    expect(k).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    expect(k).toMatch(/<Image\b/);
  });

  kabulP(
    'KK-135: kart başlıkla okunur, görsel süstür; dokunma alanı ≥48 ve basma animasyonu "Hareketi azalt"a uyar',
    () => {
      const k = paket();
      expect(k).toMatch(/accessibilityLabel=\{paketBasligi\(/);
      expect(k).toMatch(
        /accessibilityElementsHidden|importantForAccessibility="no/,
      );
      expect(k).toMatch(/dokunmaAlani|minHeight:\s*(4[89]|[5-9]\d|\d{3})/);
      expect(k).toMatch(/isReduceMotionEnabled|useReduceMotion|hareketAzalt/);
    },
  );
});
