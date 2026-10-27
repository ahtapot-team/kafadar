import { describe, expect } from 'vitest';
import { kabulCasusMantik as kabul } from '../../kabul';
import {
  type CasusDeste,
  type CasusDurum,
  type Olay,
  baslayan,
  casusSiniri,
  isle,
  kalanMs,
  kart,
  kayittanYukle,
  kelimeKartId,
  oySonucu,
  oylamaAdaylari,
  siradaki,
  sonuc,
  tahminSecenekleri,
  yeniOyun,
} from './casus';

// Sahte tohum + sahte saat, ağsız ve arayüzsüz. Gizlilik (kart yalnızca sıradaki oyuncuya, bir kez) öncelikli.
const T0 = 1_000_000;
const DK = 60_000;
const deste = (n = 20): CasusDeste => ({
  deck_id: 't',
  version: 1,
  lang: 'tr',
  sorular: ['Soru 1', 'Soru 2'],
  cards: Array.from({ length: n }, (_, i) => ({
    id: `k${i}`,
    kelime: `Kelime${i}`,
    ipucu: `İpucu${i}`,
  })),
});
const ad = (n: number) => Array.from({ length: n }, (_, i) => `P${i + 1}`);
const kur = (
  n = 4,
  o: Partial<Parameters<typeof yeniOyun>[0]> = {},
): CasusDurum =>
  yeniOyun({ oyuncular: ad(n), deste: deste(), sureDk: null, tohum: 1, ...o });

type Kart = NonNullable<ReturnType<typeof kart>>;
// Herkes sırayla kartını görür; geri dönen: tartışma aşamasındaki durum + kim ne gördü.
function rolleriOku(d: CasusDurum) {
  const roller: Record<string, Kart> = {};
  while (d.asama === 'rol') {
    const p = siradaki(d)!;
    d = isle(d, { tip: 'benim' });
    roller[p] = kart(d)!;
    d = isle(d, { tip: 'goruldu', t: T0 });
  }
  const casuslar = Object.keys(roller).filter((p) => roller[p].rol === 'casus');
  return { d, roller, casuslar };
}
const olaylar = (d: CasusDurum, ...o: Olay[]) => o.reduce(isle, d);

// Herkes `hedef`'e oy verir (hedef kendine veremez, ilk başka oyuncuya verir).
function herkesOylar(d: CasusDurum, oyuncular: string[], hedef: string) {
  for (const p of oyuncular)
    d = isle(d, {
      tip: 'oyla',
      oyveren: p,
      secilen: p === hedef ? oyuncular.find((x) => x !== hedef)! : hedef,
    });
  return isle(d, { tip: 'oylamayiBitir' });
}
const oylamayaGec = (d: CasusDurum) =>
  isle(d, { tip: 'tartismayiBitir', t: T0 + 1_000 });

describe('KK-43: casus sayısı, tohum', () => {
  kabul('casus sınırı: 3–7 → 1, 8–11 → 2, 12 → 3', () => {
    const t = [3, 7, 8, 11, 12].map(casusSiniri);
    expect(t).toEqual([1, 1, 2, 2, 3]);
  });

  kabul('varsayılan 1 casus; istenen sayı sınıra çekilir', () => {
    expect(rolleriOku(kur(5)).casuslar).toHaveLength(1);
    expect(rolleriOku(kur(8, { casusSayisi: 5 })).casuslar).toHaveLength(2);
    expect(rolleriOku(kur(12, { casusSayisi: 3 })).casuslar).toHaveLength(3);
    expect(rolleriOku(kur(6, { casusSayisi: 0 })).casuslar).toHaveLength(1);
  });

  kabul(
    'aynı tohum aynı casus, kelime, başlayan; farklı tohumlarda casus değişir',
    () => {
      const oku = (tohum: number) => {
        const r = rolleriOku(kur(6, { tohum }));
        return { c: r.casuslar, k: kelimeKartId(r.d), b: baslayan(r.d) };
      };
      expect(oku(7)).toEqual(oku(7));
      const casuslar = new Set(
        Array.from({ length: 20 }, (_, i) => oku(i + 1).c[0]),
      );
      expect(casuslar.size).toBeGreaterThan(2);
    },
  );

  kabul(
    'normal oyuncular kelimeyi, casus yalnızca ipucunu görür; casus diğer casusu bilmez',
    () => {
      const r = rolleriOku(kur(9, { casusSayisi: 2, tohum: 4 }));
      const kartKarti = deste().cards.find((c) => c.id === kelimeKartId(r.d))!;
      for (const p of Object.keys(r.roller)) {
        const k = r.roller[p];
        expect(k.metin).toBe(
          k.rol === 'casus' ? kartKarti.ipucu : kartKarti.kelime,
        );
        if (k.rol === 'casus')
          for (const diger of r.casuslar.filter((x) => x !== p))
            expect(JSON.stringify(k)).not.toContain(diger);
      }
      expect(r.casuslar).toHaveLength(2);
    },
  );
});

