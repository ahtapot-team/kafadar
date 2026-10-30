// v8 Açılış ekranı (KK-94, KK-95, KK-96, KK-97, KK-99, KK-100) — issue #191. Söz dosyası denetimi (KK-98): src/icerik/soz.kabul.test.ts.
// Arayüz test aracı yok (Semih 1C): zaman/yüzde/söz kuralları saf fonksiyon (sahte saat, sahte rng), ekran kaynak sözleşmesiyle sınanır;
// ekranın davranışı önizlemede QA tarafından açılıp gözle doğrulanır.
// SÖZLEŞME (frontend için):
//   src/core/acilis.ts   → MIN_SURE_MS = 3000 · acilisOlustur(saat: Saat) döndürür { durum(): { yuzde: number (0–100 tam sayı); gecti: boolean },
//                           hazirlikOrani(oran: 0–1): void, hazirlikBitti(): void (yazı tipi hatasında da çağrılır), dokun(): void }
//   src/core/soz.ts      → sozSec(sozler: Soz[], rng: Rng): Soz · sozAltYazisi(soz, oyunlar: Record<string, { ad: string; emoji: string }>): string | null
//                           rozet metni "🕵️ Casus kim" (emoji + boşluk + ad; tasarım B, #190); genel sözde null
//   src/games/registry.ts → her oyun kaydına `emoji` alanı: ok-mu-nok 👍 · 10-10-ama 🔟 · casus-kim 🕵️ (src/games/oyun.ts Oyun tipine `emoji: string`)
//                           Soz = { id: string; text: string; oyun: string }  (oyun: oyun kimliği ya da 'genel')
//   src/acilis/ekran.tsx → AcilisEkrani; testID: acilis-ekran, acilis-ad ("Kafadar"), acilis-cubuk (progressbar), acilis-yuzde ("%42"), acilis-soz, acilis-soz-oyun
//   app/_layout.tsx      → AcilisEkrani'ni gösterir (yazı tipi yüklenirken `return null` yok); app/index.tsx (ana ekran) onu içe aktarmaz.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { kaynaklar } from './test/yardimci';

type Acilis = {
  MIN_SURE_MS: number;
  acilisOlustur(saat: () => number): {
    durum(): { yuzde: number; gecti: boolean };
    hazirlikOrani(oran: number): void;
    hazirlikBitti(): void;
    dokun(): void;
  };
};
type Soz = { id: string; text: string; oyun: string };
type SozModulu = {
  sozSec(sozler: Soz[], rng: () => number): Soz;
  sozAltYazisi(
    soz: Soz,
    oyunlar: Record<string, { ad: string; emoji: string }>,
  ): string | null;
};

// Dinamik yüklenir: modül sözleşmeye uymasa da tip denetimi kırılmaz.
const acilisYol = './core/acilis';
const sozYol = './core/soz';
const yukleAcilis = async () =>
  (await import(/* @vite-ignore */ acilisYol)) as unknown as Acilis;
const yukleSoz = async () =>
  (await import(/* @vite-ignore */ sozYol)) as unknown as SozModulu;

const oku = (dosya: string) =>
  readFileSync(new URL(`../${dosya}`, import.meta.url), 'utf8');
const var_ = (dosya: string) => {
  try {
    return oku(dosya);
  } catch {
    return '';
  }
};

// Sahte saat: ms cinsinden elle ilerletilir.
const saatYap = () => {
  let t = 1_000_000;
  return { saat: () => t, ilerle: (ms: number) => void (t += ms) };
};

