// Quiz Night kategorileri (issue #262; PRD v10, frontend #264): çipler, süzgeç, başlık, not — KK-121, KK-122, KK-126.
// SÖZLEŞME (frontend #264 için) — src/games/quiz-night/arayuz.ts (React yok); KK-108'in Türk/Yabancı kuralları kalkar:
//   Kategori = 'dizi-film' | 'muzik' | 'spor'; çip = 'tumu' | Kategori
//   KATEGORI_CIPLERI = ['tumu','dizi-film','muzik','spor'] · kategoriEtiketi(çip) = 'Tümü' | 'Dizi & Film' | 'Müzik' | 'Spor'
//   gorunenKategoriCipleri(paketler: { kategori }[]): çip[]  → ['tumu', ...paketi olan kategoriler (KATEGORI_CIPLERI sırasıyla)];
//       paketi olan kategori sayısı 1 ya da 0 ise [] (çip satırı hiç görünmez)
//   kategoriSec(secili, dokunulan): çip → seçili çipe ya da 'tumu'ya dokunmak 'tumu' verir (filtre kalkar), aksi halde dokunulan
//   paketSuz(paketler, çip): kategoriye göre süzer, sıra korunur; 'tumu' hepsini verir (eski koken süzgeci kalkar)
//   paketBasligi(paket: { ad, baslik? }) = baslik varsa baslik, yoksa `Ne kadar ${ad} fanısın?`  (eski paketBasligi(ad) kalkar)
//   paketNotu(kategori): (metinler aşağıdaki testte) — eski PAKET_NOTU kalkar
//   Kart emojisi paketin kendi `emoji` alanıdır (tasarım #270: kategori emojisi yok); KK-125 emojileri quiz-kategori.kabul.test.ts
//   kokenMetni(paket: { kategori, koken? }): 'Türk' | 'Yabancı' | null — yalnız dizi-film kartında metin, diğerlerinde null
//   Ekranlar (app/quiz/paket.tsx, sonuç, paylaşım kartı, oda) başlığı SADECE paketBasligi'ndan alır (ekranlarda "fanısın" metni yok).
//   testID'ler: quiz-kategori-tumu, quiz-kategori-dizi-film, quiz-kategori-muzik, quiz-kategori-spor (eski quiz-koken-* kalkar).
//   Çipler `Cip` bileşeniyle çizilir (ui.tsx: accessibilityState selected + minHeight dokunmaAlani ≥48, KK-85). Seçim kalıcı değildir.
//   Uygulama paketi (src/oyun-ekranlari/quiz/paketler.ts) kategori, baslik, koken alanlarını taşır (uygulamaPaketi, #263).
import { describe, expect, it } from 'vitest';
import { dosyaIcerik, kaynaklar } from '../../test/yardimci';

type Kat = 'dizi-film' | 'muzik' | 'spor';
type P = {
  id: string;
  ad: string;
  kategori: Kat;
  koken?: 'tr' | 'yabanci';
  baslik?: string;
};
type Api = {
  KATEGORI_CIPLERI: string[];
  kategoriEtiketi(c: string): string;
  gorunenKategoriCipleri(p: { kategori: Kat }[]): string[];
  kategoriSec(secili: string, dokunulan: string): string;
  paketSuz<T extends { kategori: Kat }>(p: T[], cip: string): T[];
  paketBasligi(p: { ad: string; baslik?: string }): string;
  paketNotu(k: Kat): string;
  kokenMetni(p: { kategori: Kat; koken?: 'tr' | 'yabanci' }): string | null;
};
const yol = './arayuz';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as Api;

const p = (id: string, kategori: Kat, ek: Partial<P> = {}): P => ({
  id,
  ad: id.toUpperCase(),
  kategori,
  ...ek,
});

