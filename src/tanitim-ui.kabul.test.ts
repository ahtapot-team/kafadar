import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// PRD v6 (#131 → frontend #132): tanıtım kartı ekran sözleşmesi, kaynak düzeyinde (arayüz test aracı yok, Semih 1C).
// Davranış (kart açılışı, geri tuşu, dışarı dokunma, lobide güncelleme) önizlemede ve gerçek cihazda doğrulanır.
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
const tum = () => [...kaynaklar('app'), ...kaynaklar('src')];
const dosya = (yol: string) =>
  readFileSync(new URL(`../${yol}`, import.meta.url), 'utf8');
const kartDosyalari = () =>
  tum().filter(({ icerik }) => icerik.includes('tanitim-kart'));

describe('KK-73/KK-77: tanıtım kartı bileşeni', () => {
  it('kart testID adlarını taşır: tanitim-kart, -baslik, -kisi, -metin, -tamam', () => {
    const kart = kartDosyalari();
    expect(kart.length).toBeGreaterThan(0);
    const kaynak = kart.map((k) => k.icerik).join('\n');
    for (const t of [
      'tanitim-kart',
      'tanitim-baslik',
      'tanitim-kisi',
      'tanitim-metin',
      'tanitim-tamam',
    ])
      expect(kaynak, t).toContain(t);
  });

  it('oyun adı, kişi sayısı ve metin kayıt satırından (oyun.tanitim) okunur; bileşende oyun adı/metni sabit yazılmaz (KK-2/KK-77)', () => {
    const kart = kartDosyalari();
    expect(kart.length).toBeGreaterThan(0);
    for (const { f, icerik } of kart) {
      expect(icerik, f).toMatch(/\.tanitim\b|tanitim\.(kisi|metin)|tanitim:/);
      expect(icerik, f).not.toMatch(/Casus kim|OK mu NOK mu|10\/10 ama/);
    }
  });

  it('"Tamam" düğmesi en az 48px (dokunmaAlani) ve ekran okuyucu için erişilebilirlik özellikleri var', () => {
    expect(kartDosyalari().length).toBeGreaterThan(0);
    for (const { f, icerik } of kartDosyalari()) {
      expect(icerik, f).toMatch(/dokunmaAlani|minHeight:\s*(4[89]|[5-9]\d)/);
      expect(icerik, f).toMatch(
        /accessibilityRole|accessibilityLabel|accessible/,
      );
    }
  });

  it('"Hareketi azalt" açıkken animasyon kullanılmaz (KK-77)', () => {
    expect(kartDosyalari().length).toBeGreaterThan(0);
    for (const { f, icerik } of kartDosyalari())
      expect(icerik, f).toMatch(/azalt|hareketAzalt|reduceMotion/i);
  });

  it('görüldü yalnızca "Tamam"da işaretlenir: tanitimiIsaretle tek yerde çağrılır (geri tuşu görüldü saymaz, KK-74)', () => {
    const cagrilar = tum()
      .filter(({ f }) => f !== 'src/core/tanitim.ts')
      .flatMap(({ f, icerik }) =>
        [...icerik.matchAll(/tanitimiIsaretle\(/g)].map(() => f),
      );
    expect(cagrilar.length).toBeGreaterThan(0);
    const kartIci = cagrilar.filter((f) =>
      kartDosyalari().some((k) => k.f === f),
    );
    expect(
      kartIci.length,
      'işaretleme kart bileşeninde, "Tamam" işleyicisinde olmalı',
    ).toBe(cagrilar.length);
    expect(cagrilar.length).toBe(1);
  });
});

describe('KK-73/KK-75/KK-78: kartın açıldığı yerler', () => {
  it('ana ekrandan oyun seçimi: tanitimGerekli(…, "secim") kullanılır; "Devam et" yolu tanıtım çağırmaz', () => {
    const ana = dosya('app/index.tsx');
    const ayri = tum().filter(({ icerik }) =>
      /tanitimGerekli\([^)]*'secim'/.test(icerik),
    );
    expect(ayri.length).toBeGreaterThan(0);
    expect(ana).toMatch(/devam-et/);
    expect(ana).not.toMatch(/tanitimGerekli\([^)]*'devam'/);
  });

  it('oda lobisi: odaya kodla ilk katılımda tanitimGerekli(…, "lobi") kullanılır; kart açıkken lobi güncellenir (kart modal ya da katman, lobi ağacı değişmez)', () => {
    const lobi = dosya('app/oda/lobi.tsx');
    expect(lobi).toMatch(/tanitimGerekli\([^)]*'lobi'/);
    expect(lobi).toMatch(/lobi-baslat/);
  });
});

describe('KK-76: "Nasıl oynanır?" bağlantısı', () => {
  const YERLER = [
    ['app/paket.tsx', 'OK mu NOK mu paket ve süre ekranı'],
    ['app/casus/hazirlik.tsx', 'Casus kim ayarları'],
    ['app/onon/hazirlik.tsx', '10/10 ama hazırlığı'],
    ['app/oda/lobi.tsx', 'oda lobisi'],
  ] as const;
  for (const [yol, ad] of YERLER)
    it(`${ad} (${yol}): testID="tanitim-nasil" ve "Nasıl oynanır?" metni`, () => {
      const icerik = dosya(yol);
      expect(icerik).toContain('tanitim-nasil');
      expect(icerik).toContain('Nasıl oynanır?');
    });

  it('bağlantı aynı kartı açar: kart bileşeni dışarıdan açılabilir (görüldü bilgisinden bağımsız)', () => {
    const bagli = YERLER.map(([yol]) => dosya(yol));
    expect(bagli.every((i) => /tanitim/i.test(i))).toBe(true);
  });
});

describe('KK-78: mevcut akışlar bozulmaz', () => {
  it('çekirdek ve oda mantığı oyun tanıtımına bağlanmaz (KK-2)', () => {
    for (const k of ['src/core', 'src/oda'])
      for (const { f, icerik } of kaynaklar(k).filter(
        ({ f }) => !f.includes('tanitim'),
      ))
        expect(icerik, f).not.toMatch(
          /oyun-ekranlari\/tanitim|games\/[a-z-]+\/tanitim/,
        );
  });

  it('ana ekranda "Yakında" ve tek dokunuşla giriş testID\'leri yerinde', () => {
    const ana = dosya('app/index.tsx');
    expect(ana).toMatch(/ana-oyun-/);
    expect(ana).toMatch(/devam-et/);
  });
});
