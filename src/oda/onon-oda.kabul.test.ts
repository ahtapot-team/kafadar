import { describe, expect, it } from 'vitest';
import type { Deste } from '../core/deste';
import { kabulOnonOda as kabul } from '../kabul';
import {
  type Kimlik,
  type OdaDurum,
  type Olay,
  SORU_MS,
  SORU_SAYISI,
  gorunum,
  isle,
  odaKur,
  onOnFinal,
} from './oda';

// KK-63…KK-71: 10/10 ama oda türü. N sahte istemci, sahte saat, ağsız; olaylar doğrudan isle()'ye gider.
const T0 = 1_000_000;
const deste = (n = 30): Deste => ({
  deck_id: 't',
  version: 1,
  lang: 'tr',
  cards: Array.from({ length: n }, (_, i) => ({
    id: `k${i}`,
    text: `10/10 ama ${i}`,
  })),
});

type Oda = { d: OdaDurum; id: Kimlik[]; ad: string[] };

function kur(
  adlar: string[],
  tur: 'on-on-ama' | 'ok-mu-nok' = 'on-on-ama',
  tohum = 1,
): Oda {
  const k = odaKur({
    kod: '123456',
    kurucuAd: adlar[0],
    deste: deste(),
    tohum,
    simdi: T0,
    tur,
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
  expect(s.hata, JSON.stringify(olay)).toBeUndefined();
  return s.durum;
};
const basla = (o: Oda, t = T0) =>
  ok(o.d, { tip: 'baslat', kimlik: o.id[0] }, t);
const puanla = (d: OdaDurum, kimlik: Kimlik, puan: number, t: number) =>
  ok(d, { tip: 'puanla', kimlik, puan }, t);
const hataKodu = (d: OdaDurum, olay: Olay, t: number) => {
  const s = isle(d, olay, t);
  expect(JSON.stringify(s.durum)).toBe(JSON.stringify(d)); // hata varsa durum değişmez
  return s.hata?.kod;
};

// Bir kartı herkes puanlayarak açıklamaya getirir (herkes verince beklemeden açılır).
const kartOyna = (
  o: Oda,
  d: OdaDurum,
  puanlar: (number | null)[],
  t: number,
) => {
  let s = d;
  puanlar.forEach((p, i) => {
    if (p !== null) s = puanla(s, o.id[i], p, t + 100 * (i + 1));
  });
  if (puanlar.some((p) => p === null))
    s = ok(s, { tip: 'zaman' }, t + SORU_MS + 1);
  return s;
};
// Bir oyunu uçtan uca oynar: her kart açıklanır, kuran "Sonraki kart"a basar. Dönüş: bitmiş durum.
function oyna(o: Oda, plan: (number | null)[][]) {
  let d = basla(o);
  let t = T0;
  for (const satir of plan) {
    d = kartOyna(o, d, satir, t);
    t += SORU_MS + 5000;
    d = ok(d, { tip: 'sonraki', kimlik: o.id[0] }, t);
  }
  return { d, t };
}
const kartlar = (n: number, satir: (number | null)[]) =>
  Array.from({ length: SORU_SAYISI }, () => satir.slice(0, n));

describe('KK-63: oda türü, ortak oda altyapısı', () => {
  it('oda türü durumda ve görünümde; varsayılan OK mu NOK mu', () => {
    const a = kur(['Ali', 'Ayşe']);
    expect(a.d.tur).toBe('on-on-ama');
    expect(gorunum(a.d, a.id[1], T0).tur).toBe('on-on-ama');
    const b = kur(['Ali', 'Ayşe'], 'ok-mu-nok');
    expect(b.d.tur).toBe('ok-mu-nok');
    expect(gorunum(b.d, b.id[0], T0).tur).toBe('ok-mu-nok');
    const varsayilan = odaKur({
      kod: '000001',
      kurucuAd: 'A',
      deste: deste(),
      tohum: 1,
      simdi: T0,
    });
    expect(varsayilan.durum.tur).toBe('ok-mu-nok');
  });

  it('katılım kuralları OK mu NOK mu ile aynı: 12 kişi sınırı, başladı, "Ali 2", en az 2 oyuncu', () => {
    const o = kur(Array.from({ length: 12 }, (_, i) => `P${i}`));
    expect(hataKodu(o.d, { tip: 'katil', ad: 'Fazla' }, T0)).toBe('dolu');
    const k = kur(['Ali', 'Ali']);
    expect(k.ad).toEqual(['Ali', 'Ali 2']);
    const tek = kur(['Ali']);
    expect(hataKodu(tek.d, { tip: 'baslat', kimlik: tek.id[0] }, T0)).toBe(
      'yetersiz',
    );
    const b = kur(['Ali', 'Ayşe']);
    expect(hataKodu(b.d, { tip: 'baslat', kimlik: b.id[1] }, T0)).toBe(
      'yetkisiz',
    );
    const d = basla(b);
    expect(hataKodu(d, { tip: 'katil', ad: 'Geç' }, T0 + 1)).toBe('basladi');
  });

  kabul(
    'her oda tek oyun türünde: 10/10 ama odasında cevapla, OK mu NOK mu odasında puanla geçersiz',
    () => {
      const a = kur(['Ali', 'Ayşe']);
      const da = basla(a);
      expect(
        hataKodu(da, { tip: 'cevapla', kimlik: a.id[0], oy: 'OK' }, T0 + 10),
      ).toBeDefined();
      const b = kur(['Ali', 'Ayşe'], 'ok-mu-nok');
      const db = basla(b);
      expect(
        hataKodu(db, { tip: 'puanla', kimlik: b.id[0], puan: 5 }, T0 + 10),
      ).toBeDefined();
      expect(
        hataKodu(db, { tip: 'sonraki', kimlik: b.id[0] }, T0 + 10),
      ).toBeDefined();
    },
  );
});

describe('KK-64: 10 kart, aynı anda, sunucu saati', () => {
  it('10 kart, sıra tohumlu (sunucu belirler), herkeste aynı kart ve süre', () => {
    const a = kur(['Ali', 'Ayşe', 'Can'], 'on-on-ama', 5);
    const b = kur(['Ali', 'Ayşe', 'Can'], 'on-on-ama', 5);
    const c = kur(['Ali', 'Ayşe', 'Can'], 'on-on-ama', 6);
    expect(a.d.sorular).toHaveLength(SORU_SAYISI);
    expect(a.d.sorular.map((k) => k.id)).toEqual(b.d.sorular.map((k) => k.id));
    expect(a.d.sorular.map((k) => k.id)).not.toEqual(
      c.d.sorular.map((k) => k.id),
    );
    const d = basla(a);
    const gorunumler = a.id.map((k) => gorunum(d, k, T0 + 4000));
    for (const g of gorunumler) {
      expect(g.asama).toBe('soru');
      expect(g.soruNo).toBe(1);
      expect(g.soru?.id).toBe(a.d.sorular[0].id);
      expect(g.kalanMs).toBe(SORU_MS - 4000);
    }
  });

  kabul(
    'süre sunucu saatine göre işler: 15 sn dolunca puan reddedilir ve kart açıklanır',
    () => {
      const o = kur(['Ali', 'Ayşe']);
      let d = basla(o);
      d = puanla(d, o.id[0], 7, T0 + 1000);
      expect(
        hataKodu(d, { tip: 'puanla', kimlik: o.id[1], puan: 3 }, T0 + SORU_MS),
      ).toBe('sure-doldu');
      expect(gorunum(d, o.id[0], T0 + SORU_MS + 5).kalanMs).toBe(0);
      d = ok(d, { tip: 'zaman' }, T0 + SORU_MS);
      expect(gorunum(d, o.id[1], T0 + SORU_MS).aciklama).toBeDefined();
    },
  );
});

describe('KK-65: puan girişi', () => {
  kabul(
    '0–10 tam sayı kabul; 0 ve 10 dahil; geçersiz değerler reddedilir, durum değişmez',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      const d = basla(o);
      for (const p of [0, 1, 9, 10])
        expect(
          isle(d, { tip: 'puanla', kimlik: o.id[0], puan: p }, T0 + 5).hata,
        ).toBeUndefined();
      for (const p of [
        -1,
        11,
        4.5,
        NaN,
        Infinity,
        '5' as unknown as number,
        null as unknown as number,
      ])
        expect(
          hataKodu(d, { tip: 'puanla', kimlik: o.id[0], puan: p }, T0 + 5),
          String(p),
        ).toBe('gecersiz');
      expect(
        hataKodu(d, { tip: 'puanla', kimlik: 'yok', puan: 5 }, T0 + 5),
      ).toBe('tanimsiz');
    },
  );

  kabul(
    'süre içinde değiştirilebilir, son puan geçerli; kendi puanını görür',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = puanla(d, o.id[0], 3, T0 + 1000);
      expect(gorunum(d, o.id[0], T0 + 1100).benimPuanim).toBe(3);
      d = puanla(d, o.id[0], 9, T0 + 2000);
      expect(gorunum(d, o.id[0], T0 + 2100).benimPuanim).toBe(9);
      expect(gorunum(d, o.id[1], T0 + 2100).benimPuanim ?? null).toBeNull();
      d = puanla(d, o.id[1], 1, T0 + 3000);
      d = puanla(d, o.id[2], 5, T0 + 4000);
      expect(gorunum(d, o.id[0], T0 + 4001).aciklama?.puanlar[o.ad[0]]).toBe(9);
    },
  );

  kabul(
    '"Puanın alındı ✓ · 6/8": kimin puan verdiği görünür, kaç verdiği görünmez',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = puanla(d, o.id[1], 8, T0 + 1000);
      const g = gorunum(d, o.id[2], T0 + 1100);
      expect(g.cevapladi).toEqual([o.ad[1]]);
      expect(g.toplam).toBe(3);
      expect(JSON.stringify(g)).not.toContain('"8"');
    },
  );

  kabul(
    'herkes (bağlı) puan verince süre beklenmeden açıklamaya geçilir; 0 puan da puandır',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = puanla(d, o.id[0], 0, T0 + 1000);
      d = puanla(d, o.id[1], 0, T0 + 2000);
      expect(gorunum(d, o.id[0], T0 + 2100).aciklama).toBeUndefined();
      d = puanla(d, o.id[2], 0, T0 + 3000);
      const a = gorunum(d, o.id[0], T0 + 3001).aciklama;
      expect(a).toBeDefined();
      expect(a!.oybirligi).toBe(true);
    },
  );

  kabul(
    'puan vermeyen kişi o kartta boş sayılır; ortalamaya ve uçlara girmez',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can', 'Deniz']);
      const d = kartOyna(o, basla(o), [10, 2, null, 4], T0);
      const a = gorunum(d, o.id[2], T0 + SORU_MS + 2).aciklama!;
      expect(a.ortalama).toBe(5.3); // (10+2+4)/3 = 5.33
      expect(a.enDusuk).toEqual({ puan: 2, kisiler: ['Ayşe'] });
      expect(a.enYuksek).toEqual({ puan: 10, kisiler: ['Ali'] });
      expect(a.puanlar).toEqual({ Ali: 10, Ayşe: 2, Can: null, Deniz: 4 });
    },
  );

  kabul('hiç kimse puan vermezse çökmez: ortalama ve uçlar null', () => {
    const o = kur(['Ali', 'Ayşe']);
    const d = kartOyna(o, basla(o), [null, null], T0);
    const a = gorunum(d, o.id[0], T0 + SORU_MS + 2).aciklama!;
    expect(a.ortalama).toBeNull();
    expect(a.enDusuk).toBeNull();
    expect(a.enYuksek).toBeNull();
    expect(a.oybirligi).toBe(false);
    expect(a.bolundu).toBe(false);
  });
});

