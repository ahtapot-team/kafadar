// Kart destesi oturumunun ortak mantığı (OK mu NOK mu ve 10/10 ama): sıra, ilerleme, karıştırma, oyuncular.
// Oyun modülleri kendi alanlarını (oylar/puanlar, geçmiş, aşama adları) bunun üstüne ekler. Saf; tohumlu.
import type { Deste, Kart } from './deste';
import { metinDizisi, nesne } from './dogrula';
import { karistir, rngOlustur } from './rng';

export type Uzunluk = 10 | 20 | null; // null = sınırsız

export type Oturum = {
  deste: { deck_id: string; version: number }; // yarım oyun eski sürümle biter
  kartlar: Kart[]; // karışık
  sira: number; // geçerli kartın yeri
  tamamlanan: number; // bitirilen/atlanan kart sayısı (tur uzunluğu için)
  uzunluk: Uzunluk;
  tohum: number;
  karisim: number; // kaç kez yeniden karıştırıldı
  oyuncular: string[];
};

export function yeniOturum(s: {
  oyuncular: string[];
  deste: Deste;
  uzunluk: Uzunluk;
  tohum: number;
}): Oturum {
  return {
    deste: { deck_id: s.deste.deck_id, version: s.deste.version },
    kartlar: karistir(s.deste.cards, rngOlustur(s.tohum)),
    sira: 0,
    tamamlanan: 0,
    uzunluk: s.uzunluk,
    tohum: s.tohum,
    karisim: 0,
    oyuncular: [...s.oyuncular],
  };
}

// Sonraki karta geçiş: tur uzunluğu dolduysa oturum biter, deste tükendiyse karıştırma sorulur.
export function sonrakiAdim(d: Oturum): {
  sira: number;
  tamamlanan: number;
  sonuc: 'devam' | 'desteBitti' | 'bitti';
} {
  const tamamlanan = d.tamamlanan + 1;
  if (d.uzunluk !== null && tamamlanan >= d.uzunluk)
    return { sira: d.sira, tamamlanan, sonuc: 'bitti' };
  if (d.sira + 1 >= d.kartlar.length)
    return { sira: d.sira, tamamlanan, sonuc: 'desteBitti' };
  return { sira: d.sira + 1, tamamlanan, sonuc: 'devam' };
}

// Deste bitince baştan karıştırır (her seferinde yeni, tohumdan türeyen sıra).
export const yenidenKaristir = (d: Oturum) => ({
  sira: 0,
  karisim: d.karisim + 1,
  kartlar: karistir(d.kartlar, rngOlustur(d.tohum + d.karisim + 1)),
});

// Boş ya da var olan ad eklenmez: aynı dizi (aynı referans) döner.
export function oyuncuEkle(oyuncular: string[], ad: string): string[] {
  const temiz = ad.trim();
  return !temiz || oyuncular.includes(temiz)
    ? oyuncular
    : [...oyuncular, temiz];
}

export const oyuncuCikar = (oyuncular: string[], ad: string) =>
  oyuncular.filter((o) => o !== ad);

// Kayıttan okunan durumda oturum alanları geçerli mi (KK-14)? Oyunlar kendi alanlarını ayrıca denetler.
export function oturumGecerliMi(d: Record<string, unknown>): boolean {
  const { kartlar, sira } = d;
  return (
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
    (d.uzunluk === null || d.uzunluk === 10 || d.uzunluk === 20) &&
    typeof d.tohum === 'number' &&
    Number.isInteger(d.karisim) &&
    metinDizisi(d.oyuncular) &&
    d.oyuncular.length > 0
  );
}
