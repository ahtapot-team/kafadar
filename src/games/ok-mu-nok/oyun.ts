/* eslint-disable @typescript-eslint/no-unused-vars */
// QA iskeleti: imzalar kabul testleri içindir. Backend gerçekleştirir (KK-22).
// Durum saf ve JSON'a çevrilebilir olmalı; isle() girdiyi değiştirmez.
import type { Deste, Kart } from '../../core/deste';

const YOK = 'henüz yazılmadı';

export type Oy = 'OK' | 'NOK';

// oy: oyuncu başına işaret. 'oy' aşamasında oylanır, 'acik' aşamasında sonuç görünür,
// 'desteBitti' = deste tükendi ("Karıştırıp baştan?"), 'bitti' = oturum sonu.
// Gerisini (kartlar, oylar, geçmiş, oyuncular) gerçekleştirme ekler.
export type Durum = { asama: 'oy' | 'acik' | 'desteBitti' | 'bitti' };

export type Olay =
  | { tip: 'oyla'; oyuncu: string; oy: Oy; t: number } // t: ms; aynı oyuncuda 300 ms içindeki tekrar yok sayılır
  | { tip: 'goster' }
  | { tip: 'sonraki' }
  | { tip: 'atla' }
  | { tip: 'bitir' }
  | { tip: 'karistir' } // deste bitince baştan karıştırır
  | { tip: 'oyuncuEkle'; ad: string }
  | { tip: 'oyuncuCikar'; ad: string };

export type OyunSecenekleri = {
  oyuncular: string[];
  deste: Deste;
  uzunluk: 10 | 20 | null; // null = sınırsız
  tohum: number;
};

export type Sonuc = {
  tip: 'tekAzinlik' | 'oybirligi' | 'esit' | 'diger';
  metin: string; // tekAzinlik: "Ayşe tek başına NOK!", esit: "Tam ikiye bölündünüz"
};

export type Oduller = {
  aykiriRuh: string[]; // en çok azınlıkta kalan(lar); 2 kişilikte boş
  ruhIkizleri: [string, string][]; // en çok aynı oyu veren ikili(ler)
  olayKart: string[]; // oyları en dengeli bölünen kartın id'leri
};

export function yeniOyun(secenekler: OyunSecenekleri): Durum {
  throw new Error(YOK);
}

export function isle(durum: Durum, olay: Olay): Durum {
  throw new Error(YOK);
}

export function gecerliKart(durum: Durum): Kart {
  throw new Error(YOK);
}

// Herkes oy vermeden false.
export function gosterAktif(durum: Durum): boolean {
  throw new Error(YOK);
}

// Yalnızca 'acik' aşamasında anlamlı.
export function sonuc(durum: Durum): Sonuc {
  throw new Error(YOK);
}

// Yalnızca oyuncunun oy verdiği kartlardan hesaplanır (KK-6, KK-12).
export function oduller(durum: Durum): Oduller {
  throw new Error(YOK);
}
