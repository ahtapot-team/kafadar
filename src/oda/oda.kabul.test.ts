import { describe, expect } from 'vitest';
import type { Deste } from '../core/deste';
import { rngOlustur } from '../core/rng';
import { kabulOda as kabul } from '../kabul';
import {
  BOSTA_MS,
  type Kimlik,
  type OdaDurum,
  type Olay,
  type Oy,
  SORU_MS,
  SORU_SAYISI,
  denemeSiniri,
  final,
  gorunum,
  isle,
  kodUret,
  odaKur,
  silinmeli,
} from './oda';

// N sahte istemci, sahte saat, ağsız: her istemci yalnızca bir kimlik, olaylar doğrudan isle()'ye gider.
const T0 = 1_000_000;
const deste = (n = 30): Deste => ({
  deck_id: 't',
  version: 1,
  lang: 'tr',
  cards: Array.from({ length: n }, (_, i) => ({
    id: `k${i}`,
    text: `Soru ${i}`,
  })),
});

type Oda = { d: OdaDurum; id: Kimlik[]; ad: string[] };

function kur(adlar: string[], tohum = 1): Oda {
  const k = odaKur({
    kod: 'ABCD',
    kurucuAd: adlar[0],
    deste: deste(),
    tohum,
    simdi: T0,
  });
  const oda: Oda = { d: k.durum, id: [k.kimlik], ad: [adlar[0]] };
  for (const a of adlar.slice(1)) {
    const s = isle(oda.d, { tip: 'katil', ad: a }, T0);
    expect(s.hata).toBeUndefined();
    oda.d = s.durum;
    oda.id.push(s.kimlik!);
    oda.ad.push(s.ad!);
  }
  return oda;
}

const ok = (d: OdaDurum, olay: Olay, t: number) => {
  const s = isle(d, olay, t);
  expect(s.hata).toBeUndefined();
  return s.durum;
};
const basla = (o: Oda, t = T0) =>
  ok(o.d, { tip: 'baslat', kimlik: o.id[0] }, t);
const cevapla = (d: OdaDurum, kimlik: Kimlik, oy: Oy, t: number) =>
  ok(d, { tip: 'cevapla', kimlik, oy }, t);

// Plan: soru başına oyuncu cevapları (null = cevapsız). Herkes cevaplarsa sonraki soruya hemen geçilir,
// değilse süre dolunca sunucu alarmıyla. Dönüş: biten oda durumu ve son zaman.
function oyna(o: Oda, plan: (Oy | null)[][]) {
  let d = basla(o);
  let basl = T0;
  let t = T0;
  for (const satir of plan) {
    satir.forEach((oy, i) => {
      if (!oy) return;
      t = basl + 100 * (i + 1);
      d = cevapla(d, o.id[i], oy, t);
    });
    if (satir.some((x) => !x)) {
      t = basl + SORU_MS + 1;
      d = ok(d, { tip: 'zaman' }, t);
    }
    basl = t;
  }
  return { d, t };
}

// Kalan soruları cevapsız bırakıp süreyle bitirir.
function bitirBos(d: OdaDurum, basl: number) {
  let t = basl;
  for (let i = 0; i < SORU_SAYISI + 2 && d.asama !== 'bitti'; i++) {
    t += SORU_MS + 1;
    d = ok(d, { tip: 'zaman' }, t);
  }
  return { d, t };
}

const hepsi = (n: number, oy: Oy): Oy[] => Array.from({ length: n }, () => oy);
const dokuz = (n: number): (Oy | null)[][] =>
  Array.from({ length: SORU_SAYISI }, () => hepsi(n, 'OK'));

