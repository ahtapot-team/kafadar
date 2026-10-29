import { describe, expect, it } from 'vitest';
import { dosyaIcerik, kaynaklar } from '../../test/yardimci';

describe('10/10 ama: kayıt listesi, arayüz ve altyapı sözleşmesi (KK-55…KK-62)', () => {
  const TESTIDLER = [
    'onon-kart-metni', // KK-59: puan girişi ve açıklamada görünür
    'onon-puan-', // KK-56: onon-puan-<oyuncu sırası>-<0..10>
    'onon-goster',
    'onon-ortalama', // KK-57
    'onon-en-dusuk',
    'onon-en-yuksek',
    'onon-bolundu',
    'onon-konfeti',
    'onon-sonraki',
    'onon-atla',
    'onon-bitir',
    'onon-odul-en-acimasiz', // KK-58
    'onon-odul-melek-kalpli',
    'onon-odul-ruh-ikizleri',
    'onon-paylas',
    'onon-tekrar-oyna',
    'onon-ana-menu',
    'onon-karistir-evet',
    'onon-karistir-hayir',
  ];
  const ekranlar = () => kaynaklar('src/oyun-ekranlari/on-on-ama');

  it('10/10 ama kayıt listesinde aktif ve ekranı var (KK-55)', () => {
    const kayit = dosyaIcerik('src/games/registry.ts');
    expect(kayit).toMatch(/id:\s*'10-10-ama'/);
    expect(kayit).not.toMatch(/id:\s*'10-10-ama'[^}]*aktif:\s*false/);
    expect(kayit).toMatch(/oyun-ekranlari\/on-on-ama/);
  });

  it('ekranlar sözleşmedeki testID adlarını kullanır', () => {
    const kaynak = ekranlar()
      .map(({ icerik }) => icerik)
      .join('\n');
    expect(kaynak.length).toBeGreaterThan(0);
    expect(TESTIDLER.filter((t) => !kaynak.includes(t))).toEqual([]);
  });

  it('kart metni puan girişinde ve açıklamada görünür kalır (KK-59)', () => {
    const dosyalar = ekranlar();
    const puan = dosyalar.filter(({ icerik }) => icerik.includes('onon-puan-'));
    const acik = dosyalar.filter(({ icerik }) =>
      icerik.includes('onon-ortalama'),
    );
    expect(puan.length).toBeGreaterThan(0);
    expect(acik.length).toBeGreaterThan(0);
    for (const { f, icerik } of [...puan, ...acik])
      expect(icerik, f).toMatch(/testID="onon-kart-metni"/);
  });

  it('"Hareketi azalt" açıkken konfeti/açıklama animasyonu sade (KK-57)', () => {
    const kaynak = ekranlar()
      .map(({ icerik }) => icerik)
      .join('\n');
    expect(kaynak).toMatch(/azalt|hareketAzalt|reduceMotion/i);
  });

  it('ekran kayıttan okurken durumGecerliMi kullanır (KK-14)', () => {
    const kayit = dosyaIcerik('src/games/registry.ts');
    expect(kayit).toMatch(/on-on-ama\/onon['"]/);
    expect(kayit).toMatch(
      /gecerliMi:\s*\w*[Oo]non\w*|gecerliMi:\s*ononGecerliMi/,
    );
  });

  it('10/10 ama mantığı saf: src/games/on-on-ama içinde Date.now, Math.random, ağ ve React yok (KK-61)', () => {
    const dosyalar = kaynaklar('src/games/on-on-ama');
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(
        /Date\.now\(|Math\.random\(|WebSocket|\bfetch\(/,
      );
      expect(icerik, f).not.toMatch(/from ['"](react|react-native|expo)/);
    }
  });

  it("çekirdek ve uygulama kabuğu 10/10 ama'ya bağlanmaz (KK-2/KK-55)", () => {
    for (const { f, icerik } of [
      ...kaynaklar('src/core'),
      ...kaynaklar('src/oda'),
    ])
      expect(icerik, f).not.toMatch(/games\/on-on-ama/);
  });

  it('gerçek cihaz listesinde 10/10 ama bölümü var (KK-62)', () => {
    const liste = dosyaIcerik('docs/GERCEK-CIHAZ-KONTROL.md');
    expect(liste).toMatch(/10\/10 ama \(KK-62\)/);
    expect(liste).toMatch(/parmak/i);
    expect(liste).toMatch(/hareketi azalt/i);
  });
});
