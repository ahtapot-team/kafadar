// Oyuncu kuralları (KK-3, KK-4). Saf fonksiyonlar, arayüzden bağımsız.
export const OYUNCU_MIN = 2;
export const OYUNCU_MAKS = 12;
export const ISIM_MAKS = 16;

export const isimDuzelt = (ad: string) => ad.trim();

// Geçerliyse null, değilse Türkçe hata mesajı.
export function isimHatasi(ad: string): string | null {
  const temiz = isimDuzelt(ad);
  if (!temiz) return 'İsim boş olamaz';
  if ([...temiz].length > ISIM_MAKS)
    return `İsim en çok ${ISIM_MAKS} karakter olabilir`;
  return null;
}

const ayniMi = (a: string, b: string) =>
  a.toLocaleLowerCase('tr') === b.toLocaleLowerCase('tr');

// Aynı isim varsa "Ali 2", "Ali 3"… önerir.
export function benzersizIsim(ad: string, mevcut: readonly string[]): string {
  const temiz = isimDuzelt(ad);
  let aday = temiz;
  for (let n = 2; mevcut.some((m) => ayniMi(m, aday)); n++)
    aday = `${temiz} ${n}`;
  return aday;
}

export const ekleyebilir = (oyuncular: readonly string[]) =>
  oyuncular.length < OYUNCU_MAKS;

export function baslayabilir(oyuncular: readonly string[]): {
  tamam: boolean;
  neden?: string;
} {
  if (oyuncular.length < OYUNCU_MIN)
    return { tamam: false, neden: `En az ${OYUNCU_MIN} oyuncu gerekli` };
  return { tamam: true };
}
