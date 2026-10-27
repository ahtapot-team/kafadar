import { describe, expect, it } from 'vitest';
import { gecerliKart, isle, yeniOyun } from './oyun';

describe('KK-25: kart oy girişi ve açıklama anında aynı kalır', () => {
  it('oylamadan açıklamaya geçerken geçerli kart değişmez', () => {
    let d = yeniOyun({
      oyuncular: ['Ali', 'Ayşe'],
      deste: {
        deck_id: 't',
        version: 1,
        lang: 'tr',
        cards: [
          { id: 'a', text: 'Bir' },
          { id: 'b', text: 'İki' },
        ],
      },
      uzunluk: null,
      tohum: 1,
    });
    const kart = gecerliKart(d);
    d = isle(d, { tip: 'oyla', oyuncu: 'Ali', oy: 'OK', t: 1000 });
    expect(gecerliKart(d)).toEqual(kart);
    d = isle(d, { tip: 'oyla', oyuncu: 'Ayşe', oy: 'NOK', t: 2000 });
    d = isle(d, { tip: 'goster' });
    expect(d.asama).toBe('acik');
    expect(gecerliKart(d)).toEqual(kart);
  });
});
