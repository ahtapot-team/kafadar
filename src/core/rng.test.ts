import { describe, expect, it } from 'vitest';
import { karistir, rngOlustur } from './rng';

describe('rng', () => {
  it('aynı tohum aynı sırayı verir', () => {
    const kartlar = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(karistir(kartlar, rngOlustur(42))).toEqual(
      karistir(kartlar, rngOlustur(42)),
    );
  });
  it('farklı tohum farklı sıra verir', () => {
    const kartlar = Array.from({ length: 20 }, (_, i) => i);
    expect(karistir(kartlar, rngOlustur(1))).not.toEqual(
      karistir(kartlar, rngOlustur(2)),
    );
  });
  it('elemanları kaybetmez', () => {
    expect(karistir([1, 2, 3], rngOlustur(7)).sort()).toEqual([1, 2, 3]);
  });
});
