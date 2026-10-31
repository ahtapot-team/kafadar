import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dosyaIcerik as dosya, kaynaklar } from './test/yardimci';

// v7.1 (issue #184): kart kendiliğinden açılmaz (KK-90); her oyun ekranında ortak ⓘ düğmesi (KK-91, KK-92).
// Arayüz test aracı yok (Semih 1C): sözleşme kaynak düzeyinde; davranış önizlemede ve cihazda doğrulanır.
// Sözleşme (frontend için):
//   src/tanitim-kutusu.tsx dışa aktarır  BilgiDugmesi({ oyunId })  — tek ortak bileşen, testID="nasil-oynanir",
//   görünen simge "ⓘ", accessibilityLabel="Nasıl oynanır", accessibilityRole="button", dokunma alanı ≥ dokunmaAlani (48).
//   Dokununca TanitimKarti açılır; "Tamam" ya da geri kartı kapatır; ekran değişmez (router çağrısı yok).
//   Ekranlarda yalnızca `<BilgiDugmesi oyunId={…} />` yazılır (testID'yi ekranlar tanımlamaz).
//   KALDIRILIR: src/core/tanitim.ts (görüldü bilgisi), TanitimBaglantisi, testID "tanitim-nasil", "Nasıl oynanır?" yazı bağlantıları.

const tum = () => [...kaynaklar('app'), ...kaynaklar('src')];
const BILESEN = 'src/tanitim-kutusu.tsx';
// Oyun seçildikten sonraki ekranlar (PRD KK-91). Oyun ekranları ve sonuç, çerçeve dosyalarında çizilir.
const EKRANLAR = [
  ['app/mod.tsx', 'mod seçimi'],
  ['app/oyuncular.tsx', 'oyuncular'],
  ['app/paket.tsx', 'OK mu NOK mu hazırlığı'],
  ['app/casus/hazirlik.tsx', 'Casus kim hazırlığı'],
  ['app/onon/hazirlik.tsx', '10/10 ama hazırlığı'],
  ['app/oda/lobi.tsx', 'oda lobisi'],
  ['app/oyun.tsx', 'oyun ekranları ve sonuç (tek telefon)'],
  ['app/oda/oyun.tsx', 'oyun ekranları ve sonuç (oda)'],
] as const;
const bilesenGovde = () => {
  const k = dosya(BILESEN);
  const bas = k.indexOf('export function BilgiDugmesi');
  expect(bas, 'BilgiDugmesi bileşeni').toBeGreaterThan(-1);
  const sonraki = k.indexOf('\nexport ', bas + 10);
  return k.slice(bas, sonraki < 0 ? undefined : sonraki);
};

