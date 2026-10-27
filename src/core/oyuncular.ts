/* eslint-disable @typescript-eslint/no-unused-vars */
// QA iskeleti: imzalar kabul testleri içindir. Backend/frontend gerçekleştirir.
// Oyuncu kimliği = isim (isimler benzersizdir, KK-4).

const YOK = 'henüz yazılmadı';

export const OYUNCU_MIN = 2;
export const OYUNCU_MAKS = 12;
export const ISIM_MAKS = 16;

// Baştaki/sondaki boşlukları kırpar.
export function isimDuzelt(ad: string): string {
  throw new Error(YOK);
}

// Kırpılmış isim boşsa ya da ISIM_MAKS karakterden uzunsa Türkçe mesaj, değilse null.
// Emoji tek karakter sayılır.
export function isimHatasi(ad: string): string | null {
  throw new Error(YOK);
}

// İsim mevcutsa "Ali 2", "Ali 3" önerir; değilse (kırpılmış) adı aynen döndürür.
export function benzersizIsim(ad: string, mevcut: string[]): string {
  throw new Error(YOK);
}

// 2'nin altında tamam=false ve neden yazılıdır.
export function baslayabilir(oyuncular: string[]): {
  tamam: boolean;
  neden?: string;
} {
  throw new Error(YOK);
}

// 12 oyuncuda false (ekleme alanı gizlenir).
export function ekleyebilir(oyuncular: string[]): boolean {
  throw new Error(YOK);
}
