// v7 Oyun kategorileri (KK-79…KK-86, issue #172; uygulama #173).
// Arayüz test aracı yok (Semih 1C): çip kuralları saf fonksiyon olarak, ekran kaynak sözleşmesiyle sınanır.
// Test adları PRD KK numarasıyla başlar; issue #172'nin kendi kriterleri "Q" önekini kullanır (KK- çakışması olmasın, #168).
// Sözleşme (frontend için): src/games/kategori.ts dışa aktarır
//   CIPLER = ['tumu','2-kisi','kalabalik','cift','aile','quiz']
//   cipEslesir(cip, oyun) · gorunenCipler(oyunlar) · filtrele(oyunlar, cip) · cipSec(secili, dokunulan)
//   turEtiketi(tur) · kisiMetni(oyun)
// Oyun tipine `tur` ('oylama'|'puanlama'|'gizli-rol'|'quiz') ve isteğe bağlı `ortam` (('cift'|'aile')[]) eklenir.
// Ana ekran testID'leri: kategori-cipleri, cip-<id>, oyun-tur-<oyunId>, oyun-kisi-<oyunId>.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../kabul';
import { oyunlar } from './registry';

const kabulKategori = BEKLEYEN.kategori ? it.fails : it;

type Cip = 'tumu' | '2-kisi' | 'kalabalik' | 'cift' | 'aile' | 'quiz';
type Tur = 'oylama' | 'puanlama' | 'gizli-rol' | 'quiz';
type Ortam = 'cift' | 'aile';
type Kayit = {
  id: string;
  ad: string;
  aktif: boolean;
  minOyuncu?: number;
  tur?: Tur;
  ortam?: Ortam[];
};
type Kategori = {
  CIPLER: Cip[];
  cipEslesir(cip: Cip, oyun: Kayit): boolean;
  gorunenCipler(liste: Kayit[]): Cip[];
  filtrele(liste: Kayit[], cip: Cip): Kayit[];
  cipSec(secili: Cip, dokunulan: Cip): Cip;
  turEtiketi(tur: Tur): string;
  kisiMetni(oyun: Kayit): string;
};

// Modül henüz yokken tip denetimi kırılmasın diye dinamik yüklenir (uygulama PR'ı gerekirse statik import'a çevirir).
const yol = './kategori';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as Kategori;

const oku = (dosya: string) =>
  readFileSync(new URL(`../../${dosya}`, import.meta.url), 'utf8');

const oyun = (
  id: string,
  tur: Tur,
  ortam?: Ortam[],
  minOyuncu?: number,
  aktif = true,
): Kayit => ({ id, ad: id, aktif, tur, ortam, minOyuncu });

// Bugünkü verinin aynası (PRD v7 "Etiketler" tablosu).
const bugun = [
  oyun('ok-mu-nok', 'oylama', ['cift', 'aile']),
  oyun('10-10-ama', 'puanlama', ['cift']),
  oyun('casus-kim', 'gizli-rol', ['aile'], 3),
];

describe('KK-79: kayıt satırında tür ve ortam etiketleri', () => {
  kabulKategori(
    'Q1/KK-79: her aktif oyunun `tur` alanı geçerli, `ortam` varsa cift/aile alt kümesi',
    () => {
      for (const o of oyunlar.filter((x) => x.aktif)) {
        const k = o as unknown as Kayit;
        expect(
          ['oylama', 'puanlama', 'gizli-rol', 'quiz'],
          `${o.id}: tur`,
        ).toContain(k.tur);
        for (const e of k.ortam ?? [])
          expect(['cift', 'aile'], `${o.id}: ortam`).toContain(e);
      }
    },
  );

  kabulKategori(
    'Q2/KK-79: yeni kişi alanı yok; kişi aralığı minOyuncu ve genel üst sınırdan (12) okunur',
    () => {
      for (const o of oyunlar) {
        const anahtarlar = Object.keys(o);
        for (const yasak of [
          'kisi',
          'kisiler',
          'maksOyuncu',
          'maxOyuncu',
          'kisiSayisi',
        ])
          expect(anahtarlar, `${o.id}: ${yasak}`).not.toContain(yasak);
      }
      // Kayıt satırı sözleşmesi: etiketler kayıtta durur (tur alanı en az bir oyunda var).
      expect(oyunlar.some((o) => 'tur' in o)).toBe(true);
    },
  );
});

