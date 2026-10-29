import { describe, expect, it } from 'vitest';
import * as casus from './casus';
import {
  type CasusDeste,
  type CasusDurum,
  isle,
  siradaki,
  yeniOyun,
} from './casus';

// KK-14/KK-47: kayıttan okunan Casus kim durumu şemadan geçmeden kullanılmaz (OK mu NOK mu'daki durumGecerliMi gibi).
// Sözleşme: durumGecerliMi(d: unknown): d is CasusDurum, çökmeden true/false döner (casus.ts'ten export).
const dogrula = (
  casus as unknown as { durumGecerliMi?: (d: unknown) => boolean }
).durumGecerliMi;
const T0 = 1_000_000;
const deste: CasusDeste = {
  deck_id: 't',
  version: 1,
  lang: 'tr',
  sorular: ['s'],
  cards: Array.from({ length: 20 }, (_, i) => ({
    id: `k${i}`,
    kelime: `K${i}`,
    ipucu: `I${i}`,
  })),
};
const oyuncular = ['A', 'B', 'C', 'D', 'E'];
const baslangic = () => yeniOyun({ oyuncular, deste, sureDk: 3, tohum: 4 });

// Her aşamadan bir durum: rol (yarı), tartışma, oylama, açıklama, tahmin, sonuç.
function asamalar(): Record<string, CasusDurum> {
  let d = baslangic();
  const yari = isle(isle(d, { tip: 'benim' }), { tip: 'goruldu', t: T0 });
  while (d.asama === 'rol')
    d = isle(isle(d, { tip: 'benim' }), { tip: 'goruldu', t: T0 });
  const tartisma = d;
  const oylama = isle(d, { tip: 'tartismayiBitir', t: T0 + 1 });
  const hedef = (kim: string) => {
    let x = oylama;
    for (const p of oyuncular)
      x = isle(x, {
        tip: 'oyla',
        oyveren: p,
        secilen: p === kim ? oyuncular.find((y) => y !== kim)! : kim,
      });
    return isle(x, { tip: 'oylamayiBitir' });
  };
  const casusAdi = (JSON.parse(JSON.stringify(d)) as { casuslar: string[] })
    .casuslar[0];
  const aciklama = hedef(casusAdi);
  const tahmin = isle(aciklama, { tip: 'devam' });
  const sonuc = isle(tahmin, { tip: 'oyunuBitir' });
  return { rol: yari, tartisma, oylama, aciklama, tahmin, sonuc };
}

const bozma: Record<string, (d: Record<string, unknown>) => void> = {
  'bilinmeyen aşama': (d) => (d.asama = 'uçtu'),
  'aşama sayı': (d) => (d.asama = 3),
  'oyuncular dizi değil': (d) => (d.oyuncular = 'ABC'),
  'oyuncular sayı içeriyor': (d) => (d.oyuncular = [1, 2, 3]),
  'oyuncu sayısı 2': (d) => (d.oyuncular = ['A', 'B']),
  'oyuncu sayısı 13': (d) =>
    (d.oyuncular = Array.from({ length: 13 }, (_, i) => `P${i}`)),
  'casus oyuncu değil': (d) => (d.casuslar = ['Hayalet']),
  'casus yok': (d) => (d.casuslar = []),
  'casus sınırı aşılmış': (d) => (d.casuslar = ['A', 'B', 'C', 'D']),
  'kart eksik': (d) => delete d.kartlar,
  'kart alanı yanlış': (d) => (d.kartlar = { id: 1, kelime: 2, ipucu: 3 }),
  'şıklar 6 değil': (d) => (d.siklar = ['a', 'b']),
  'şıklar doğru kelimeyi içermiyor': (d) =>
    (d.siklar = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6']),
  'sıra negatif': (d) => (d.sira = -1),
  'sıra aşırı büyük': (d) => (d.sira = 9999),
  'sıra sayı değil': (d) => (d.sira = 'x'),
  'açık bayrağı yok': (d) => delete d.acik,
  'tur geçersiz': (d) => (d.tur = 3),
  'süre negatif': (d) => (d.sureMs = -5),
  'süre metin': (d) => (d.sureMs = 'uzun'),
  'oylar oyuncu dışı': (d) => (d.oylar = { Hayalet: 'A' }),
  'oylar değer oyuncu dışı': (d) => (d.oylar = { A: 'Hayalet' }),
  'adaylar oyuncu dışı': (d) => (d.adaylar = ['Hayalet']),
  'kazanan geçersiz': (d) => (d.kazanan = 'berabere'),
  'seçilen oyuncu dışı': (d) => (d.secilen = 'Hayalet'),
  'başlayan oyuncu dışı': (d) => (d.baslayan = 'Hayalet'),
};

describe('KK-14/KK-47: Casus kim kayıt doğrulaması', () => {
  it('durumGecerliMi export edilir', () => {
    expect(dogrula).toBeTypeOf('function');
  });

  it('her aşamadaki geçerli durum (JSON gidiş-dönüşü dahil) kabul edilir', () => {
    for (const [ad, d] of Object.entries(asamalar())) {
      expect(dogrula!(d), ad).toBe(true);
      expect(dogrula!(JSON.parse(JSON.stringify(d))), `${ad} (JSON)`).toBe(
        true,
      );
    }
    const dolu = casus.kayittanYukle(asamalar().rol);
    expect(dogrula!(dolu)).toBe(true);
    expect(siradaki(dolu)).toBe(siradaki(asamalar().rol));
  });

  it('çöp değerler çökmeden reddedilir', () => {
    for (const x of [null, undefined, 42, 'x', true, [], {}, [1, 2], () => 1])
      expect(dogrula!(x), String(x)).toBe(false);
  });

  it('bozuk alanlar reddedilir, çökme yok', () => {
    const temel = asamalar();
    for (const [ad, bozucu] of Object.entries(bozma)) {
      for (const asama of ['rol', 'oylama', 'sonuc']) {
        const d = JSON.parse(JSON.stringify(temel[asama])) as Record<
          string,
          unknown
        >;
        bozucu(d);
        // "ilgisiz" aşamada hiçbir etkisi olmayan bozulma yok: her bozulma yapısal olarak geçersizdir
        expect(dogrula!(d), `${ad} @ ${asama}`).toBe(false);
      }
    }
  });
});
