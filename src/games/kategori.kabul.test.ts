// v7.1 Kişi filtresi (KK-87, KK-88, KK-89; KK-85 çip erişilebilirliği korunur, KK-93 belgeler) — issue #184.
// Arayüz test aracı yok (Semih 1C): çip kuralları saf fonksiyon olarak, ekran kaynak sözleşmesiyle sınanır.
// Test adları PRD KK numarasıyla başlar. Sözleşme (frontend için): src/games/kategori.ts dışa aktarır
//   CIPLER = ['tumu','2-kisi','3-5-kisi','6-uzeri-kisi']          (sıra böyle, hepsi her zaman görünür)
//   CIP_ETIKETI = { tumu:'Tümü', '2-kisi':'2 kişi', '3-5-kisi':'3–5 kişi', '6-uzeri-kisi':'6+ kişi' }
//   cipEslesir(cip, oyun) · filtrele(oyunlar, cip) · cipSec(secili, dokunulan) · kisiMetni(oyun)
//   BOS_LISTE_METNI = 'Bu kişi sayısına uygun oyun henüz yok.'
// KALDIRILIR: gorunenCipler, turEtiketi, Oyun.tur, Oyun.ortam, çip kimlikleri kalabalik/cift/aile/quiz.
// Ana ekran testID'leri: kategori-cipleri, cip-<id>, oyun-kisi-<oyunId>, kategori-bos (boş liste metni).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../kabul';
import { oyunlar } from './registry';

// Kırmızı-önce: v7.1 uygulaması gelene dek bu testler it.fails ile beklenir; işi kapatan PR bayrağı ve bu satırı siler.
const kabulV71 = BEKLEYEN.v71 ? it.fails : it;

type Cip = 'tumu' | '2-kisi' | '3-5-kisi' | '6-uzeri-kisi';
type Kayit = { id: string; ad: string; aktif: boolean; minOyuncu?: number };
type Kategori = {
  CIPLER: Cip[];
  CIP_ETIKETI: Record<Cip, string>;
  BOS_LISTE_METNI: string;
  cipEslesir(cip: Cip, oyun: Kayit): boolean;
  filtrele(liste: Kayit[], cip: Cip): Kayit[];
  cipSec(secili: Cip, dokunulan: Cip): Cip;
  kisiMetni(oyun: Kayit): string;
};

// Dinamik yüklenir: modül sözleşmeye uymasa da tip denetimi kırılmaz.
const yol = './kategori';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as Kategori;

const oku = (dosya: string) =>
  readFileSync(new URL(`../../${dosya}`, import.meta.url), 'utf8');

const oyun = (id: string, minOyuncu?: number, aktif = true): Kayit => ({
  id,
  ad: id,
  aktif,
  minOyuncu,
});
const ids = (l: Kayit[]) => l.map((o) => o.id);

// Bugünkü verinin aynası: iki oyun 2–12, Casus kim 3–12.
const bugun = [oyun('ok-mu-nok'), oyun('10-10-ama'), oyun('casus-kim', 3)];