describe('KK-29: oda kodu', () => {
  kabul('kod 4 karakter, O 0 I 1 yok, çeşitli', () => {
    const rng = rngOlustur(7);
    const kodlar = Array.from({ length: 500 }, () => kodUret(rng));
    for (const k of kodlar) {
      expect(k).toMatch(/^[A-Z2-9]{4}$/);
      expect(k).not.toMatch(/[OI01]/);
    }
    expect(new Set(kodlar).size).toBeGreaterThan(50);
  });

  kabul('kod görünümde, oyun bitince kod kullanılamaz', () => {
    const o = kur(['Ali', 'Ayşe']);
    expect(gorunum(o.d, o.id[1], T0).kod).toBe('ABCD');
    const { d } = bitirBos(basla(o), T0);
    expect(d.asama).toBe('bitti');
    expect(isle(d, { tip: 'katil', ad: 'Can' }, T0 + 1).hata?.kod).toBe(
      'kapali',
    );
  });
});

describe('KK-30: katılım hataları ve isim kuralı', () => {
  kabul('aynı isim "Ali 2", "Ali 3" olur (kuran dahil)', () => {
    const o = kur(['Ali', 'Ali', 'Ali']);
    expect(o.ad).toEqual(['Ali', 'Ali 2', 'Ali 3']);
  });

  kabul(
    'oda dolu (12), oyun başladı, oda kapalı: Türkçe net hata, durum değişmez',
    () => {
      const adlar = Array.from({ length: 12 }, (_, i) => `O${i}`);
      const dolu = kur(adlar);
      const s1 = isle(dolu.d, { tip: 'katil', ad: 'Fazla' }, T0);
      expect(s1.hata?.kod).toBe('dolu');
      expect(s1.hata?.mesaj).toMatch(/\S{3,}/);
      expect(s1.durum).toEqual(dolu.d);

      const o = kur(['Ali', 'Ayşe']);
      const basladi = basla(o);
      const s2 = isle(basladi, { tip: 'katil', ad: 'Can' }, T0 + 1);
      expect(s2.hata?.kod).toBe('basladi');
      expect(s2.durum).toEqual(basladi);

      const kapali = bitirBos(basladi, T0).d;
      expect(isle(kapali, { tip: 'katil', ad: 'Can' }, T0 + 1).hata?.kod).toBe(
        'kapali',
      );
    },
  );

  kabul('kod denemelerine hız sınırı: istemci başına, zamanla açılır', () => {
    let kayit: unknown = {};
    const sonuclar: boolean[] = [];
    for (let i = 0; i < 30; i++) {
      const s = denemeSiniri(kayit, 'ip1', T0 + i * 10);
      kayit = s.kayit;
      sonuclar.push(s.izin);
    }
    expect(sonuclar[0]).toBe(true);
    expect(sonuclar.filter((x) => !x).length).toBeGreaterThan(0);
    expect(denemeSiniri(kayit, 'ip2', T0 + 400).izin).toBe(true);
    expect(denemeSiniri(kayit, 'ip1', T0 + 3_600_000).izin).toBe(true);
    expect(JSON.parse(JSON.stringify(kayit))).toEqual(kayit);
  });
});

describe('KK-31: lobi', () => {
  kabul(
    'katılanlar herkeste görünür, kuran dahil; Başlat yalnızca kuranda, ≥2 oyuncuyla açık',
    () => {
      const tek = kur(['Ali']);
      expect(gorunum(tek.d, tek.id[0], T0).baslatGorunur).toBe(true);
      expect(gorunum(tek.d, tek.id[0], T0).baslatAktif).toBe(false);
      expect(
        isle(tek.d, { tip: 'baslat', kimlik: tek.id[0] }, T0).hata?.kod,
      ).toBe('yetersiz');

      const o = kur(['Ali', 'Ayşe', 'Can']);
      const adlar = o.id.map((k) =>
        gorunum(o.d, k, T0).oyuncular.map((x) => x.ad),
      );
      for (const a of adlar) expect(a).toEqual(['Ali', 'Ayşe', 'Can']);
      expect(gorunum(o.d, o.id[0], T0)).toMatchObject({
        baslatGorunur: true,
        baslatAktif: true,
      });
      expect(gorunum(o.d, o.id[1], T0)).toMatchObject({ baslatGorunur: false });
      expect(isle(o.d, { tip: 'baslat', kimlik: o.id[1] }, T0).hata?.kod).toBe(
        'yetkisiz',
      );
      expect(basla(o).asama).toBe('soru');
    },
  );
});

