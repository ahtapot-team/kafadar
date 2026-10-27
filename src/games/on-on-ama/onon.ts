// 10/10 ama (tek telefon, açık puan): saf, tohumlu, serileştirilebilir durum makinesi (KK-61, KK-22).
// Date.now, Math.random, ağ ve React yok; isle() girdiyi değiştirmez.
import type { Deste } from '../../core/deste';
import { karistir, rngOlustur } from '../../core/rng';

export const PUAN_MIN = 0;
export const PUAN_MAKS = 10;
export const BOLUNDU_FARKI = 8; // uçlar arası fark ≥ 8 ve oybirliği değil → "Tam bölündünüz" (KK-57)

// 'puan': puanlar girilir (açıklamaya kadar değiştirilebilir), 'acik': sonuç görünür,
// 'desteBitti': "Karıştırıp baştan?", 'bitti': oturum sonu.
export type Durum = {
  asama: 'puan' | 'acik' | 'desteBitti' | 'bitti';
  deste: { deck_id: string; version: number };
  kartlar: { id: string; text: string }[]; // karışık
  sira: number;
  tamamlanan: number; // bitirilen/atlanan kart sayısı
  uzunluk: 10 | 20 | null;
  tohum: number;
  karisim: number;
  oyuncular: string[];
  puanlar: Record<string, number>; // geçerli kartın puanları (0–10 tam sayı)
  gecmis: { kartId: string; puanlar: Record<string, number> }[]; // açıklanmış kartlar
};

export type Olay =
  | { tip: 'puan'; oyuncu: string; puan: number } // yalnızca 'puan' aşamasında; son girilen geçerli; geçersiz yok sayılır
  | { tip: 'goster' } // herkes puan vermeden yok sayılır
  | { tip: 'sonraki' } // 'acik' aşamasından sonraki karta
  | { tip: 'atla' } // 'puan' veya 'acik' aşamasından, kartı geçmişe yazmadan
  | { tip: 'bitir' }
  | { tip: 'karistir' } // 'desteBitti' aşamasında baştan karıştırır
  | { tip: 'oyuncuEkle'; ad: string }
  | { tip: 'oyuncuCikar'; ad: string };

export type OyunSecenekleri = {
  oyuncular: string[];
  deste: Deste;
  uzunluk: 10 | 20 | null;
  tohum: number;
};

export type UcPuan = { puan: number; kisiler: string[] }; // oyuncu sırasıyla

// 'acik' aşaması: bir kartın açıklaması (KK-57).
export type Ozet = {
  ortalama: number; // bir ondalığa yuvarlanmış (örn. 5.7)
  enDusuk: UcPuan;
  enYuksek: UcPuan;
  oybirligi: boolean; // herkes aynı puanı verdi
  bolundu: boolean; // en yüksek − en düşük ≥ BOLUNDU_FARKI
};

// Oturum sonu ödülleri (KK-58). Yalnızca hâlâ oyunda olanlar ve açıklanmış kartlardan hesaplanır.
export type Oduller = {
  enAcimasiz: string[]; // verdiği puanların ortalaması en düşük olan(lar); herkes eşitse boş
  melekKalpli: string[]; // ortalaması en yüksek olan(lar); herkes eşitse boş
  ruhIkizleri: [string, string][]; // ortak kartlarda puan farkının ortalaması en küçük ikili(ler); ikili oyuncu sırasıyla
};

export function yeniOyun(s: OyunSecenekleri): Durum {
  return {
    asama: 'puan',
    deste: { deck_id: s.deste.deck_id, version: s.deste.version },
    kartlar: karistir(s.deste.cards, rngOlustur(s.tohum)),
    sira: 0,
    tamamlanan: 0,
    uzunluk: s.uzunluk,
    tohum: s.tohum,
    karisim: 0,
    oyuncular: [...s.oyuncular],
    puanlar: {},
    gecmis: [],
  };
}

export const gecerliKart = (d: Durum) => d.kartlar[d.sira];

