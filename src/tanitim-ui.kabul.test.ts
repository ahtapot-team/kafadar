import { describe, expect, it } from 'vitest';
import { dosyaIcerik as dosya, kaynaklar } from './test/yardimci';

// Tanıtım kartı bileşeni sözleşmesi (KK-77, değişmez) ve akışların korunması (KK-93), kaynak düzeyinde
// (arayüz test aracı yok, Semih 1C). Kartın ⓘ ile açılması ve kendiliğinden açılmaması: nasil-oynanir.kabul.test.ts.
const tum = () => [...kaynaklar('app'), ...kaynaklar('src')];
const kartDosyalari = () =>
  tum().filter(({ icerik }) => icerik.includes('tanitim-kart'));

describe('KK-77: tanıtım kartı bileşeni', () => {
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

  it('oyun adı, kişi sayısı ve metin kayıt satırından (oyun.tanitim) okunur; bileşende oyun adı/metni sabit yazılmaz (KK-2)', () => {
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

  it('"Hareketi azalt" açıkken animasyon kullanılmaz', () => {
    expect(kartDosyalari().length).toBeGreaterThan(0);
    for (const { f, icerik } of kartDosyalari())
      expect(icerik, f).toMatch(/azalt|hareketAzalt|reduceMotion/i);
  });
});

describe('KK-93: mevcut akışlar bozulmaz', () => {
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

  it('oda lobisi güncellenmeye ve oyun başlatmaya devam eder (lobi-baslat)', () => {
    expect(dosya('app/oda/lobi.tsx')).toMatch(/lobi-baslat/);
  });
});