describe('KK-44/46: devir perdesi, gizlilik', () => {
  kabul(
    'kart perde açılmadan görünmez; yalnızca sıradaki oyuncu, "Gördüm"e kadar',
    () => {
      let d = kur(3);
      expect(siradaki(d)).toBe('P1');
      expect(kart(d)).toBeNull();
      d = isle(d, { tip: 'benim' });
      expect(kart(d)).not.toBeNull();
      d = isle(d, { tip: 'goruldu', t: T0 });
      expect(kart(d)).toBeNull();
      expect(siradaki(d)).toBe('P2');
      d = olaylar(
        d,
        { tip: 'benim' },
        { tip: 'goruldu', t: T0 },
        { tip: 'benim' },
        { tip: 'goruldu', t: T0 },
      );
      expect(d.asama).toBe('tartisma');
      expect(kart(d)).toBeNull();
      expect(siradaki(d)).toBeNull();
    },
  );

  kabul(
    '"Ben X\'im" olmadan "Gördüm" geçersiz: kimse kartını görmeden atlanamaz',
    () => {
      const d = kur(3);
      expect(isle(d, { tip: 'goruldu', t: T0 })).toEqual(d);
    },
  );

  kabul(
    'arka plana alınca açık kart kapanır, oyuncu hâlâ görmemiş sayılır',
    () => {
      let d = isle(kur(3), { tip: 'benim' });
      d = isle(d, { tip: 'arkaPlan' });
      expect(kart(d)).toBeNull();
      expect(siradaki(d)).toBe('P1');
      d = isle(d, { tip: 'benim' });
      expect(kart(d)).not.toBeNull();
    },
  );

  kabul(
    'her oyuncu kartını tam bir kez görür (görenin kartı bir daha açılmaz)',
    () => {
      let d = kur(4);
      let acilis = 0;
      for (let i = 0; i < 4; i++) {
        d = isle(d, { tip: 'benim' });
        if (kart(d)) acilis++;
        d = isle(d, { tip: 'goruldu', t: T0 });
        // görenin ardından gelen "Ben X'im" yalnızca yeni sıradakini açar, öncekini değil
        const onceki = siradaki(d);
        const yeni = isle(d, { tip: 'benim' });
        expect(kart(yeni) === null || siradaki(yeni) === onceki).toBe(true);
      }
      expect(acilis).toBe(4);
    },
  );
});

describe('KK-47: kayıt ve devam', () => {
  kabul(
    'açık kart geri yüklenmez; görenler kalır, kalanlar devir perdesinden devam eder',
    () => {
      let d = kur(4);
      d = olaylar(
        d,
        { tip: 'benim' },
        { tip: 'goruldu', t: T0 },
        { tip: 'benim' },
        { tip: 'goruldu', t: T0 },
        { tip: 'benim' },
      );
      expect(kart(d)).not.toBeNull(); // P3'ün kartı açıkken uygulama kapanır
      const diril = kayittanYukle(JSON.parse(JSON.stringify(d)) as CasusDurum);
      expect(kart(diril)).toBeNull();
      expect(siradaki(diril)).toBe('P3'); // P1 ve P2 tekrar rol ekranına dönmez
      const son = olaylar(
        diril,
        { tip: 'benim' },
        { tip: 'goruldu', t: T0 },
        { tip: 'benim' },
        { tip: 'goruldu', t: T0 },
      );
      expect(son.asama).toBe('tartisma');
    },
  );

  kabul('devam eden oyun aynı casus ve kelimeyle sürer', () => {
    const d0 = kur(5, { tohum: 9 });
    const tam = rolleriOku(d0);
    let yari = olaylar(
      d0,
      { tip: 'benim' },
      { tip: 'goruldu', t: T0 },
      { tip: 'benim' },
    );
    yari = kayittanYukle(JSON.parse(JSON.stringify(yari)) as CasusDurum);
    const devam = rolleriOku(yari);
    expect(kelimeKartId(devam.d)).toBe(kelimeKartId(tam.d));
    expect(Object.keys(devam.roller)).toEqual(['P2', 'P3', 'P4', 'P5']);
  });
});