describe('KK-80: bugünkü 3 oyunun etiketleri', () => {
  kabulKategori('Q3/KK-80: tür ve ortam PRD tablosundaki gibi', () => {
    const al = (id: string) =>
      oyunlar.find((o) => o.id === id) as unknown as Kayit;
    expect(al('ok-mu-nok').tur).toBe('oylama');
    expect(al('ok-mu-nok').ortam).toEqual(['cift', 'aile']);
    expect(al('10-10-ama').tur).toBe('puanlama');
    expect(al('10-10-ama').ortam).toEqual(['cift']);
    expect(al('casus-kim').tur).toBe('gizli-rol');
    expect(al('casus-kim').ortam).toEqual(['aile']);
  });

  kabulKategori(
    'Q4/KK-80: kişi aralığı 2–12, 2–12, 3–12 (minOyuncu varsayılanı 2)',
    async () => {
      const { kisiMetni } = await yukle();
      const metin = Object.fromEntries(
        oyunlar.map((o) => [o.id, kisiMetni(o as unknown as Kayit)]),
      );
      expect(metin).toEqual({
        'ok-mu-nok': '2–12 kişi',
        '10-10-ama': '2–12 kişi',
        'casus-kim': '3–12 kişi',
      });
    },
  );
});

describe('KK-81: çip satırı (sıra, ilk seçim, ekran sözleşmesi)', () => {
  kabulKategori(
    'Q5/KK-81: çip sırası Tümü · 2 kişi · Kalabalık · Çift · Aile · Quiz',
    async () => {
      const { CIPLER } = await yukle();
      expect(CIPLER).toEqual([
        'tumu',
        '2-kisi',
        'kalabalik',
        'cift',
        'aile',
        'quiz',
      ]);
    },
  );

  kabulKategori(
    'Q6/KK-81: ana ekran çip satırı oyun listesinin üstünde, ilk seçim Tümü, seçim kalıcı değil',
    () => {
      const k = oku('app/index.tsx');
      expect(k).toContain('kategori-cipleri');
      expect(k).toContain('cip-');
      expect(k).toMatch(/useState(<[^>]*>)?\(\s*'tumu'\s*\)/);
      expect(k.indexOf('kategori-cipleri')).toBeLessThan(
        k.indexOf('ana-oyun-'),
      );
      expect(k).toContain("from '../src/games/kategori'");
      // Seçim uygulama kapanınca hatırlanmaz: çip durumu depoya yazılmaz.
      expect(k).not.toMatch(/depo\.setItem\([^)]*cip/i);
    },
  );
});

describe('KK-82: daraltmayan çip gizlenir', () => {
  kabulKategori(
    'Q7/KK-82: bugünkü veriyle görünen çipler Tümü · 2 kişi · Çift · Aile',
    async () => {
      const { gorunenCipler } = await yukle();
      expect(gorunenCipler(bugun)).toEqual(['tumu', '2-kisi', 'cift', 'aile']);
    },
  );

  kabulKategori(
    'Q8/KK-82: gerçek kayıt listesiyle de aynı sonuç (Kalabalık ve Quiz gizli)',
    async () => {
      const { gorunenCipler } = await yukle();
      expect(gorunenCipler(oyunlar as unknown as Kayit[])).toEqual([
        'tumu',
        '2-kisi',
        'cift',
        'aile',
      ]);
    },
  );

  kabulKategori(
    'Q9/KK-82: hiçbir oyun eşleşmeyen çip (Quiz) gizli, eşleşen oyun gelince görünür',
    async () => {
      const { gorunenCipler } = await yukle();
      expect(gorunenCipler(bugun)).not.toContain('quiz');
      const quizli = [...bugun, oyun('bilgi-yarismasi', 'quiz')];
      expect(gorunenCipler(quizli)).toContain('quiz');
    },
  );

  kabulKategori(
    'Q10/KK-82: tüm oyunların eşleştiği çip (Kalabalık) gizli; biri dışarıda kalırsa görünür',
    async () => {
      const { gorunenCipler, cipEslesir } = await yukle();
      expect(bugun.every((o) => cipEslesir('kalabalik', o))).toBe(true);
      expect(gorunenCipler(bugun)).not.toContain('kalabalik');
    },
  );

  kabulKategori(
    'Q11/KK-82: görünecek çip kalmazsa satır hiç gösterilmez (boş liste)',
    async () => {
      const { gorunenCipler } = await yukle();
      // Tek oyun: hiçbir çip daraltmaz (ya hepsi eşleşir ya hiçbiri).
      expect(gorunenCipler([oyun('tek', 'oylama', ['cift'])])).toEqual([]);
      // Aynı etiketli iki oyun: Çift hepsini, diğerleri hiçbirini eşleştirmez.
      expect(
        gorunenCipler([
          oyun('a', 'oylama', ['cift'], 3),
          oyun('b', 'oylama', ['cift'], 3),
        ]),
      ).toEqual([]);
      expect(gorunenCipler([])).toEqual([]);
    },
  );

  kabulKategori(
    'Q12/KK-82: Tümü yalnızca en az bir çip görünürken gösterilir ve her zaman ilk sıradadır',
    async () => {
      const { gorunenCipler } = await yukle();
      const liste = [oyun('a', 'oylama', ['aile']), oyun('b', 'quiz')];
      const cipler = gorunenCipler(liste);
      expect(cipler[0]).toBe('tumu');
      expect(cipler).toEqual(['tumu', 'aile', 'quiz']);
    },
  );
});

