import { describe, expect, it } from 'vitest';
import type { Depo } from '../core/kayit';
import { rngOlustur } from '../core/rng';
import { desteler } from '../desteler';
import { ODA_ANAHTARI, OdaIstemci, kalanMs } from './istemci';
import { SahteSunucu } from './sahte';

const depoYap = (): Depo & { veri: Map<string, string> } => {
  const veri = new Map<string, string>();
  return {
    veri,
    getItem: async (k) => veri.get(k) ?? null,
    setItem: async (k, v) => void veri.set(k, v),
    removeItem: async (k) => void veri.delete(k),
  };
};

const akis = () => new Promise((r) => setTimeout(r, 0));

function kur() {
  const sunucu = new SahteSunucu(() => 1_000_000, rngOlustur(5), desteler);
  const istemci = (depo = depoYap()) => {
    const bekleyen: (() => void)[] = [];
    const i = new OdaIstemci({
      uret: sunucu.uret,
      depo,
      saat: () => sunucu.simdi,
      zamanla: (_ms, f) => {
        bekleyen.push(f);
        return () => {};
      },
    });
    return {
      i,
      depo,
      tekrarDene: () => bekleyen.splice(0).forEach((f) => f()),
    };
  };
  return { sunucu, istemci };
}

describe('oda istemcisi (#51)', () => {
  it('oda kurulur: kod (6 rakam) + kimlik gelir, kuran lobide görünür, Başlat yalnızca kuranda', async () => {
    const { istemci } = kur();
    const a = istemci();
    a.i.kur('Murat', 'arkadas');
    await akis();
    const d = a.i.durum;
    expect(d.baglanti).toBe('acik');
    expect(d.kod).toMatch(/^\d{6}$/);
    expect(d.gorunum?.oyuncular.map((o) => o.ad)).toEqual(['Murat']);
    expect(d.gorunum?.baslatGorunur).toBe(true);
    expect(d.gorunum?.baslatAktif).toBe(false); // en az 2 oyuncu (KK-31)
  });

  it('katılan lobide herkeste görünür; Ali 2 kuralı; Başlat 2 kişiyle açılır, katılanda görünmez', async () => {
    const { istemci } = kur();
    const a = istemci();
    a.i.kur('Ali', 'arkadas');
    await akis();
    const b = istemci();
    b.i.katil(a.i.durum.kod!.toLowerCase(), 'Ali'); // küçük harf de kabul
    await akis();
    expect(b.i.durum.ad).toBe('Ali 2');
    expect(a.i.durum.gorunum?.oyuncular.map((o) => o.ad)).toEqual([
      'Ali',
      'Ali 2',
    ]);
    expect(a.i.durum.gorunum?.baslatAktif).toBe(true);
    expect(b.i.durum.gorunum?.baslatGorunur).toBe(false);
  });

  it('yanlış kod: Türkçe hata, durum odasız kalır', async () => {
    const { istemci } = kur();
    const b = istemci();
    b.i.katil('ZZZZ', 'Ayşe');
    await akis();
    expect(b.i.durum.hata?.mesaj).toMatch(/açık bir oda yok/);
    expect(b.i.durum.kimlik).toBeNull();
  });

  it('oyun başlayınca yeni katılım kapanır (KK-31)', async () => {
    const { istemci } = kur();
    const a = istemci();
    a.i.kur('Ali', 'arkadas');
    await akis();
    const b = istemci();
    b.i.katil(a.i.durum.kod!, 'Ayşe');
    await akis();
    a.i.baslat();
    expect(a.i.durum.gorunum?.asama).toBe('soru');
    const c = istemci();
    c.i.katil(a.i.durum.kod!, 'Can');
    await akis();
    expect(c.i.durum.hata?.kod).toBe('basladi');
  });

  it('kimlik cihazda saklanır; kopunca "yeniden" durumu, geri dönünce aynı kimlikle odaya katılır (KK-37)', async () => {
    const { istemci, sunucu } = kur();
    const a = istemci();
    a.i.kur('Ali', 'arkadas');
    await akis();
    const b = istemci();
    b.i.katil(a.i.durum.kod!, 'Ayşe');
    await akis();
    expect(JSON.parse(b.depo.veri.get(ODA_ANAHTARI)!).kimlik).toBe(
      b.i.durum.kimlik,
    );
    const kimlik = b.i.durum.kimlik!;

    sunucu.kopar(kimlik);
    expect(b.i.durum.baglanti).toBe('yeniden'); // "Yeniden bağlanıyor…"
    expect(
      a.i.durum.gorunum?.oyuncular.find((o) => o.ad === 'Ayşe')?.bagli,
    ).toBe(false);

    b.tekrarDene();
    await akis();
    expect(b.i.durum.baglanti).toBe('acik');
    expect(b.i.durum.kimlik).toBe(kimlik);
    expect(
      a.i.durum.gorunum?.oyuncular.find((o) => o.ad === 'Ayşe')?.bagli,
    ).toBe(true);
  });

  it('uygulama kapanıp açılınca devamEt() saklı kimlikle aynı odaya döner', async () => {
    const { istemci } = kur();
    const a = istemci();
    a.i.kur('Ali', 'arkadas');
    await akis();
    const b = istemci();
    b.i.katil(a.i.durum.kod!, 'Ayşe');
    await akis();
    const kimlik = b.i.durum.kimlik;
    const yeniAcilis = istemci(b.depo); // aynı cihaz deposu, yeni istemci
    expect(await yeniAcilis.i.devamEt()).toBe(true);
    await akis();
    expect(yeniAcilis.i.durum.kimlik).toBe(kimlik);
    expect(yeniAcilis.i.durum.gorunum?.oyuncular).toHaveLength(2);
  });

  it('oda kapanmışsa saklı kimlik silinir ve hata gösterilir', async () => {
    const { istemci, sunucu } = kur();
    const a = istemci();
    a.i.kur('Ali', 'arkadas');
    await akis();
    const depo = a.depo;
    sunucu['odalar'].clear(); // oda kapandı
    const yeniAcilis = istemci(depo);
    await yeniAcilis.i.devamEt();
    await akis();
    expect(yeniAcilis.i.durum.kimlik).toBeNull();
    expect(yeniAcilis.i.durum.hata?.kod).toBe('kapali');
    expect(depo.veri.has(ODA_ANAHTARI)).toBe(false);
  });

  it('ayrılınca kimlik silinir; kalan süre sunucu saatine göre azalır', async () => {
    const { istemci, sunucu } = kur();
    const a = istemci();
    a.i.kur('Ali', 'arkadas');
    await akis();
    const b = istemci();
    b.i.katil(a.i.durum.kod!, 'Ayşe');
    await akis();
    a.i.baslat();
    expect(kalanMs(a.i.durum, sunucu.simdi)).toBe(15_000);
    expect(kalanMs(a.i.durum, sunucu.simdi + 4_000)).toBe(11_000);
    b.i.ayril();
    expect(b.depo.veri.has(ODA_ANAHTARI)).toBe(false);
    expect(b.i.durum.kod).toBeNull();
  });
});

