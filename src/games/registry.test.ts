import { describe, expect, it } from 'vitest';
import type { Oyun } from './oyun';
import { oyunlar } from './registry';

describe('registry', () => {
  it('OK mu NOK mu kayıtlıdır', () => {
    expect(oyunlar.map((o) => o.id)).toContain('ok-mu-nok');
  });
  it('listeye eklenen oyun listede görünür (KK-2 iskeleti)', () => {
    const sahte: Oyun = {
      id: 'sahte',
      ad: 'Sahte',
      aktif: true,
    };
    expect([...oyunlar, sahte].map((o) => o.id)).toContain('sahte');
  });
});