describe('KK-121: kategori çipleri ve süzgeç (saf kurallar)', () => {
  it('KK-121: çip sırası Tümü · Dizi & Film · Müzik · Spor, etiketleri yazıyla', async () => {
    const { KATEGORI_CIPLERI, kategoriEtiketi } = await yukle();
    expect(KATEGORI_CIPLERI).toEqual(['tumu', 'dizi-film', 'muzik', 'spor']);
    expect(KATEGORI_CIPLERI.map(kategoriEtiketi)).toEqual([
      'Tümü',
      'Dizi & Film',
      'Müzik',
      'Spor',
    ]);
  });

  it('KK-121: paketi olan kategorilerin çipi görünür, sıra paket sırasına bağlı değildir', async () => {
    const { gorunenKategoriCipleri } = await yukle();
    expect(
      gorunenKategoriCipleri([
        p('a', 'spor'),
        p('b', 'dizi-film'),
        p('c', 'muzik'),
      ]),
    ).toEqual(['tumu', 'dizi-film', 'muzik', 'spor']);
  });

  it('KK-121: paketi olmayan kategorinin çipi görünmez', async () => {
    const { gorunenKategoriCipleri } = await yukle();
    expect(
      gorunenKategoriCipleri([
        p('a', 'dizi-film'),
        p('b', 'spor'),
        p('c', 'spor'),
      ]),
    ).toEqual(['tumu', 'dizi-film', 'spor']);
    expect(gorunenKategoriCipleri([p('a', 'muzik'), p('b', 'spor')])).toEqual([
      'tumu',
      'muzik',
      'spor',
    ]);
  });

  it('KK-121: paketi olan tek kategori varsa (ya da hiç paket yoksa) çip satırı hiç görünmez', async () => {
    const { gorunenKategoriCipleri } = await yukle();
    expect(
      gorunenKategoriCipleri([p('a', 'dizi-film'), p('b', 'dizi-film')]),
    ).toEqual([]);
    expect(gorunenKategoriCipleri([p('a', 'spor')])).toEqual([]);
    expect(gorunenKategoriCipleri([])).toEqual([]);
  });

  it('KK-121: süzgeç kategoriye göre, sıra korunur; Tümü hepsini verir', async () => {
    const { paketSuz } = await yukle();
    const l = [
      p('a', 'muzik'),
      p('b', 'spor'),
      p('c', 'dizi-film'),
      p('d', 'muzik'),
      p('e', 'spor'),
    ];
    const id = (x: P[]) => x.map((y) => y.id);
    expect(id(paketSuz(l, 'tumu'))).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(id(paketSuz(l, 'muzik'))).toEqual(['a', 'd']);
    expect(id(paketSuz(l, 'spor'))).toEqual(['b', 'e']);
    expect(id(paketSuz(l, 'dizi-film'))).toEqual(['c']);
  });

  it("KK-121: seçili çipe ya da Tümü'ne dokunmak filtreyi kaldırır; başka çipe dokunmak onu seçer", async () => {
    const { kategoriSec } = await yukle();
    expect(kategoriSec('tumu', 'muzik')).toBe('muzik');
    expect(kategoriSec('muzik', 'spor')).toBe('spor');
    expect(kategoriSec('muzik', 'muzik')).toBe('tumu');
    expect(kategoriSec('spor', 'tumu')).toBe('tumu');
    expect(kategoriSec('tumu', 'tumu')).toBe('tumu');
  });
});

