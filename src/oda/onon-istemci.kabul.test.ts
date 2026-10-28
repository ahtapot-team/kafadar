import { describe, expect, it } from 'vitest';
import type { Depo } from '../core/kayit';
import { kabulOnonOdaIstemci as kabul } from '../kabul';
import { OdaIstemci, odaTuru } from './istemci';
import type { Acilis, Istemci, Sunucu } from './mesaj';
import type { Gorunum, OnOnFinal } from './oda';
import { onOnKisisel, puanSirasi } from './onon-ozet';
import type { TasimaDinleyici, TasimaUretici } from './tasima';

// #125 (KK-63, KK-64, KK-65, KK-67, KK-68, KK-69, KK-70 istemci tarafı): ağsız, sahte taşıma, sahte saat.
const depoYap = (): Depo => {
  const veri = new Map<string, string>();
  return {
    getItem: async (k) => veri.get(k) ?? null,
    setItem: async (k, v) => void veri.set(k, v),
    removeItem: async (k) => void veri.delete(k),
  };
};
const akis = () => new Promise((r) => setTimeout(r, 0));

function kurTasima() {
  const gonderilen: Istemci[] = [];
  const acilislar: Acilis[] = [];
  const kimlikler: (string | undefined)[] = [];
  let dinleyici: TasimaDinleyici | null = null;
  const uret: TasimaUretici = (a, d, k) => {
    acilislar.push(a);
    kimlikler.push(k);
    dinleyici = d;
    return { gonder: (m) => void gonderilen.push(m), kapat: () => {} };
  };
  const bekleyen: (() => void)[] = [];
  const i = new OdaIstemci({
    uret,
    depo: depoYap(),
    saat: () => 1_000_000,
    zamanla: (_ms, f) => {
      bekleyen.push(f);
      return () => {};
    },
  });
  return {
    i,
    gonderilen,
    acilislar,
    kimlikler,
    sun: (m: Sunucu) => dinleyici!.mesaj(m),
    kopar: () => dinleyici!.kapandi(),
    tekrarDene: () => bekleyen.splice(0).forEach((f) => f()),
    bekleyenSayisi: () => bekleyen.length,
  };
}

const gor = (k: Partial<Gorunum> = {}): Gorunum => ({
  tur: 'on-on-ama',
  asama: 'soru',
  kod: '123456',
  oyuncular: [
    { ad: 'Murat', bagli: true },
    { ad: 'Ayşe', bagli: true },
  ],
  baslatGorunur: false,
  baslatAktif: false,
  soruNo: 1,
  soru: { id: 'k1', text: '10/10 ama her sabah 5te kalkıyor.' },
  kalanMs: 15_000,
  cevapladi: [],
  toplam: 2,
  ...k,
});
const tamam: Sunucu = {
  t: 'tamam',
  kod: '123456',
  kimlik: 'kim-1',
  ad: 'Murat',
};
const sunGorunum = (g: Gorunum): Sunucu => ({
  t: 'gorunum',
  gorunum: g,
  simdi: 1_000_000,
});

const bosFinal: OnOnFinal = {
  kartlar: [],
  oduller: { enAcimasiz: [], melekKalpli: [], ruhIkizleri: [] },
  kisisel: {},
};

describe('KK-63: oda türü, istemci', () => {
  it('OK mu NOK mu odası kurulumu değişmez: açılış komutunda oyun alanı yok', () => {
    const t = kurTasima();
    t.i.kur('Murat', 'arkadas');
    expect(t.acilislar).toEqual([
      { islem: 'kur', ad: 'Murat', paket: 'arkadas' },
    ]);
  });

  kabul(
    '10/10 ama odası kurulur: oyun türü ve paket açılış komutunda gider (sunucu: ?oyun=on-on-ama&paket=…)',
    () => {
      const t = kurTasima();
      t.i.kur('Murat', 'sevgili', 'on-on-ama');
      expect(t.acilislar).toEqual([
        { islem: 'kur', ad: 'Murat', paket: 'sevgili', oyun: 'on-on-ama' },
      ]);
    },
  );

  kabul(
    'katılan odanın oyununa girer: ekran türü odanın türünden (kodla, hangi oyundan gelirse gelsin)',
    async () => {
      const t = kurTasima();
      expect(odaTuru(t.i.durum)).toBeNull(); // henüz odada değil
      t.i.katil('123456', 'Ayşe');
      t.sun(tamam);
      t.sun(sunGorunum(gor({ tur: 'on-on-ama' })));
      await akis();
      expect(odaTuru(t.i.durum)).toBe('on-on-ama');
      t.sun(sunGorunum(gor({ tur: 'ok-mu-nok' })));
      expect(odaTuru(t.i.durum)).toBe('ok-mu-nok');
      t.sun(sunGorunum(gor({ tur: undefined }))); // türsüz (eski) görünüm OK mu NOK odasıdır
      expect(odaTuru(t.i.durum)).toBe('ok-mu-nok');
    },
  );
});

