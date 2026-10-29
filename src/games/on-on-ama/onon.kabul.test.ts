import { describe, expect, it } from 'vitest';
import {
  type Durum,
  type Olay,
  durumGecerliMi,
  gecerliKart,
  gosterAktif,
  isle,
  oduller,
  ozet,
  yeniOyun,
} from './onon';

// KK-56…KK-58, KK-61: saf durum makinesi. Sahte tohum, ağsız; zaman yok.
const deste = (n: number) => ({
  deck_id: 't',
  version: 1,
  lang: 'tr',
  cards: Array.from({ length: n }, (_, i) => ({
    id: `k${i}`,
    text: `10/10 ama ${i}`,
  })),
});
const P = ['Ali', 'Ayşe', 'Can', 'Deniz'];
const baslat = (
  oyuncular = P,
  n = 30,
  uzunluk: 10 | 20 | null = 10,
  tohum = 1,
) => yeniOyun({ oyuncular, deste: deste(n), uzunluk, tohum });
const uygula = (d: Durum, ...olaylar: Olay[]) =>
  olaylar.reduce((s, o) => isle(s, o), d);
const puanla = (d: Durum, p: number[], oyuncular = P) =>
  uygula(
    d,
    ...oyuncular.map((o, i): Olay => ({ tip: 'puan', oyuncu: o, puan: p[i] })),
  );
// Bir kartı puanlayıp açar, sonraki karta geçer.
const tur = (d: Durum, p: number[], oyuncular = P) =>
  uygula(puanla(d, p, oyuncular), { tip: 'goster' }, { tip: 'sonraki' });

describe('KK-61: tohumlu, saf, serileştirilebilir', () => {
  it('aynı tohum aynı kart sırası; yeniOyun girdiyi değiştirmez', () => {
    const ds = deste(30);
    const kopya = JSON.stringify(ds);
    const a = yeniOyun({ oyuncular: P, deste: ds, uzunluk: 10, tohum: 5 });
    const b = yeniOyun({ oyuncular: P, deste: ds, uzunluk: 10, tohum: 5 });
    const c = yeniOyun({ oyuncular: P, deste: ds, uzunluk: 10, tohum: 6 });
    expect(a.kartlar.map((k) => k.id)).toEqual(b.kartlar.map((k) => k.id));
    expect(a.kartlar.map((k) => k.id)).not.toEqual(c.kartlar.map((k) => k.id));
    expect(JSON.stringify(ds)).toBe(kopya);
    expect(a.asama).toBe('puan');
    expect(a.gecmis).toEqual([]);
  });

  it('isle() girdiyi değiştirmez; durum JSON gidiş-dönüşünden sonra aynı davranır', () => {
    const d = puanla(baslat(), [3, 4, 5, 6]);
    const once = JSON.stringify(d);
    const e = isle(d, { tip: 'goster' });
    expect(JSON.stringify(d)).toBe(once);
    const geri = JSON.parse(JSON.stringify(d)) as Durum;
    expect(isle(geri, { tip: 'goster' })).toEqual(e);
    expect(durumGecerliMi(geri)).toBe(true);
  });
});

