// Görsel yenileme, ana ekran (PRD v11, issue #293 → frontend #295): KK-127, KK-128, KK-129, KK-130, KK-134, KK-135.
// Arayüz test aracı yok (Semih 1C): kurallar saf fonksiyon, ekran kaynak sözleşmesiyle sınanır; görünüm GERCEK-CIHAZ-KONTROL v11 satırlarında.
// SÖZLEŞME (frontend için) — app/index.tsx testID'leri:
//   ana-izgara (2 sütunlu ızgara) · ana-oyun-<id> (ikon kartı, basılabilir) · ana-oyun-gorsel-<id> (<Image>) · oyun-kisi-<id> (ad altında kişi metni)
//   ana-oyun-yakinda-<id> (aktif olmayan) · kisi-dock (altta sabit çubuk; "Kaç kişisiniz?" + kategori-cipleri + cip-<id>) · kategori-bos
//   ust-kart (üstte tek kart) · ust-kart-etiket ("Son oynanan" | "Öne çıkan") · ust-kart-oyna ("Oyna" düğmesi)
//   Üst kart ustKartSec'ten (src/games/ust-kart.ts) gelir; ikona dokunmayla aynı yola gider; çip süzgecinden geçmez.
//   Uzun basma: onLongPress + delayLongPress 400–600 ms → TanitimKarti ("Tamam" kapatır); ana ekranda ⓘ (BilgiDugmesi) yok;
//   ipucu "Kuralları görmek için oyuna basılı tut"; accessibilityActions "Nasıl oynanır".
//   src/games/kategori.ts: kartEtiketi(oyun) = `${oyun.ad}, ${kisiMetni(oyun)}` (ekran okuyucu, KK-135).
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../kabul';
import { dosyaIcerik } from '../test/yardimci';

const kabulA = BEKLEYEN.anaEkranV11 ? it.fails : it;

// Yorum satırları sayılmaz (emoji/sabit değer taraması kodu yoklar).
const kod = (t: string) =>
  t
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((s) => s.replace(/(^|\s)\/\/.*$/, '$1'))
    .join('\n');
const ana = () => dosyaIcerik('app/index.tsx');

type Kat = {
  kartEtiketi(o: { ad: string; aktif: boolean; minOyuncu?: number }): string;
};
const yol = './kategori';
const kategori = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as Kat;