describe('KK-87: kişi çipleri satırı', () => {
  kabulV71('KK-87: çip sırası Tümü · 2 kişi · 3–5 kişi · 6+ kişi', async () => {
    const { CIPLER, CIP_ETIKETI } = await yukle();
    expect(CIPLER).toEqual(['tumu', '2-kisi', '3-5-kisi', '6-uzeri-kisi']);
    expect(CIPLER.map((c) => CIP_ETIKETI[c])).toEqual([
      'Tümü',
      '2 kişi',
      '3–5 kişi',
      '6+ kişi',
    ]);
  });

  kabulV71(
    'KK-87: dört çip de her zaman görünür (gorunenCipler yok, satır koşulsuz)',
    async () => {
      const kat = (await yukle()) as unknown as Record<string, unknown>;
      expect(kat.gorunenCipler).toBeUndefined();
      const k = oku('app/index.tsx');
      expect(k).not.toContain('gorunenCipler');
      expect(k).toContain('CIPLER');
      expect(k).toContain('kategori-cipleri');
    },
  );

  it('KK-87: çip satırı oyun listesinin üstünde, ilk seçim Tümü, seçim kalıcı değil', () => {
    const k = oku('app/index.tsx');
    expect(k).toContain('cip-');
    expect(k).toMatch(/useState(<[^>]*>)?\(\s*'tumu'\s*\)/);
    expect(k.indexOf('kategori-cipleri')).toBeLessThan(k.indexOf('ana-oyun-'));
    expect(k).toContain("from '../src/games/kategori'");
    expect(k).not.toMatch(/depo\.setItem\([^)]*cip/i);
  });

  it("KK-87: seçili çipe ya da Tümü'ne dokunmak filtreyi kaldırır; tek seçim", async () => {
    const { cipSec } = await yukle();
    expect(cipSec('tumu', '2-kisi')).toBe('2-kisi');
    expect(cipSec('2-kisi', '2-kisi')).toBe('tumu');
    expect(cipSec('2-kisi', '3-5-kisi')).toBe('3-5-kisi');
    expect(cipSec('3-5-kisi', 'tumu')).toBe('tumu');
    expect(cipSec('tumu', 'tumu')).toBe('tumu');
    expect(cipSec('6-uzeri-kisi', '6-uzeri-kisi')).toBe('tumu');
  });
});