const puanMi = (p: unknown): p is number =>
  typeof p === 'number' &&
  Number.isInteger(p) &&
  p >= PUAN_MIN &&
  p <= PUAN_MAKS;

// Herkes puan verince true (0 da geçerli puandır).
export const gosterAktif = (d: Durum) =>
  d.asama === 'puan' && d.oyuncular.every((o) => puanMi(d.puanlar[o]));

// Yalnızca 'acik' aşamasında anlamlı.
export function ozet(d: Durum): Ozet {
  const verenler = d.oyuncular.filter((o) => d.puanlar[o] !== undefined);
  const puanlar = verenler.map((o) => d.puanlar[o]);
  if (puanlar.length === 0)
    return {
      ortalama: 0,
      enDusuk: { puan: 0, kisiler: [] },
      enYuksek: { puan: 0, kisiler: [] },
      oybirligi: false,
      bolundu: false,
    };
  const en = (puan: number): UcPuan => ({
    puan,
    kisiler: verenler.filter((o) => d.puanlar[o] === puan),
  });
  const dusuk = Math.min(...puanlar);
  const yuksek = Math.max(...puanlar);
  const oybirligi = dusuk === yuksek;
  return {
    ortalama:
      Math.round((puanlar.reduce((a, b) => a + b, 0) * 10) / puanlar.length) /
      10,
    enDusuk: en(dusuk),
    enYuksek: en(yuksek),
    oybirligi,
    bolundu: !oybirligi && yuksek - dusuk >= BOLUNDU_FARKI,
  };
}

// Kesirleri tam sayıyla karşılaştırır (ondalık yuvarlama hatası olmasın): a/b ile c/d.
type Oran = { s: number; n: number }; // toplam, adet
const kucukMu = (a: Oran, b: Oran) => a.s * b.n < b.s * a.n;
const esitMi = (a: Oran, b: Oran) => a.s * b.n === b.s * a.n;

// Oran listesinden en küçüğü (ya da en büyüğü) olanların anahtarları.
function uclar<T>(liste: { k: T; o: Oran }[], enKucuk: boolean): T[] {
  if (liste.length === 0) return [];
  let en = liste[0].o;
  for (const { o } of liste)
    if (enKucuk ? kucukMu(o, en) : kucukMu(en, o)) en = o;
  return liste.filter(({ o }) => esitMi(o, en)).map(({ k }) => k);
}

// Yalnızca hâlâ oyunda olanlar ve açıklanmış kartlardan hesaplanır (KK-58).
export function oduller(d: Durum): Oduller {
  const ort: { k: string; o: Oran }[] = [];
  for (const ad of d.oyuncular) {
    const p = d.gecmis.map((g) => g.puanlar[ad]).filter((x) => x !== undefined);
    if (p.length > 0)
      ort.push({ k: ad, o: { s: p.reduce((a, b) => a + b, 0), n: p.length } });
  }
  const hepsiEsit = ort.every(({ o }) => esitMi(o, ort[0].o));
  const ikizler: { k: [string, string]; o: Oran }[] = [];
  d.oyuncular.forEach((a, i) =>
    d.oyuncular.slice(i + 1).forEach((b) => {
      const ortak = d.gecmis.filter(
        (g) => g.puanlar[a] !== undefined && g.puanlar[b] !== undefined,
      );
      if (ortak.length > 0)
        ikizler.push({
          k: [a, b],
          o: {
            s: ortak.reduce(
              (t, g) => t + Math.abs(g.puanlar[a] - g.puanlar[b]),
              0,
            ),
            n: ortak.length,
          },
        });
    }),
  );
  return {
    enAcimasiz: hepsiEsit ? [] : uclar(ort, true),
    melekKalpli: hepsiEsit ? [] : uclar(ort, false),
    ruhIkizleri: uclar(ikizler, true),
  };
}