describe('KK-48: tartışma, süre, bitir', () => {
  kabul(
    'ilk soru soran tartışma başında seçilir (tohumlu, oyunculardan biri)',
    () => {
      const d = kur(5);
      expect(baslayan(d)).toBeNull();
      const r = rolleriOku(d);
      expect(ad(5)).toContain(baslayan(r.d));
      expect(baslayan(rolleriOku(kur(5)).d)).toBe(baslayan(r.d));
    },
  );

  kabul(
    'süre kapalıysa kalanMs null; açıksa gerçek saate göre, arka plan fark etmez',
    () => {
      const kapali = rolleriOku(kur(3)).d;
      expect(kalanMs(kapali, T0 + 10_000)).toBeNull();
      const acik = rolleriOku(kur(3, { sureDk: 3 })).d; // tartışma T0'da başlar
      expect(kalanMs(acik, T0)).toBe(3 * DK);
      const arka = isle(acik, { tip: 'arkaPlan' });
      expect(kalanMs(arka, T0 + DK)).toBe(2 * DK);
    },
  );

  kabul('süre dolunca zaman oylamaya geçirir; dolmadan geçirmez', () => {
    const d = rolleriOku(kur(3, { sureDk: 3 })).d;
    expect(isle(d, { tip: 'zaman', t: T0 + 2 * DK }).asama).toBe('tartisma');
    expect(isle(d, { tip: 'zaman', t: T0 + 3 * DK + 1 }).asama).toBe('oylama');
  });

  kabul(
    'moderatör süre dolmadan (ya da süre kapalıyken) oylamaya geçebilir',
    () => {
      expect(oylamayaGec(rolleriOku(kur(3, { sureDk: 8 })).d).asama).toBe(
        'oylama',
      );
      expect(oylamayaGec(rolleriOku(kur(3)).d).asama).toBe('oylama');
    },
  );

  kabul(
    'oyunu bitir her aşamada sonuç verir; kazanan ilan edilmez, casuslar ve kelime gösterilir',
    () => {
      const r = rolleriOku(kur(4, { tohum: 2 }));
      const asamalar: CasusDurum[] = [
        kur(4, { tohum: 2 }),
        r.d,
        oylamayaGec(r.d),
      ];
      for (const d of asamalar) {
        const s = sonuc(isle(d, { tip: 'oyunuBitir' }));
        expect(s.kazanan).toBeNull();
        expect(s.casuslar).toEqual(r.casuslar);
        expect(s.kelime).toMatch(/^Kelime\d+$/);
      }
    },
  );
});

describe('KK-49: oylama, eşitlik', () => {
  const P = ad(4);
  const oylamada = () => oylamayaGec(rolleriOku(kur(4, { tohum: 3 })).d);

  kabul(
    'kendine ve aday dışına oy geçersiz; son oy geçerli; herkes oylamadan sayılmaz',
    () => {
      let d = oylamada();
      expect(isle(d, { tip: 'oyla', oyveren: 'P1', secilen: 'P1' })).toEqual(d);
      expect(isle(d, { tip: 'oyla', oyveren: 'P1', secilen: 'Yok' })).toEqual(
        d,
      );
      d = isle(d, { tip: 'oyla', oyveren: 'P1', secilen: 'P2' });
      expect(isle(d, { tip: 'oylamayiBitir' }).asama).toBe('oylama'); // herkes oy vermedi
      d = herkesOylar(d, P, 'P3'); // P1 oyunu değiştirir: son oy geçerli
      expect(oySonucu(d)).toEqual({ secilen: 'P3' });
      expect(d.asama).toBe('aciklama');
    },
  );

  kabul(
    'eşitlikte yalnızca eşit kalanlar arasında bir kez daha oylanır',
    () => {
      let d = oylamada();
      expect(oylamaAdaylari(d)).toEqual(P);
      for (const [o, s] of [
        ['P1', 'P2'],
        ['P2', 'P1'],
        ['P3', 'P1'],
        ['P4', 'P2'],
      ])
        d = isle(d, { tip: 'oyla', oyveren: o, secilen: s });
      d = isle(d, { tip: 'oylamayiBitir' });
      expect(d.asama).toBe('oylama'); // 2–2
      expect(oylamaAdaylari(d).sort()).toEqual(['P1', 'P2']);
      expect(isle(d, { tip: 'oyla', oyveren: 'P3', secilen: 'P4' })).toEqual(d); // aday değil
      for (const [o, s] of [
        ['P1', 'P2'],
        ['P2', 'P1'],
        ['P3', 'P1'],
        ['P4', 'P1'],
      ])
        d = isle(d, { tip: 'oyla', oyveren: o, secilen: s });
      d = isle(d, { tip: 'oylamayiBitir' });
      expect(d.asama).toBe('aciklama');
      expect(oySonucu(d)).toEqual({ secilen: 'P1' });
    },
  );

  kabul('ikinci turda da eşitse casuslar kazanır', () => {
    let d = oylamada();
    const tur = () => {
      for (const [o, s] of [
        ['P1', 'P2'],
        ['P2', 'P1'],
        ['P3', 'P1'],
        ['P4', 'P2'],
      ])
        d = isle(d, { tip: 'oyla', oyveren: o, secilen: s });
      d = isle(d, { tip: 'oylamayiBitir' });
    };
    tur();
    tur();
    expect(d.asama).toBe('sonuc');
    expect(sonuc(d).kazanan).toBe('casus');
  });
});