describe('KK-32: aynı soru, aynı anda, sunucu saati', () => {
  const sira = (o: Oda) => {
    let d = basla(o);
    let t = T0;
    const idler: string[] = [];
    for (let i = 0; i < SORU_SAYISI; i++) {
      idler.push(gorunum(d, o.id[0], t).soru!.id);
      o.id.forEach((k) => {
        t += 10;
        d = cevapla(d, k, 'OK', t);
      });
    }
    return idler;
  };

  kabul(
    'tüm telefonlarda aynı soru, 10 farklı soru; aynı tohum aynı sıra',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can'], 5);
      const d = basla(o);
      const sorular = o.id.map((k) => gorunum(d, k, T0).soru!.id);
      expect(new Set(sorular).size).toBe(1);
      const a = sira(kur(['Ali', 'Ayşe', 'Can'], 5));
      expect(new Set(a).size).toBe(SORU_SAYISI);
      expect(sira(kur(['Ali', 'Ayşe', 'Can'], 5))).toEqual(a);
      expect(sira(kur(['Ali', 'Ayşe', 'Can'], 6))).not.toEqual(a);
    },
  );

  kabul('kalan süre sunucu saatinden hesaplanır, herkes için aynı', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    const d = basla(o);
    for (const k of o.id) {
      expect(gorunum(d, k, T0).kalanMs).toBe(SORU_MS);
      expect(gorunum(d, k, T0 + 5_000).kalanMs).toBe(SORU_MS - 5_000);
    }
    expect(gorunum(d, o.id[0], T0).soruNo).toBe(1);
  });
});

describe('KK-33: cevap değiştirme, geç cevap, cevapsız', () => {
  kabul('süre içinde son cevap geçerli', () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    let d = basla(o);
    d = cevapla(d, o.id[0], 'OK', T0 + 1_000);
    d = cevapla(d, o.id[0], 'NOK', T0 + 2_000);
    expect(gorunum(d, o.id[0], T0 + 2_000).benimOyum).toBe('NOK');
    d = cevapla(d, o.id[1], 'OK', T0 + 3_000);
    d = cevapla(d, o.id[2], 'OK', T0 + 4_000);
    const f = final(bitirBos(d, T0 + 4_000).d);
    expect(f.kimNeDedi['Ali'][0]).toBe('NOK');
  });

  kabul('süre bittikten sonra gelen cevap reddedilir, durum değişmez', () => {
    const o = kur(['Ali', 'Ayşe']);
    const d = basla(o);
    const s = isle(
      d,
      { tip: 'cevapla', kimlik: o.id[0], oy: 'OK' },
      T0 + SORU_MS + 1_000,
    );
    expect(s.hata?.kod).toBe('sure-doldu');
    expect(s.durum).toEqual(d);
  });
});

describe('KK-34: herkes cevaplayınca geçilir, kim cevapladı görünür', () => {
  kabul(
    'son cevapla sonraki soru açılır; sayaç adları gösterir, cevabı değil',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = cevapla(d, o.id[0], 'OK', T0 + 1_000);
      d = cevapla(d, o.id[1], 'NOK', T0 + 2_000);
      const g = gorunum(d, o.id[0], T0 + 2_000);
      expect(g.cevapladi.sort()).toEqual(['Ali', 'Ayşe']);
      expect(g.toplam).toBe(3);
      expect(g.soruNo).toBe(1);
      d = cevapla(d, o.id[2], 'OK', T0 + 3_000);
      const g2 = gorunum(d, o.id[2], T0 + 3_000);
      expect(g2.soruNo).toBe(2);
      expect(g2.kalanMs).toBe(SORU_MS);
      expect(g2.cevapladi).toEqual([]);
    },
  );
});

