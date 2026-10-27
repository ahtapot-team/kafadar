import { describe, expect } from 'vitest';
import type { Deste } from '../../core/deste';
import { kabul } from '../../kabul';
import {
  type Durum,
  type Oduller,
  type Olay,
  type Oy,
  type OyunSecenekleri,
  gecerliKart,
  gosterAktif,
  isle,
  oduller,
  sonuc,
  yeniOyun,
} from './oyun';

const deste = (n = 50): Deste => ({
  deck_id: 't',
  version: 1,
  lang: 'tr',
  cards: Array.from({ length: n }, (_, i) => ({
    id: `k${i}`,
    text: `Kart ${i}`,
  })),
});

const yeni = (o: Partial<OyunSecenekleri> = {}) =>
  yeniOyun({
    oyuncular: ['Ali', 'Ayşe', 'Can'],
    deste: deste(),
    uzunluk: null,
    tohum: 1,
    ...o,
  });

type Oylar = Record<string, Oy>;
const HEPSI_OK: Oylar = { Ali: 'OK', Ayşe: 'OK', Can: 'OK' };

let saat = 100_000;
const oyla = (d: Durum, oylar: Oylar) =>
  Object.entries(oylar).reduce(
    (a, [oyuncu, oy]) =>
      isle(a, { tip: 'oyla', oyuncu, oy, t: (saat += 1000) } as Olay),
    d,
  );
const goster = (d: Durum) => isle(d, { tip: 'goster' });
const sonraki = (d: Durum) => isle(d, { tip: 'sonraki' });
const oyVeGoster = (d: Durum, oylar: Oylar) => goster(oyla(d, oylar));

// Her tur: oyla + göster (+ son tur hariç sonraki). Sonunda oturumu bitirir.
function oyna(d: Durum, turlar: Oylar[]) {
  const idler: string[] = [];
  turlar.forEach((oylar, i) => {
    idler.push(gecerliKart(d).id);
    d = oyVeGoster(d, oylar);
    if (i < turlar.length - 1) d = sonraki(d);
  });
  return { d: isle(d, { tip: 'bitir' }), idler };
}

const norm = (o: Oduller) => ({
  aykiriRuh: [...o.aykiriRuh].sort(),
  ruhIkizleri: o.ruhIkizleri.map((p) => [...p].sort()).sort(),
  olayKart: [...o.olayKart].sort(),
});

// Atla ile ilk n kartın sırası (tohum testleri için).
function sira(d: Durum, n: number) {
  const s: string[] = [];
  for (let i = 0; i < n; i++) {
    s.push(gecerliKart(d).id);
    d = isle(d, { tip: 'atla' });
  }
  return s;
}

