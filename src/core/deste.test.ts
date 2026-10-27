import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { type Deste, desteHatalari } from './deste';

const deste = (cards: Deste['cards']): Deste => ({
  deck_id: 'd',
  version: 1,
  lang: 'tr',
  cards,
});

describe('desteHatalari', () => {
  it('geçerli desteyi kabul eder', () => {
    expect(
      desteHatalari(
        deste([
          { id: 'a', text: 'Bir' },
          { id: 'b', text: 'İki' },
        ]),
      ),
    ).toEqual([]);
  });
  it('boş kartı reddeder', () => {
    expect(desteHatalari(deste([{ id: 'a', text: '   ' }]))).toHaveLength(1);
  });
  it('tr yerel ayarıyla büyük/küçük harf duyarsız yinelenen kartı reddeder', () => {
    const hatalar = desteHatalari(
      deste([
        { id: 'a', text: 'ISLAK' },
        { id: 'b', text: 'ısla' + 'k' },
      ]),
    );
    expect(hatalar).toHaveLength(1);
  });
  it('İ/i ve I/ı farklıdır', () => {
    expect(
      desteHatalari(
        deste([
          { id: 'a', text: 'Işık' },
          { id: 'b', text: 'İşik' },
        ]),
      ),
    ).toEqual([]);
  });
  it('140 karakterden uzun kartı reddeder', () => {
    expect(
      desteHatalari(deste([{ id: 'a', text: 'x'.repeat(141) }])),
    ).toHaveLength(1);
    expect(desteHatalari(deste([{ id: 'a', text: 'x'.repeat(140) }]))).toEqual(
      [],
    );
  });
  it('eksik ve yinelenen id değerlerini reddeder', () => {
    expect(desteHatalari(deste([{ id: '', text: 'Bir' }]))).toHaveLength(1);
    expect(
      desteHatalari(
        deste([
          { id: 'a', text: 'Bir' },
          { id: 'a', text: 'İki' },
        ]),
      ),
    ).toHaveLength(1);
  });
});

describe('content/decks', () => {
  const klasor = new URL('../../content/decks/', import.meta.url);
  for (const dosya of readdirSync(klasor).filter((d) => d.endsWith('.json'))) {
    it(`${dosya} geçerli`, () => {
      const d = JSON.parse(readFileSync(new URL(dosya, klasor), 'utf8'));
      expect(desteHatalari(d)).toEqual([]);
    });
  }
});