describe('KK-66: açıklamaya kadar puanlar sızmaz', () => {
  kabul(
    'başkasının puanı değişince benim görünümüm değişmez; yalnızca kendi görünümü değişir',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      const base = basla(o);
      const a = puanla(
        puanla(base, o.id[0], 2, T0 + 1000),
        o.id[1],
        3,
        T0 + 1500,
      );
      const b = puanla(
        puanla(base, o.id[0], 2, T0 + 1000),
        o.id[1],
        9,
        T0 + 1500,
      ); // yalnızca Ayşe'nin puanı farklı
      for (const i of [0, 2])
        expect(gorunum(a, o.id[i], T0 + 2000)).toEqual(
          gorunum(b, o.id[i], T0 + 2000),
        );
      expect(gorunum(a, o.id[1], T0 + 2000)).not.toEqual(
        gorunum(b, o.id[1], T0 + 2000),
      );
    },
  );

  kabul(
    'aynı garanti süre bitip açıklama gelmeden önce de, kopuk oyuncu için de geçerli',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let base = basla(o);
      base = ok(base, { tip: 'kop', kimlik: o.id[2] }, T0 + 500);
      const a = puanla(base, o.id[0], 1, T0 + 1000);
      const b = puanla(base, o.id[0], 10, T0 + 1000);
      for (const i of [1, 2])
        expect(gorunum(a, o.id[i], T0 + 2000)).toEqual(
          gorunum(b, o.id[i], T0 + 2000),
        );
    },
  );

  kabul(
    'açıklama sonrası herkes herkesin puanını görür (aynı açıklama her telefonda)',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = puanla(
        puanla(puanla(d, o.id[0], 2, T0 + 1), o.id[1], 7, T0 + 2),
        o.id[2],
        5,
        T0 + 3,
      );
      const [x, y, z] = o.id.map((k) => gorunum(d, k, T0 + 4).aciklama);
      expect(x).toEqual(y);
      expect(y).toEqual(z);
      expect(x!.puanlar).toEqual({ Ali: 2, Ayşe: 7, Can: 5 });
    },
  );
});

