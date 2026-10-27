import { describe, expect, it } from 'vitest';
import { rngOlustur } from '../core/rng';
import { kodGecerliMi, kodUret } from './oda';

describe('oda kodu (KK-29)', () => {
  it('6 rakam; önde sıfırlı kodlar da geçerli', () => {
    for (const k of ['000000', '012345', '999999', '123456'])
      expect(kodGecerliMi(k)).toBe(true);
  });
  it('6 hane dışı, harf, boşluk ve boş reddedilir', () => {
    for (const k of [
      '12345',
      '1234567',
      'ABCD12',
      'abcdef',
      '12 456',
      ' 12345',
      '',
      '12345a',
      '١٢٣٤٥٦',
    ])
      expect(kodGecerliMi(k), k).toBe(false);
  });
  it('üretilen kod her zaman geçerli, çeşitli ve önde sıfır içerebilir', () => {
    const rng = rngOlustur(11);
    const kodlar = Array.from({ length: 2000 }, () => kodUret(rng));
    expect(kodlar.every(kodGecerliMi)).toBe(true);
    expect(new Set(kodlar).size).toBeGreaterThan(1900);
    expect(kodlar.some((k) => k.startsWith('0'))).toBe(true);
  });
});
