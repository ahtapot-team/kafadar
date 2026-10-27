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
  const sunucu = new SahteSunucu(1_000_000, rngOlustur(5), desteler);
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
  it('oda kurulur: kod (4 harf) + kimlik gelir, kuran lobide görünür, Başlat yalnızca kuranda', async () => {
    const { istemci } = kur();
    const a = istemci();
    a.i.kur('Murat', 'arkadas');
    await akis();
    const d = a.i.durum;
    expect(d.baglanti).toBe('acik');
    expect(d.kod).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);
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
