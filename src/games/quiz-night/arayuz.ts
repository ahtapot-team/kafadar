// Quiz Night ekran kuralları (KK-107…KK-112). React yok; ekranlar bunları çağırır, Node doğrudan çalıştırır.
import { TUR_SORU_SAYISI, unvanSec, type Zorluk } from './quiz.ts';

export type ModId = 'tek' | 'grup' | 'oda-kur' | 'oda-katil';
export const MODLAR: { id: ModId; etiket: string }[] = [
  { id: 'tek', etiket: 'Tek başına' },
  { id: 'grup', etiket: 'Tek telefonda grup' },
  { id: 'oda-kur', etiket: 'Oda kur' },
  { id: 'oda-katil', etiket: 'Odaya katıl' },
];

// Faz 1'de oda seçenekleri gizli (KK-107); oda açılınca dört mod görünür.
export const gorunenModlar = (odaAcik = false) =>
  odaAcik ? MODLAR : MODLAR.filter((m) => m.id === 'tek' || m.id === 'grup');

export const paketBasligi = (ad: string) => `Ne kadar ${ad} fanısın?`;
export const PAKET_NOTU = 'Resmî değildir · Spoiler içerir';

export type Koken = 'tr' | 'yabanci';
export type KokenCipi = 'tumu' | Koken;
export const KOKEN_CIPLERI: KokenCipi[] = ['tumu', 'tr', 'yabanci'];
export const kokenEtiketi = (k: Koken) => (k === 'tr' ? 'Türk' : 'Yabancı');
export const KOKEN_CIP_ETIKETI: Record<KokenCipi, string> = {
  tumu: 'Tümü',
  tr: 'Türk',
  yabanci: 'Yabancı',
};

export const paketSuz = <P extends { koken: Koken }>(
  paketler: readonly P[],
  cip: KokenCipi,
): P[] =>
  cip === 'tumu' ? [...paketler] : paketler.filter((p) => p.koken === cip);

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
