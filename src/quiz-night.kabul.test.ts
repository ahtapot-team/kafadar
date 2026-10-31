// Quiz Night Faz 1 (issue #222): kayıt, ana ekran kartı, marka kuralı, belgeler — KK-106, KK-119; marka kuralı KK-124 (v10, KK-118'in yerini alır).
// SÖZLEŞME (frontend #224 için):
//   src/games/registry.ts'te { id:'quiz-night', ad:'Quiz Night', emoji:'🧠', aktif:true, minOyuncu:1, tanitim:{ kisi:'1–12 kişi', metin } }
//   tanitim.metin üç modu (tek başına, grup, oda) anlatır (ⓘ "Nasıl oynanır", KK-91)
//   CLAUDE.md ve docs/MIMARI.md "Quiz Night"ı anlatır
// KK-124 (marka, v10): app.json, eas.json, package.json adı, kayıt ve mağaza metinlerinde hiçbir paketin adı (dizi/film, kulüp, sanatçı) geçmez.
// Ekran akışı testleri (testID/kaynak sözleşmesi) #221 tasarımı gelince eklenir.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cipEslesir, CIPLER, filtrele, kisiMetni } from './games/kategori';
import { oyunlar } from './games/registry';
import { dosyaIcerik } from './test/yardimci';

const quiz = () => oyunlar.find((o) => o.id === 'quiz-night');

describe('KK-106: ana ekranda Quiz Night kartı', () => {
  it('KK-106: kayıt: 🧠 Quiz Night, aktif, 1–12 kişi', () => {
    const q = quiz();
    expect(q).toBeDefined();
    expect(q!.ad).toBe('Quiz Night');
    expect(q!.emoji).toBe('🧠');
    expect(q!.aktif).toBe(true);
    expect(q!.minOyuncu).toBe(1);
    expect(kisiMetni(q!)).toBe('1–12 kişi');
    expect(q!.tanitim?.kisi).toBe('1–12 kişi');
  });

  it('KK-106: Tümü, 1 kişi, 2 kişi ve 3+ kişi çiplerinin hepsinde görünür', () => {
    const q = quiz()!;
    expect(CIPLER).toEqual(['tumu', '1-kisi', '2-kisi', '3-uzeri-kisi']);
    for (const c of CIPLER) {
      expect(cipEslesir(c, q)).toBe(true);
      expect(filtrele(oyunlar, c).map((o) => o.id)).toContain('quiz-night');
    }
  });

  it('KK-106: ⓘ metni üç modu da kısaca anlatır (KK-91)', () => {
    const metin = (quiz()?.tanitim?.metin ?? '').toLocaleLowerCase('tr');
    expect(metin).toMatch(/tek başına/);
    expect(metin).toMatch(/grup|tek telefon/);
    expect(metin).toMatch(/oda/);
    expect(metin.length).toBeLessThanOrEqual(400); // kısa
  });
});