// QA (#66 incelemesi): geçici hata, ön plana dönüş ve final davranışı. Sahte sunucu yerine elle sürülen taşıma.
describe('oda istemcisi: dayanıklılık', () => {
  const eldenTasima = () => {
    const bagler: {
      acilis: unknown;
      d: import('./tasima').TasimaDinleyici;
      kimlik?: string;
    }[] = [];
    const uret: import('./tasima').TasimaUretici = (acilis, d, kimlik) => {
      bagler.push({ acilis, d, kimlik });
      return { gonder: () => {}, kapat: () => {} };
    };
    const depo = depoYap();
    const planli: (() => void)[] = [];
    const i = new OdaIstemci({
      uret,
      depo,
      saat: () => 0,
      zamanla: (_ms, f) => {
        planli.push(f);
        return () => {};
      },
    });
    const odada = () => {
      i.kur('Ali', 'arkadas');
      bagler
        .at(-1)!
        .d.mesaj({ t: 'tamam', kod: 'ABCD', kimlik: 'k1', ad: 'Ali' });
    };
    return { i, bagler, depo, planli, odada };
  };
  const gorunum = (asama: 'lobi' | 'soru' | 'bitti') =>
    ({
      t: 'gorunum',
      simdi: 0,
      gorunum: {
        asama,
        kod: 'ABCD',
        oyuncular: [],
        baslatGorunur: false,
        baslatAktif: false,
        cevapladi: [],
        toplam: 0,
      },
    }) as never;

  it("geçici hata (cok-deneme) kimliği silmez, 'yeniden'de kalır; kapali silinir", async () => {
    const t = eldenTasima();
    t.odada();
    await akis();
    t.bagler.at(-1)!.d.kapandi(); // koptu
    expect(t.i.durum.baglanti).toBe('yeniden');
    t.planli.splice(0).forEach((f) => f()); // yeniden dene → 'don'
    expect(t.bagler.at(-1)!.acilis).toEqual({ islem: 'don', kod: 'ABCD' });
    expect(t.bagler.at(-1)!.kimlik).toBe('k1'); // belirteç adreste değil, taşımaya ayrı verilir
    t.bagler.at(-1)!.d.mesaj({
      t: 'hata',
      hata: { kod: 'cok-deneme', mesaj: 'Çok fazla deneme.' },
    });
    t.bagler.at(-1)!.d.kapandi();
    expect(t.i.durum.kimlik).toBe('k1');
    expect(t.i.durum.baglanti).toBe('yeniden');
    expect(t.depo.veri.has(ODA_ANAHTARI)).toBe(true);
    t.planli.splice(0).forEach((f) => f());
    t.bagler.at(-1)!.d.mesaj({
      t: 'hata',
      hata: { kod: 'kapali', mesaj: 'Bu oda kapandı.' },
    });
    expect(t.i.durum.kimlik).toBeNull();
    expect(t.depo.veri.has(ODA_ANAHTARI)).toBe(false);
  });

  it('ön plana dönünce bağlantı her zaman tazelenir (açıkken de)', async () => {
    const t = eldenTasima();
    t.odada();
    await akis();
    const once = t.bagler.length;
    t.i.onPlana();
    expect(t.bagler.length).toBe(once + 1);
    expect(t.bagler.at(-1)!.acilis).toMatchObject({ islem: 'don' });
    expect(t.bagler.at(-1)!.kimlik).toBe('k1');
  });

  it('final gösterilirken yeniden bağlanma yok, final silinmez', async () => {
    const t = eldenTasima();
    t.odada();
    t.bagler.at(-1)!.d.mesaj(gorunum('bitti'));
    t.bagler.at(-1)!.d.mesaj({
      t: 'final',
      final: {
        yuzdeler: [],
        enTartismali: [],
        oduller: { aykiriRuh: [], ruhIkizleri: [] },
        kimNeDedi: {},
        ayniOlan: {},
      },
    });
    const once = t.bagler.length;
    t.bagler.at(-1)!.d.kapandi();
    t.i.onPlana();
    expect(t.bagler.length).toBe(once);
    expect(t.planli).toHaveLength(0);
    expect(t.i.durum.final).not.toBeNull();
    expect(t.i.durum.baglanti).toBe('kapali');
  });
});