describe('KK-67: açıklama (KK-57 kuralları)', () => {
  const ac = (puanlar: number[], adlar = ['Ali', 'Ayşe', 'Can', 'Deniz']) => {
    const o = kur(adlar.slice(0, puanlar.length));
    const d = kartOyna(o, basla(o), puanlar, T0);
    return gorunum(d, o.id[0], T0 + 100 * puanlar.length + 1).aciklama!;
  };

  kabul(
    'ortalama bir ondalık, uçları verenler, eşit uçlar oyuncu sırasıyla',
    () => {
      const a = ac([10, 0, 5, 5]);
      expect(a.ortalama).toBe(5);
      expect(a.enDusuk).toEqual({ puan: 0, kisiler: ['Ayşe'] });
      expect(a.enYuksek).toEqual({ puan: 10, kisiler: ['Ali'] });
      expect(ac([1, 2, 2, 2]).ortalama).toBe(1.8);
      expect(ac([2, 9, 2, 9]).enDusuk!.kisiler).toEqual(['Ali', 'Can']);
    },
  );

  kabul('oybirliği (herkes aynı) ve "Tam bölündünüz" (fark ≥ 8)', () => {
    expect(ac([6, 6, 6, 6])).toMatchObject({ oybirligi: true, bolundu: false });
    expect(ac([1, 9, 5, 5])).toMatchObject({ oybirligi: false, bolundu: true });
    expect(ac([1, 8, 5, 5]).bolundu).toBe(false);
  });

  kabul(
    'açıklama aşamasında yeni puan kabul edilmez; süre (zaman) açıklamayı ilerletmez',
    () => {
      const o = kur(['Ali', 'Ayşe']);
      let d = kartOyna(o, basla(o), [3, 4], T0);
      expect(
        hataKodu(d, { tip: 'puanla', kimlik: o.id[0], puan: 9 }, T0 + 500),
      ).toBeDefined();
      d = ok(d, { tip: 'zaman' }, T0 + 10 * SORU_MS); // kuran basmadan açıklama süresiz bekler
      expect(gorunum(d, o.id[0], T0 + 10 * SORU_MS).aciklama).toBeDefined();
      expect(gorunum(d, o.id[0], T0 + 10 * SORU_MS).soruNo).toBe(1);
    },
  );
});

