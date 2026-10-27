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

export type Oyun = {
  id: string;
  ad: string;
  aktif: boolean;
  // Ekran tembel yüklenir: mantık testleri (node) React Native'e dokunmaz.
  ekran?: () => Promise<{ default: ComponentType<OyunEkraniProps> }>;
};
