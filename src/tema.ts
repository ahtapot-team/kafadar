// Tasarım token'ları: design/TASARIM-SISTEMI.md (B · Çıkartma). Elle renk/süre yazılmaz, buradan alınır.
const ortak = {
  kontur: '#0B0920',
  golge: '#7C6CFF',
  marka: '#FFD23F',
  marka2: '#5B8CFF',
  ok: '#3DDC84',
  nok: '#FF5A4E',
};

export const renkler = {
  koyu: {
    ...ortak,
    zemin: '#16123F',
    yuzey: '#2B2570',
    metin: '#FFF8E7',
    metinSoluk: '#B9B3E8',
    okMetin: '#3DDC84',
    nokMetin: '#FF5A4E',
  },
  acik: {
    ...ortak,
    zemin: '#FFF8E7',
    yuzey: '#FFFFFF',
    metin: '#16123F',
    metinSoluk: '#5B5585',
    okMetin: '#0F8A4B',
    nokMetin: '#D63A2F',
  },
};

export type Tema = keyof typeof renkler;
export type Renkler = (typeof renkler)[Tema];

export const bosluk = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };
export const yaricap = { cip: 12, dugme: 20, kart: 30, yuvarlak: 999 };
export const kenarBosluk = 22;
export const dokunmaAlani = 48;
export const dugmeYuksekligi = 62;

// Hareket süreleri (ms) ve easing: tasarım hareket tablosu.
export const hareket = {
  logo: 700,
  ekranGecisi: 280,
  kartCevirme: 450,
  dugmeBas: 90,
  dugmeBirak: 150,
  azaltilmisSolma: 150,
  geriSayimAdimi: 1000,
  sayiGirisi: 250,
  oySecimi: 160,
  cubukDolma: 2000,
  sticker: 300,
  sarsinti: 400,
  konfeti: 1500,
};
export const easing = {
  yay: [0.34, 1.56, 0.64, 1] as const,
  yumusak: [0.2, 0.8, 0.2, 1] as const,
  cubuk: [0.16, 1, 0.3, 1] as const,
};

// Tek aile: Bricolage Grotesque (app/_layout.tsx'te yüklenir).
export const font = {
  kalin: 'BricolageGrotesque_800ExtraBold',
  orta: 'BricolageGrotesque_500Medium',
};

export const yazi = {
  baslikXl: { fontFamily: font.kalin, fontSize: 48, letterSpacing: -1.4 },
  baslik: { fontFamily: font.kalin, fontSize: 36 },
  dugme: { fontFamily: font.kalin, fontSize: 21 },
  govde: { fontFamily: font.orta, fontSize: 17, lineHeight: 25 },
  etiket: {
    fontFamily: font.kalin,
    fontSize: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
  },
};