describe('KK-64/KK-65: puan gönderme', () => {
  kabul(
    'puanla(n) {t:"puanla", puan:n} gönderir; değiştirince yenisi gider (son puan sunucuda geçerli)',
    async () => {
      const t = kurTasima();
      t.i.katil('123456', 'Murat');
      t.sun(tamam);
      t.sun(sunGorunum(gor()));
      await akis();
      t.i.puanla(7);
      t.i.puanla(3);
      t.i.puanla(0); // 0 geçerli puandır
      expect(t.gonderilen).toEqual([
        { t: 'puanla', puan: 7 },
        { t: 'puanla', puan: 3 },
        { t: 'puanla', puan: 0 },
      ]);
    },
  );

  kabul('bağlantı yokken puanla çökmez ve bir şey göndermez', () => {
    const t = kurTasima();
    expect(() => t.i.puanla(5)).not.toThrow();
    expect(t.gonderilen).toEqual([]);
  });

  it('sunucudan "sure-doldu"/"gecersiz" hatası odayı bozmaz: hata gösterilir, kimlik ve görünüm kalır', async () => {
    const t = kurTasima();
    t.i.katil('123456', 'Murat');
    t.sun(tamam);
    t.sun(sunGorunum(gor()));
    await akis();
    t.sun({
      t: 'hata',
      hata: { kod: 'sure-doldu', mesaj: 'Süre doldu, cevap sayılmadı.' },
    });
    expect(t.i.durum.hata?.kod).toBe('sure-doldu');
    expect(t.i.durum.kimlik).toBe('kim-1');
    expect(t.i.durum.gorunum).not.toBeNull();
    t.sun({ t: 'hata', hata: { kod: 'gecersiz', mesaj: 'Geçersiz puan.' } });
    expect(t.i.durum.kimlik).toBe('kim-1');
  });
});

describe('KK-67/KK-68: açıklama ve "Sonraki kart"', () => {
  kabul('sonraki() {t:"sonraki"} gönderir', async () => {
    const t = kurTasima();
    t.i.kur('Murat', 'arkadas', 'on-on-ama');
    t.sun(tamam);
    t.sun(sunGorunum(gor({ sonrakiGorunur: true })));
    await akis();
    t.i.sonraki();
    expect(t.gonderilen).toEqual([{ t: 'sonraki' }]);
  });

  it('açıklama görünümü olduğu gibi durumda; yetki değişince sonrakiGorunur güncellenir', async () => {
    const t = kurTasima();
    t.i.katil('123456', 'Ayşe');
    t.sun(tamam);
    const aciklama = {
      ortalama: 5.3,
      enDusuk: { puan: 1, kisiler: ['Ayşe'] },
      enYuksek: { puan: 10, kisiler: ['Murat'] },
      oybirligi: false,
      bolundu: true,
      puanlar: { Murat: 10, Ayşe: 1 },
    };
    t.sun(sunGorunum(gor({ aciklama, sonrakiGorunur: false })));
    expect(t.i.durum.gorunum?.aciklama).toEqual(aciklama);
    expect(t.i.durum.gorunum?.sonrakiGorunur).toBe(false);
    t.sun(sunGorunum(gor({ aciklama, sonrakiGorunur: true }))); // kuran koptu, yetki bize geçti
    expect(t.i.durum.gorunum?.sonrakiGorunur).toBe(true);
  });
});

describe('KK-69/KK-70: final ve yeniden bağlanma', () => {
  kabul(
    'onfinal mesajı durumda saklanır; final gösterilirken yeniden bağlanılmaz',
    async () => {
      const t = kurTasima();
      t.i.katil('123456', 'Murat');
      t.sun(tamam);
      t.sun(sunGorunum(gor({ asama: 'bitti' })));
      t.sun({ t: 'final', final: bosFinal });
      await akis();
      expect(t.i.durum.onFinal).toEqual(bosFinal);
      expect(t.i.durum.final).toBeNull();
      const once = t.acilislar.length;
      t.kopar();
      expect(t.i.durum.baglanti).toBe('kapali');
      expect(t.bekleyenSayisi()).toBe(0);
      t.i.onPlana();
      expect(t.acilislar.length).toBe(once);
    },
  );

  it('oyun ortasında kopma: "yeniden" durumu, aynı kimlikle geri dönüş (KK-37 10/10 ama odasında da)', async () => {
    const t = kurTasima();
    t.i.katil('123456', 'Murat');
    t.sun(tamam);
    t.sun(sunGorunum(gor()));
    await akis();
    t.kopar();
    expect(t.i.durum.baglanti).toBe('yeniden');
    t.tekrarDene();
    expect(t.acilislar.at(-1)).toEqual({ islem: 'don', kod: '123456' });
    expect(t.kimlikler.at(-1)).toBe('kim-1');
  });
});

