// Quiz Night Faz 1 (issue #222): kayıt, ana ekran kartı, marka kuralı, belgeler — KK-106, KK-118, KK-119.
// SÖZLEŞME (frontend #224 için):
//   src/games/registry.ts'te { id:'quiz-night', ad:'Quiz Night', emoji:'🧠', aktif:true, minOyuncu:1, tanitim:{ kisi:'1–12 kişi', metin } }
//   tanitim.metin üç modu (tek başına, grup, oda) anlatır (ⓘ "Nasıl oynanır", KK-91)
//   CLAUDE.md ve docs/MIMARI.md "Quiz Night"ı anlatır
// KK-118 (marka): app.json, eas.json, package.json adı ve kayıt metinlerinde dizi/film adı geçmez (paket adları içerik dosyasındadır).
// Ekran akışı testleri (testID/kaynak sözleşmesi) #221 tasarımı gelince eklenir.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cipEslesir, CIPLER, filtrele, kisiMetni } from './games/kategori';
import { oyunlar } from './games/registry';
import { BEKLEYEN } from './kabul';
import { dosyaIcerik } from './test/yardimci';

const kabulQuiz = BEKLEYEN.quiz ? it.fails : it;
const quiz = () => oyunlar.find((o) => o.id === 'quiz-night');

describe('KK-106: ana ekranda Quiz Night kartı', () => {
  kabulQuiz('KK-106: kayıt: 🧠 Quiz Night, aktif, 1–12 kişi', () => {
    const q = quiz();
    expect(q).toBeDefined();
    expect(q!.ad).toBe('Quiz Night');
    expect(q!.emoji).toBe('🧠');
    expect(q!.aktif).toBe(true);
    expect(q!.minOyuncu).toBe(1);
    expect(kisiMetni(q!)).toBe('1–12 kişi');
    expect(q!.tanitim?.kisi).toBe('1–12 kişi');
  });

  kabulQuiz(
    'KK-106: Tümü, 1 kişi, 2 kişi ve 3+ kişi çiplerinin hepsinde görünür',
    () => {
      const q = quiz()!;
      expect(CIPLER).toEqual(['tumu', '1-kisi', '2-kisi', '3-uzeri-kisi']);
      for (const c of CIPLER) {
        expect(cipEslesir(c, q)).toBe(true);
        expect(filtrele(oyunlar, c).map((o) => o.id)).toContain('quiz-night');
      }
    },
  );

  kabulQuiz('KK-106: ⓘ metni üç modu da kısaca anlatır (KK-91)', () => {
    const metin = (quiz()?.tanitim?.metin ?? '').toLocaleLowerCase('tr');
    expect(metin).toMatch(/tek başına/);
    expect(metin).toMatch(/grup|tek telefon/);
    expect(metin).toMatch(/oda/);
    expect(metin.length).toBeLessThanOrEqual(400); // kısa
  });
});

describe('KK-118: marka — uygulama adı ve mağaza metinlerinde dizi/film adı yok', () => {
  // Faz 1 paketlerinin dayandığı yapımlar ve yaygın örnekler (içerik dosyaları hariç her yerde yasak).
  const YASAK = [
    'kurtlar vadisi',
    'leyla ile mecnun',
    'game of thrones',
    'breaking bad',
    'harry potter',
    'squid game',
    'stranger things',
    'friends',
    'avengers',
    'star wars',
    'lord of the rings',
    'şahsiyet',
    'ezel',
    'behzat',
    'çukur',
  ];
  const temiz = (ad: string, metin: string) => {
    const kucuk = metin.toLocaleLowerCase('tr');
    for (const y of YASAK)
      expect(kucuk, `${ad} içinde "${y}"`).not.toContain(y);
  };

  it('KK-118: app.json (ad, slug, açıklamalar) dizi/film adı içermez', () => {
    temiz('app.json', dosyaIcerik('app.json'));
  });

  it('KK-118: eas.json, app.config.js ve package.json adı dizi/film adı içermez', () => {
    for (const d of [
      'app.config.js',
      'eas.json',
      'web/index.html',
      'public/index.html',
    ])
      if (existsSync(new URL(`../${d}`, import.meta.url)))
        temiz(d, dosyaIcerik(d));
    const paket = JSON.parse(dosyaIcerik('package.json')) as {
      name: string;
      description?: string;
    };
    temiz('package.json', `${paket.name} ${paket.description ?? ''}`);
  });

  it('KK-118: oyun kayıtları (ad, emoji, tanıtım) dizi/film adı içermez', () => {
    temiz(
      'registry',
      JSON.stringify(oyunlar.map((o) => ({ ad: o.ad, t: o.tanitim }))),
    );
  });

  it('KK-118: mağaza metni dosyası varsa (docs/magaza*, store/*) dizi/film adı içermez', () => {
    for (const d of [
      'docs/magaza.md',
      'docs/magaza-metinleri.md',
      'store/magaza.md',
      'store/metadata.md',
    ])
      if (existsSync(new URL(`../${d}`, import.meta.url)))
        temiz(d, readFileSync(new URL(`../${d}`, import.meta.url), 'utf8'));
  });
});

describe('KK-119: diğer oyunlar değişmez, belgeler güncel', () => {
  it('KK-119: mevcut üç oyun kayıtta yerinde ve aktif (Quiz Night ekleme sonrası da)', () => {
    for (const id of ['ok-mu-nok', '10-10-ama', 'casus-kim'])
      expect(oyunlar.find((o) => o.id === id)?.aktif).toBe(true);
    expect(oyunlar.slice(0, 3).map((o) => o.id)).toEqual([
      'ok-mu-nok',
      '10-10-ama',
      'casus-kim',
    ]);
  });

  it('KK-119: gerçek kayıtta "1 kişi" çipi artık yalnızca minOyuncu 1 olan oyunları gösterir (örnek liste testi KK-104 değişmez)', () => {
    expect(filtrele(oyunlar, '1-kisi').map((o) => o.id)).toEqual(
      oyunlar.filter((o) => o.minOyuncu === 1).map((o) => o.id),
    );
  });

  kabulQuiz(
    'KK-119: gerçek kayıtta "1 kişi" çipi boş değildir (Quiz Night)',
    () => {
      expect(filtrele(oyunlar, '1-kisi').map((o) => o.id)).toEqual([
        'quiz-night',
      ]);
    },
  );

  kabulQuiz("KK-119: CLAUDE.md ve docs/MIMARI.md Quiz Night'ı anlatır", () => {
    for (const d of ['CLAUDE.md', 'docs/MIMARI.md'])
      expect(dosyaIcerik(d), d).toMatch(/Quiz Night/);
  });
});