describe('KK-94: açılış ekranı her açılışta bir kez görünür', () => {
  it('KK-94: ekran "Kafadar", çubuk, yüzde ve söz için sözleşmedeki testID\'leri taşır', () => {
    const ekran = var_('src/acilis/ekran.tsx');
    expect(ekran).toMatch(/export (function|const) AcilisEkrani/);
    for (const id of [
      'acilis-ekran',
      'acilis-ad',
      'acilis-cubuk',
      'acilis-yuzde',
      'acilis-soz',
      'acilis-soz-oyun',
    ])
      expect(ekran, id).toContain(`testID="${id}"`);
    expect(ekran).toContain('Kafadar');
    expect(ekran).toMatch(/%\$\{|`%\$\{|'%'\s*\+|%{/); // yüzde "%42" biçiminde yazılır
  });

  it('KK-94: kök yerleşim açılış ekranını gösterir; yazı tipi beklerken boş ekran (return null) yok', () => {
    const kok = oku('app/_layout.tsx');
    expect(kok).toMatch(/AcilisEkrani/);
    expect(kok).not.toMatch(
      /if\s*\(\s*!fontHazir\s*&&\s*!fontHatasi\s*\)\s*return null/,
    );
  });

  it('KK-94: ana ekran açılış ekranını içe aktarmaz (uygulama içinde dönünce yeniden görünmez)', () => {
    expect(var_('src/acilis/ekran.tsx')).not.toBe('');
    for (const { f, icerik } of [
      ...kaynaklar('app').filter(({ f }) => !f.endsWith('_layout.tsx')),
    ])
      expect(icerik, f).not.toMatch(/AcilisEkrani|acilis\/ekran/);
  });
});

describe('KK-95: yüzde yalnızca ileri gider; %100 hazırlık + en az 3 sn', () => {
  it('KK-95: en az 3 saniye sabit (MIN_SURE_MS = 3000)', async () => {
    const { MIN_SURE_MS } = await yukleAcilis();
    expect(MIN_SURE_MS).toBe(3000);
  });

  it('KK-95: hazırlık erken bitse de 3 sn dolmadan %100 olmaz, geçmez', async () => {
    const { acilisOlustur, MIN_SURE_MS } = await yukleAcilis();
    const s = saatYap();
    const a = acilisOlustur(s.saat);
    a.hazirlikBitti();
    s.ilerle(MIN_SURE_MS - 1);
    expect(a.durum().yuzde).toBeLessThan(100);
    expect(a.durum().gecti).toBe(false);
    s.ilerle(1);
    expect(a.durum()).toEqual({ yuzde: 100, gecti: true });
  });

  it('KK-95: hazırlık bitmeden süre dolsa da %100 olmaz; hazırlık bitince hemen %100', async () => {
    const { acilisOlustur, MIN_SURE_MS } = await yukleAcilis();
    const s = saatYap();
    const a = acilisOlustur(s.saat);
    s.ilerle(MIN_SURE_MS * 5);
    expect(a.durum().yuzde).toBeLessThan(100);
    expect(a.durum().gecti).toBe(false);
    a.hazirlikBitti();
    expect(a.durum()).toEqual({ yuzde: 100, gecti: true });
  });

  it('KK-95: yüzde yavaş olanı izler (süre ve hazırlığın küçüğü) ve asla geri gitmez', async () => {
    const { acilisOlustur, MIN_SURE_MS } = await yukleAcilis();
    const s = saatYap();
    const a = acilisOlustur(s.saat);
    const gecmis: number[] = [a.durum().yuzde];
    const adim = (ms: number, oran?: number) => {
      s.ilerle(ms);
      if (oran !== undefined) a.hazirlikOrani(oran);
      gecmis.push(a.durum().yuzde);
    };
    adim(MIN_SURE_MS / 2); // süre %50, hazırlık 0 → ~%0
    expect(gecmis.at(-1)).toBeLessThan(10);
    adim(0, 0.8); // süre %50, hazırlık %80 → ~%50
    expect(gecmis.at(-1)).toBeGreaterThanOrEqual(45);
    expect(gecmis.at(-1)).toBeLessThanOrEqual(55);
    adim(0, 0.3); // hazırlık oranı düşük bildirilse de yüzde düşmez
    expect(gecmis.at(-1)).toBeGreaterThanOrEqual(gecmis.at(-2)!);
    adim(MIN_SURE_MS / 2 - 1, 1); // süre ~%100'ün hemen altında
    expect(gecmis.at(-1)).toBeLessThan(100);
    adim(1);
    expect(gecmis.at(-1)).toBe(100);
    for (let i = 1; i < gecmis.length; i++)
      expect(gecmis[i], `adım ${i}`).toBeGreaterThanOrEqual(gecmis[i - 1]);
    for (const y of gecmis) expect(Number.isInteger(y)).toBe(true);
  });

  it('KK-95: %100 olunca uygulama kendiliğinden geçer (ekran gecti durumunu yönlendirmeye çevirir)', () => {
    const ekran = var_('src/acilis/ekran.tsx') + var_('app/_layout.tsx');
    expect(ekran).toMatch(/acilisOlustur/);
    expect(ekran).toMatch(/\.gecti|gecti/);
    expect(ekran).toMatch(/\.durum\(\)/);
  });
});

describe('KK-96: dokunma beklemeyi atlar; hata ekranı takmaz', () => {
  it('KK-96: hazırlık bittiyse dokunma hemen geçirir (3 sn beklemeden)', async () => {
    const { acilisOlustur } = await yukleAcilis();
    const s = saatYap();
    const a = acilisOlustur(s.saat);
    a.hazirlikBitti();
    s.ilerle(500);
    expect(a.durum().gecti).toBe(false);
    a.dokun();
    expect(a.durum()).toEqual({ yuzde: 100, gecti: true });
  });

  it('KK-96: hazırlık bitmediyse dokunma geçirmez; hazırlık biter bitmez geçer (süre beklenmez)', async () => {
    const { acilisOlustur } = await yukleAcilis();
    const s = saatYap();
    const a = acilisOlustur(s.saat);
    s.ilerle(500);
    a.dokun();
    expect(a.durum().gecti).toBe(false);
    s.ilerle(500);
    a.hazirlikBitti();
    expect(a.durum()).toEqual({ yuzde: 100, gecti: true });
  });

  it('KK-96: ekran dokunmayı dinler (Pressable/onPress → dokun) ve yazı tipi hatasında hazırlığı bitirir', () => {
    const ekran = var_('src/acilis/ekran.tsx');
    const kok = oku('app/_layout.tsx');
    expect(ekran).toMatch(/\.dokun\(\)/);
    expect(ekran).toMatch(/onPress|onTouchEnd|Pressable/);
    // yazı tipi hatası (fontHatasi) hazırlığı bitmiş sayar; ekran takılı kalmaz
    expect(kok).toMatch(/fontHatasi/);
    expect(kok + ekran).toMatch(/hazirlikBitti\(\)/);
  });
});

describe('KK-97: söz seçimi saf fonksiyon (src/core/rng ile)', () => {
  const sozler: Soz[] = [
    { id: 's1', text: 'Birinci söz', oyun: 'ok-mu-nok' },
    { id: 's2', text: 'İkinci söz', oyun: 'casus-kim' },
    { id: 's3', text: 'Üçüncü söz', oyun: 'genel' },
    { id: 's4', text: 'Dördüncü söz', oyun: '10-10-ama' },
  ];

  it('KK-97: sahte rng ile tüm sözler arasından seçer (0 → ilk, 0.99 → son, 0.5 → ortadaki)', async () => {
    const { sozSec } = await yukleSoz();
    expect(sozSec(sozler, () => 0).id).toBe('s1');
    expect(sozSec(sozler, () => 0.99).id).toBe('s4');
    expect(sozSec(sozler, () => 0.5).id).toBe('s3');
  });

  it('KK-97: gerçek tohumlu rng ile çok çekimde bütün sözler çıkar, her biri geçerli', async () => {
    const { sozSec } = await yukleSoz();
    const { rngOlustur } = await import('./core/rng');
    const rng = rngOlustur(42);
    const goruldu = new Set<string>();
    for (let i = 0; i < 200; i++) goruldu.add(sozSec(sozler, rng).id);
    expect([...goruldu].sort()).toEqual(['s1', 's2', 's3', 's4']);
  });

  it('KK-97: oyuna ait sözün altında "emoji + oyun adı" rozeti yazar, genel sözde yazmaz', async () => {
    const { sozAltYazisi } = await yukleSoz();
    const oyunlar = {
      'ok-mu-nok': { ad: 'OK mu NOK mu', emoji: '👍' },
      '10-10-ama': { ad: '10/10 ama', emoji: '🔟' },
      'casus-kim': { ad: 'Casus kim', emoji: '🕵️' },
    };
    expect(sozAltYazisi(sozler[1], oyunlar)).toBe('🕵️ Casus kim');
    expect(sozAltYazisi(sozler[3], oyunlar)).toBe('🔟 10/10 ama');
    expect(sozAltYazisi(sozler[0], oyunlar)).toBe('👍 OK mu NOK mu');
    expect(sozAltYazisi(sozler[2], oyunlar)).toBeNull();
  });

  it('KK-97: her oyun kaydında emoji alanı var (ok-mu-nok 👍, 10-10-ama 🔟, casus-kim 🕵️)', async () => {
    const { oyunlar } = await import('./games/registry');
    const emoji = Object.fromEntries(
      oyunlar.map((o) => [o.id, (o as { emoji?: string }).emoji]),
    );
    expect(emoji).toEqual({
      'ok-mu-nok': '👍',
      '10-10-ama': '🔟',
      'casus-kim': '🕵️',
    });
  });

  it('KK-97: seçim ve alt yazı React/Expo içe aktarmaz; rastgelelik src/core/rng üzerinden', () => {
    const soz = var_('src/core/soz.ts');
    expect(soz).not.toBe('');
    expect(soz).not.toMatch(/from ['"](react|react-native|expo)/);
    expect(soz).not.toMatch(/Math\.random/);
    const ekran = var_('src/acilis/ekran.tsx');
    expect(ekran).toMatch(/sozSec/);
    expect(ekran).toMatch(/sozAltYazisi/);
  });
});

describe('KK-99: erişilebilirlik, tema, bağımlılık', () => {
  it('KK-99: çubuk progressbar rolü ve değerini sunar; söz ve yüzde ekran okuyucudan gizlenmez', () => {
    const ekran = var_('src/acilis/ekran.tsx');
    expect(ekran).toMatch(/accessibilityRole="progressbar"/);
    expect(ekran).toMatch(/accessibilityValue/);
    expect(ekran).not.toMatch(
      /accessibilityElementsHidden|importantForAccessibility="no/,
    );
  });

  it("KK-99: renk/boyut token'lardan gelir (renk sabiti yok), koyu/açık tema useDurum ile", () => {
    const ekran = var_('src/acilis/ekran.tsx');
    expect(ekran).not.toBe('');
    expect(ekran).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    expect(ekran).toMatch(/useDurum/);
    expect(ekran).toMatch(/from ['"][./]+(src\/)?tema['"]|\.\.\/tema/);
  });

  it('KK-99: yeni bağımlılık yok (açılış kaynakları yalnızca package.json bağımlılıklarını içe aktarır)', () => {
    const pkg = JSON.parse(oku('package.json')) as {
      dependencies: Record<string, string>;
    };
    const kaynak = [
      ...kaynaklar('src/acilis'),
      { f: 'src/core/acilis.ts', icerik: var_('src/core/acilis.ts') },
      { f: 'src/core/soz.ts', icerik: var_('src/core/soz.ts') },
    ];
    expect(kaynak.some((k) => k.icerik !== '')).toBe(true);
    for (const { f, icerik } of kaynak)
      for (const m of icerik.matchAll(/from ['"]([^'"./][^'"]*)['"]/g)) {
        const ad = m[1].startsWith('@')
          ? m[1].split('/').slice(0, 2).join('/')
          : m[1].split('/')[0];
        expect(Object.keys(pkg.dependencies), `${f}: ${ad}`).toContain(ad);
      }
  });
});

describe('KK-100: mevcut akışlar ve belgeler', () => {
  it('KK-100: "Devam et" ve davet bağlantısı akışları ana ekranda yerinde (mevcut kabul testleri yeşil kalır)', () => {
    const anaEkran = oku('app/index.tsx');
    expect(anaEkran).toContain('etiket="Devam et"');
    expect(oku('app/_layout.tsx')).toMatch(/OdaSaglayici/);
    expect(oku('app/ayarlar.tsx')).not.toBe('');
  });

  it('KK-100: CLAUDE.md ve docs/MIMARI.md açılış ekranını ve söz dosyasını anlatır', () => {
    for (const d of ['CLAUDE.md', 'docs/MIMARI.md']) {
      const m = oku(d);
      expect(m, d).toMatch(/açılış ekranı/i);
      expect(m, d).toContain('content/acilis/sozler.json');
    }
  });
});
