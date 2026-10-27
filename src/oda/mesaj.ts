// İstemci ↔ sunucu mesajları (#48 ile kararlaştırıldı). Tek bağlantı, JSON metin çerçeveleri, her mesajda `t`.
// Tipler oda.ts'ten gelir; sunucu yalnızca kabuktur, kurallar oda.ts'tedir (KK-40).
import type { Final, Gorunum, Hata, Kimlik, Oy } from './oda';

export type Paket = 'arkadas' | 'cift' | 'aile';

// Bağlanırken adres sorgusuyla gönderilir (?islem=kur&ad=…&paket=…); tarayıcı soketi tek bağlantıda odaya yönlenir.
export type Acilis =
  | { islem: 'kur'; ad: string; paket: Paket }
  | { islem: 'katil'; kod: string; ad: string }
  | { islem: 'don'; kod: string }; // yeniden bağlanma (KK-37); belirteç adreste değil, ilk mesajda gider

// Bağlantı kurulduktan sonra istemciden giden mesajlar.
export type Istemci =
  | { t: 'kimlik'; kimlik: Kimlik } // 'don' bağlantısının İLK mesajı: belirteç adrese konmaz (günlüklere sızmasın)
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
