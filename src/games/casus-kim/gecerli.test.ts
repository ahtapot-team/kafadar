import { describe, expect, it } from 'vitest';
import {
  type CasusDeste,
  type CasusDurum,
  durumGecerliMi,
  isle,
  yeniOyun,
} from './casus';

const deste: CasusDeste = {
  deck_id: 't',
  version: 1,
  lang: 'tr',
  sorular: ['S?'],
  cards: Array.from({ length: 10 }, (_, i) => ({
    id: `k${i}`,
    kelime: `Kelime${i}`,
    ipucu: `Ipucu${i}`,
  })),
};
const P = ['P1', 'P2', 'P3', 'P4'];
const kopya = (
  d: CasusDurum,
  ...degisim: Partial<Record<keyof CasusDurum, unknown>>[]
) => Object.assign(JSON.parse(JSON.stringify(d)), ...degisim) as unknown;

// Oyunun her aşamasından gerçek durumlar toplanır.
function asamalar(): CasusDurum[] {
  const liste: CasusDurum[] = [];
  let d = yeniOyun({ oyuncular: P, deste, sureDk: 3, tohum: 1 });
  liste.push(d);
  for (let i = 0; i < 4; i++) {
    d = isle(d, { tip: 'benim' });
    liste.push(d);
    d = isle(d, { tip: 'goruldu', t: 1000 });
    liste.push(d);
  }
  d = isle(d, { tip: 'tartismayiBitir', t: 2000 });
  liste.push(d);
  const hedef = d.casuslar[0];
  for (const p of P)
    d = isle(d, {
      tip: 'oyla',
      oyveren: p,
      secilen: p === hedef ? P.find((x) => x !== hedef)! : hedef,
    });
  liste.push(d);
  d = isle(d, { tip: 'oylamayiBitir' });
  liste.push(d);
  d = isle(d, { tip: 'devam' });
  liste.push(d);
  d = isle(d, { tip: 'tahmin', kelime: d.kartlar.kelime });
  liste.push(d);
  return liste;
}

describe('durumGecerliMi', () => {
  it('oyunun her aşamasındaki gerçek durum geçerli (JSON gidiş-dönüşü dahil)', () => {
    for (const d of asamalar()) {
      expect(durumGecerliMi(d)).toBe(true);
      expect(durumGecerliMi(JSON.parse(JSON.stringify(d)))).toBe(true);
    }
  });

  it('nesne olmayan ya da boş veri geçersiz', () => {
    for (const x of [null, undefined, 1, 'x', [], {}, { asama: 'rol' }])
      expect(durumGecerliMi(x)).toBe(false);
  });

  it('tutarsız kayıtlar geçersiz', () => {
    const d = asamalar()[1]; // rol, kart açık
    const tartisma = asamalar()[9];
    const bozuklar = [
      kopya(d, { asama: 'bilinmeyen' }),
      kopya(d, { oyuncular: [] }),
      kopya(d, { oyuncular: ['P1', 'P1', 'P2'] }),
      kopya(d, { casuslar: ['Yok'] }),
      kopya(d, { casuslar: [] }),
      kopya(d, { casuslar: ['P1', 'P2', 'P3'] }),
      kopya(d, { kartlar: { id: 'x' } }),
      kopya(d, { siklar: ['Baska'] }),
      kopya(d, { baslayan: 'Yok' }),
      kopya(d, { sureMs: -5 }),
      kopya(d, { sira: 99 }),
      kopya(d, { sira: 1.5 }),
      kopya(d, { acik: 'evet' }),
      kopya(tartisma, { acik: true }), // açık kart rol dışında: rol sızıntısı
      kopya(tartisma, { sira: 0 }),
      kopya(tartisma, { tartismaBas: null }),
      kopya(d, { tur: 3 }),
      kopya(d, { oylar: { P1: 'P1' } }),
      kopya(d, { oylar: { Yok: 'P2' } }),
      kopya(d, { kazanan: 'casus' }), // sonuç aşaması dışında kazanan
    ];
    for (const b of bozuklar) expect(durumGecerliMi(b)).toBe(false);
  });
});
