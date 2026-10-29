// 10/10 ama (tek telefon, açık puan): saf, tohumlu, serileştirilebilir durum makinesi (KK-61, KK-22).
// Date.now, Math.random, ağ ve React yok; isle() girdiyi değiştirmez.
import type { Deste } from '../../core/deste';
import { benzersiz, doluMetinler, nesne, puanMi } from '../../core/dogrula';
import {
  type Oturum,
  type Uzunluk,
  oturumGecerliMi,
  oyuncuCikar,
  oyuncuEkle,
  sonrakiAdim,
  yeniOturum,
  yenidenKaristir,
} from '../../core/oturum';
import { type Oduller, oduluHesapla } from '../../core/puan-oduller';

export const PUAN_MIN = 0;
export const PUAN_MAKS = 10;
export const BOLUNDU_FARKI = 8; // uçlar arası fark ≥ 8 ve oybirliği değil → "Tam bölündünüz" (KK-57)

// 'puan': puanlar girilir (açıklamaya kadar değiştirilebilir), 'acik': sonuç görünür,
// 'desteBitti': "Karıştırıp baştan?", 'bitti': oturum sonu.
export type Durum = Oturum & {
  asama: 'puan' | 'acik' | 'desteBitti' | 'bitti';
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
  uzunluk: Uzunluk;
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

export type { Oduller } from '../../core/puan-oduller';

export function yeniOyun(s: OyunSecenekleri): Durum {
  return { asama: 'puan', ...yeniOturum(s), puanlar: {}, gecmis: [] };
}

export const gecerliKart = (d: Durum) => d.kartlar[d.sira];

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

export const oduller = (d: Durum): Oduller =>
  oduluHesapla(d.oyuncular, d.gecmis);

// Sonraki karta geçer: tur uzunluğu dolduysa oturum biter, deste tükendiyse karıştırma sorulur.
function ilerle(d: Durum): Durum {
  const a = sonrakiAdim(d);
  const temiz = { ...d, tamamlanan: a.tamamlanan, puanlar: {} };
  if (a.sonuc === 'bitti') return { ...temiz, asama: 'bitti' };
  if (a.sonuc === 'desteBitti') return { ...temiz, asama: 'desteBitti' };
  return { ...temiz, asama: 'puan', sira: a.sira };
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
      return { ...d, asama: 'puan', ...yenidenKaristir(d) };
    case 'oyuncuEkle': {
      const o = oyuncuEkle(d.oyuncular, olay.ad);
      return o === d.oyuncular ? d : { ...d, oyuncular: o };
    }
    case 'oyuncuCikar':
      return {
        ...d,
        oyuncular: oyuncuCikar(d.oyuncular, olay.ad),
        puanlar: Object.fromEntries(
          Object.entries(d.puanlar).filter(([o]) => o !== olay.ad),
        ),
      };
  }
}

const puanlarMi = (x: unknown): x is Record<string, number> =>
  nesne(x) && Object.values(x).every(puanMi);

// Kayıttan okunan durumun şeması (KK-14): sürüm doğru olsa bile alanlar eksik/hatalıysa false döner;
// çağıran kaydı siler ve yeni oyuna / ana ekrana düşer, arayüz çökmez.
export function durumGecerliMi(d: unknown): d is Durum {
  if (!nesne(d) || !oturumGecerliMi(d)) return false;
  const oyuncular = d.oyuncular as string[];
  return (
    ['puan', 'acik', 'desteBitti', 'bitti'].includes(d.asama as string) &&
    (d.tamamlanan as number) >= 0 &&
    doluMetinler(oyuncular) &&
    benzersiz(oyuncular) &&
    puanlarMi(d.puanlar) &&
    Object.keys(d.puanlar).every((o) => oyuncular.includes(o)) &&
    Array.isArray(d.gecmis) &&
    d.gecmis.every(
      (g) => nesne(g) && typeof g.kartId === 'string' && puanlarMi(g.puanlar),
    )
  );
}
