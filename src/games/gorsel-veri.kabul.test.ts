// Görsel yenileme, veri katmanı (PRD v11, issue #293 → backend #294): KK-127 (kayıt), KK-129 (saf kural), KK-132, KK-133, belgeler (KK-136).
// SÖZLEŞME (backend için):
//   Oyun kaydı (src/games/oyun.ts, registry.ts): zorunlu `gorsel: string` (uygulama içindeki görsel dosyasının depo kökünden yolu, .png/.webp),
//     isteğe bağlı `onecikan?: true` (tam bir aktif oyunda: quiz-night). `emoji` alanı AÇILIŞ ekranı (KK-97) için kalır; ana/paket ekranı onu çizmez.
//   Quiz paketi (content/quiz/*.json): zorunlu `gorsel: string` (aynı yol kuralı), `emoji` alanı YOK. quizHatalari() boş/eksik `gorsel`i bildirir
//     (hata metni "gorsel" içerir); scripts/icerik-dogrula.ts dosyanın varlığını da denetler (existsSync).
//   src/games/ust-kart.ts: ustKartSec(son, oyunlar) → { tur: 'son-oynanan' | 'one-cikan', etiket: 'Son oynanan' | 'Öne çıkan', oyun, altSatir? }
//     son = { oyunId, kisi, paketAd? } | null. Son oynanan oyun listede yoksa ya da aktif değilse öne çıkana düşer (KK-129).
//     altSatir (yalnız son-oynanan): "4 kişi · Aile paketi"; paketAd yoksa "4 kişi". Saf fonksiyon: ağ yok, sunucuya gitmez.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dosyaIcerik } from '../test/yardimci';
import { oyunlar } from './registry';

type Kayit = {
  id: string;
  ad: string;
  aktif: boolean;
  onecikan?: boolean;
  gorsel?: string;
};
type Son = { oyunId: string; kisi: number; paketAd?: string };
type Sonuc = {
  tur: string;
  etiket: string;
  oyun: Kayit;
  altSatir?: string;
};
const yol = './ust-kart';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as {
    ustKartSec(son: Son | null | undefined, liste: Kayit[]): Sonuc;
  };