describe('KK-124: marka — uygulama adı ve mağaza metinlerinde hiçbir paketin adı yok', () => {
  // v10 (KK-118'in yerini alır): content/quiz paketlerinin ad/baslik alanları + planlanan Spor/Müzik adları + yaygın örnekler.
  // Yalnız METİN alanları denetlenir (JSON anahtarları değil: app.json'daki "manifest" gibi sıradan kelimeler sorun değildir);
  // büyük/küçük harf yok sayılır, sözcük sınırı aranır ("Manifest" paketi, "manifestation" kelimesini yakalamaz).
  const paketAdlari = () =>
    readdirSync(new URL('../content/quiz/', import.meta.url))
      .filter((f) => f.endsWith('.json'))
      .flatMap((f) => {
        const p = JSON.parse(
          readFileSync(
            new URL(`../content/quiz/${f}`, import.meta.url),
            'utf8',
          ),
        ) as { ad?: string; baslik?: string };
        return [p.ad, p.baslik];
      })
      .filter((x): x is string => typeof x === 'string' && x.trim() !== '');
  const YASAK = [
    ...paketAdlari(),
    'Aşk-ı Memnu',
    'Hababam Sınıfı',
    'Prison Break',
    'Galatasaray',
    'Fenerbahçe',
    'Beşiktaş',
    'Manifest',
    'Emircan İğrek',
    'BLOK3',
    'Mabel Matiz',
    'Kurtlar Vadisi',
    'Game of Thrones',
    'Harry Potter',
    'Squid Game',
    'Stranger Things',
    'Friends',
    'Star Wars',
    'Sezen Aksu',
    'Tarkan',
  ];
  const kacis = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const metinler = (v: unknown): string[] =>
    typeof v === 'string'
      ? [v]
      : Array.isArray(v)
        ? v.flatMap(metinler)
        : v && typeof v === 'object'
          ? Object.values(v).flatMap(metinler)
          : [];
  const temiz = (ad: string, metin: string[]) => {
    for (const y of YASAK) {
      const re = new RegExp(
        `(?<![\\p{L}\\p{N}])${kacis(y.toLocaleLowerCase('tr'))}(?![\\p{L}\\p{N}])`,
        'u',
      );
      for (const m of metin)
        expect(re.test(m.toLocaleLowerCase('tr')), `${ad} içinde "${y}"`).toBe(
          false,
        );
    }
  };
  const jsonMetni = (d: string) => metinler(JSON.parse(dosyaIcerik(d)));

  it('KK-124: denetim paket adlarını gerçekten okur (içerik klasöründen en az 3 ad)', () => {
    expect(paketAdlari().length).toBeGreaterThanOrEqual(3);
  });

  it('KK-124: app.json metin alanları (ad, slug, açıklamalar) hiçbir paketin adını içermez; anahtarlar sayılmaz', () => {
    temiz('app.json', jsonMetni('app.json'));
    expect(() => temiz('x', ['Kafadar Manifest'])).toThrow(); // denetimin kendisi çalışıyor
    expect(() => temiz('x', ['manifestation', 'Manifestasyon'])).not.toThrow();
  });

  it('KK-124: eas.json, app.config.js ve package.json adı hiçbir paketin adını içermez', () => {
    if (existsSync(new URL('../eas.json', import.meta.url)))
      temiz('eas.json', jsonMetni('eas.json'));
    for (const d of ['app.config.js', 'web/index.html', 'public/index.html'])
      if (existsSync(new URL(`../${d}`, import.meta.url)))
        temiz(d, [dosyaIcerik(d)]);
    const paket = JSON.parse(dosyaIcerik('package.json')) as {
      name: string;
      description?: string;
    };
    temiz('package.json', [paket.name, paket.description ?? '']);
  });

  it('KK-124: oyun kayıtları (ad, emoji, tanıtım) hiçbir paketin adını içermez', () => {
    temiz(
      'registry',
      metinler(oyunlar.map((o) => ({ ad: o.ad, t: o.tanitim }))),
    );
  });

  it('KK-124: mağaza metni dosyası varsa (docs/magaza*, store/*) hiçbir paketin adını içermez', () => {
    for (const d of [
      'docs/magaza.md',
      'docs/magaza-metinleri.md',
      'store/magaza.md',
      'store/metadata.md',
    ])
      if (existsSync(new URL(`../${d}`, import.meta.url)))
        temiz(d, [dosyaIcerik(d)]);
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

  it('KK-119: gerçek kayıtta "1 kişi" çipi boş değildir (Quiz Night)', () => {
    expect(filtrele(oyunlar, '1-kisi').map((o) => o.id)).toEqual([
      'quiz-night',
    ]);
  });

  it("KK-119: CLAUDE.md ve docs/MIMARI.md Quiz Night'ı anlatır", () => {
    for (const d of ['CLAUDE.md', 'docs/MIMARI.md'])
      expect(dosyaIcerik(d), d).toMatch(/Quiz Night/);
  });
});
