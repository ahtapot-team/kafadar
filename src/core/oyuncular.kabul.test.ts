import { describe, expect, it } from 'vitest';
import {
  baslayabilir,
  benzersizIsim,
  ekleyebilir,
  isimDuzelt,
  isimHatasi,
} from './oyuncular';

const oniki = Array.from({ length: 12 }, (_, i) => `Oyuncu${i + 1}`);

describe('KK-3: oyuncu sayısı 2–12', () => {
  it('2 oyuncunun altında Başla pasif, nedeni yazılı', () => {
    for (const liste of [[], ['Ali']]) {
      const s = baslayabilir(liste);
      expect(s.tamam).toBe(false);
      expect(s.neden).toBeTruthy();
    }
  });

  it('2 ve 12 oyuncuda Başla aktif', () => {
    expect(baslayabilir(['Ali', 'Ayşe']).tamam).toBe(true);
    expect(baslayabilir(oniki).tamam).toBe(true);
  });

  it('12 oyuncuda ekleme alanı gizlenir', () => {
    expect(ekleyebilir(oniki.slice(0, 11))).toBe(true);
    expect(ekleyebilir(oniki)).toBe(false);
  });
});

describe('KK-4: isim kuralları', () => {
  it('boşluklar kırpılır, boş isim hata verir', () => {
    expect(isimDuzelt('  Ali  ')).toBe('Ali');
    expect(isimHatasi('   ')).toBeTruthy();
    expect(isimHatasi('')).toBeTruthy();
    expect(isimHatasi('  Ali  ')).toBeNull();
  });

  it('kırpılmış 16 karakter kabul, 17 karakter hata', () => {
    expect(isimHatasi('a'.repeat(16))).toBeNull();
    expect(isimHatasi(`  ${'a'.repeat(16)}  `)).toBeNull();
    expect(isimHatasi('a'.repeat(17))).toBeTruthy();
  });

  it('Türkçe karakter ve emoji desteklenir (emoji tek karakter sayılır)', () => {
    expect(isimHatasi('Şükrü İğdır')).toBeNull();
    expect(isimHatasi('👍'.repeat(16))).toBeNull();
    expect(isimHatasi('👍'.repeat(17))).toBeTruthy();
  });

  it('aynı isimde "Ali 2" önerilir, sonra "Ali 3"', () => {
    expect(benzersizIsim('Ali', ['Ali'])).toBe('Ali 2');
    expect(benzersizIsim('Ali', ['Ali', 'Ali 2'])).toBe('Ali 3');
    expect(benzersizIsim('Ayşe', ['Ali'])).toBe('Ayşe');
    expect(benzersizIsim(' Ali ', ['Ali'])).toBe('Ali 2');
  });
});