describe('KK-127: ikon ızgarası', () => {
  kabulA(
    'KK-127: iki sütunlu ızgara (ana-izgara), kayıt sırasıyla filtrele() çıktısından çizilir',
    () => {
      const k = ana();
      expect(k).toContain('ana-izgara');
      expect(k).toMatch(/numColumns=\{2\}|width:\s*'4\d%'|flexBasis:\s*'4\d%'/);
      expect(k).toMatch(/filtrele\(\s*oyunlar/);
    },
  );

  kabulA(
    'KK-127: her kartta görsel (<Image>, ana-oyun-gorsel-<id>), altında ad ve oyun-kisi-<id>',
    () => {
      const k = ana();
      expect(k).toMatch(/<Image\b/);
      expect(k).toMatch(/testID=\{`ana-oyun-gorsel-\$\{/);
      expect(k).toMatch(/\.gorsel\b/);
      expect(k).toContain('oyun-kisi-');
      expect(k).toMatch(/kisiMetni\(/);
      expect(k).toContain('ana-oyun-');
    },
  );

  kabulA("KK-127: yazılar ≥12 px; sabit renk yok (tema token'ları)", () => {
    const k = kod(ana());
    for (const m of k.matchAll(/fontSize:\s*(\d+)/g))
      expect(Number(m[1])).toBeGreaterThanOrEqual(12);
    expect(k).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    expect(k).toMatch(/<Image\b/); // bu test yeni ekranı da doğrular (kırmızı → yeşil)
  });
});

describe("KK-128: kişi çipleri alttaki dock'ta", () => {
  kabulA(
    'KK-128: kisi-dock "Kaç kişisiniz?" yazar, çipleri (kategori-cipleri) içerir ve listeden sonra gelir',
    () => {
      const k = ana();
      expect(k).toContain('kisi-dock');
      expect(k).toContain('Kaç kişisiniz?');
      expect(k).toContain('kategori-cipleri');
      expect(k.indexOf('kisi-dock')).toBeGreaterThan(k.indexOf('ana-izgara'));
      expect(k.indexOf('kategori-cipleri')).toBeGreaterThan(
        k.indexOf('ana-izgara'),
      );
    },
  );

  kabulA(
    'KK-128: dock ekrana sabit (position absolute/bottom ya da kaydırma alanının dışında)',
    () => {
      const k = ana();
      const i = k.indexOf('kisi-dock');
      expect(i).toBeGreaterThan(-1);
      const parca = k.slice(Math.max(0, i - 200), i + 800);
      expect(parca).toMatch(
        /position:\s*'absolute'|bottom:\s*0|<\/ScrollView>/,
      );
      expect(k.slice(i)).toContain('cip-');
    },
  );

  kabulA(
    'KK-128: boş süzgeçte kategori-bos metni korunur; çipler ve süzgeç kuralları KK-103/104 gibi saf fonksiyondan',
    () => {
      const k = ana();
      expect(k).toContain('kategori-bos');
      expect(k).toContain('BOS_LISTE_METNI');
      expect(k).toMatch(/cipSec\(/);
      expect(k).toMatch(/useState(<[^>]*>)?\(\s*'tumu'\s*\)/);
      expect(k).toContain('kisi-dock');
    },
  );
});

describe('KK-129: üst kart', () => {
  kabulA(
    'KK-129: ust-kart ustKartSec ile seçilir, süzülmemiş oyunlar listesinden',
    () => {
      const k = ana();
      expect(k).toContain("from '../src/games/ust-kart'");
      expect(k).toMatch(/ustKartSec\(\s*[^,]+,\s*oyunlar\s*\)/);
      for (const t of ['ust-kart', 'ust-kart-etiket', 'ust-kart-oyna'])
        expect(k, t).toContain(t);
    },
  );

  kabulA(
    'KK-129: alt satır tek satır, uzunsa üç nokta (numberOfLines={1})',
    () => {
      const k = ana();
      expect(k).toContain('altSatir');
      expect(k).toMatch(/numberOfLines=\{1\}/);
    },
  );

  kabulA(
    'KK-129: "Oyna" ikona dokunmayla aynı açma işlevini kullanır; son oynanan telefonda saklanır',
    () => {
      const k = ana();
      expect(k).toContain('Oyna');
      expect(k).toContain("oyun.modSecimi ? '/mod' : '/oyuncular'");
      expect(k).toMatch(
        /depo\.(getItem|setItem)|oku[A-Za-z]*Son|kaydet[A-Za-z]*Son|sonOynanan/i,
      );
      expect(k).toContain('ust-kart-oyna');
    },
  );
});

describe('KK-130: uzun basınca tanıtım kartı', () => {
  kabulA(
    'KK-130: ikon kartı onLongPress (≈0,5 sn) ile TanitimKarti açar; ana ekranda ⓘ yok',
    () => {
      const k = ana();
      expect(k).toMatch(/onLongPress=/);
      expect(k).toMatch(/delayLongPress=\{[456]\d\d\}/);
      expect(k).toContain('TanitimKarti');
      expect(k).not.toContain('BilgiDugmesi');
      expect(k).not.toContain('ⓘ');
    },
  );

  kabulA('KK-130: ipucu satırı ve ekran okuyucu eylemi "Nasıl oynanır"', () => {
    const k = ana();
    expect(k).toContain('Kuralları görmek için oyuna basılı tut');
    expect(k).toContain('accessibilityActions');
    expect(k).toContain('Nasıl oynanır');
    expect(k).toContain('onAccessibilityAction');
  });

  it('KK-130: oyun içi ⓘ (BilgiDugmesi) değişmez: tanıtım kutusu bileşeni durur, "Tamam" kapatır', () => {
    const t = dosyaIcerik('src/tanitim-kutusu.tsx');
    expect(t).toContain('export function BilgiDugmesi');
    expect(t).toContain('export function TanitimKarti');
    expect(t).toContain('Tamam');
  });
});

describe('KK-134: ana ekranda emoji yok', () => {
  kabulA(
    'KK-134: app/index.tsx kodunda emoji karakteri ya da oyunun `emoji` alanı yok (⚙️, 👥 dahil)',
    () => {
      const k = kod(ana());
      expect(k).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(k).not.toMatch(/\.emoji\b|\bemoji\b/);
      expect(k).toMatch(/<Image\b/); // yerine görsel gelir
    },
  );

  kabulA(
    'KK-134: ayarlar düğmesi emoji değil görsel/çizim (erişilebilir etiket "Ayarlar" kalır)',
    () => {
      const k = kod(ana());
      expect(k).toContain('accessibilityLabel="Ayarlar"');
      expect(k).not.toMatch(/\p{Extended_Pictographic}/u);
    },
  );
});

describe('KK-135: ana ekran erişilebilirliği', () => {
  kabulA('KK-135: kartEtiketi "<oyun adı>, <kişi sayısı>" okutur', async () => {
    const { kartEtiketi } = await kategori();
    expect(kartEtiketi({ ad: 'Quiz Night', aktif: true, minOyuncu: 1 })).toBe(
      'Quiz Night, 1–12 kişi',
    );
    expect(kartEtiketi({ ad: 'OK mu NOK mu', aktif: true })).toBe(
      'OK mu NOK mu, 2–12 kişi',
    );
    expect(kartEtiketi({ ad: 'Casus kim', aktif: true, minOyuncu: 3 })).toBe(
      'Casus kim, 3–12 kişi',
    );
  });

  kabulA(
    "KK-135: kart accessibilityLabel kartEtiketi'nden, görsel süs (okunmaz)",
    () => {
      const k = ana();
      expect(k).toContain('kartEtiketi(');
      expect(k).toMatch(/accessibilityLabel=\{kartEtiketi\(/);
      expect(k).toMatch(
        /accessibilityElementsHidden|importantForAccessibility="no/,
      );
    },
  );

  kabulA(
    'KK-135: dokunma alanı ≥48 (dokunmaAlani), basma animasyonu "Hareketi azalt"ta kapalı',
    () => {
      const k = ana();
      expect(k).toContain('dokunmaAlani');
      expect(k).toMatch(/isReduceMotionEnabled|useReduceMotion|hareketAzalt/);
      expect(k).toMatch(/scale/);
      expect(k).toContain('ana-izgara'); // yeni ikon kartları için
    },
  );

  it("KK-135: dokunma alanı token'ı 48 ve koyu/açık tema belirteçleri src/tema.ts'te (korunur)", () => {
    const t = dosyaIcerik('src/tema.ts');
    expect(t).toMatch(/dokunmaAlani\s*=\s*48/);
    expect(t).toMatch(/koyu/i);
    expect(t).toMatch(/acik|açık/i);
  });
});
