/* eslint-disable @typescript-eslint/no-unused-vars -- iskelet: gövdeler #106'da yazılır */
// 10/10 ama (tek telefon, açık puan): saf, tohumlu, serileştirilebilir durum makinesi (KK-61, KK-22).
// Arayüz iskeleti (#105): gövdeler backend #106'da yazılır. Date.now, Math.random, ağ ve React yok.
import type { Deste } from '../../core/deste';

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

const yap = (): never => {
  throw new Error('10/10 ama mantığı henüz yazılmadı (#106)');
};

export function yeniOyun(_s: OyunSecenekleri): Durum {
  return yap();
}
export function gecerliKart(_d: Durum): { id: string; text: string } {
  return yap();
}
export function gosterAktif(_d: Durum): boolean {
  return yap();
}
export function ozet(_d: Durum): Ozet {
  return yap();
}
export function oduller(_d: Durum): Oduller {
  return yap();
}
export function isle(_d: Durum, _olay: Olay): Durum {
  return yap();
}
export function durumGecerliMi(_d: unknown): _d is Durum {
  return yap();
}
