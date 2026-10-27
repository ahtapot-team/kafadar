// İstemci ↔ sunucu mesajları (#48 ile kararlaştırıldı). Tek bağlantı, JSON metin çerçeveleri, her mesajda `t`.
// Tipler oda.ts'ten gelir; sunucu yalnızca kabuktur, kurallar oda.ts'tedir (KK-40).
import type { Final, Gorunum, Hata, Kimlik, Oy } from './oda';

export type Paket = 'arkadas' | 'cift' | 'aile';

export type Istemci =
  | { t: 'kur'; ad: string; paket: Paket }
  | { t: 'katil'; kod: string; ad: string }
  | { t: 'don'; kod: string; kimlik: Kimlik } // yeniden bağlanma (KK-37)
  | { t: 'baslat' }
  | { t: 'cevapla'; oy: Oy }
  | { t: 'ayril' };

// 'cok-deneme': kod denemesi hız sınırı (KK-30). 'baglanti': istemci tarafı (sunucuya ulaşılamadı).
export type OdaHata = {
  kod: Hata['kod'] | 'cok-deneme' | 'baglanti';
  mesaj: string;
};

export type Sunucu =
  | { t: 'tamam'; kod: string; kimlik: Kimlik; ad: string } // kur / katil / don başarısı
  | { t: 'hata'; hata: OdaHata }
  | { t: 'gorunum'; gorunum: Gorunum; simdi: number } // simdi = sunucu saati (ms)
  | { t: 'final'; final: Final };
