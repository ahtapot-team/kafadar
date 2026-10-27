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

describe('OK mu NOK mu desteleri (#87)', () => {
  for (const ad of ['arkadas', 'cift', 'aile']) {
    it(`${ad}: 100 kart, sürüm 2, eski 55 id aynen`, () => {
      const d = JSON.parse(
        readFileSync(
          new URL(`../../content/decks/${ad}.json`, import.meta.url),
          'utf8',
        ),
      ) as Deste;
      expect(d.cards).toHaveLength(100);
      expect(d.version).toBeGreaterThanOrEqual(2);
      // Yarım kalmış oyun eski sürümle biter: ilk 55 kartın id'leri değişmez.
      const eski = Array.from(
        { length: 55 },
        (_, i) => `${ad}-${String(i + 1).padStart(2, '0')}`,
      );
      expect(d.cards.slice(0, 55).map((c) => c.id)).toEqual(eski);
    });
  }
});
