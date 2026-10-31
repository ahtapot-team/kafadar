// Quiz Night ekran kuralları (KK-107…KK-112). React yok; ekranlar bunları çağırır, Node doğrudan çalıştırır.
import { TUR_SORU_SAYISI, unvanSec, type Zorluk } from './quiz.ts';

export type ModId = 'tek' | 'grup' | 'oda-kur' | 'oda-katil';
export const MODLAR: { id: ModId; etiket: string }[] = [
  { id: 'tek', etiket: 'Tek başına' },
  { id: 'grup', etiket: 'Tek telefonda grup' },
  { id: 'oda-kur', etiket: 'Oda kur' },
  { id: 'oda-katil', etiket: 'Odaya katıl' },
];

// Faz 2'de oda seçenekleri varsayılan olarak görünür (KK-107); `false` yalnız tek telefon modlarını verir.
export const gorunenModlar = (odaAcik = true) =>
  odaAcik ? MODLAR : MODLAR.filter((m) => m.id === 'tek' || m.id === 'grup');

export type Koken = 'tr' | 'yabanci';
export type Kategori = 'dizi-film' | 'muzik' | 'spor';
export type KategoriCipi = 'tumu' | Kategori;

// Başlık `baslik` varsa o, yoksa "Ne kadar <ad> fanısın?" (KK-122); ekranlar başlığı yalnız buradan alır.
export const paketBasligi = (p: { ad: string; baslik?: string }) =>
  p.baslik ?? `Ne kadar ${p.ad} fanısın?`;

export const KATEGORI_CIPLERI: KategoriCipi[] = [
  'tumu',
  'dizi-film',
  'muzik',
  'spor',
];
const ETIKET: Record<KategoriCipi, string> = {
  tumu: 'Tümü',
  'dizi-film': 'Dizi & Film',
  muzik: 'Müzik',
  spor: 'Spor',
};
export const kategoriEtiketi = (c: KategoriCipi) => ETIKET[c];

// Paketi olan kategorilerin çipleri; 0 ya da 1 kategori varsa satır hiç görünmez (KK-121).
export const gorunenKategoriCipleri = (
  paketler: readonly { kategori: Kategori }[],
): KategoriCipi[] => {
  const var_ = KATEGORI_CIPLERI.filter(
    (c) => c !== 'tumu' && paketler.some((p) => p.kategori === c),
  );
  return var_.length < 2 ? [] : ['tumu', ...var_];
};

// Seçili çipe ya da Tümü'ne dokunmak filtreyi kaldırır.
export const kategoriSec = (
  secili: KategoriCipi,
  dokunulan: KategoriCipi,
): KategoriCipi => (dokunulan === secili ? 'tumu' : dokunulan);

export const paketSuz = <P extends { kategori: Kategori }>(
  paketler: readonly P[],
  cip: KategoriCipi,
): P[] =>
  cip === 'tumu' ? [...paketler] : paketler.filter((p) => p.kategori === cip);

const NOT_ORTAK = 'Resmî değildir · ';
const NOT: Record<Kategori, string> = {
  'dizi-film': 'Spoiler içerir',
  muzik: 'Sanatçıyla bağlantısı yoktur',
  spor: 'Kulüple bağlantısı yoktur',
};
export const paketNotu = (k: Kategori) => NOT_ORTAK + NOT[k];

// Türk / Yabancı yalnız Dizi & Film kartında.
export const kokenMetni = (p: { kategori: Kategori; koken?: Koken }) =>
  p.kategori !== 'dizi-film' || !p.koken
    ? null
    : p.koken === 'tr'
      ? 'Türk'
      : 'Yabancı';

export const ilerlemeMetni = (indeks0: number, toplam = TUR_SORU_SAYISI) =>
  `${indeks0 + 1}/${toplam}`;

export const zorlukEtiketi = (z: Zorluk) =>
  z === 'kolay' ? 'Kolay' : z === 'orta' ? 'Orta' : 'Zor';

export type SikRengi = 'ok' | 'nok' | 'notr';

// Tek başına: cevaptan önce hepsi nötr; sonra doğru ok, yanlış seçilen nok.
export const sikRengi = (
  sik: number,
  dogru: number,
  secilen: number | null,
): SikRengi =>
  secilen === null
    ? 'notr'
    : sik === dogru
      ? 'ok'
      : sik === secilen
        ? 'nok'
        : 'notr';

// İlk cevap kilitlenir; 0 da kilitli sayılır.
export const cevapKilitle = (mevcut: number | null, yeni: number) =>
  mevcut === null ? yeni : mevcut;

export const SONRAKI_BEKLEME_MS = 1500;

// Grup: "Cevabı göster"e kadar hiçbir şık farklı görünmez (KK-112).
export const grupSikRengi = (
  sik: number,
  dogru: number,
  gosterildi: boolean,
): SikRengi => (gosterildi && sik === dogru ? 'ok' : 'notr');

export const sonucMetni = (puan: number, toplam = TUR_SORU_SAYISI) =>
  `${puan}/${toplam}`;

type SonucOyuncu = { ad: string; dogru: number; sira: number };

export const sonucSatirlari = (
  sonuc: readonly SonucOyuncu[],
  unvanlar: readonly string[],
) =>
  sonuc.map((o) => ({
    ad: o.ad,
    puan: sonucMetni(o.dogru),
    unvan: unvanSec(unvanlar, o.dogru),
    sira: o.sira,
    birinci: o.sira === 1,
  }));

// Paylaşım kartı: grupta birinci(ler), tek başına oyuncunun kendisi. Soru/cevap ve ortalama yok (KK-111).
export function paylasimKarti(g: {
  mod: 'tek' | 'grup';
  paket: string;
  sonuc: readonly SonucOyuncu[];
  unvanlar: readonly string[];
}) {
  const satirlar = sonucSatirlari(g.sonuc, g.unvanlar);
  const birinciler = satirlar.filter((s) => s.birinci);
  const hedef = g.mod === 'grup' ? birinciler : satirlar.slice(0, 1);
  const ilk = hedef[0];
  return {
    paket: g.paket,
    kupa: g.mod === 'grup',
    adlar: hedef.map((s) => s.ad),
    puan: ilk.puan,
    unvan: ilk.unvan,
  };
}

// Oda (Faz 2, KK-113): sunucu saatine göre ince sayaç; son 5 sn'de titrer, kırmızı yok.
export const QUIZ_ODA_SURE_MS = 20_000;
export const odaSayac = (kalanMs: number) => {
  const k = Math.min(QUIZ_ODA_SURE_MS, Math.max(0, kalanMs));
  return {
    oran: k / QUIZ_ODA_SURE_MS,
    saniye: Math.ceil(k / 1000),
    titret: k > 0 && k <= 5000,
  };
};

// Açıklamadan önce (dogru null) yalnız kendi şıkkım kilitli; sonra doğru yeşil, yanlış seçtiğim kırmızı.
export const odaSikRengi = (
  sik: number,
  dogru: number | null,
  benim: number | null,
): SikRengi | 'kilitli' =>
  dogru === null
    ? sik === benim
      ? 'kilitli'
      : 'notr'
    : sik === dogru
      ? 'ok'
      : sik === benim
        ? 'nok'
        : 'notr';
