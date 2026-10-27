/* eslint-disable @typescript-eslint/no-unused-vars */
// QA iskeleti (#50): imzalar kabul testleri içindir; backend gerçekleştirir (#47).
// Oda mantığı saf ve serileştirilebilir bir durum makinesidir (KK-40): saat (`simdi`, ms) ve rastgelelik
// dışarıdan verilir; Date.now, Math.random, ağ ve React kullanılmaz. Sunucu (Durable Object) bu
// mantığı çalıştıran ince bir kabuktur; her olayda kendi saatini `simdi` olarak verir.
import type { Deste, Kart } from '../core/deste';

const YOK = 'henüz yazılmadı';

export type Kimlik = string; // katılımda sunucunun verdiği, cihazda saklanan oyuncu belirteci
export type Oy = 'OK' | 'NOK';

export const SORU_MS = 15_000;
export const SORU_SAYISI = 10;
export const OYUNCU_MAKS = 12;
export const BOSTA_MS = 3_600_000;

// 'lobi' → 'soru' → 'bitti'. Gerisini (oyuncular, sorular, cevaplar, zaman damgaları) gerçekleştirme ekler;
// JSON'a çevrilebilir olmalı.
export type OdaDurum = { asama: 'lobi' | 'soru' | 'bitti' };

export type Olay =
  | { tip: 'katil'; ad: string }
  | { tip: 'baslat'; kimlik: Kimlik } // yalnızca kuran
  | { tip: 'cevapla'; kimlik: Kimlik; oy: Oy } // süre içinde değiştirilebilir, son cevap geçerli
  | { tip: 'kop'; kimlik: Kimlik } // bağlantı koptu
  | { tip: 'don'; kimlik: Kimlik } // aynı kimlikle geri döndü
  | { tip: 'ayril'; kimlik: Kimlik }
  | { tip: 'zaman' }; // sunucu alarmı: süre dolduysa sonraki soruya (ya da finale) geçer

export type Hata = {
  kod:
    | 'kapali' // oda bitti/kapandı
    | 'dolu' // 12 oyuncu
    | 'basladi' // oyun başladı, katılım kapalı
    | 'yetkisiz' // kuran değil
    | 'yetersiz' // 2'den az oyuncu
    | 'sure-doldu' // süre bittikten sonra gelen cevap
    | 'tanimsiz'; // bilinmeyen kimlik
  mesaj: string; // Türkçe, net
};

// Hata varsa durum DEĞİŞMEZ. katil başarılıysa `kimlik` ve çakışma çözülmüş `ad` ("Ali 2") döner.
export type Sonuc = {
  durum: OdaDurum;
  hata?: Hata;
  kimlik?: Kimlik;
  ad?: string;
};

// Kişiye özel görünüm: başkalarının cevabı final'e kadar HİÇBİR alanda yer almaz (KK-34, KK-35).
export type Gorunum = {
  asama: 'lobi' | 'soru' | 'bitti';
  kod: string;
  oyuncular: { ad: string; bagli: boolean }[]; // kuran dahil
  baslatGorunur: boolean; // yalnızca kuranda true
  baslatAktif: boolean; // en az 2 oyuncuyla true
  soruNo?: number; // 1…10 ('soru' aşamasında)
  soru?: Kart;
  kalanMs?: number; // sunucu saatine göre
  cevapladi: string[]; // cevap vermiş oyuncuların adları (ne dediği değil)
  toplam: number; // oyuncu sayısı ("6/8")
  benimOyum?: Oy | null; // yalnızca kendi cevabı
};

export type Final = {
  yuzdeler: { kartId: string; ok: number; nok: number; bos: number }[]; // tamamlanan sorular; sayılar (yüzde arayüzde)
  enTartismali: string[]; // oyları en dengeli bölünen kart(lar)
  oduller: { aykiriRuh: string[]; ruhIkizleri: [string, string][] }; // KK-12 kuralları
  kimNeDedi: Record<string, (Oy | null)[]>; // oyuncu adı → soru sırasıyla cevaplar (null = boş)
  ayniOlan: Record<string, number>; // oyuncu adı → çoğunlukla aynı olduğu soru sayısı ("7/10")
};

// 4 harfli kod; O, 0, I, 1 kullanılmaz (KK-29).
export function kodUret(rng: () => number): string {
  throw new Error(YOK);
}

// Kuran kişi de oyuncudur. Sorular `tohum` ile sunucuda seçilip sıralanır (KK-32).
export function odaKur(s: {
  kod: string;
  kurucuAd: string;
  deste: Deste;
  tohum: number;
  simdi: number;
}): { durum: OdaDurum; kimlik: Kimlik } {
  throw new Error(YOK);
}

export function isle(durum: OdaDurum, olay: Olay, simdi: number): Sonuc {
  throw new Error(YOK);
}

export function gorunum(
  durum: OdaDurum,
  kimlik: Kimlik,
  simdi: number,
): Gorunum {
  throw new Error(YOK);
}

// Yalnızca 'bitti' aşamasında anlamlı.
export function final(durum: OdaDurum): Final {
  throw new Error(YOK);
}

// Oda ve isimler silinmeli mi (KK-39): son etkinlikten BOSTA_MS geçtiyse ya da oyun bitmesinden BOSTA_MS sonra.
export function silinmeli(durum: OdaDurum, simdi: number): boolean {
  throw new Error(YOK);
}

// Kod denemesi hız sınırı (KK-30). `kayit` JSON'a çevrilebilir; her denemede yenisi döner.
export function denemeSiniri(
  kayit: unknown,
  istemci: string,
  simdi: number,
): { izin: boolean; kayit: unknown } {
  throw new Error(YOK);
}
