// #275: Paket ekranı başlığı kategori sistemiyle uyumlu olmalı (tasarım: design/221-quiz-night/kategori.html → "Neyin fanısın?")
// ve #273'ten kalan ölü kod (`kategoriEmoji`) temizlenmeli.
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../../kabul';
import { dosyaIcerik } from '../../test/yardimci';

const kabulBaslik = BEKLEYEN.quizBaslikNeyin ? it.fails : it;

describe('#275: paket ekranı başlığı ve temizlik', () => {
  kabulBaslik(
    'app/quiz/paket.tsx başlığı "Neyin fanısın?"; "Hangi dizi?" kalmaz',
    () => {
      const kaynak = dosyaIcerik('app/quiz/paket.tsx');
      expect(kaynak).toContain('Neyin fanısın?');
      expect(kaynak).not.toContain('Hangi dizi?');
    },
  );

  kabulBaslik(
    'arayuz.ts ölü `kategoriEmoji` dışa aktarmaz (kartlar paketin kendi emojisini kullanır)',
    () => {
      expect(dosyaIcerik('src/games/quiz-night/arayuz.ts')).not.toMatch(
        /kategoriEmoji/,
      );
    },
  );
});
