import { describe, expect, it } from 'vitest';
import {
  baslat,
  cevapla,
  dogruSayilari,
  durumGecerliMi,
  herkesCevapladi,
  ilerle,
  turSonucu,
  type Soru,
  type Zorluk,
} from './quiz';

const havuz: Soru[] = (['kolay', 'orta', 'zor'] as Zorluk[]).flatMap((z) =>
  Array.from({ length: 6 }, (_, i) => ({
    id: `${z}-${i}`,
    metin: `${z} ${i}?`,
    secenekler: ['A', 'B', 'C', 'D'],
    dogru: 0,
    zorluk: z,
    tur: 'dunya' as const,
  })),
);

describe('Quiz Night durum makinesi', () => {
  it('baslat: geçerli durum; 10 soru, cevaplar boş', () => {
    const d = baslat('p', havuz, 1, ['Ali']);
    expect(durumGecerliMi(d)).toBe(true);
    expect(d.sorular).toHaveLength(10);
    expect(d.cevaplar[0].every((c) => c === null)).toBe(true);
  });

  it('cevapla: cevap kilitli (ikinci cevap yok sayılır), girdiyi değiştirmez', () => {
    const d = baslat('p', havuz, 1, ['Ali']);
    const d1 = cevapla(d, 0, 2);
    expect(d.cevaplar[0][0]).toBeNull();
    expect(d1.cevaplar[0][0]).toBe(2);
    expect(cevapla(d1, 0, 3).cevaplar[0][0]).toBe(2);
    expect(cevapla(d, 0, 4)).toBe(d);
  });

  it('ilerle: herkes cevaplamadan geçmez; son sorudan sonra sonuç', () => {
    let d = baslat('p', havuz, 1, ['Ali', 'Ece']);
    d = cevapla(d, 0, 0);
    expect(herkesCevapladi(d)).toBe(false);
    expect(ilerle(d).soru).toBe(0);
    for (let k = 0; k < 10; k++) {
      d = cevapla(
        cevapla(d, 0, d.sorular[k].dogru),
        1,
        (d.sorular[k].dogru + 1) % 4,
      );
      d = ilerle(d);
    }
    expect(d.asama).toBe('sonuc');
    expect(durumGecerliMi(d)).toBe(true);
    expect(dogruSayilari(d)).toEqual([10, 0]);
    expect(turSonucu(d)).toEqual([
      { ad: 'Ali', dogru: 10, katsayi: 20, sira: 1 },
      { ad: 'Ece', dogru: 0, katsayi: 0, sira: 2 },
    ]);
  });

  it('durumGecerliMi: bozuk girdiyi reddeder', () => {
    const d = baslat('p', havuz, 1, ['Ali']);
    for (const x of [
      null,
      42,
      {},
      { ...d, soru: 10 },
      { ...d, asama: 'x' },
      { ...d, oyuncular: [] },
      { ...d, cevaplar: [[...d.cevaplar[0].slice(1), 7]] },
    ])
      expect(durumGecerliMi(x)).toBe(false);
  });
});