describe('KK-83: çip eşleşme kuralı ve filtreleme', () => {
  kabulKategori(
    'Q13/KK-83: eşleşme kuralları (Çip kuralları tablosu)',
    async () => {
      const { cipEslesir } = await yukle();
      const ok = bugun[0];
      const casus = bugun[2];
      expect(bugun.every((o) => cipEslesir('tumu', o))).toBe(true);
      expect(cipEslesir('2-kisi', ok)).toBe(true); // minOyuncu yok → 2
      expect(cipEslesir('2-kisi', casus)).toBe(false); // minOyuncu 3
      expect(cipEslesir('2-kisi', oyun('x', 'oylama', [], 2))).toBe(true);
      expect(cipEslesir('2-kisi', oyun('x', 'oylama', [], 1))).toBe(true);
      expect(cipEslesir('kalabalik', ok)).toBe(true); // üst sınır 12 ≥ 6
      expect(cipEslesir('cift', ok)).toBe(true);
      expect(cipEslesir('cift', casus)).toBe(false);
      expect(cipEslesir('aile', casus)).toBe(true);
      expect(cipEslesir('aile', bugun[1])).toBe(false);
      expect(cipEslesir('quiz', oyun('q', 'quiz'))).toBe(true);
      expect(cipEslesir('quiz', ok)).toBe(false);
      // ortam alanı hiç yoksa Çift/Aile eşleşmez (arkadaş grubu sayılır).
      expect(cipEslesir('cift', oyun('y', 'oylama'))).toBe(false);
      expect(cipEslesir('aile', oyun('y', 'oylama'))).toBe(false);
    },
  );

  kabulKategori(
    'Q14/KK-83: filtre yalnızca eşleşenleri bırakır, sıra değişmez',
    async () => {
      const { filtrele } = await yukle();
      const ids = (l: Kayit[]) => l.map((o) => o.id);
      expect(ids(filtrele(bugun, 'tumu'))).toEqual([
        'ok-mu-nok',
        '10-10-ama',
        'casus-kim',
      ]);
      expect(ids(filtrele(bugun, 'cift'))).toEqual(['ok-mu-nok', '10-10-ama']);
      expect(ids(filtrele(bugun, 'aile'))).toEqual(['ok-mu-nok', 'casus-kim']);
      expect(ids(filtrele(bugun, '2-kisi'))).toEqual([
        'ok-mu-nok',
        '10-10-ama',
      ]);
      expect(ids(filtrele(bugun, 'quiz'))).toEqual([]);
      const ters = [...bugun].reverse();
      expect(ids(filtrele(ters, 'aile'))).toEqual(['casus-kim', 'ok-mu-nok']);
    },
  );

  kabulKategori(
    'Q15/KK-83: "Yakında" (aktif değil) oyunlar aynı kurala uyar',
    async () => {
      const { filtrele } = await yukle();
      const liste = [
        ...bugun,
        oyun('yakinda-cift', 'oylama', ['cift'], undefined, false),
      ];
      expect(filtrele(liste, 'cift').map((o) => o.id)).toEqual([
        'ok-mu-nok',
        '10-10-ama',
        'yakinda-cift',
      ]);
      expect(filtrele(liste, 'quiz')).toEqual([]);
    },
  );

  kabulKategori(
    "Q16/KK-83: seçili çipe ya da Tümü'ne dokunmak filtreyi kaldırır; tek seçim",
    async () => {
      const { cipSec } = await yukle();
      expect(cipSec('tumu', 'cift')).toBe('cift');
      expect(cipSec('cift', 'cift')).toBe('tumu'); // seçiliye dokun → kalkar
      expect(cipSec('cift', 'tumu')).toBe('tumu');
      expect(cipSec('tumu', 'tumu')).toBe('tumu');
      expect(cipSec('cift', 'aile')).toBe('aile'); // tek seçim: öncekinin yerine geçer
    },
  );

  kabulKategori(
    'Q17/KK-83: ana ekran listeyi filtrele() ile çizer ve çipe dokunmayı cipSec() ile çözer',
    () => {
      const k = oku('app/index.tsx');
      expect(k).toMatch(/filtrele\(\s*oyunlar/);
      expect(k).toMatch(/cipSec\(/);
      expect(k).toMatch(/gorunenCipler\(\s*oyunlar/);
    },
  );
});

describe('KK-84: oyun kartında tür rozeti ve kişi sayısı', () => {
  kabulKategori(
    'Q18/KK-84: rozet metinleri Oylama / Puanlama / Gizli rol / Quiz',
    async () => {
      const { turEtiketi } = await yukle();
      expect(turEtiketi('oylama')).toBe('Oylama');
      expect(turEtiketi('puanlama')).toBe('Puanlama');
      expect(turEtiketi('gizli-rol')).toBe('Gizli rol');
      expect(turEtiketi('quiz')).toBe('Quiz');
    },
  );

  kabulKategori(
    'Q19/KK-84: kişi sayısı tanıtım kartındakiyle aynı (KK-73)',
    async () => {
      const { kisiMetni } = await yukle();
      for (const o of oyunlar.filter((x) => x.aktif && x.tanitim))
        expect(kisiMetni(o as unknown as Kayit), o.id).toBe(o.tanitim?.kisi);
    },
  );

  kabulKategori(
    'Q20/KK-84: ana ekran her kartta oyun-tur-<id> ve oyun-kisi-<id> gösterir',
    () => {
      const k = oku('app/index.tsx');
      expect(k).toContain('oyun-tur-');
      expect(k).toContain('oyun-kisi-');
      expect(k).toMatch(/turEtiketi\(/);
      expect(k).toMatch(/kisiMetni\(/);
    },
  );
});

describe('KK-85: çip erişilebilirliği ve tema', () => {
  kabulKategori(
    'Q21/KK-85: çipler ortak Cip bileşeniyle (seçili durumu + ≥48px) çizilir',
    () => {
      const k = oku('app/index.tsx');
      expect(k).toMatch(/<Cip\b/);
      expect(k).toMatch(/testID=\{`cip-\$\{/);
      expect(k).toMatch(/secili=\{/);
      const ui = oku('src/ui.tsx');
      const cip = ui.slice(ui.indexOf('export function Cip'));
      expect(cip).toContain('accessibilityState={{ selected');
      expect(cip).toContain('minHeight: dokunmaAlani');
    },
  );

  kabulKategori(
    "Q22/KK-85: çip satırı stil değerlerini tema token'larından alır (sabit renk yok)",
    () => {
      const k = oku('app/index.tsx');
      const bas = k.indexOf('kategori-cipleri');
      expect(bas).toBeGreaterThan(-1);
      const parca = k.slice(Math.max(0, bas - 400), bas + 1200);
      expect(parca).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(parca).not.toMatch(/rgba?\(/);
    },
  );
});

describe('KK-86: oyuna dokunduktan sonraki akış ve belgeler', () => {
  it('Q23/KK-86: ana ekranda oyun açma akışı (tanıtım → mod/oyuncular) korunur', () => {
    const k = oku('app/index.tsx');
    expect(k).toContain('tanitimGorulduMu');
    expect(k).toContain('tanitimGerekli');
    expect(k).toContain("oyun.modSecimi ? '/mod' : '/oyuncular'");
    for (const t of ['ana-oyun-', 'ana-oyun-yakinda-'])
      expect(k, t).toContain(t);
  });

  kabulKategori(
    'Q24/KK-86: CLAUDE.md ve MIMARI.md "yeni oyun ekleme" adımları tur ve ortam alanlarını anlatır',
    () => {
      const mimari = oku('docs/MIMARI.md');
      const bas = mimari.indexOf('## Yeni oyun nasıl eklenir');
      expect(bas).toBeGreaterThan(-1);
      const sonraki = mimari.indexOf('\n## ', bas + 5);
      const bolum = mimari.slice(bas, sonraki < 0 ? undefined : sonraki);
      expect(bolum).toMatch(/\btur\b/);
      expect(bolum).toMatch(/\bortam\b/);
      const claude = oku('CLAUDE.md');
      expect(claude).toMatch(/\btur\b/);
      expect(claude).toMatch(/\bortam\b/);
    },
  );
});