describe('KK-50: açıklama, casus tahmini', () => {
  const P = ad(5);
  const hazir = (tohum = 5) => {
    const r = rolleriOku(kur(5, { tohum }));
    return { ...r, normal: P.find((p) => !r.casuslar.includes(p))! };
  };

  kabul('oylanan casus değilse casuslar kazanır, tahmin yok', () => {
    const h = hazir();
    let d = herkesOylar(oylamayaGec(h.d), P, h.normal);
    expect(oySonucu(d)).toEqual({ secilen: h.normal });
    d = isle(d, { tip: 'devam' });
    expect(d.asama).toBe('sonuc');
    expect(sonuc(d)).toMatchObject({ kazanan: 'casus', casuslar: h.casuslar });
  });

  kabul(
    'oylanan casussa 6 şıklı tahmin: bilirse casuslar, bilemezse grup kazanır',
    () => {
      const h = hazir();
      const tahmine = () =>
        isle(herkesOylar(oylamayaGec(h.d), P, h.casuslar[0]), { tip: 'devam' });
      const d = tahmine();
      expect(d.asama).toBe('tahmin');
      const sik = tahminSecenekleri(d);
      const dogru = deste().cards.find((c) => c.id === kelimeKartId(d))!.kelime;
      expect(sik).toHaveLength(6);
      expect(new Set(sik).size).toBe(6);
      expect(sik).toContain(dogru);
      for (const s of sik)
        expect(deste().cards.map((c) => c.kelime)).toContain(s);
      expect(sonuc(isle(d, { tip: 'tahmin', kelime: dogru })).kazanan).toBe(
        'casus',
      );
      const yanlis = sik.find((s) => s !== dogru)!;
      const grup = isle(tahmine(), { tip: 'tahmin', kelime: yanlis });
      expect(sonuc(grup)).toMatchObject({ kazanan: 'grup', kelime: dogru });
      expect(sonuc(grup).casuslar).toEqual(h.casuslar);
      expect(isle(d, { tip: 'tahmin', kelime: 'şıklarda yok' })).toEqual(d);
    },
  );
});

describe('KK-51: kelime tekrarı', () => {
  kabul(
    'oturumda aynı kelime tekrar gelmez; deste bitince baştan karıştırılır',
    () => {
      const d5 = deste(5);
      const kullanilan: string[] = [];
      for (let i = 0; i < 5; i++) {
        const d = yeniOyun({
          oyuncular: ad(3),
          deste: d5,
          sureDk: null,
          tohum: i + 1,
          kullanilan,
        });
        const id = kelimeKartId(d);
        expect(kullanilan).not.toContain(id);
        kullanilan.push(id);
      }
      expect(new Set(kullanilan).size).toBe(5);
      const bitmis = yeniOyun({
        oyuncular: ad(3),
        deste: d5,
        sureDk: null,
        tohum: 9,
        kullanilan,
      });
      expect(d5.cards.map((c) => c.id)).toContain(kelimeKartId(bitmis));
    },
  );
});

describe('KK-53: saf, serileştirilebilir, deterministik', () => {
  kabul(
    'isle girdiyi değiştirmez; JSON gidiş-dönüşünden sonra aynı davranır',
    () => {
      const d = isle(kur(4, { tohum: 8 }), { tip: 'benim' });
      const kopya = structuredClone(d);
      isle(d, { tip: 'goruldu', t: T0 });
      expect(d).toEqual(kopya);
      const diril = JSON.parse(JSON.stringify(d)) as CasusDurum;
      expect(diril).toEqual(d);
      expect(kart(diril)).toEqual(kart(d));
      expect(rolleriOku(diril).roller).toEqual(rolleriOku(d).roller);
    },
  );
});
