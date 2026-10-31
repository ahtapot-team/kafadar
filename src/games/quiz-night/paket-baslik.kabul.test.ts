// #275: Paket ekranı başlığı kategori sistemiyle uyumlu olmalı (tasarım: design/221-quiz-night/kategori.html → "Neyin fanısın?")
// ve #273'ten kalan ölü kod (`kategoriEmoji`) temizlenmeli.
import { describe, expect, it } from 'vitest';
import { dosyaIcerik } from '../../test/yardimci';

describe('#275: paket ekranı başlığı ve temizlik', () => {
  it('app/quiz/paket.tsx başlığı "Neyin fanısın?"; "Hangi dizi?" kalmaz', () => {
    const kaynak = dosyaIcerik('app/quiz/paket.tsx');
    expect(kaynak).toContain('Neyin fanısın?');
    expect(kaynak).not.toContain('Hangi dizi?');
  });

  it('arayuz.ts ölü `kategoriEmoji` dışa aktarmaz (kartlar paketin kendi emojisini kullanır)', () => {
    expect(dosyaIcerik('src/games/quiz-night/arayuz.ts')).not.toMatch(
      /kategoriEmoji/,
    );
  });
});
