// Taşıma: istemci mantığı (istemci.ts) ağdan ayrıdır. Gerçek bağlantı (src/baglanti) ya da testte/geliştirmede sahte sunucu.
import type { Acilis, Istemci, Sunucu } from './mesaj';

export type TasimaDinleyici = {
  acildi(): void;
  mesaj(m: Sunucu): void;
  kapandi(): void;
};

export type Tasima = {
  gonder(m: Istemci): void;
  kapat(): void;
};

// Bir bağlantı açar (komut `acilis` ile gider); açılınca dinleyici.acildi çağrılır. Sunucu önce 'tamam' ya da 'hata' gönderir.
export type TasimaUretici = (
  acilis: Acilis,
  dinleyici: TasimaDinleyici,
) => Tasima;