describe('KK-121: paket seçimi ekranı (kaynak sözleşmesi)', () => {
  const paketEkrani = () => dosyaIcerik('app/quiz/paket.tsx');

  it('KK-121: ekran kategori çiplerini saf kurallardan çizer; quiz-kategori-* testID, eski quiz-koken-* yok', () => {
    const k = paketEkrani();
    for (const ad of [
      'gorunenKategoriCipleri',
      'kategoriSec',
      'paketSuz',
      'KATEGORI_CIPLERI',
    ])
      expect(k, ad).toContain(ad);
    expect(k).toContain('quiz-kategori-');
    expect(k).not.toMatch(/quiz-koken|KOKEN_CIPLERI|KOKEN_TESTID/);
  });

  it('KK-121: çipler Cip bileşenidir (seçili durumu, ≥48px dokunma alanı) ve seçim kalıcı depolanmaz', () => {
    const k = paketEkrani();
    expect(k).toMatch(/<Cip\b/);
    expect(k).toMatch(/secili=\{/);
    expect(k).not.toMatch(/AsyncStorage|core\/kayit|depo/i);
    const ui = dosyaIcerik('src/ui.tsx');
    const cip = ui.slice(ui.indexOf('export function Cip'));
    expect(cip).toContain('accessibilityState={{ selected');
    expect(cip).toContain('minHeight: dokunmaAlani');
  });
});

describe('KK-122: paket kartı başlığı ve notu', () => {
  it('KK-122: başlık baslik alanıdır; yoksa "Ne kadar <ad> fanısın?"', async () => {
    const { paketBasligi } = await yukle();
    expect(paketBasligi({ ad: 'Aşk-ı Memnu' })).toBe(
      'Ne kadar Aşk-ı Memnu fanısın?',
    );
    expect(
      paketBasligi({
        ad: 'Galatasaray',
        baslik: 'Ne kadar Galatasaraylısın?',
      }),
    ).toBe('Ne kadar Galatasaraylısın?');
    expect(paketBasligi({ ad: 'Manifest', baslik: undefined })).toBe(
      'Ne kadar Manifest fanısın?',
    );
  });

  it('KK-122: kategoriye göre not', async () => {
    const { paketNotu } = await yukle();
    expect(paketNotu('dizi-film')).toBe('Resmî değildir · Spoiler içerir');
    expect(paketNotu('muzik')).toBe(
      'Resmî değildir · Sanatçıyla bağlantısı yoktur',
    );
    expect(paketNotu('spor')).toBe(
      'Resmî değildir · Kulüple bağlantısı yoktur',
    );
  });

  it('KK-122: Türk / Yabancı etiketi yalnız Dizi & Film kartında', async () => {
    const { kokenMetni } = await yukle();
    expect(kokenMetni({ kategori: 'dizi-film', koken: 'tr' })).toBe('Türk');
    expect(kokenMetni({ kategori: 'dizi-film', koken: 'yabanci' })).toBe(
      'Yabancı',
    );
    expect(kokenMetni({ kategori: 'muzik' })).toBeNull();
    expect(kokenMetni({ kategori: 'spor' })).toBeNull();
    expect(kokenMetni({ kategori: 'spor', koken: 'tr' })).toBeNull();
  });
});

describe('KK-122: aynı başlık her yerde, yalnız tema renkleri (kaynak sözleşmesi)', () => {
  const diger = () =>
    [...kaynaklar('app'), ...kaynaklar('src')].filter(
      ({ f }) =>
        !f.startsWith('src/games/quiz-night/') && !f.startsWith('src/icerik/'),
    );

  it('KK-122: "fanısın" başlığı yalnız arayuz.ts\'te üretilir; sonuç, paket ve oda ekranı paketBasligi kullanır', () => {
    for (const { f, icerik } of diger())
      // Paket ekranı başlığı "Neyin fanısın?" (#275, tasarım kategori.html) kart başlığı değildir; tek istisna.
      expect(icerik.replaceAll('Neyin fanısın?', ''), f).not.toMatch(/fanısın/);
    for (const d of [
      'app/quiz/paket.tsx',
      'src/oyun-ekranlari/quiz/sonuc.tsx',
      'src/oda-ui/quiz-final.tsx',
    ])
      expect(dosyaIcerik(d), d).toContain('paketBasligi');
  });

  it('KK-122: paket kartı notu ve Türk/Yabancı metnini kurallardan alır', () => {
    const k = dosyaIcerik('app/quiz/paket.tsx');
    for (const ad of ['paketNotu', 'kokenMetni']) expect(k, ad).toContain(ad);
    expect(k).not.toMatch(/PAKET_NOTU|kokenEtiketi/);
  });

  // Zaten geçer; v10 sonrası da geçmeli (kulüp renkleri, arma, logo, görsel yok).
  it('KK-122: paket ekranında sabit renk, görsel dosyası ya da Image yok (kulüp renkleri/arma/logo/albüm kapağı)', () => {
    const k = dosyaIcerik('app/quiz/paket.tsx');
    expect(k).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    expect(k).not.toMatch(
      /<Image\b|ImageBackground|\.png|\.jpe?g|\.webp|\.svg/,
    );
  });
});

describe('KK-126: belgeler kategorileri anlatır', () => {
  it('KK-126: CLAUDE.md ve docs/MIMARI.md dizi-film, muzik ve spor kategorilerini anlatır', () => {
    for (const d of ['CLAUDE.md', 'docs/MIMARI.md'])
      for (const k of ['dizi-film', 'muzik', 'spor'])
        expect(dosyaIcerik(d), `${d} ${k}`).toContain(k);
  });
});