describe('KK-68: "Sonraki kart" yalnızca yetkilide', () => {
  const acik = () => {
    const o = kur(['Ali', 'Ayşe', 'Can']);
    return { o, d: kartOyna(o, basla(o), [3, 4, 5], T0) };
  };

  kabul(
    'yalnızca kuranda görünür; diğerleri bekler; kuran dışındaki "sonraki" reddedilir',
    () => {
      const { o, d } = acik();
      expect(o.id.map((k) => gorunum(d, k, T0 + 400).sonrakiGorunur)).toEqual([
        true,
        false,
        false,
      ]);
      expect(hataKodu(d, { tip: 'sonraki', kimlik: o.id[1] }, T0 + 400)).toBe(
        'yetkisiz',
      );
    },
  );

  kabul(
    '"sonraki" yalnızca açıklama aşamasında kabul edilir (puan toplanırken reddedilir, açıklamada kabul)',
    () => {
      const o = kur(['Ali', 'Ayşe']);
      const d = basla(o);
      expect(hataKodu(d, { tip: 'sonraki', kimlik: o.id[0] }, T0 + 5)).toBe(
        'gecersiz',
      );
      const a = kartOyna(o, d, [3, 4], T0);
      expect(
        isle(a, { tip: 'sonraki', kimlik: o.id[0] }, T0 + 400).hata,
      ).toBeUndefined();
    },
  );

  kabul(
    'sonraki kart: sıradaki kart, puanlar sıfırlanır, süre yeniden başlar',
    () => {
      const { o, d } = acik();
      const t = T0 + 20_000;
      const s = ok(d, { tip: 'sonraki', kimlik: o.id[0] }, t);
      const g = gorunum(s, o.id[1], t + 1000);
      expect(g.soruNo).toBe(2);
      expect(g.soru?.id).toBe(o.d.sorular[1].id);
      expect(g.kalanMs).toBe(SORU_MS - 1000);
      expect(g.cevapladi).toEqual([]);
      expect(g.aciklama).toBeUndefined();
      expect(gorunum(s, o.id[0], t).benimPuanim ?? null).toBeNull();
    },
  );

  kabul(
    'kuran kopunca ya da çıkınca yetki sıradaki bağlı oyuncuya geçer; her an tek yetkili; oyun takılmaz',
    () => {
      for (const olay of ['kop', 'ayril'] as const) {
        const { o, d } = acik();
        const s = ok(d, { tip: olay, kimlik: o.id[0] }, T0 + 500);
        const yetkili = o.id
          .slice(1)
          .filter((k) => gorunum(s, k, T0 + 600).sonrakiGorunur);
        expect(yetkili, olay).toEqual([o.id[1]]);
        expect(
          hataKodu(s, { tip: 'sonraki', kimlik: o.id[2] }, T0 + 600),
          olay,
        ).toBe('yetkisiz');
        const s2 = ok(s, { tip: 'sonraki', kimlik: o.id[1] }, T0 + 700);
        expect(gorunum(s2, o.id[2], T0 + 800).soruNo, olay).toBe(2);
      }
    },
  );

  kabul('kuran ve sıradaki de kopuksa yetki ilk bağlı oyuncuya geçer', () => {
    const { o, d: d0 } = acik();
    let d = ok(d0, { tip: 'kop', kimlik: o.id[0] }, T0 + 500);
    d = ok(d, { tip: 'kop', kimlik: o.id[1] }, T0 + 510);
    expect(gorunum(d, o.id[2], T0 + 520).sonrakiGorunur).toBe(true);
  });
});