describe('KK-6: oyun ortasında oyuncu ekle/çıkar', () => {
  kabul('sonradan katılan oyuncu yalnızca katıldığı kartlardan sayılır', () => {
    let d = yeni();
    const k1 = gecerliKart(d).id;
    d = oyVeGoster(d, { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' });
    d = isle(d, { tip: 'oyuncuEkle', ad: 'Deniz' });
    d = sonraki(d);
    d = oyla(d, HEPSI_OK);
    expect(gosterAktif(d)).toBe(false); // Deniz henüz oy vermedi
    d = oyVeGoster(d, { Deniz: 'NOK' });
    d = sonraki(d);
    d = oyVeGoster(d, { ...HEPSI_OK, Deniz: 'NOK' });
    d = isle(d, { tip: 'bitir' });
    const o = oduller(d);
    expect(o.aykiriRuh).toEqual(['Deniz']); // Deniz 2 kez, Ali 1 kez azınlıkta
    expect(o.olayKart).toEqual([k1]); // k1: 2-1; Deniz'li kartlar 3-1
  });

  kabul('çıkarılan oyuncunun oyu beklenmez; ödüller çökmez', () => {
    let d = yeni();
    d = sonraki(oyVeGoster(d, { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' }));
    d = oyVeGoster(d, { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' });
    d = sonraki(d);
    d = oyla(d, { Ayşe: 'OK', Can: 'OK' });
    expect(gosterAktif(d)).toBe(false);
    d = isle(d, { tip: 'oyuncuCikar', ad: 'Ali' });
    expect(gosterAktif(d)).toBe(true);
    d = isle(goster(d), { tip: 'bitir' });
    expect(norm(oduller(d)).ruhIkizleri).toEqual([['Ayşe', 'Can']]);
  });
});

describe('KK-7: tur uzunluğu', () => {
  kabul('10 kartlık turda 10. karttan sonra oturum biter', () => {
    let d = yeni({ uzunluk: 10 });
    for (let i = 1; i <= 10; i++) {
      d = sonraki(oyVeGoster(d, HEPSI_OK));
      expect(d.asama).toBe(i < 10 ? 'oy' : 'bitti');
    }
  });

  kabul('sınırsız turda deste bitene kadar devam eder', () => {
    let d = yeni({ uzunluk: null, deste: deste(30) });
    for (let i = 1; i <= 30; i++) {
      d = sonraki(oyVeGoster(d, HEPSI_OK));
      expect(d.asama).toBe(i < 30 ? 'oy' : 'desteBitti');
    }
  });

  kabul('Bitir her an oturumu bitirir', () => {
    expect(isle(yeni(), { tip: 'bitir' }).asama).toBe('bitti');
    expect(isle(oyVeGoster(yeni(), HEPSI_OK), { tip: 'bitir' }).asama).toBe(
      'bitti',
    );
  });
});

describe('KK-8: kart tekrarı', () => {
  kabul('aynı kart tekrar gelmez, deste bitince karıştırma sorulur', () => {
    let d = yeni({ deste: deste(5) });
    const gorulen: string[] = [];
    for (let i = 0; i < 5; i++) {
      gorulen.push(gecerliKart(d).id);
      d = sonraki(oyVeGoster(d, HEPSI_OK));
    }
    expect(new Set(gorulen).size).toBe(5);
    expect(d.asama).toBe('desteBitti');
    d = isle(d, { tip: 'karistir' });
    expect(d.asama).toBe('oy');
    expect(gecerliKart(d).id).toMatch(/^k\d$/);
  });

  kabul('Atla da kartı tüketir, atlanan kart geri gelmez', () => {
    let d = yeni({ deste: deste(5) });
    const gorulen: string[] = [];
    for (let i = 0; i < 5; i++) {
      gorulen.push(gecerliKart(d).id);
      d = isle(d, { tip: 'atla' });
    }
    expect(new Set(gorulen).size).toBe(5);
    expect(d.asama).toBe('desteBitti');
  });
});

describe('KK-10: oy girişi', () => {
  kabul('herkes oy vermeden Göster pasiftir ve basılsa da açmaz', () => {
    let d = yeni();
    expect(gosterAktif(d)).toBe(false);
    d = oyla(d, { Ali: 'OK', Ayşe: 'NOK' });
    expect(gosterAktif(d)).toBe(false);
    expect(goster(d)).toEqual(d);
    d = oyla(d, { Can: 'OK' });
    expect(gosterAktif(d)).toBe(true);
    expect(goster(d).asama).toBe('acik');
  });

  kabul('oy açıklamadan önce değiştirilebilir, sonra değiştirilemez', () => {
    let d = oyla(yeni(), { Ali: 'OK' });
    d = oyla(d, { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' });
    d = goster(d);
    expect(sonuc(d).metin).toBe('Ali tek başına NOK!');
    expect(oyla(d, { Ali: 'OK' })).toEqual(d);
  });

  kabul(
    'aynı oyuncuda 300 ms içindeki tekrar dokunuş tek işlem sayılır',
    () => {
      const ol = (oyuncu: string, oy: Oy, t: number): Olay => ({
        tip: 'oyla',
        oyuncu,
        oy,
        t,
      });
      const bitir = (d: Durum) =>
        sonuc(
          goster(
            isle(isle(d, ol('Ayşe', 'OK', 20_000)), ol('Can', 'OK', 30_000)),
          ),
        );
      let d = isle(yeni(), ol('Ali', 'OK', 10_000));
      d = isle(d, ol('Ali', 'NOK', 10_100)); // yok sayılır
      expect(bitir(d).tip).toBe('oybirligi');
      d = isle(d, ol('Ali', 'NOK', 11_000)); // yeterince sonra: geçerli
      expect(bitir(d).tip).toBe('tekAzinlik');
    },
  );

  kabul("Göster'e iki kez basmak sonucu iki kez açmaz", () => {
    const d = oyVeGoster(yeni(), { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' });
    expect(goster(d)).toEqual(d);
    expect(sonraki(sonraki(d)).asama).toBe('oy'); // çift "Sonraki" de tek kart ilerletir
    expect(gecerliKart(sonraki(sonraki(d))).id).toBe(
      gecerliKart(sonraki(d)).id,
    );
  });
});

describe('KK-11: açıklama metinleri', () => {
  kabul('tek azınlıkta "<isim> tek başına <oy>!"', () => {
    const a = oyVeGoster(yeni(), { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' });
    expect(sonuc(a)).toEqual({
      tip: 'tekAzinlik',
      metin: 'Ali tek başına NOK!',
    });
    const b = oyVeGoster(yeni(), { Ali: 'OK', Ayşe: 'NOK', Can: 'NOK' });
    expect(sonuc(b)).toEqual({
      tip: 'tekAzinlik',
      metin: 'Ali tek başına OK!',
    });
  });

  kabul('oybirliğinde tip oybirligi (konfeti)', () => {
    expect(sonuc(oyVeGoster(yeni(), HEPSI_OK)).tip).toBe('oybirligi');
    const hepNok = { Ali: 'NOK', Ayşe: 'NOK', Can: 'NOK' } as Oylar;
    expect(sonuc(oyVeGoster(yeni(), hepNok)).tip).toBe('oybirligi');
  });

  kabul('eşitlikte "Tam ikiye bölündünüz"', () => {
    const d = yeni({ oyuncular: ['Ali', 'Ayşe', 'Can', 'Deniz'] });
    const s = sonuc(
      oyVeGoster(d, { Ali: 'OK', Ayşe: 'OK', Can: 'NOK', Deniz: 'NOK' }),
    );
    expect(s).toEqual({ tip: 'esit', metin: 'Tam ikiye bölündünüz' });
  });
});

describe('KK-12: oturum sonu ödülleri', () => {
  kabul('Aykırı ruh, Ruh ikizleri ve Olay kart', () => {
    const { d, idler } = oyna(yeni(), [
      { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' },
      { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' },
      { Ali: 'OK', Ayşe: 'OK', Can: 'NOK' },
    ]);
    const o = norm(oduller(d));
    expect(o.aykiriRuh).toEqual(['Ali']);
    expect(o.ruhIkizleri).toEqual([['Ayşe', 'Can']]);
    expect(o.olayKart).toEqual([...idler].sort()); // üç kart de 2-1: eşitlikte hepsi
  });

  kabul('Olay kart en dengeli bölünen kart; oybirliği azınlık sayılmaz', () => {
    const d = yeni({ oyuncular: ['Ali', 'Ayşe', 'Can', 'Deniz'] });
    const { d: son, idler } = oyna(d, [
      { Ali: 'OK', Ayşe: 'OK', Can: 'OK', Deniz: 'OK' },
      { Ali: 'OK', Ayşe: 'OK', Can: 'OK', Deniz: 'NOK' },
      { Ali: 'OK', Ayşe: 'OK', Can: 'NOK', Deniz: 'NOK' },
    ]);
    const o = oduller(son);
    expect(o.olayKart).toEqual([idler[2]]);
    expect(o.aykiriRuh).toEqual(['Deniz']);
  });

  kabul('Aykırı ruhta eşitlik: tüm kazananlar gösterilir', () => {
    const { d } = oyna(yeni(), [
      { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' },
      { Ali: 'OK', Ayşe: 'NOK', Can: 'OK' },
    ]);
    expect(norm(oduller(d)).aykiriRuh).toEqual(['Ali', 'Ayşe']);
  });

  kabul('2 kişilik oyunda Aykırı ruh verilmez', () => {
    const { d } = oyna(yeni({ oyuncular: ['Ali', 'Ayşe'] }), [
      { Ali: 'OK', Ayşe: 'NOK' },
      { Ali: 'OK', Ayşe: 'OK' },
    ]);
    expect(oduller(d).aykiriRuh).toEqual([]);
  });
});

describe('KK-22: saf, serileştirilebilir, tohumlu durum makinesi', () => {
  kabul('aynı tohum aynı kart sırasını verir, farklı tohum farklısını', () => {
    const a = sira(yeni({ tohum: 7 }), 20);
    expect(sira(yeni({ tohum: 7 }), 20)).toEqual(a);
    expect(sira(yeni({ tohum: 8 }), 20)).not.toEqual(a);
    expect(new Set(a).size).toBe(20);
  });

  kabul(
    'isle girdiyi değiştirmez; JSON gidiş-dönüşünden sonra aynı davranır',
    () => {
      const d = oyla(yeni({ tohum: 3 }), { Ali: 'NOK', Ayşe: 'OK', Can: 'OK' });
      const kopya = structuredClone(d);
      goster(d);
      expect(d).toEqual(kopya);
      const diril = JSON.parse(JSON.stringify(d)) as Durum;
      expect(diril).toEqual(d);
      expect(sonuc(goster(diril))).toEqual(sonuc(goster(d)));
      const ilerle = (x: Durum) => sonraki(goster(x));
      expect(sira(ilerle(diril), 5)).toEqual(sira(ilerle(d), 5));
    },
  );
});