describe("KK-35: oylar final'e kadar sızmaz", () => {
  const degerler = (x: unknown): unknown[] =>
    x !== null && typeof x === 'object'
      ? Object.values(x).flatMap(degerler)
      : [x];

  kabul(
    'başkasının cevabı hiçbir görünüm alanında yok; yalnızca kendi cevabı var',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = cevapla(d, o.id[0], 'NOK', T0 + 1_000);
      const b = degerler(gorunum(d, o.id[1], T0 + 2_000));
      expect(b).not.toContain('NOK');
      expect(b).not.toContain('OK');
      expect(gorunum(d, o.id[0], T0 + 2_000).benimOyum).toBe('NOK');
    },
  );
});

describe('KK-36: final', () => {
  const PLAN: (Oy | null)[][] = [
    ['OK', 'OK', 'NOK'],
    ['OK', 'OK', 'NOK'],
    ['OK', 'NOK', 'NOK'],
    ['OK', 'OK', null],
    ...Array.from({ length: 6 }, () => hepsi(3, 'OK')),
  ];

  kabul(
    'yüzdeler (boşlar ayrı), en tartışmalı, ödüller, kim ne dedi, kişisel',
    () => {
      const o = kur(['A', 'B', 'C']);
      const { d } = oyna(o, PLAN);
      expect(d.asama).toBe('bitti');
      const f = final(d);
      expect(f.yuzdeler).toHaveLength(SORU_SAYISI);
      expect(f.yuzdeler[0]).toMatchObject({ ok: 2, nok: 1, bos: 0 });
      expect(f.yuzdeler[3]).toMatchObject({ ok: 2, nok: 0, bos: 1 });
      expect(f.enTartismali.sort()).toEqual(
        f.yuzdeler
          .slice(0, 3)
          .map((y) => y.kartId)
          .sort(),
      );
      expect(f.oduller.aykiriRuh).toEqual(['C']);
      expect(f.oduller.ruhIkizleri.map((p) => [...p].sort())).toEqual([
        ['A', 'B'],
      ]);
      expect(f.kimNeDedi['C']).toEqual([
        'NOK',
        'NOK',
        'NOK',
        null,
        ...hepsi(6, 'OK'),
      ]);
      expect(f.ayniOlan).toEqual({ A: 9, B: 10, C: 7 });
    },
  );

  kabul('2 kişilik odada Aykırı ruh verilmez', () => {
    const o = kur(['A', 'B']);
    const plan: (Oy | null)[][] = [['OK', 'NOK'], ...dokuz(2).slice(1)];
    expect(final(oyna(o, plan).d).oduller.aykiriRuh).toEqual([]);
  });
});

describe('KK-37: kopma ve yeniden bağlanma', () => {
  kabul(
    'kopan aynı kimlikle döner, o anki soruya katılır; kopukken biten soru boş',
    () => {
      const o = kur(['A', 'B', 'C']);
      let d = basla(o);
      d = ok(d, { tip: 'kop', kimlik: o.id[1] }, T0 + 1_000);
      expect(
        gorunum(d, o.id[0], T0 + 1_000).oyuncular.find((x) => x.ad === 'B')
          ?.bagli,
      ).toBe(false);
      d = cevapla(d, o.id[0], 'OK', T0 + 2_000);
      d = cevapla(d, o.id[2], 'OK', T0 + 3_000);
      const t = T0 + SORU_MS + 1_500;
      d = ok(d, { tip: 'zaman' }, t);
      d = ok(d, { tip: 'don', kimlik: o.id[1] }, t);
      const g = gorunum(d, o.id[1], t);
      expect(g.asama).toBe('soru');
      expect(g.soruNo).toBeGreaterThanOrEqual(2);
      expect(g.kalanMs).toBeGreaterThan(0);
      expect(g.kalanMs).toBeLessThanOrEqual(SORU_MS);
      expect(
        gorunum(d, o.id[0], t).oyuncular.find((x) => x.ad === 'B')?.bagli,
      ).toBe(true);
      d = cevapla(d, o.id[1], 'NOK', t + 500);
      const f = final(bitirBos(d, t + 500).d);
      expect(f.kimNeDedi['B'][0]).toBeNull();
    },
  );

  kabul('bilinmeyen kimlik dönemez', () => {
    const o = kur(['A', 'B']);
    expect(
      isle(basla(o), { tip: 'don', kimlik: 'yok-boyle-kimlik' }, T0 + 1).hata
        ?.kod,
    ).toBe('tanimsiz');
  });
});