describe('KK-69: final ve ödüller', () => {
  kabul(
    '10. kartın açıklamasından sonra "Sonraki" finale götürür; tüm telefonlarda bitti',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      const { d } = oyna(o, kartlar(3, [3, 4, 5]));
      expect(d.asama).toBe('bitti');
      for (const k of o.id)
        expect(gorunum(d, k, T0 + 10 * SORU_MS * 2).asama).toBe('bitti');
      const f = onOnFinal(d);
      expect(f.kartlar).toHaveLength(SORU_SAYISI);
      expect(f.kartlar[0].ortalama).toBe(4);
    },
  );

  kabul(
    '9. kartın açıklamasında finale geçilmez; yalnızca 10. karttan sonra',
    () => {
      const o = kur(['Ali', 'Ayşe']);
      const plan = kartlar(2, [3, 4]);
      const { d } = oyna(o, plan.slice(0, 9));
      expect(d.asama).toBe('soru');
      expect(gorunum(d, o.id[0], T0 + 10 ** 7).soruNo).toBe(10);
    },
  );

  kabul(
    'ödüller: en acımasız = en düşük ortalama, melek kalpli = en yüksek, ruh ikizleri = en yakın ikili',
    () => {
      const o = kur(['A', 'B', 'C']);
      const satirlar = [
        [10, 0, 5],
        [8, 2, 5],
        [9, 1, 5],
      ];
      const plan = Array.from(
        { length: SORU_SAYISI },
        (_, i) => satirlar[i % 3],
      );
      const f = onOnFinal(oyna(o, plan).d);
      expect(f.oduller.enAcimasiz).toEqual(['B']);
      expect(f.oduller.melekKalpli).toEqual(['A']);
      expect(f.oduller.ruhIkizleri).toEqual([
        ['A', 'C'],
        ['B', 'C'],
      ]); // fark ortalaması eşit (4)
    },
  );

  kabul('herkesin ortalaması eşitse acımasız/melek ödülü yok', () => {
    const o = kur(['A', 'B', 'C']);
    const f = onOnFinal(oyna(o, kartlar(3, [5, 5, 5])).d);
    expect(f.oduller.enAcimasiz).toEqual([]);
    expect(f.oduller.melekKalpli).toEqual([]);
  });

  kabul('boşlar ödüle girmez; kişisel kartta boş null görünür', () => {
    const o = kur(['A', 'B', 'C']);
    // C hiç puan vermez; A hep 10, B hep 0
    const f = onOnFinal(oyna(o, kartlar(3, [10, 0, null])).d);
    expect(f.oduller.enAcimasiz).toEqual(['B']);
    expect(f.oduller.melekKalpli).toEqual(['A']);
    expect(f.oduller.ruhIkizleri).toEqual([['A', 'B']]); // C'nin ortak kartı yok
    expect(f.kisisel.C).toEqual({
      ortalama: null,
      verilen: Array(SORU_SAYISI).fill(null),
    });
    expect(f.kisisel.A.ortalama).toBe(10);
    expect(f.kartlar[0].puanlar).toEqual({ A: 10, B: 0, C: null });
  });

  kabul(
    'oyundan çıkan ödüllere girmez ama kişisel/kart puanlarında geçmişi kalır',
    () => {
      const o = kur(['A', 'B', 'C', 'D']);
      let d = basla(o);
      let t = T0;
      for (let i = 0; i < SORU_SAYISI; i++) {
        d = kartOyna(
          o,
          d,
          i < 3
            ? [0, 5, 5, 5]
            : i === 3
              ? [0, 5, 5, 5]
              : [5, 5, 5, 5].map((x, j) => (j === 0 ? null : x)),
          t,
        );
        if (i === 3)
          d = ok(d, { tip: 'ayril', kimlik: o.id[0] }, t + SORU_MS + 100);
        t += SORU_MS + 5000;
        d = ok(d, { tip: 'sonraki', kimlik: o.id[i < 3 ? 0 : 1] }, t);
      }
      expect(d.asama).toBe('bitti');
      const f = onOnFinal(d);
      const hepsiAdlar = [
        ...f.oduller.enAcimasiz,
        ...f.oduller.melekKalpli,
        ...f.oduller.ruhIkizleri.flat(),
      ];
      expect(hepsiAdlar).not.toContain('A');
      expect(f.kisisel.A.verilen.slice(0, 3)).toEqual([0, 0, 0]); // çıkış anındaki kart sayılmaz (OK mu NOK ile aynı)
    },
  );
});

