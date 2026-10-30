// v8.1 (KK-101, KK-102, KK-105) — issue #205. Çip kuralları (KK-103, KK-104): src/games/kategori.kabul.test.ts.
// Arayüz test aracı yok (Semih 1C): kaynak sözleşmesi testleri; telefonda yazı tipi Expo Go'da insanlarca doğrulanır.
// SÖZLEŞME (frontend için):
//   KK-101: src/acilis/ekran.tsx'te "Kafadar" logosu (testID acilis-ad) `fontHazir` olmadan çizilmez
//           (`{fontHazir && …}`, `fontHazir ? … : null` ya da opacity/görünürlük `fontHazir`a bağlı);
//           açılış ve ana ekran logosu aynı `<Yazi tur="baslikXl">` kullanır (aynı yazı tipi ve kalınlık).
//   KK-102: app/index.tsx'te "Bir oyun seç, telefonu ele ver." yok; logo ile çip satırı arasında yerine yazı gelmez.
//   KK-105: CLAUDE.md ve docs/MIMARI.md kişi çiplerini "Tümü · 1 kişi · 2 kişi · 3+ kişi" olarak anlatır.
import { describe, expect, it } from 'vitest';
import { dosyaIcerik } from './test/yardimci';

describe('KK-101: açılış logosu yazı tipi hazır olmadan çizilmez', () => {
  it('KK-101: açılıştaki "Kafadar" (acilis-ad) fontHazir koşuluna bağlı', () => {
    const e = dosyaIcerik('src/acilis/ekran.tsx');
    const i = e.indexOf('testID="acilis-ad"');
    expect(i).toBeGreaterThan(-1);
    const oncesi = e.slice(Math.max(0, i - 1800), i);
    expect(oncesi).toMatch(
      /fontHazir\s*(&&|\?)|opacity:\s*fontHazir|fontHazir\s*\?\s*1\s*:\s*0/,
    );
  });

  it('KK-101: açılış ve ana ekran logosu aynı yazı tipi tokenını kullanır (baslikXl: Bricolage 800)', () => {
    const e = dosyaIcerik('src/acilis/ekran.tsx');
    const a = dosyaIcerik('app/index.tsx');
    expect(e).toMatch(/<Yazi\s+tur="baslikXl"[^>]*testID="acilis-ad"/s);
    expect(a).toMatch(/<Yazi tur="baslikXl"[^>]*>\s*Kafadar\s*<\/Yazi>/);
    expect(dosyaIcerik('src/tema.ts')).toMatch(
      /baslikXl:\s*\{\s*fontFamily:\s*font\.kalin/,
    );
  });

  it('KK-101: yazı tipi yüklenemezse açılış takılmaz (fontHazir = yüklendi ya da hata; KK-96)', () => {
    const l = dosyaIcerik('app/_layout.tsx');
    expect(l).toMatch(/fontHazir=\{fontHazir \|\| !!fontHatasi\}/);
  });
});

describe('KK-102: ana ekranda alt yazı yok', () => {
  it('KK-102: "Bir oyun seç, telefonu ele ver." kaynakta geçmez', () => {
    expect(dosyaIcerik('app/index.tsx')).not.toMatch(/Bir oyun seç/);
  });

  it('KK-102: logo ile çip satırı arasında başka yazı gelmez (<Yazi> yok)', () => {
    const k = dosyaIcerik('app/index.tsx');
    const logo = k.indexOf('<Logo />');
    const cipler = k.indexOf('testID="kategori-cipleri"');
    expect(logo).toBeGreaterThan(-1);
    expect(cipler).toBeGreaterThan(logo);
    expect(k.slice(logo, cipler)).not.toMatch(/<Yazi\b|<Text\b/);
  });
});

describe('KK-105: diğer akışlar ve belgeler', () => {
  it('KK-105: CLAUDE.md ve MIMARI.md çipleri "Tümü · 1 kişi · 2 kişi · 3+ kişi" diye anlatır, eski çip adları kalmaz', () => {
    const mimari = dosyaIcerik('docs/MIMARI.md');
    const claude = dosyaIcerik('CLAUDE.md');
    expect(mimari).toContain('Tümü · 1 kişi · 2 kişi · 3+ kişi');
    for (const [ad, d] of [
      ['MIMARI', mimari],
      ['CLAUDE', claude],
    ])
      expect(d, ad).not.toMatch(/3–5 kişi|6\+ kişi/);
  });

  it('KK-105: açılış (KK-94…100), kart kişi sayısı (KK-89) ve ⓘ (KK-91) testleri yerinde (silinmedi)', () => {
    for (const d of [
      'src/acilis.kabul.test.ts',
      'src/icerik/soz.kabul.test.ts',
      'src/games/kategori.kabul.test.ts',
    ])
      expect(dosyaIcerik(d).length, d).toBeGreaterThan(500);
    expect(dosyaIcerik('src/games/kategori.kabul.test.ts')).toContain('KK-89:');
  });
});
