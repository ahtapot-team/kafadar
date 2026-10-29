import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { desteHatalari } from './core/deste';
import { oyunlar } from './games/registry';
import { dosyaIcerik, kaynaklar } from './test/yardimci';

describe('KK-1: ana ekran oyun listesi', () => {
  it('OK mu NOK mu ve Casus kim aktif; 10/10 ama "Yakında"', () => {
    const aktiflik = Object.fromEntries(oyunlar.map((o) => [o.id, o.aktif]));
    expect(aktiflik).toEqual({
      'ok-mu-nok': true,
      '10-10-ama': true,
      'casus-kim': true, // KK-42: #81'de aktif
    });
  });
});

describe('KK-7 / KK-21: soru desteleri', () => {
  for (const ad of ['arkadas', 'cift', 'aile']) {
    it(`${ad}: en az 100 geçerli kart, sürümlü, kimlikli`, () => {
      const deste = JSON.parse(
        readFileSync(
          new URL(`../content/decks/${ad}.json`, import.meta.url),
          'utf8',
        ),
      );
      expect(deste.deck_id).toBe(ad);
      expect(deste.lang).toBe('tr');
      expect(Number.isInteger(deste.version)).toBe(true);
      expect(deste.cards.length).toBeGreaterThanOrEqual(100);
      expect(desteHatalari(deste)).toEqual([]);
    });
  }
});

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
    it(`${dosya}.tsx kart metnini testID="kart-metni" ile gösterir`, () => {
      const icerik = readFileSync(
        new URL(`./oyun-ekranlari/ok-mu-nok/${dosya}.tsx`, import.meta.url),
        'utf8',
      );
      expect(icerik).toMatch(/testID="kart-metni"/);
    });
  }
});

describe('KK-26: oyun dışı ekranlarda Geri, oyun içinde geri yok', () => {
  // Arayüz test aracı yok (Semih 1C): düğmenin varlığı kaynak düzeyinde korunur;
  // "Geri'de bilgiler korunur" ve "Ayarlar'a dönüş" önizlemede tıklanarak doğrulanır.
  for (const ekran of ['oyuncular', 'paket']) {
    it(`${ekran}.tsx görünür bir Geri düğmesi (testID="geri") içerir`, () => {
      expect(dosyaIcerik(`app/${ekran}.tsx`)).toMatch(/testID="geri"/);
    });
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

  it('ana ekranda "Ayarlar" metinli büyük düğme yok, adlı ayarlar ikonu var', () => {
    const ana = dosyaIcerik('app/index.tsx');
    expect(ana).toMatch(/testID="ayarlar(-ikon)?"/);
    expect(ana).not.toMatch(/etiket="Ayarlar"/);
    expect(ana).toMatch(/accessibilityLabel="Ayarlar"/); // ikon ekran okuyucuda adlı
  });
});

describe('#36 cila: v1 sonrası küçük açıklar', () => {
  // Arayüz test aracı yok (Semih 1C): kaynak düzeyinde sözleşme; davranışı QA önizlemede doğrular.
  it("bozuk kayıt okuma sırasında reddedilir: durum.tsx oyunOku'ya doğrulayıcı verir", () => {
    // "Devam et" sorusu yalnızca geçerli kayıtta çıkar (KK-14): oyunOku(depo, doğrulayıcı)
    expect(dosyaIcerik('src/durum.tsx')).toMatch(
      /oyunOku(<[^>]+>)?\(\s*depo\s*,/,
    );
  });

  it('geçersiz adreste Türkçe sade sayfa: app/+not-found.tsx', () => {
    const icerik = dosyaIcerik('app/+not-found.tsx');
    expect(icerik).toMatch(/Sayfa bulunamadı/);
    expect(icerik).toMatch(/testID="ana-ekrana-don"/);
    expect(icerik).not.toMatch(/Unmatched/);
  });

  it("Paylaş düğmesi web'de gizlenir: denetim tek bileşende (PaylasDugmesi, Platform.OS), düğme yalnızca ondan çizilir (#142)", () => {
    expect(dosyaIcerik('src/oyun-ekranlari/ortak/paylasim.tsx')).toMatch(
      /function PaylasDugmesi[\s\S]*Platform\.OS/,
    );
    const dosyalar = kaynaklar('src/oyun-ekranlari').filter(({ icerik }) =>
      /testID="paylas"/.test(icerik),
    );
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).toMatch(/<PaylasDugmesi/);
    }
  });

  it("keep-awake web'de çağrılmaz: app/oyun.tsx koşulsuz useKeepAwake() çağırmaz", () => {
    expect(dosyaIcerik('app/oyun.tsx')).not.toMatch(/useKeepAwake\(\s*\)/);
  });
});

describe('KK-23: CI ve önizleme', () => {
  it("CI biçim, lint, tip, gizli anahtar, test ve kabul adımlarını koşar; PR başına önizleme workflow'ları var", () => {
    const ci = dosyaIcerik('.github/workflows/ci.yml');
    for (const adim of [
      'format:check',
      'npm run lint',
      'npm run typecheck',
      'gitleaks',
      'npm test',
      'npm run kabul',
    ])
      expect(ci, adim).toContain(adim);
    expect(dosyaIcerik('.github/workflows/onizleme.yml')).toMatch(
      /pull_request/,
    );
    expect(dosyaIcerik('.github/workflows/web-onizleme.yml')).toMatch(
      /pull_request/,
    );
  });
});