describe('KK-56: puan girişi', () => {
  it('0–10 tam sayı kabul; geçersiz değerler yok sayılır', () => {
    const d = baslat();
    for (const puan of [0, 5, 10]) {
      const s = isle(d, { tip: 'puan', oyuncu: 'Ali', puan });
      expect(s.puanlar.Ali).toBe(puan);
    }
    for (const puan of [-1, 11, 4.5, NaN, Infinity]) {
      const s = isle(d, { tip: 'puan', oyuncu: 'Ali', puan });
      expect(s.puanlar.Ali, String(puan)).toBeUndefined();
    }
    expect(isle(d, { tip: 'puan', oyuncu: 'Yok', puan: 5 }).puanlar).toEqual(
      {},
    );
  });

  it('açıklamaya kadar değiştirilebilir; son girilen geçerli; açıkken değişmez', () => {
    let d = puanla(baslat(), [3, 4, 5, 6]);
    d = isle(d, { tip: 'puan', oyuncu: 'Ali', puan: 9 });
    expect(d.puanlar.Ali).toBe(9);
    const acik = isle(d, { tip: 'goster' });
    expect(acik.asama).toBe('acik');
    expect(isle(acik, { tip: 'puan', oyuncu: 'Ali', puan: 1 })).toEqual(acik);
  });

  it('Göster yalnızca herkes puan verince açılır', () => {
    let d = baslat();
    expect(gosterAktif(d)).toBe(false);
    d = uygula(
      d,
      { tip: 'puan', oyuncu: 'Ali', puan: 0 },
      { tip: 'puan', oyuncu: 'Ayşe', puan: 7 },
    );
    expect(gosterAktif(d)).toBe(false);
    expect(isle(d, { tip: 'goster' })).toEqual(d);
    d = puanla(d, [0, 7, 3, 3]);
    expect(gosterAktif(d)).toBe(true); // 0 puan da geçerli puandır
    expect(isle(d, { tip: 'goster' }).asama).toBe('acik');
  });

  it('Göster kartı geçmişe yazar; Sonraki yeni kartta puanları sıfırlar', () => {
    const d0 = baslat();
    const k = gecerliKart(d0);
    const acik = uygula(puanla(d0, [1, 2, 3, 4]), { tip: 'goster' });
    expect(acik.gecmis).toEqual([
      { kartId: k.id, puanlar: { Ali: 1, Ayşe: 2, Can: 3, Deniz: 4 } },
    ]);
    const sonraki = isle(acik, { tip: 'sonraki' });
    expect(sonraki.asama).toBe('puan');
    expect(sonraki.puanlar).toEqual({});
    expect(gecerliKart(sonraki).id).not.toBe(k.id);
    expect(isle(d0, { tip: 'sonraki' })).toEqual(d0); // açık değilken Sonraki yok
  });
});

describe('KK-57: açıklama', () => {
  const ac = (p: number[], oyuncular = P) =>
    ozet(uygula(puanla(baslat(oyuncular), p, oyuncular), { tip: 'goster' }));

  it('ortalama bir ondalık; en düşük ve en yüksek puan verenler', () => {
    const o = ac([10, 0, 5, 5]);
    expect(o.ortalama).toBe(5);
    expect(o.enDusuk).toEqual({ puan: 0, kisiler: ['Ayşe'] });
    expect(o.enYuksek).toEqual({ puan: 10, kisiler: ['Ali'] });
    expect(ac([1, 2, 2, 2]).ortalama).toBe(1.8); // 7/4 = 1.75 → 1.8
    expect(ac([7, 7, 3], ['A', 'B', 'C']).ortalama).toBe(5.7); // 17/3
    expect(ac([1, 2, 2], ['A', 'B', 'C']).ortalama).toBe(1.7); // 5/3
  });

  it('eşit uç puanlarda hepsi oyuncu sırasıyla listelenir', () => {
    const o = ac([2, 9, 2, 9]);
    expect(o.enDusuk).toEqual({ puan: 2, kisiler: ['Ali', 'Can'] });
    expect(o.enYuksek).toEqual({ puan: 9, kisiler: ['Ayşe', 'Deniz'] });
  });

  it('oybirliği: herkes aynı puan; bölünme değil', () => {
    const o = ac([6, 6, 6, 6]);
    expect(o.oybirligi).toBe(true);
    expect(o.bolundu).toBe(false);
    expect(ac([6, 6, 6, 7]).oybirligi).toBe(false);
    expect(ac([0, 0, 0, 0]).oybirligi).toBe(true);
  });

  it('"Tam bölündünüz": uçlar arası fark ≥ 8 (7 değil)', () => {
    expect(ac([1, 9, 5, 5]).bolundu).toBe(true); // 8
    expect(ac([0, 10, 5, 5]).bolundu).toBe(true); // 10
    expect(ac([1, 8, 5, 5]).bolundu).toBe(false); // 7
    expect(ac([5, 5, 5, 5]).bolundu).toBe(false);
  });

  it('2 kişilikte de çalışır', () => {
    const o = ac([0, 10], ['A', 'B']);
    expect(o).toMatchObject({ ortalama: 5, bolundu: true, oybirligi: false });
  });
});

