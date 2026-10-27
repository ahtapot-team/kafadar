import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { desteHatalari } from './core/deste';
import { kabul, kabulKk25, kabulKk26, kabulKk27 } from './kabul';
import { oyunlar } from './games/registry';

describe('KK-1: ana ekran oyun listesi', () => {
  kabul('OK mu NOK mu aktif; 10/10 ama ve Casus kim "Yakında"', () => {
    const aktiflik = Object.fromEntries(oyunlar.map((o) => [o.id, o.aktif]));
    expect(aktiflik).toEqual({
      'ok-mu-nok': true,
      '10-10-ama': false,
      'casus-kim': false,
    });
  });
});

describe('KK-7 / KK-21: soru desteleri', () => {
  for (const ad of ['arkadas', 'cift', 'aile']) {
    it(`${ad}: en az 50 geçerli kart, sürümlü, kimlikli`, () => {
      const deste = JSON.parse(
        readFileSync(
          new URL(`../content/decks/${ad}.json`, import.meta.url),
          'utf8',
        ),
      );
      expect(deste.deck_id).toBe(ad);
      expect(deste.lang).toBe('tr');
      expect(Number.isInteger(deste.version)).toBe(true);
      expect(deste.cards.length).toBeGreaterThanOrEqual(50);
      expect(desteHatalari(deste)).toEqual([]);
    });
  }
});

// Koruma testleri: bugün geçer, ileride bozulursa kırmızıya döner.
const kaynaklar = (klasor: string) =>
  readdirSync(new URL(`../${klasor}`, import.meta.url), { recursive: true })
    .map(String)
    .filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.'))
    .map((f) => ({
      f: `${klasor}/${f}`,
      icerik: readFileSync(
        new URL(`../${klasor}/${f}`, import.meta.url),
        'utf8',
      ),
    }));

describe('KK-2: oyun eklenti olarak eklenir', () => {
  it('ana ekran ve çekirdek belirli bir oyunu doğrudan içe aktarmaz', () => {
    for (const { f, icerik } of [
      ...kaynaklar('app'),
      ...kaynaklar('src/core'),
    ]) {
      expect(icerik, f).not.toMatch(/ok-mu-nok/);
    }
  });
});

describe('KK-22: oyun mantığı arayüzden ayrı', () => {
  it('çekirdek ve oyun mantığı react / react-native / expo içe aktarmaz', () => {
    const dosyalar = [
      ...kaynaklar('src/core'),
      ...kaynaklar('src/games/ok-mu-nok'),
    ];
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(/from ['"](react|react-native|expo)/);
    }
  });
});

describe('KK-25: kart metni oy girişinde ve açıklamada görünür kalır', () => {
  // Arayüz test aracı yok (Semih 1C): ekranların kart metnini göstermesi kaynak düzeyinde
  // korunur; gerçek görünüm ve boyut (≥16pt) önizlemede ve cihaz listesinde doğrulanır.
  for (const dosya of ['oy', 'acik']) {
    kabulKk25(
      `${dosya}.tsx kart metnini testID="kart-metni" ile gösterir`,
      () => {
        const icerik = readFileSync(
          new URL(`./oyun-ekranlari/ok-mu-nok/${dosya}.tsx`, import.meta.url),
          'utf8',
        );
        expect(icerik).toMatch(/testID="kart-metni"/);
      },
    );
  }
});

const dosyaIcerik = (yol: string) =>
  readFileSync(new URL(`../${yol}`, import.meta.url), 'utf8');

describe('KK-26: oyun dışı ekranlarda Geri, oyun içinde geri yok', () => {
  // Arayüz test aracı yok (Semih 1C): düğmenin varlığı kaynak düzeyinde korunur;
  // "Geri'de bilgiler korunur" ve "Ayarlar'a dönüş" önizlemede tıklanarak doğrulanır.
  for (const ekran of ['oyuncular', 'paket']) {
    kabulKk26(
      `${ekran}.tsx görünür bir Geri düğmesi (testID="geri") içerir`,
      () => {
        expect(dosyaIcerik(`app/${ekran}.tsx`)).toMatch(/testID="geri"/);
      },
    );
  }

  it('ayarlar.tsx Geri düğmesi içerir (zaten var, korunur)', () => {
    expect(dosyaIcerik('app/ayarlar.tsx')).toMatch(/testID="geri"/);
  });

  it('oyun ekranları Geri düğmesi içermez (çıkış onayı vardır, KK-15)', () => {
    const dosyalar = [
      ...kaynaklar('app').filter(({ f }) => f.endsWith('/oyun.tsx')),
      ...kaynaklar('src/oyun-ekranlari'),
    ];
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(/testID="geri"/);
    }
    expect(dosyaIcerik('app/oyun.tsx')).toMatch(/cikis-onay-evet/);
  });
});

describe('KK-27: Ayarlar yalnızca ana ekranda, sağ üstte sabit küçük ikon', () => {
  it('ikon ve /ayarlar gezintisi yalnızca app/index.tsx içinde', () => {
    const dosyalar = [...kaynaklar('app'), ...kaynaklar('src/oyun-ekranlari')];
    for (const { f, icerik } of dosyalar) {
      if (f.endsWith('app/index.tsx') || f.endsWith('app/ayarlar.tsx'))
        continue;
      expect(icerik, f).not.toMatch(/testID="ayarlar(-ikon)?"/);
      expect(icerik, f).not.toMatch(/['"]\/ayarlar['"]/);
    }
  });

  kabulKk27(
    'ana ekranda "Ayarlar" metinli büyük düğme yok, ayarlar-ikon var',
    () => {
      const ana = dosyaIcerik('app/index.tsx');
      expect(ana).toMatch(/testID="ayarlar-ikon"/);
      expect(ana).not.toMatch(/testID="ayarlar"/);
      expect(ana).not.toMatch(/etiket="Ayarlar"/);
      expect(ana).toMatch(/accessibilityLabel="Ayarlar"/); // ikon ekran okuyucuda adlı
    },
  );
});