describe('KK-88: kişi aralığı kesişimi ve filtre', () => {
  kabulV71(
    'KK-88: eşleşme = oyunun [minOyuncu ?? 2, 12] aralığı çipin aralığıyla kesişir',
    async () => {
      const { cipEslesir } = await yukle();
      const ok = oyun('ok'); // 2–12
      const casus = oyun('c', 3); // 3–12
      expect(bugun.every((o) => cipEslesir('tumu', o))).toBe(true);
      expect(cipEslesir('2-kisi', ok)).toBe(true);
      expect(cipEslesir('2-kisi', oyun('x', 1))).toBe(true); // 1 → en az 2 sayılır
      expect(cipEslesir('2-kisi', oyun('x', 2))).toBe(true);
      expect(cipEslesir('2-kisi', casus)).toBe(false);
      expect(cipEslesir('3-5-kisi', ok)).toBe(true);
      expect(cipEslesir('3-5-kisi', casus)).toBe(true);
      expect(cipEslesir('3-5-kisi', oyun('x', 5))).toBe(true); // 5–12 ∩ 3–5 = {5}
      expect(cipEslesir('3-5-kisi', oyun('x', 6))).toBe(false); // 6–12 ∩ 3–5 = ∅
      expect(cipEslesir('6-uzeri-kisi', ok)).toBe(true);
      expect(cipEslesir('6-uzeri-kisi', casus)).toBe(true);
      expect(cipEslesir('6-uzeri-kisi', oyun('x', 12))).toBe(true);
    },
  );

  kabulV71(
    'KK-88: filtre yalnızca eşleşenleri bırakır, sıra değişmez (bugün 2 kişi → OK mu NOK mu, 10/10 ama)',
    async () => {
      const { filtrele } = await yukle();
      expect(ids(filtrele(bugun, 'tumu'))).toEqual(ids(bugun));
      expect(ids(filtrele(bugun, '2-kisi'))).toEqual([
        'ok-mu-nok',
        '10-10-ama',
      ]);
      expect(ids(filtrele(bugun, '3-5-kisi'))).toEqual(ids(bugun));
      expect(ids(filtrele(bugun, '6-uzeri-kisi'))).toEqual(ids(bugun));
      const karisik = [oyun('a', 6), oyun('b'), oyun('c', 4), oyun('d', 2)];
      expect(ids(filtrele(karisik, '3-5-kisi'))).toEqual(['b', 'c', 'd']);
      expect(ids(filtrele(karisik, '2-kisi'))).toEqual(['b', 'd']);
    },
  );

  kabulV71(
    'KK-88: "Yakında" (aktif değil) oyunlar aynı kurala uyar',
    async () => {
      const { filtrele } = await yukle();
      const liste = [oyun('a'), oyun('yakinda-uc', 3, false), oyun('b')];
      expect(ids(filtrele(liste, '2-kisi'))).toEqual(['a', 'b']);
      expect(ids(filtrele(liste, '3-5-kisi'))).toEqual([
        'a',
        'yakinda-uc',
        'b',
      ]);
    },
  );

  kabulV71(
    'KK-88: gerçek kayıt listesiyle "2 kişi" Casus kim\'i eler, diğer çipler hepsini bırakır',
    async () => {
      const { filtrele } = await yukle();
      const liste = oyunlar as unknown as Kayit[];
      expect(ids(filtrele(liste, '2-kisi'))).not.toContain('casus-kim');
      expect(ids(filtrele(liste, '2-kisi'))).toContain('ok-mu-nok');
      expect(filtrele(liste, '3-5-kisi')).toHaveLength(liste.length);
      expect(filtrele(liste, '6-uzeri-kisi')).toHaveLength(liste.length);
    },
  );

  kabulV71(
    'KK-88: hiçbir oyun eşleşmezse metin "Bu kişi sayısına uygun oyun henüz yok."',
    async () => {
      const { filtrele, BOS_LISTE_METNI } = await yukle();
      expect(BOS_LISTE_METNI).toBe('Bu kişi sayısına uygun oyun henüz yok.');
      expect(filtrele([oyun('a', 6)], '2-kisi')).toEqual([]);
      expect(filtrele([], '3-5-kisi')).toEqual([]);
    },
  );

  kabulV71(
    'KK-88: ana ekran listeyi filtrele() ile çizer, çipe dokunmayı cipSec() ile çözer, boş listede kategori-bos gösterir',
    () => {
      const k = oku('app/index.tsx');
      expect(k).toMatch(/filtrele\(\s*oyunlar/);
      expect(k).toMatch(/cipSec\(/);
      expect(k).toContain('BOS_LISTE_METNI');
      expect(k).toContain('kategori-bos');
    },
  );
});

describe('KK-89: kartta yalnızca kişi sayısı; tür ve ortam yok', () => {
  kabulV71('KK-89: kayıt satırlarında `tur` ve `ortam` alanları yoktur', () => {
    for (const o of oyunlar) {
      const anahtarlar = Object.keys(o);
      expect(anahtarlar, `${o.id}: tur`).not.toContain('tur');
      expect(anahtarlar, `${o.id}: ortam`).not.toContain('ortam');
    }
  });

  kabulV71(
    'KK-89: Oyun sözleşmesinde (oyun.ts) `tur`/`ortam` alanı ve OyunTuru tipi kalmaz',
    () => {
      const t = oku('src/games/oyun.ts');
      expect(t).not.toMatch(/^\s*tur\??:/m);
      expect(t).not.toMatch(/^\s*ortam\??:/m);
      expect(t).not.toContain('OyunTuru');
      expect(t).not.toContain('OyunOrtami');
    },
  );

  kabulV71(
    'KK-89: kategori.ts tür etiketi ve Çift/Aile/Kalabalık/Quiz çiplerini taşımaz',
    async () => {
      const kat = (await yukle()) as unknown as Record<string, unknown>;
      expect(kat.turEtiketi).toBeUndefined();
      const kaynak = oku('src/games/kategori.ts');
      for (const eski of ["'cift'", "'aile'", "'kalabalik'", "'quiz'"])
        expect(kaynak, eski).not.toContain(eski);
    },
  );

  kabulV71(
    'KK-89: ana ekran kartında tür rozeti yok (oyun-tur-<id>), yalnızca oyun-kisi-<id>',
    () => {
      const k = oku('app/index.tsx');
      expect(k).not.toContain('oyun-tur-');
      expect(k).not.toContain('turEtiketi');
      expect(k).toContain('oyun-kisi-');
      expect(k).toMatch(/kisiMetni\(/);
    },
  );

  it('KK-89: kişi sayısı tanıtım kartında yazanla aynıdır', async () => {
    const { kisiMetni } = await yukle();
    for (const o of oyunlar.filter((x) => x.aktif && x.tanitim))
      expect(kisiMetni(o as unknown as Kayit), o.id).toBe(o.tanitim?.kisi);
  });

  it('KK-89: yeni kişi alanı yok; kişi aralığı minOyuncu ve genel üst sınırdan (12) okunur', () => {
    for (const o of oyunlar) {
      const anahtarlar = Object.keys(o);
      for (const yasak of ['maxOyuncu', 'kisi', 'kisiSayisi', 'oyuncuSayisi'])
        expect(anahtarlar, `${o.id}: ${yasak}`).not.toContain(yasak);
    }
  });
});

describe('KK-85: çip erişilebilirliği ve tema (değişmez)', () => {
  it('KK-85: çipler bir çip bileşeniyle çizilir (seçili durumu + ≥48px), ana ekranda testID cip-<id>', () => {
    const k = oku('app/index.tsx');
    expect(k).toMatch(/<(Cip|KategoriCip)\b/);
    expect(k).toMatch(/testID=\{`cip-\$\{/);
    expect(k).toMatch(/secili=\{/);
    const ui = oku('src/ui.tsx');
    const ad = /<(Cip|KategoriCip)\b/.exec(k)?.[1] ?? 'Cip';
    const cip = ui.slice(ui.indexOf(`export function ${ad}`));
    expect(cip).toContain('accessibilityState={{ selected');
    expect(cip).toContain('minHeight: dokunmaAlani');
  });

  it('KK-85: yazi.cip token Bricolage 800, 16; seçili çip marka2 dolgu, "✓ " ön eki, etiket ✓ içermez', () => {
    const t = oku('src/tema.ts');
    const bas = t.indexOf('export const yazi');
    const govde = t.slice(bas, t.indexOf('};', bas));
    expect(govde).toMatch(/cip:\s*\{[^}]*fontFamily:\s*font\.kalin/);
    expect(govde).toMatch(/cip:\s*\{[^}]*fontSize:\s*16\b/);
    const k = oku('app/index.tsx');
    const ui = oku('src/ui.tsx');
    const ad = /<(Cip|KategoriCip)\b/.exec(k)?.[1] ?? 'Cip';
    const b = ui.indexOf(`export function ${ad}`);
    expect(b).toBeGreaterThan(-1);
    const sonraki = ui.indexOf('\nexport ', b + 10);
    const cip = ui.slice(b, sonraki < 0 ? undefined : sonraki);
    expect(cip).toContain('renk.marka2');
    expect(cip).toContain('yazi.cip');
    expect(cip).toMatch(/['"`]✓ ?['"`]|✓ /);
    expect(cip).toMatch(/accessibilityLabel=\{etiket\}/);
  });

  it("KK-85: çip satırı stil değerlerini tema token'larından alır (sabit renk yok)", () => {
    const k = oku('app/index.tsx');
    const bas = k.indexOf('kategori-cipleri');
    expect(bas).toBeGreaterThan(-1);
    const parca = k.slice(Math.max(0, bas - 400), bas + 1200);
    expect(parca).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(parca).not.toMatch(/rgba?\(/);
  });
});

describe('KK-93: akışlar ve belgeler', () => {
  it('KK-93: ana ekrandan oyun açma akışı korunur (tek dokunuşla mod/oyuncular)', () => {
    const k = oku('app/index.tsx');
    expect(k).toContain("oyun.modSecimi ? '/mod' : '/oyuncular'");
    for (const t of ['ana-oyun-', 'ana-oyun-yakinda-', 'devam-et'])
      expect(k, t).toContain(t);
  });

  kabulV71(
    'KK-93: CLAUDE.md ve MIMARI.md "yeni oyun ekleme" adımlarında `tur`/`ortam` geçmez',
    () => {
      const mimari = oku('docs/MIMARI.md');
      const bas = mimari.indexOf('## Yeni oyun nasıl eklenir');
      expect(bas).toBeGreaterThan(-1);
      const sonraki = mimari.indexOf('\n## ', bas + 5);
      const bolum = mimari.slice(bas, sonraki < 0 ? undefined : sonraki);
      const yasak = /`tur`|`ortam`|\btur\/ortam\b|\bortam\b/;
      expect(bolum).not.toMatch(yasak);
      const claude = oku('CLAUDE.md');
      const satir = claude.split('\n').filter((s) => s.includes('src/games/'));
      expect(satir.join('\n')).not.toMatch(yasak);
      expect(claude).not.toMatch(/`tur`|`ortam`/);
    },
  );
});