describe('KK-58: oturum sonu ödülleri', () => {
  // 3 kart: A 10/8/9, B 0/2/1, C hep 5.
  const oyna = (kartlar: number[][], oyuncular: string[]) =>
    kartlar.reduce((d, p) => tur(d, p, oyuncular), baslat(oyuncular));
  const ABC = ['A', 'B', 'C'];

  it('en acımasız = en düşük ortalama, melek kalpli = en yüksek ortalama', () => {
    const d = oyna(
      [
        [10, 0, 5],
        [8, 2, 5],
        [9, 1, 5],
      ],
      ABC,
    );
    const o = oduller(d);
    expect(o.enAcimasiz).toEqual(['B']);
    expect(o.melekKalpli).toEqual(['A']);
  });

  it('ruh ikizleri = ortak kartlarda puan farkı ortalaması en küçük ikili; eşitlikte hepsi', () => {
    const d = oyna(
      [
        [10, 0, 5],
        [8, 2, 5],
        [9, 1, 5],
      ],
      ABC,
    );
    // |A−C| ortalaması 4, |B−C| 4, |A−B| 8 → iki ikili eşit
    expect(oduller(d).ruhIkizleri).toEqual([
      ['A', 'C'],
      ['B', 'C'],
    ]);
    const e = oyna(
      [
        [3, 3, 9],
        [4, 4, 1],
        [5, 5, 8],
      ],
      ABC,
    );
    expect(oduller(e).ruhIkizleri).toEqual([['A', 'B']]);
  });

  it('herkesin ortalaması eşitse acımasız/melek boş; hiç kart yoksa her şey boş', () => {
    const d = oyna(
      [
        [5, 5, 5],
        [6, 6, 6],
      ],
      ABC,
    );
    expect(oduller(d).enAcimasiz).toEqual([]);
    expect(oduller(d).melekKalpli).toEqual([]);
    expect(oduller(baslat(ABC))).toEqual({
      enAcimasiz: [],
      melekKalpli: [],
      ruhIkizleri: [],
    });
  });

  it("açıklanmamış (Göster'e basılmamış) kart sayılmaz; Atla geçmişe yazmaz", () => {
    let d = oyna([[10, 0, 5]], ABC);
    d = puanla(d, [0, 10, 5], ABC); // açıklanmadı
    expect(oduller(d).melekKalpli).toEqual(['A']);
    const a = isle(d, { tip: 'atla' });
    expect(a.gecmis).toHaveLength(1);
    expect(oduller(a).melekKalpli).toEqual(['A']);
  });

  it('oturumdan çıkarılan oyuncu ödül almaz', () => {
    const d = oyna(
      [
        [10, 0, 5],
        [8, 2, 5],
      ],
      ABC,
    );
    const e = isle(d, { tip: 'oyuncuCikar', ad: 'B' });
    const o = oduller(e);
    expect([
      ...o.enAcimasiz,
      ...o.melekKalpli,
      ...o.ruhIkizleri.flat(),
    ]).not.toContain('B');
  });
});

