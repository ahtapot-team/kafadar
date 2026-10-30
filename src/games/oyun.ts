// Oyun sözleşmesi: yeni oyun = bu tipte bir kayıt + registry.ts'ye bir satır.
// aktif=false: ana ekranda "Yakında" olarak görünür, açılmaz (KK-1).
import type { ComponentType } from 'react';
import type { Deste } from '../core/deste';

// Çerçeve (app/oyun.tsx) oyunun ekranına bunları verir.
export type OyunEkraniProps = {
  deste: Deste;
  uzunluk: 10 | 20 | null;
  onCik: () => void; // "Oyundan çık?" onayını açar
  onOyuncular: () => void; // oyuncu düzenleme ekranı
  onAnaMenu: () => void; // oyunu bitirip ana ekrana döner
};

// Tanıtım kartı (PRD v6, KK-73…KK-77): metin oyunun kayıt satırından gelir; yeni oyun kendi tanıtımını kendi satırıyla ekler.
export type Tanitim = {
  kisi: string; // ör. "2–12 kişi"
  metin: string; // 3–4 satır (PRD v6 tanıtım metinleri tablosu)
};

// Kategori etiketleri (PRD v7, KK-79…KK-86): tür kartta rozet olur; ortam Çift / Aile çiplerini besler.
export type OyunTuru = 'oylama' | 'puanlama' | 'gizli-rol' | 'quiz';
export type OyunOrtami = 'cift' | 'aile';

export type Oyun = {
  id: string;
  ad: string;
  aktif: boolean;
  tur: OyunTuru;
  ortam?: OyunOrtami[]; // yoksa yalnızca arkadaş grubu sayılır (Çift / Aile çipine girmez)
  // Ekran tembel yüklenir: mantık testleri (node) React Native'e dokunmaz.
  ekran?: () => Promise<{ default: ComponentType<OyunEkraniProps> }>;
  modSecimi?: boolean; // ana ekrandan sonra "Tek telefon / Oda" seçimi var mı (yalnızca OK mu NOK mu)
  minOyuncu?: number; // oyuncular ekranında en az kaç kişi (varsayılan 2)
  kurulum?: string; // oyuncular ekranından sonraki ayar ekranı (varsayılan '/paket')
  // Kayıtlı yarım oyunun bu oyuna ait geçerli durum olup olmadığı (bozuk kayıt reddedilir, KK-14).
  gecerliMi?: (durum: unknown) => boolean;
  tanitim?: Tanitim; // aktif her oyunda bulunur (KK-77)
};