const kok = (p: string) => new URL(`../../${p}`, import.meta.url);
const kayitlar = oyunlar as unknown as Kayit[];
const paketler = () =>
  readdirSync(kok('content/quiz'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({
      f,
      p: JSON.parse(readFileSync(kok(`content/quiz/${f}`), 'utf8')) as Record<
        string,
        unknown
      >,
    }));
const gorselYollari = () => [
  ...kayitlar.map((o) => o.gorsel),
  ...paketler().map(({ p }) => p.gorsel),
];

const liste: Kayit[] = [
  { id: 'a', ad: 'A', aktif: true },
  { id: 'b', ad: 'B', aktif: true, onecikan: true },
  { id: 'c', ad: 'C', aktif: false },
];

describe('KK-127: oyun kaydı ikon görseli taşır', () => {
  it('KK-127: her oyun kaydında dosyası var olan `gorsel` (png/webp) bulunur', () => {
    for (const o of kayitlar) {
      expect(typeof o.gorsel, `${o.id}: gorsel`).toBe('string');
      expect(o.gorsel, o.id).toMatch(/\.(png|webp)$/);
      expect(existsSync(kok(o.gorsel!)), `${o.id}: ${o.gorsel} yok`).toBe(true);
    }
  });

  it('KK-127: oyunların görselleri birbirinden farklıdır (her oyunun kendi nesnesi)', () => {
    const g = kayitlar.map((o) => o.gorsel);
    expect(g.every(Boolean)).toBe(true);
    expect(new Set(g).size).toBe(g.length);
  });

  it('KK-127: oyun.ts sözleşmesinde `gorsel` zorunlu alandır (isteğe bağlı değil)', () => {
    expect(dosyaIcerik('src/games/oyun.ts')).toMatch(/^\s*gorsel:\s*string/m);
  });
});

describe('KK-129: öne çıkan oyun ve üst kart seçimi', () => {
  it('KK-129: tam bir aktif oyun `onecikan` işaretlidir ve bugün Quiz Night', () => {
    const o = kayitlar.filter((x) => x.onecikan);
    expect(o.map((x) => x.id)).toEqual(['quiz-night']);
    expect(o[0].aktif).toBe(true);
  });

  it('KK-129: oynanmış oyun yoksa "Öne çıkan" (alt satır yok)', async () => {
    const { ustKartSec } = await yukle();
    for (const son of [null, undefined]) {
      const s = ustKartSec(son, liste);
      expect(s.tur).toBe('one-cikan');
      expect(s.etiket).toBe('Öne çıkan');
      expect(s.oyun.id).toBe('b');
      expect(s.altSatir).toBeUndefined();
    }
  });

  it('KK-129: oynanmış oyun varsa "Son oynanan", alt satır "<kişi> kişi · <paket>"', async () => {
    const { ustKartSec } = await yukle();
    const s = ustKartSec(
      { oyunId: 'a', kisi: 4, paketAd: 'Aile paketi' },
      liste,
    );
    expect(s.tur).toBe('son-oynanan');
    expect(s.etiket).toBe('Son oynanan');
    expect(s.oyun.id).toBe('a');
    expect(s.altSatir).toBe('4 kişi · Aile paketi');
  });

  it('KK-129: paket adı yoksa alt satır yalnız kişi sayısıdır', async () => {
    const { ustKartSec } = await yukle();
    const s = ustKartSec({ oyunId: 'a', kisi: 2 }, liste);
    expect(s.altSatir).toBe('2 kişi');
  });

  it('KK-129: son oynanan oyun kayıttan kalkmış ya da aktif değilse "Öne çıkan"a düşer', async () => {
    const { ustKartSec } = await yukle();
    for (const oyunId of ['yok', 'c']) {
      const s = ustKartSec({ oyunId, kisi: 3 }, liste);
      expect(s.tur, oyunId).toBe('one-cikan');
      expect(s.oyun.id, oyunId).toBe('b');
    }
  });

  it('KK-129: seçim kural dosyası saf; ağ çağrısı yok, sunucu son oynananı bilmez', () => {
    const k = dosyaIcerik('src/games/ust-kart.ts');
    expect(k).not.toMatch(/fetch\(|WebSocket|XMLHttpRequest/);
    const sunucu = readdirSync(kok('sunucu/src'))
      .filter((f) => f.endsWith('.ts'))
      .map((f) => dosyaIcerik(`sunucu/src/${f}`))
      .join('\n');
    expect(sunucu).not.toMatch(/son-?oynanan/i);
  });
});

describe('KK-132: Quiz paketlerinde zorunlu görsel, emoji yok', () => {
  it('KK-132: her paketin `gorsel` alanı var, dosyası var olur, `emoji` alanı kalmaz', () => {
    for (const { f, p } of paketler()) {
      expect(typeof p.gorsel, `${f}: gorsel`).toBe('string');
      expect(p.gorsel, f).toMatch(/\.(png|webp)$/);
      expect(existsSync(kok(p.gorsel as string)), `${f}: ${p.gorsel}`).toBe(
        true,
      );
      expect(Object.keys(p), `${f}: emoji`).not.toContain('emoji');
    }
  });

  it('KK-132: Müzik paketlerinin her biri kendi nesnesini taşır (megafon, kulaklık, mikrofon, nota)', () => {
    const g = ['manifest', 'emir-can-igrek', 'blok3', 'mabel-matiz'].map(
      (id) => {
        const x = paketler().find(({ p }) => p.id === id);
        expect(x, id).toBeDefined();
        return x!.p.gorsel as string;
      },
    );
    expect(g.every((x) => typeof x === 'string')).toBe(true);
    expect(new Set(g).size).toBe(4);
  });

  it('KK-132: üç Spor paketi aynı görseli (kupa) paylaşır; spor.png', () => {
    const g = ['galatasaray', 'fenerbahce', 'besiktas'].map((id) => {
      const x = paketler().find(({ p }) => p.id === id);
      expect(x, id).toBeDefined();
      return x!.p.gorsel as string;
    });
    expect(new Set(g).size).toBe(1);
    expect(g[0]).toMatch(/spor\.(png|webp)$/);
  });

  it('KK-132: eksik/boş `gorsel` doğrulayıcıda hata verir, emoji zorunlu değildir', async () => {
    const { quizHatalari } = (await import('../icerik/quiz')) as unknown as {
      quizHatalari(d: unknown): string[];
    };
    const iyi = paketler()[0].p;
    expect(quizHatalari(iyi), 'gerçek paket').toEqual([]);
    const eksik = Object.fromEntries(
      Object.entries(iyi).filter(([k]) => k !== 'gorsel'),
    );
    expect(quizHatalari(eksik).join(' ')).toMatch(/gorsel/);
    expect(quizHatalari({ ...iyi, gorsel: '' }).join(' ')).toMatch(/gorsel/);
    const emojisiz = Object.fromEntries(
      Object.entries(iyi).filter(([k]) => k !== 'emoji'),
    );
    expect(quizHatalari(emojisiz)).toEqual([]);
  });

  it('KK-132: içerik denetleyicisi (npm run icerik) `gorsel` dosyasının varlığını da bakar', () => {
    const s = dosyaIcerik('scripts/icerik-dogrula.ts');
    const q = dosyaIcerik('src/icerik/quiz.ts');
    expect(s + q).toMatch(/gorsel/);
    expect(s + q).toMatch(/existsSync/);
  });

  it('KK-132: uygulama paketi (QuizPaket) `gorsel` taşır, `emoji` taşımaz', () => {
    const t = dosyaIcerik('src/oyun-ekranlari/quiz/paketler.ts');
    expect(t).toMatch(/^\s*gorsel:\s*string/m);
    expect(t).not.toMatch(/^\s*emoji:/m);
    expect(dosyaIcerik('src/icerik/quiz.ts')).not.toMatch(/\bemoji\b/);
  });
});

describe('KK-133: görseller bizim, hafif, uygulamayla gelir', () => {
  it('KK-133: her görsel ≤50 KB, toplam ≤1 MB (tekil dosyalar)', () => {
    const yollar = [...new Set(gorselYollari())];
    expect(yollar.length).toBeGreaterThanOrEqual(8); // 4 oyun + paket nesneleri
    let toplam = 0;
    for (const y of yollar) {
      expect(typeof y).toBe('string');
      const b = statSync(kok(y as string)).size;
      expect(b, `${y} ${b} bayt`).toBeLessThanOrEqual(50 * 1024);
      toplam += b;
    }
    expect(toplam).toBeLessThanOrEqual(1024 * 1024);
  });

  it('KK-133: görseller uygulama paketinde (design/ dışında, ağdan değil)', () => {
    for (const y of gorselYollari()) {
      expect(typeof y).toBe('string');
      expect(y as string).not.toMatch(/^(https?:)?\/\//);
      expect(y as string).not.toMatch(/^design\//);
    }
  });

  it('KK-133: LISANS.md her görselin kaynağını yazar (dosya adı geçer), Three.js kendi çizimimiz', () => {
    const kokKlasor = kok('design/290-gorsel-yenileme');
    const lisanslar = readdirSync(kokKlasor, { recursive: true })
      .map(String)
      .filter((f) => f.split('/').pop() === 'LISANS.md')
      .map((f) =>
        readFileSync(
          new URL(`design/290-gorsel-yenileme/${f}`, kok('')),
          'utf8',
        ),
      )
      .join('\n')
      .toLocaleLowerCase('tr');
    expect(lisanslar).toContain('three.js');
    for (const y of new Set(gorselYollari())) {
      const ad = (y as string)
        .split('/')
        .pop()!
        .replace(/\.(png|webp)$/, '');
      expect(lisanslar, ad).toContain(ad.toLocaleLowerCase('tr'));
    }
  });
});

describe('KK-133: yeni bağımlılık ve harici kaynak yok (şimdiden geçerli, korunur)', () => {
  it('KK-133: package.json 3B/ikon kütüphanesi eklemez', () => {
    const p = JSON.parse(dosyaIcerik('package.json')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const adlar = Object.keys({ ...p.dependencies, ...p.devDependencies });
    for (const a of adlar)
      expect(a, a).not.toMatch(
        /^(three|expo-gl|@react-three\/.+|@expo\/vector-icons|react-native-vector-icons|lottie-react-native)$/,
      );
  });

  it('KK-133: Three.js ve Google Fonts yalnız design/ HTML dosyalarında (uygulama kaynağında yok)', () => {
    for (const klasor of ['app', 'src']) {
      const dosyalar = readdirSync(kok(klasor), { recursive: true })
        .map(String)
        .filter((f) => /\.(tsx?|json)$/.test(f) && !f.includes('.test.'));
      for (const f of dosyalar) {
        const t = readFileSync(kok(`${klasor}/${f}`), 'utf8');
        expect(t, `${klasor}/${f}`).not.toMatch(
          /from ['"]three['"]|fonts\.googleapis|cdnjs\.cloudflare/,
        );
      }
    }
  });
});

describe('KK-136: belgeler görseli anlatır', () => {
  it('KK-136: MIMARI "Yeni oyun nasıl eklenir" ve CLAUDE.md `gorsel` alanını anlatır', () => {
    const m = dosyaIcerik('docs/MIMARI.md');
    const bas = m.indexOf('## Yeni oyun nasıl eklenir');
    expect(bas).toBeGreaterThan(-1);
    const son = m.indexOf('\n## ', bas + 5);
    expect(m.slice(bas, son < 0 ? undefined : son)).toMatch(/`gorsel`/);
    expect(dosyaIcerik('CLAUDE.md')).toMatch(/`gorsel`/);
  });

  it('KK-136: MIMARI ve CLAUDE.md yeni paket adımında görseli ve `emoji` alanının kalktığını yazar', () => {
    const t = dosyaIcerik('docs/MIMARI.md') + dosyaIcerik('CLAUDE.md');
    expect(t).not.toMatch(/paket[^\n]{0,60}`emoji`/i);
    expect(t).toMatch(/paket[^\n]{0,200}gorsel|gorsel[^\n]{0,200}paket/i);
  });
});
