import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { CasusDeste, CasusKart } from './casus';
import { casusDesteHatalari } from './deste';

const kartlar = (n: number): CasusKart[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `k${i}`,
    kelime: `Kelime ${i}`,
    ipucu: `Ipucu ${i}`,
  }));
const deste = (cards: CasusKart[], sorular = ['Soru?']): CasusDeste => ({
  deck_id: 't',
  version: 1,
  lang: 'tr',
  sorular,
  cards,
});

describe('casusDesteHatalari', () => {
  it('geçerli desteyi kabul eder', () => {
    expect(casusDesteHatalari(deste(kartlar(6)))).toEqual([]);
  });
  it('6 karttan azını reddeder (tahmin şıkları)', () => {
    expect(casusDesteHatalari(deste(kartlar(5)))).toHaveLength(1);
  });
  it('boş kelime/ipucu, yinelenen id ve kelime (tr), uzunluk, ipucu kelimeyi içermesi', () => {
    const k = kartlar(6);
    expect(
      casusDesteHatalari(
        deste([...k.slice(0, 5), { id: 'x', kelime: ' ', ipucu: 'a' }]),
      ),
    ).toHaveLength(1);
    expect(
      casusDesteHatalari(deste([...k.slice(0, 5), { ...k[0] }])),
    ).toContainEqual(expect.stringContaining('yinelenen id'));
    expect(
      casusDesteHatalari(
        deste([
          ...k.slice(0, 4),
          { id: 'a', kelime: 'ISLAK', ipucu: 'x1' },
          { id: 'b', kelime: 'ıslak', ipucu: 'x2' },
        ]),
      ),
    ).toContainEqual(expect.stringContaining('yinelenen kelime'));
    expect(
      casusDesteHatalari(
        deste([
          ...k.slice(0, 5),
          { id: 'u', kelime: 'k'.repeat(31), ipucu: 'a' },
        ]),
      ),
    ).toHaveLength(1);
    expect(
      casusDesteHatalari(
        deste([
          ...k.slice(0, 5),
          { id: 'i', kelime: 'Plaj', ipucu: 'Plaj havlusu' },
        ]),
      ),
    ).toContainEqual(expect.stringContaining('ipucu kelimeyi içeriyor'));
  });
  it('boş ve yinelenen soruyu reddeder', () => {
    expect(casusDesteHatalari(deste(kartlar(6), ['A?', 'a?']))).toHaveLength(1);
    expect(casusDesteHatalari(deste(kartlar(6), [' ']))).toHaveLength(1);
  });
});

describe('content/casus', () => {
  const klasor = new URL('../../../content/casus/', import.meta.url);
  for (const dosya of readdirSync(klasor).filter((d) => d.endsWith('.json'))) {
    it(`${dosya} geçerli`, () => {
      const d = JSON.parse(
        readFileSync(new URL(dosya, klasor), 'utf8'),
      ) as CasusDeste;
      expect(casusDesteHatalari(d)).toEqual([]);
    });
  }
});