// Sonraki karta geçer: tur uzunluğu dolduysa oturum biter, deste tükendiyse karıştırma sorulur.
function ilerle(d: Durum): Durum {
  const tamamlanan = d.tamamlanan + 1;
  const temiz = { ...d, tamamlanan, puanlar: {} };
  if (d.uzunluk !== null && tamamlanan >= d.uzunluk)
    return { ...temiz, asama: 'bitti' };
  if (d.sira + 1 >= d.kartlar.length) return { ...temiz, asama: 'desteBitti' };
  return { ...temiz, asama: 'puan', sira: d.sira + 1 };
}

export function isle(d: Durum, olay: Olay): Durum {
  switch (olay.tip) {
    case 'puan':
      if (
        d.asama !== 'puan' ||
        !d.oyuncular.includes(olay.oyuncu) ||
        !puanMi(olay.puan)
      )
        return d;
      return { ...d, puanlar: { ...d.puanlar, [olay.oyuncu]: olay.puan } };
    case 'goster':
      if (!gosterAktif(d)) return d;
      return {
        ...d,
        asama: 'acik',
        gecmis: [
          ...d.gecmis,
          { kartId: gecerliKart(d).id, puanlar: { ...d.puanlar } },
        ],
      };
    case 'sonraki':
      return d.asama === 'acik' ? ilerle(d) : d;
    case 'atla':
      return d.asama === 'puan' || d.asama === 'acik' ? ilerle(d) : d;
    case 'bitir':
      return { ...d, asama: 'bitti' };
    case 'karistir':
      if (d.asama !== 'desteBitti') return d;
      return {
        ...d,
        asama: 'puan',
        sira: 0,
        karisim: d.karisim + 1,
        kartlar: karistir(d.kartlar, rngOlustur(d.tohum + d.karisim + 1)),
      };
    case 'oyuncuEkle': {
      const ad = olay.ad.trim();
      return !ad || d.oyuncular.includes(ad)
        ? d
        : { ...d, oyuncular: [...d.oyuncular, ad] };
    }
    case 'oyuncuCikar':
      return {
        ...d,
        oyuncular: d.oyuncular.filter((o) => o !== olay.ad),
        puanlar: Object.fromEntries(
          Object.entries(d.puanlar).filter(([o]) => o !== olay.ad),
        ),
      };
  }
}

const nesne = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const puanlarMi = (x: unknown): x is Record<string, number> =>
  nesne(x) && Object.values(x).every(puanMi);

// Kayıttan okunan durumun şeması (KK-14): sürüm doğru olsa bile alanlar eksik/hatalıysa false döner;
// çağıran kaydı siler ve yeni oyuna / ana ekrana düşer, arayüz çökmez.
export function durumGecerliMi(d: unknown): d is Durum {
  if (!nesne(d)) return false;
  const { kartlar, sira, oyuncular } = d;
  return (
    ['puan', 'acik', 'desteBitti', 'bitti'].includes(d.asama as string) &&
    nesne(d.deste) &&
    typeof d.deste.deck_id === 'string' &&
    typeof d.deste.version === 'number' &&
    Array.isArray(kartlar) &&
    kartlar.length > 0 &&
    kartlar.every(
      (k) => nesne(k) && typeof k.id === 'string' && typeof k.text === 'string',
    ) &&
    Number.isInteger(sira) &&
    (sira as number) >= 0 &&
    (sira as number) < kartlar.length &&
    Number.isInteger(d.tamamlanan) &&
    (d.tamamlanan as number) >= 0 &&
    (d.uzunluk === null || d.uzunluk === 10 || d.uzunluk === 20) &&
    typeof d.tohum === 'number' &&
    Number.isInteger(d.karisim) &&
    Array.isArray(oyuncular) &&
    oyuncular.length > 0 &&
    oyuncular.every((o) => typeof o === 'string' && o !== '') &&
    new Set(oyuncular).size === oyuncular.length &&
    puanlarMi(d.puanlar) &&
    Object.keys(d.puanlar).every((o) => (oyuncular as string[]).includes(o)) &&
    Array.isArray(d.gecmis) &&
    d.gecmis.every(
      (g) => nesne(g) && typeof g.kartId === 'string' && puanlarMi(g.puanlar),
    )
  );
}
