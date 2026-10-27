import { describe, expect, it } from 'vitest';
import { type Durum, type Oy, isle, oduller, yeniOyun } from './oyun';

const deste = {
  deck_id: 't',
  version: 1,
  lang: 'tr',
  cards: Array.from({ length: 10 }, (_, i) => ({ id: `k${i}`, text: `${i}` })),
};

const tur = (d: Durum, oylar: Record<string, Oy>, t: number) => {
  for (const [oyuncu, oy] of Object.entries(oylar))
    d = isle(d, { tip: 'oyla', oyuncu, oy, t: (t += 1000) });
  return isle(isle(d, { tip: 'goster' }), { tip: 'sonraki' });
};

describe('oduller: çıkarılan oyuncu', () => {
  it('en çok azınlıkta kalan çıkarılırsa ödül kalanlardan birine gider', () => {
    let d = yeniOyun({
      oyuncular: ['Ali', 'Ayşe', 'Can', 'Deniz'],
      deste,
      uzunluk: null,
      tohum: 1,
    });
    d = tur(d, { Ali: 'NOK', Ayşe: 'OK', Can: 'OK', Deniz: 'OK' }, 0);
    d = tur(d, { Ali: 'NOK', Ayşe: 'OK', Can: 'OK', Deniz: 'OK' }, 100_000);
    d = tur(d, { Ali: 'OK', Ayşe: 'OK', Can: 'NOK', Deniz: 'OK' }, 200_000);
    d = isle(d, { tip: 'oyuncuCikar', ad: 'Ali' });
    expect(oduller(isle(d, { tip: 'bitir' })).aykiriRuh).toEqual(['Can']);
  });
});
