import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { type Deste, desteHatalari } from '../../core/deste';

describe('content/onon (KK-60)', () => {
  const klasor = new URL('../../../content/onon/', import.meta.url);
  const dosyalar = readdirSync(klasor).filter((d) => d.endsWith('.json'));
  it('3 paket var', () => expect(dosyalar).toHaveLength(3));
  for (const dosya of dosyalar) {
    it(`${dosya}: ≥100 kart, şema geçerli, her kart "10/10 ama" içerir`, () => {
      const d = JSON.parse(
        readFileSync(new URL(dosya, klasor), 'utf8'),
      ) as Deste;
      expect(d.cards.length).toBeGreaterThanOrEqual(100);
      expect(desteHatalari(d)).toEqual([]);
      expect(d.cards.filter((c) => !c.text.includes('10/10 ama'))).toEqual([]);
    });
  }
});
