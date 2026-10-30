// v8.1 (KK-101, KK-102, KK-105) — issue #205. Çip kuralları (KK-103, KK-104): src/games/kategori.kabul.test.ts.
// Arayüz test aracı yok (Semih 1C): kaynak sözleşmesi testleri; telefonda yazı tipi Expo Go'da insanlarca doğrulanır.
// SÖZLEŞME (frontend için):
//   KK-101: src/acilis/ekran.tsx'te "Kafadar" logosu (testID acilis-ad) `fontHazir` olmadan çizilmez
//           (`{fontHazir && …}`, `fontHazir ? … : null` ya da opacity/görünürlük `fontHazir`a bağlı);
//           açılış ve ana ekran logosu aynı `<Yazi tur="baslikXl">` kullanır (aynı yazı tipi ve kalınlık).
//   KK-102: app/index.tsx'te "Bir oyun seç, telefonu ele ver." yok; logo ile çip satırı arasında yerine yazı gelmez.
//   KK-105: CLAUDE.md ve docs/MIMARI.md kişi çiplerini "Tümü · 1 kişi · 2 kişi · 3+ kişi" olarak anlatır.
import { describe, expect, it } from 'vitest';
import { dosyaIcerik } from './test/yardimci';

// #209 (iOS, KK-101): opaklıkla gizlemek yetmez; Text yazı tipi yokken mount edilirse iOS fontu sonradan uygulamaz.
// SÖZLEŞME: src/acilis/ekran.tsx'te acilis-ad, acilis-soz, acilis-soz-oyun `{fontHazir && (…)}` / `{fontHazir ? (…) : null}`
//   bloğunun İÇİNDE (fontHazir=false iken ağaçta yok) ya da `if (!fontHazir) return …` ile erken çıkıştan sonra çizilir.

// `bas` indeksindeki `{`nin eşleşen `}` indeksi.
const kapanis = (s: string, bas: number) => {
  let d = 0;
  for (let i = bas; i < s.length; i++) {
    if (s[i] === '{') d++;
    else if (s[i] === '}' && --d === 0) return i;
  }
  return s.length;
};

// testID, fontHazir koşullu bir JSX bloğunun içinde mi?
const fontKosullu = (kaynak: string, testID: string) => {
  const i = kaynak.indexOf(`testID="${testID}"`);
  if (i < 0) return false;
  const erken = kaynak.search(/if\s*\(\s*!fontHazir\s*\)\s*return/);
  if (erken >= 0 && erken < i) return true;
  for (const m of kaynak.matchAll(/\{\s*fontHazir\s*(?:&&|\?)/g)) {
    const bas = m.index ?? 0;
    if (bas < i && i < kapanis(kaynak, bas)) return true;
  }
  return false;
};

describe('KK-101: açılış logosu yazı tipi hazır olmadan çizilmez', () => {
  it('KK-101: acilis-ad, söz ve oyun adı fontHazir=false iken ağaçta yok (opaklıkla gizleme yetmez, #209)', () => {
    const e = dosyaIcerik('src/acilis/ekran.tsx');
    for (const id of ['acilis-ad', 'acilis-soz', 'acilis-soz-oyun'])
      expect(fontKosullu(e, id), id).toBe(true);
    // Platformdan bağımsız (iOS ve Android): Platform.OS'a bağlı çözüm kabul edilmez.
    expect(e).not.toMatch(/Platform\.(OS|select)/);
  });

  it('KK-101: denetleyici doğru çalışır (koşullu mount geçer, opacity yakalanır)', () => {
    const mount = '<V>{fontHazir && (<Y testID="a">x</Y>)}</V>';
    const tern = '<V>{fontHazir ? (<Y testID="a">x</Y>) : null}</V>';
    const opak =
      '<V style={{ opacity: fontHazir ? 1 : 0 }}><Y testID="a">x</Y></V>';
    const disinda = '<V>{fontHazir && (<Y>y</Y>)}<Y testID="a">x</Y></V>';
    expect(fontKosullu(mount, 'a')).toBe(true);
    expect(fontKosullu(tern, 'a')).toBe(true);
    expect(fontKosullu(opak, 'a')).toBe(false);
    expect(fontKosullu(disinda, 'a')).toBe(false);
  });

  it('KK-101: açılış ve ana ekran logosu aynı yazı tipi tokenını kullanır (baslikXl: Bricolage 800)', () => {
    const e = dosyaIcerik('src/acilis/ekran.tsx');
    const a = dosyaIcerik('app/index.tsx');
    expect(e).toMatch(/<Yazi\s+tur="baslikXl"[^>]*testID="acilis-ad"/s);
    expect(a).toMatch(/<Yazi tur="baslikXl"[^>]*>\s*Kafadar\s*<\/Yazi>/);
    expect(dosyaIcerik('src/tema.ts')).toMatch(
      /baslikXl:\s*\{\s*fontFamily:\s*font\.kalin/,
    );
  });

  it('KK-101: yazı tipi yüklenemezse açılış takılmaz (fontHazir = yüklendi ya da hata; KK-96)', () => {
    const l = dosyaIcerik('app/_layout.tsx');
    expect(l).toMatch(/fontHazir=\{fontHazir \|\| !!fontHatasi\}/);
  });
});

describe('KK-102: ana ekranda alt yazı yok', () => {
  it('KK-102: "Bir oyun seç, telefonu ele ver." kaynakta geçmez', () => {
    expect(dosyaIcerik('app/index.tsx')).not.toMatch(/Bir oyun seç/);
  });

  it('KK-102: logo ile çip satırı arasında başka yazı gelmez (<Yazi> yok)', () => {
    const k = dosyaIcerik('app/index.tsx');
    const logo = k.indexOf('<Logo />');
    const cipler = k.indexOf('testID="kategori-cipleri"');
    expect(logo).toBeGreaterThan(-1);
    expect(cipler).toBeGreaterThan(logo);
    expect(k.slice(logo, cipler)).not.toMatch(/<Yazi\b|<Text\b/);
  });
});

describe('KK-105: diğer akışlar ve belgeler', () => {
  it('KK-105: CLAUDE.md ve MIMARI.md çipleri "Tümü · 1 kişi · 2 kişi · 3+ kişi" diye anlatır, eski çip adları kalmaz', () => {
    const mimari = dosyaIcerik('docs/MIMARI.md');
    const claude = dosyaIcerik('CLAUDE.md');
    expect(mimari).toContain('Tümü · 1 kişi · 2 kişi · 3+ kişi');
    for (const [ad, d] of [
      ['MIMARI', mimari],
      ['CLAUDE', claude],
    ])
      expect(d, ad).not.toMatch(/3–5 kişi|6\+ kişi/);
  });

  it('KK-105: açılış (KK-94…100), kart kişi sayısı (KK-89) ve ⓘ (KK-91) testleri yerinde (silinmedi)', () => {
    for (const d of [
      'src/acilis.kabul.test.ts',
      'src/icerik/soz.kabul.test.ts',
      'src/games/kategori.kabul.test.ts',
    ])
      expect(dosyaIcerik(d).length, d).toBeGreaterThan(500);
    expect(dosyaIcerik('src/games/kategori.kabul.test.ts')).toContain('KK-89:');
  });
});
