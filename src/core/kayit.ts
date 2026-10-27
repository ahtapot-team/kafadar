/* eslint-disable @typescript-eslint/no-unused-vars */
// QA iskeleti: imzalar kabul testleri içindir. Backend/frontend gerçekleştirir (KK-5, KK-14).
// Oyundan bağımsızdır: durum türünü çağıran verir.

const YOK = 'henüz yazılmadı';

// AsyncStorage bu arayüze uyar; testte Map ile sahtelenir.
export type Depo = {
  getItem(anahtar: string): Promise<string | null>;
  setItem(anahtar: string, deger: string): Promise<void>;
  removeItem(anahtar: string): Promise<void>;
};

export const OYUN_ANAHTARI = 'kafadar:oyun';
export const EKIP_ANAHTARI = 'kafadar:son-ekip';
export const KAYIT_SURUMU = 1;

export async function sonEkipKaydet(
  depo: Depo,
  oyuncular: string[],
): Promise<void> {
  throw new Error(YOK);
}

// Kayıt yoksa ya da bozuksa boş liste.
export async function sonEkipOku(depo: Depo): Promise<string[]> {
  throw new Error(YOK);
}

// OYUN_ANAHTARI altına { surum: KAYIT_SURUMU, durum } yazar.
export async function oyunKaydet<S>(depo: Depo, durum: S): Promise<void> {
  throw new Error(YOK);
}

// Okunamayan ya da eski sürümlü kayıtta çökmez, kaydı siler ve null döner.
export async function oyunOku<S>(depo: Depo): Promise<S | null> {
  throw new Error(YOK);
}

// isle(durum, olay) çalıştırır, yeni durumu kaydeder ve döndürür.
// "Her oydan ve her karttan sonra kaydedilir."
export async function isleKaydet<S, O>(
  depo: Depo,
  isle: (durum: S, olay: O) => S,
  durum: S,
  olay: O,
): Promise<S> {
  throw new Error(YOK);
}