describe('KK-70: kopma ve yeniden bağlanma', () => {
  kabul(
    'bağlı herkes puan verince geçilir (kopuk beklenmez); kopuk o kartta boş',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = ok(d, { tip: 'kop', kimlik: o.id[2] }, T0 + 500);
      d = puanla(d, o.id[0], 4, T0 + 1000);
      d = puanla(d, o.id[1], 6, T0 + 1500);
      const a = gorunum(d, o.id[0], T0 + 1600).aciklama!;
      expect(a.puanlar).toEqual({ Ali: 4, Ayşe: 6, Can: null });
      expect(a.ortalama).toBe(5);
    },
  );

  kabul(
    'geri dönen oyuncu açıklamayı ve sonraki kartı görür; kendi puanı olmayan kart boş',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = ok(d, { tip: 'kop', kimlik: o.id[2] }, T0 + 500);
      d = puanla(puanla(d, o.id[0], 4, T0 + 1000), o.id[1], 6, T0 + 1500);
      d = ok(d, { tip: 'don', kimlik: o.id[2] }, T0 + 2000);
      const g = gorunum(d, o.id[2], T0 + 2100);
      expect(g.aciklama).toBeDefined();
      expect(g.benimPuanim ?? null).toBeNull();
      d = ok(d, { tip: 'sonraki', kimlik: o.id[0] }, T0 + 3000);
      expect(gorunum(d, o.id[2], T0 + 3100).soruNo).toBe(2);
      d = puanla(d, o.id[2], 9, T0 + 3200); // dönen oyuncu yeni kartta puan verebilir
      expect(gorunum(d, o.id[2], T0 + 3300).benimPuanim).toBe(9);
    },
  );

  kabul(
    'kopukken süresi biten kart: kopuğun puanı boş; kopmadan önce verdiği puan geçerli',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = puanla(d, o.id[2], 7, T0 + 500);
      d = ok(d, { tip: 'kop', kimlik: o.id[2] }, T0 + 800);
      d = puanla(d, o.id[0], 1, T0 + 1000); // Ayşe vermedi, kimse beklemeden geçmez
      d = ok(d, { tip: 'zaman' }, T0 + SORU_MS + 1);
      const a = gorunum(d, o.id[0], T0 + SORU_MS + 2).aciklama!;
      expect(a.puanlar).toEqual({ Ali: 1, Ayşe: null, Can: 7 });
    },
  );
});

