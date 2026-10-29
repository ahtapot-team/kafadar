import { describe, expect, it } from 'vitest';
import { dosyaIcerik, kaynaklar } from '../../test/yardimci';

describe('Casus kim: kayıt listesi, arayüz ve altyapı sözleşmesi (KK-42…KK-54)', () => {
  const TESTIDLER = [
    'casus-paket-yerler', // KK-43 ayarlar
    'casus-sayi',
    'casus-sure',
    'casus-basla',
    'casus-perde', // KK-44 devir perdesi
    'casus-ben',
    'casus-kart',
    'casus-goruldu',
    'casus-baslayan', // KK-48
    'casus-soru',
    'casus-oylamaya-gec',
    'casus-bitir',
    'casus-oylama', // KK-49
    'casus-oyla-',
    'casus-oy-bitir',
    'casus-aciklama',
    'casus-tahmin-', // KK-50 (6 şık)
    'casus-sonuc',
    'casus-tekrar',
    'casus-paylas',
  ];

  it('casus-kim kayıt listesinde aktif, ekranı var (KK-42)', () => {
    const kayit = dosyaIcerik('src/games/registry.ts');
    expect(kayit).not.toMatch(/id:\s*'casus-kim'[^}]*aktif:\s*false/);
    expect(kayit).toMatch(/casus-kim/);
    expect(kayit).toMatch(/ekran/);
  });

  it('Casus ekranı kayıttan okurken durumGecerliMi kullanır (KK-14)', () => {
    const dosyalar = [...kaynaklar('app'), ...kaynaklar('src')].filter(
      ({ icerik }) => icerik.includes('casus-kart'),
    );
    expect(dosyalar.length).toBeGreaterThan(0);
    expect(
      dosyalar.some(({ icerik }) => /oyunOku[^;]*durumGecerliMi/s.test(icerik)),
    ).toBe(true);
  });

  it('ekranlar sözleşmedeki testID adlarını kullanır', () => {
    const kaynak = [...kaynaklar('app'), ...kaynaklar('src')]
      .map(({ icerik }) => icerik)
      .join('\n');
    expect(TESTIDLER.filter((t) => !kaynak.includes(t))).toEqual([]);
  });

  it('rol kartı arka plana alınınca kapanır (AppState ya da visibilitychange)', () => {
    const kartDosyalari = [...kaynaklar('app'), ...kaynaklar('src')].filter(
      ({ icerik }) => icerik.includes('casus-kart'),
    );
    expect(kartDosyalari.length).toBeGreaterThan(0);
    expect(
      kartDosyalari.some(({ icerik }) =>
        /AppState|visibilitychange/.test(icerik),
      ),
    ).toBe(true);
  });

  it('Casus kim mantığı saf: src/games/casus-kim içinde Date.now, Math.random, ağ ve React yok (KK-53)', () => {
    const dosyalar = kaynaklar('src/games/casus-kim');
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(
        /Date\.now\(|Math\.random\(|WebSocket|\bfetch\(/,
      );
      expect(icerik, f).not.toMatch(/from ['"](react|react-native|expo)/);
    }
  });

  it("OK mu NOK mu çekirdeği Casus kim'e bağlanmaz (KK-2/KK-42)", () => {
    for (const { f, icerik } of [...kaynaklar('app'), ...kaynaklar('src/core')])
      expect(icerik, f).not.toMatch(/games\/casus-kim/);
  });

  it('gerçek cihaz listesinde Casus kim bölümü var (KK-54)', () => {
    const liste = dosyaIcerik('docs/GERCEK-CIHAZ-KONTROL.md');
    expect(liste).toMatch(/Casus kim \(KK-54\)/);
    expect(liste).toMatch(/basılı tut/i);
    expect(liste).toMatch(/uygulama değiştirici/i);
  });
});
