import { describe, expect } from 'vitest';
import type { Deste } from './deste';
import { kabul } from '../kabul';
import {
  type Depo,
  EKIP_ANAHTARI,
  KAYIT_SURUMU,
  OYUN_ANAHTARI,
  isleKaydet,
  oyunOku,
  sonEkipKaydet,
  sonEkipOku,
} from './kayit';
import {
  type Durum,
  type Olay,
  gecerliKart,
  isle,
  sonuc,
  yeniOyun,
} from '../games/ok-mu-nok/oyun';

const kaydet = (depo: Depo, d: Durum, olay: Olay) =>
  isleKaydet(depo, isle, d, olay);
const oku = (depo: Depo) => oyunOku<Durum>(depo);

const depoYap = (): Depo & { veri: Map<string, string> } => {
  const veri = new Map<string, string>();
  return {
    veri,
    getItem: async (k) => veri.get(k) ?? null,
    setItem: async (k, v) => void veri.set(k, v),
    removeItem: async (k) => void veri.delete(k),
  };
};

const deste: Deste = {
  deck_id: 't',
  version: 1,
  lang: 'tr',
  cards: Array.from({ length: 20 }, (_, i) => ({ id: `k${i}`, text: `K${i}` })),
};

const yeni = () =>
  yeniOyun({
    oyuncular: ['Ali', 'Ayşe', 'Can'],
    deste,
    uzunluk: null,
    tohum: 5,
  });

describe('KK-5: son oyuncu listesi', () => {
  kabul('kaydedilir ve geri gelir (Türkçe karakter, emoji)', async () => {
    const depo = depoYap();
    await sonEkipKaydet(depo, ['Ali', 'Şükrü', '👍']);
    expect(await sonEkipOku(depo)).toEqual(['Ali', 'Şükrü', '👍']);
  });

  kabul('kayıt yoksa ya da bozuksa boş liste, çökmez', async () => {
    const depo = depoYap();
    expect(await sonEkipOku(depo)).toEqual([]);
    depo.veri.set(EKIP_ANAHTARI, '{bozuk');
    expect(await sonEkipOku(depo)).toEqual([]);
  });
});

describe('KK-14: oturum kaydı ve devam etme', () => {
  kabul('kayıt yoksa devam edilecek oyun yoktur', async () => {
    expect(await oku(depoYap())).toBeNull();
  });

  kabul('her oydan ve her karttan sonra kaydedilir', async () => {
    const depo = depoYap();
    let d = yeni();
    d = await kaydet(depo, d, {
      tip: 'oyla',
      oyuncu: 'Ali',
      oy: 'OK',
      t: 1,
    });
    expect(await oku(depo)).toEqual(d);
    for (const oyuncu of ['Ayşe', 'Can']) {
      d = await kaydet(depo, d, {
        tip: 'oyla',
        oyuncu,
        oy: 'NOK',
        t: 9999,
      });
    }
    d = await kaydet(depo, d, { tip: 'goster' });
    d = await kaydet(depo, d, { tip: 'sonraki' });
    expect(await oku(depo)).toEqual(d);
  });

  kabul('kapanıp açılınca kalınan yerden aynı oyun sürer', async () => {
    const depo = depoYap();
    let d = yeni();
    for (const oyuncu of ['Ali', 'Ayşe', 'Can']) {
      d = await kaydet(depo, d, { tip: 'oyla', oyuncu, oy: 'OK', t: 1000 });
    }
    const diril = await oku(depo);
    expect(diril).not.toBeNull();
    const a = isle(d, { tip: 'goster' });
    const b = isle(diril!, { tip: 'goster' });
    expect(sonuc(b)).toEqual(sonuc(a));
    expect(gecerliKart(isle(b, { tip: 'sonraki' }))).toEqual(
      gecerliKart(isle(a, { tip: 'sonraki' })),
    );
  });

  kabul(
    'okunamayan ya da eski sürümlü kayıtta çökmez, kayıt silinir',
    async () => {
      const bozuklar = [
        'bozuk{',
        '42',
        '{}',
        JSON.stringify({ surum: KAYIT_SURUMU - 1, durum: {} }),
      ];
      for (const bozuk of bozuklar) {
        const depo = depoYap();
        depo.veri.set(OYUN_ANAHTARI, bozuk);
        expect(await oku(depo)).toBeNull();
        expect(await depo.getItem(OYUN_ANAHTARI)).toBeNull();
      }
    },
  );

  kabul('kayıt sürümlüdür', async () => {
    const depo = depoYap();
    await kaydet(depo, yeni(), { tip: 'bitir' });
    const ham = JSON.parse((await depo.getItem(OYUN_ANAHTARI)) ?? '{}');
    expect(ham.surum).toBe(KAYIT_SURUMU);
  });
});