describe('KK-69: OK mu NOK mu odası finali bozulmaz', () => {
  it('tur ok-mu-nok iken {t:"final"} durum.final\'a yazılır, onFinal null kalır', async () => {
    const t = kurTasima();
    t.i.katil('123456', 'Murat');
    t.sun(tamam);
    t.sun(sunGorunum(gor({ tur: 'ok-mu-nok', asama: 'bitti' })));
    const f = {
      yuzdeler: [],
      enTartismali: [],
      oduller: { aykiriRuh: [], ruhIkizleri: [] },
      kimNeDedi: {},
      ayniOlan: {},
    };
    t.sun({ t: 'final', final: f });
    await akis();
    expect(t.i.durum.final).toEqual(f);
    expect(t.i.durum.onFinal).toBeNull();
  });
});

describe('KK-69: kişisel kart türetmeleri (onOnKisisel)', () => {
  const final: OnOnFinal = {
    kartlar: [],
    oduller: {
      enAcimasiz: ['Ayşe'],
      melekKalpli: ['Deniz'],
      ruhIkizleri: [['Deniz', 'Mert']],
    },
    kisisel: {
      Deniz: { ortalama: 8, verilen: [8, 6, null, 10] },
      Mert: { ortalama: 6, verilen: [6, 6, 6, null] },
      Ayşe: { ortalama: 3, verilen: [4, 2, null, 3] },
      Can: { ortalama: null, verilen: [null, null, null, null] },
    },
  };

  kabul(
    'ortalama, odaya göre fark (odanın tüm puanlarının ortalaması), uçlar ve boş sayısı',
    () => {
      // oda: 51 puan / 9 puan = 5,67
      expect(onOnKisisel(final, 'Deniz')).toMatchObject({
        ortalama: 8,
        odaFarki: 2.3,
        enYuksek: 10,
        enDusuk: 6,
        bos: 1,
      });
      expect(onOnKisisel(final, 'Mert')).toMatchObject({
        ortalama: 6,
        odaFarki: 0.3,
        enYuksek: 6,
        enDusuk: 6,
        bos: 1,
      });
      expect(onOnKisisel(final, 'Ayşe')).toMatchObject({
        ortalama: 3,
        odaFarki: -2.7,
        enYuksek: 4,
        enDusuk: 2,
        bos: 1,
      });
    },
  );

  kabul('hiç puan vermeyen: ortalama/fark/uçlar null, hepsi boş', () => {
    expect(onOnKisisel(final, 'Can')).toEqual({
      ortalama: null,
      odaFarki: null,
      ikiz: null,
      enYuksek: null,
      enDusuk: null,
      bos: 4,
    });
  });

  kabul('ruh ikizi: ikizlerden diğeri; ikizi olmayan null', () => {
    expect(onOnKisisel(final, 'Deniz').ikiz).toBe('Mert');
    expect(onOnKisisel(final, 'Mert').ikiz).toBe('Deniz');
    expect(onOnKisisel(final, 'Ayşe').ikiz).toBeNull();
  });
});

describe('KK-67: açıklama çubuk sırası (puanSirasi)', () => {
  kabul('puan azalan, eşitlikte oyuncu sırası, boş en sonda', () => {
    const a = {
      ortalama: 5.8,
      enDusuk: { puan: 2, kisiler: ['Ali'] },
      enYuksek: { puan: 10, kisiler: ['Ayşe', 'Deniz'] },
      oybirligi: false,
      bolundu: true,
      puanlar: { Ali: 2, Ayşe: 10, Can: null, Deniz: 10, Elif: 5 } as Record<
        string,
        number | null
      >,
    };
    expect(puanSirasi(a)).toEqual([
      { ad: 'Ayşe', puan: 10 },
      { ad: 'Deniz', puan: 10 },
      { ad: 'Elif', puan: 5 },
      { ad: 'Ali', puan: 2 },
      { ad: 'Can', puan: null },
    ]);
  });
});