describe('KK-90: tanıtım kartı kendiliğinden açılmaz', () => {
  it('KK-90: "görüldü" bilgisi tutulmaz: tanitim.ts yok, işaretleme/okuma ve saklama anahtarı kodda geçmez', () => {
    expect(existsSync(new URL('./core/tanitim.ts', import.meta.url))).toBe(
      false,
    );
    for (const { f, icerik } of tum())
      for (const yasak of [
        'tanitimiIsaretle',
        'tanitimGorulduMu',
        'tanitimGerekli',
        'TANITIM_ANAHTARI',
        'kafadar:tanitim',
      ])
        expect(icerik, `${f}: ${yasak}`).not.toContain(yasak);
  });

  it('KK-90: ana ekran oyun seçerken tanıtım karşılamaz, giriş tek dokunuş (v11/KK-130: kart yalnızca uzun basmayla açılır)', () => {
    const ana = dosya('app/index.tsx');
    // v11: ana ekran TanitimKarti'ni uzun basmayla açabilir; kendiliğinden (useEffect/ilk açılış) açılamaz, "görüldü" tutulmaz.
    expect(ana).not.toMatch(/useEffect\([\s\S]{0,200}tanitim/i);
    expect(ana).not.toMatch(/tanitimGerekli|tanitimGorulduMu|tanitimiIsaretle/);
    if (/TanitimKarti/.test(ana)) expect(ana).toMatch(/onLongPress=/);
    expect(ana).toContain("oyun.modSecimi ? '/mod' : '/oyuncular'");
  });

  it('KK-90: oda lobisine kodla katılırken kart kendiliğinden açılmaz (kart yalnızca ⓘ ile)', () => {
    const lobi = dosya('app/oda/lobi.tsx');
    expect(lobi).not.toContain('TanitimKarti');
    expect(lobi).not.toMatch(/tanitimGerekli|tanitimGorulduMu/);
  });

  it('KK-90: TanitimKarti yalnızca BilgiDugmesi içinden ve ana ekranda uzun basmayla kullanılır (başka hiçbir ekran kartı açmaz)', () => {
    // v11 (KK-130): ana ekran (app/index.tsx) uzun basmayla açar; başka hiçbir ekran açmaz.
    const kullananlar = tum()
      .filter(({ f }) => f !== BILESEN && f !== 'app/index.tsx')
      .filter(({ icerik }) => /<TanitimKarti\b/.test(icerik))
      .map(({ f }) => f);
    expect(kullananlar).toEqual([]);
    expect(dosya(BILESEN)).toMatch(/<TanitimKarti\b/);
    expect(bilesenGovde()).toMatch(/<TanitimKarti\b/);
  });

  it('KK-90: "Tamam" kartı yalnızca kapatır: depo yazılmaz', () => {
    const k = dosya(BILESEN);
    expect(k).not.toMatch(/\bdepo\b/);
    expect(k).not.toContain('tanitimiIsaretle');
  });
});

describe('KK-91: her oyun ekranında ⓘ, ana ekranda yok', () => {
  it('KK-91: ortak BilgiDugmesi bileşeni var; testID nasil-oynanir, simge ⓘ', () => {
    const g = bilesenGovde();
    expect(g).toContain('nasil-oynanir');
    expect(g).toContain('ⓘ');
    expect(g).toMatch(/<TanitimKarti\b/);
  });

  for (const [yol, ad] of EKRANLAR)
    it(`KK-91: ${ad} (${yol}) BilgiDugmesi gösterir`, () => {
      const icerik = dosya(yol);
      expect(icerik).toMatch(/<BilgiDugmesi\b[^>]*oyunId=/);
      expect(icerik).toMatch(
        /BilgiDugmesi[^;]*from ['"][^'"]*tanitim-kutusu['"]/,
      );
    });

  it('KK-91: ana ekranda (app/index.tsx) ve ayarlarda ⓘ yoktur', () => {
    for (const yol of ['app/index.tsx', 'app/ayarlar.tsx']) {
      const icerik = dosya(yol);
      expect(icerik, yol).not.toContain('BilgiDugmesi');
      expect(icerik, yol).not.toContain('nasil-oynanir');
    }
  });

  it('KK-91: kart ekranı değiştirmez: BilgiDugmesi gezinme çağrısı (router) yapmaz, kart "Tamam" ya da geri ile kapanır', () => {
    const g = bilesenGovde();
    expect(g).not.toMatch(/router\./);
    expect(g).toMatch(/onTamam=\{[^}]*\}/);
    expect(g).toMatch(/onKapat=\{[^}]*\}/);
  });

  it('KK-91: eski "Nasıl oynanır?" yazı bağlantıları kaldırılmıştır (tanitim-nasil, TanitimBaglantisi, "Nasıl oynanır?")', () => {
    for (const { f, icerik } of tum()) {
      expect(icerik, `${f}: tanitim-nasil`).not.toContain('tanitim-nasil');
      expect(icerik, `${f}: TanitimBaglantisi`).not.toContain(
        'TanitimBaglantisi',
      );
      expect(icerik, `${f}: Nasıl oynanır?`).not.toContain('Nasıl oynanır?');
    }
  });
});

describe('KK-92: ⓘ düğmesi erişilebilirliği ve tema', () => {
  it('KK-92: dokunma alanı ≥ 48px ve ekran okuyucu "Nasıl oynanır" der', () => {
    const g = bilesenGovde();
    expect(g).toMatch(/dokunmaAlani|minHeight:\s*(4[89]|[5-9]\d)/);
    expect(g).toMatch(
      /minWidth:\s*dokunmaAlani|width:\s*dokunmaAlani|dokunmaAlani/,
    );
    expect(g).toContain('accessibilityRole="button"');
    expect(g).toMatch(/accessibilityLabel=\{?["'`]Nasıl oynanır["'`]\}?/);
  });

  it("KK-92: stil değerleri tema token'larından gelir (sabit renk yok), renk useDurum'dan", () => {
    const g = bilesenGovde();
    expect(g).toMatch(/renk\./);
    expect(g).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(g).not.toMatch(/rgba?\(/);
  });

  it('KK-92: tüm ekranlarda aynı ortak bileşen: nasil-oynanir testID tanımı tek yerde', () => {
    const tanimlayanlar = tum()
      .filter(({ icerik }) => icerik.includes('nasil-oynanir'))
      .map(({ f }) => f);
    expect(tanimlayanlar).toEqual([BILESEN]);
  });
});