describe('KK-38: kuran çıkarsa, tek oyuncu kalırsa', () => {
  kabul('kuran ayrılsa ya da kopsa da oyun kalanlarla sürer ve biter', () => {
    for (const olay of ['ayril', 'kop'] as const) {
      const o = kur(['A', 'B', 'C']);
      let d = basla(o);
      d = ok(d, { tip: olay, kimlik: o.id[0] }, T0 + 1_000);
      expect(d.asama).toBe('soru');
      d = cevapla(d, o.id[1], 'OK', T0 + 2_000);
      d = cevapla(d, o.id[2], 'NOK', T0 + 3_000);
      d = bitirBos(d, T0 + 3_000).d;
      expect(d.asama).toBe('bitti');
      expect(final(d).yuzdeler).toHaveLength(SORU_SAYISI);
    }
  });

  kabul(
    'tek oyuncu kalırsa oyun biter, o ana kadarki sonuçlar gösterilir',
    () => {
      const o = kur(['A', 'B', 'C']);
      let t = T0;
      let d = basla(o);
      for (let soru = 0; soru < 2; soru++) {
        for (const k of o.id) {
          t += 100;
          d = cevapla(d, k, 'OK', t);
        }
      }
      d = ok(d, { tip: 'ayril', kimlik: o.id[1] }, t + 100);
      expect(d.asama).toBe('soru');
      d = ok(d, { tip: 'ayril', kimlik: o.id[2] }, t + 200);
      expect(d.asama).toBe('bitti');
      expect(final(d).yuzdeler).toHaveLength(2);
    },
  );
});

describe('KK-39: veri saklama', () => {
  kabul('1 saat boşta kalan oda silinir; etkinlik sayacı sıfırlar', () => {
    const o = kur(['A', 'B']);
    expect(silinmeli(o.d, T0 + BOSTA_MS - 60_000)).toBe(false);
    expect(silinmeli(o.d, T0 + BOSTA_MS + 60_000)).toBe(true);
    const d = ok(o.d, { tip: 'katil', ad: 'C' }, T0 + 3_000_000);
    expect(silinmeli(d, T0 + 3_000_000 + BOSTA_MS - 60_000)).toBe(false);
    expect(silinmeli(d, T0 + 3_000_000 + BOSTA_MS + 60_000)).toBe(true);
  });

  kabul('oyun bitince silinir, oyun sürerken silinmez', () => {
    const o = kur(['A', 'B']);
    const d = basla(o);
    expect(silinmeli(d, T0 + 1_000)).toBe(false);
    const son = bitirBos(d, T0);
    expect(silinmeli(son.d, son.t + BOSTA_MS + 60_000)).toBe(true);
  });
});

describe('KK-40: saf, serileştirilebilir, deterministik', () => {
  kabul(
    'isle girdiyi değiştirmez; JSON gidiş-dönüşünden sonra aynı davranır',
    () => {
      const o = kur(['A', 'B', 'C']);
      const d = cevapla(basla(o), o.id[0], 'OK', T0 + 1_000);
      const kopya = structuredClone(d);
      isle(d, { tip: 'cevapla', kimlik: o.id[1], oy: 'NOK' }, T0 + 2_000);
      expect(d).toEqual(kopya);
      const diril = JSON.parse(JSON.stringify(d)) as OdaDurum;
      expect(diril).toEqual(d);
      const devam = (x: OdaDurum) =>
        bitirBos(cevapla(x, o.id[1], 'NOK', T0 + 2_000), T0 + 2_000).d;
      expect(final(devam(diril))).toEqual(final(devam(d)));
    },
  );

  kabul('aynı olay dizisi aynı sonucu verir', () => {
    const calis = () => final(oyna(kur(['A', 'B', 'C'], 3), dokuz(3)).d);
    expect(calis()).toEqual(calis());
  });
});