describe('KK-71: saf, serileştirilebilir, OK mu NOK mu bozulmaz', () => {
  kabul(
    'isle() girdiyi değiştirmez; JSON gidiş-dönüşünden sonra aynı davranır',
    () => {
      const o = kur(['Ali', 'Ayşe', 'Can']);
      let d = basla(o);
      d = puanla(d, o.id[0], 3, T0 + 100);
      const once = JSON.stringify(d);
      const s = isle(d, { tip: 'puanla', kimlik: o.id[1], puan: 6 }, T0 + 200);
      expect(JSON.stringify(d)).toBe(once);
      const geri = JSON.parse(once) as OdaDurum;
      expect(
        isle(geri, { tip: 'puanla', kimlik: o.id[1], puan: 6 }, T0 + 200),
      ).toEqual(s);
    },
  );

  it('OK mu NOK mu odası aynı: cevapla çalışır, gorunum 10/10 ama alanları taşımaz', () => {
    const o = kur(['Ali', 'Ayşe'], 'ok-mu-nok');
    let d = basla(o);
    d = ok(d, { tip: 'cevapla', kimlik: o.id[0], oy: 'OK' }, T0 + 100);
    const g = gorunum(d, o.id[0], T0 + 200);
    expect(g.benimOyum).toBe('OK');
    expect(g.aciklama).toBeUndefined();
    expect(g.benimPuanim).toBeUndefined();
    expect(g.sonrakiGorunur).toBeUndefined();
  });

  kabul('rastgele oyun: 100 tohum, gizlilik ve tutarlılık değişmezleri', () => {
    for (let tohum = 1; tohum <= 100; tohum++) {
      const n = 2 + (tohum % 5);
      const o = kur(
        Array.from({ length: n }, (_, i) => `P${i}`),
        'on-on-ama',
        tohum,
      );
      let d = basla(o);
      let t = T0;
      for (let kart = 0; kart < SORU_SAYISI; kart++) {
        o.id.forEach((k, i) => {
          if ((tohum + kart + i) % 4 !== 0)
            d = puanla(
              d,
              k,
              (tohum * 7 + kart * 3 + i * 5) % 11,
              t + 100 * (i + 1),
            );
        });
        if (gorunum(d, o.id[0], t + 1000).aciklama === undefined)
          d = ok(d, { tip: 'zaman' }, t + SORU_MS + 1);
        const g = o.id.map((k) => gorunum(d, k, t + SORU_MS + 2).aciklama);
        expect(g[0], `tohum ${tohum} kart ${kart}`).toBeDefined();
        for (const x of g) expect(x).toEqual(g[0]);
        t += SORU_MS + 5000;
        d = ok(d, { tip: 'sonraki', kimlik: o.id[0] }, t);
      }
      expect(d.asama).toBe('bitti');
      expect(onOnFinal(d).kartlar).toHaveLength(SORU_SAYISI);
    }
  });
});