describe('akış: uzunluk, atla, bitir, karıştır, oyuncular', () => {
  it('10 kartlık tur 10. Sonraki ile biter; sınırsızda deste biter, Karıştır baştan', () => {
    let d = baslat(P, 30, 10);
    for (let i = 0; i < 9; i++) d = tur(d, [1, 2, 3, 4]);
    expect(d.asama).toBe('puan');
    d = tur(d, [1, 2, 3, 4]);
    expect(d.asama).toBe('bitti');
    expect(d.gecmis).toHaveLength(10);

    let s = baslat(P, 3, null);
    for (let i = 0; i < 3; i++) s = tur(s, [5, 5, 5, 5]);
    expect(s.asama).toBe('desteBitti');
    const k = isle(s, { tip: 'karistir' });
    expect(k.asama).toBe('puan');
    expect(isle(d, { tip: 'karistir' })).toEqual(d); // yalnızca desteBitti'de
  });

  it('Atla sonraki karta geçer, geçmişe yazmaz, tur uzunluğuna sayılır', () => {
    let d = baslat(P, 30, 10);
    const ilk = gecerliKart(d).id;
    d = isle(puanla(d, [1, 2, 3, 4]), { tip: 'atla' });
    expect(d.gecmis).toEqual([]);
    expect(gecerliKart(d).id).not.toBe(ilk);
    expect(d.puanlar).toEqual({});
    expect(d.tamamlanan).toBe(1);
  });

  it('Bitir her aşamada oturumu bitirir', () => {
    expect(isle(baslat(), { tip: 'bitir' }).asama).toBe('bitti');
    expect(isle(puanla(baslat(), [1, 2, 3, 4]), { tip: 'bitir' }).asama).toBe(
      'bitti',
    );
  });

  it('oyuncu eklenir (tekrar ve boş ad yok); çıkarılanın puanı düşer', () => {
    let d = baslat();
    expect(isle(d, { tip: 'oyuncuEkle', ad: 'Ali' })).toEqual(d);
    expect(isle(d, { tip: 'oyuncuEkle', ad: '  ' })).toEqual(d);
    d = isle(d, { tip: 'oyuncuEkle', ad: 'Ece' });
    expect(d.oyuncular).toContain('Ece');
    d = puanla(d, [1, 2, 3, 4, 5], [...P, 'Ece']);
    d = isle(d, { tip: 'oyuncuCikar', ad: 'Ece' });
    expect(d.oyuncular).not.toContain('Ece');
    expect(d.puanlar.Ece).toBeUndefined();
    expect(gosterAktif(d)).toBe(true); // kalanlar tam
  });
});

describe('kayıt şeması: durumGecerliMi (KK-14 kalıbı)', () => {
  const gecerli = () =>
    uygula(puanla(baslat(), [1, 2, 3, 4]), { tip: 'goster' });
  const boz = (f: (d: Record<string, unknown>) => void) => {
    const d = JSON.parse(JSON.stringify(gecerli())) as Record<string, unknown>;
    f(d);
    return d;
  };

  it('geçerli durum her aşamada kabul', () => {
    for (const d of [
      baslat(),
      puanla(baslat(), [1, 2, 3, 4]),
      gecerli(),
      uygula(gecerli(), { tip: 'bitir' }),
    ])
      expect(durumGecerliMi(JSON.parse(JSON.stringify(d)))).toBe(true);
  });

  it('çöp ve bozuk alanlar reddedilir, çökmez', () => {
    for (const x of [null, undefined, 1, 'x', [], {}])
      expect(durumGecerliMi(x)).toBe(false);
    const bozuklar: ((d: Record<string, unknown>) => void)[] = [
      (d) => (d.asama = 'uyku'),
      (d) => delete d.kartlar,
      (d) => (d.kartlar = []),
      (d) => (d.kartlar = [{ id: 'a' }]),
      (d) => (d.sira = 999),
      (d) => (d.oyuncular = []),
      (d) => (d.oyuncular = [1, 2]),
      (d) => (d.puanlar = { Ali: 11 }),
      (d) => (d.puanlar = { Ali: 4.5 }),
      (d) => (d.puanlar = { Ali: 'on' }),
      (d) => (d.gecmis = [{}]),
      (d) => (d.gecmis = [{ kartId: 'a', puanlar: { Ali: -1 } }]),
      (d) => (d.uzunluk = 7),
      (d) => delete d.deste,
    ];
    for (const f of bozuklar) expect(durumGecerliMi(boz(f))).toBe(false);
  });
});
