// Taşıma: istemci mantığı (istemci.ts) ağdan ayrıdır. Gerçek bağlantı (src/baglanti) ya da testte/geliştirmede sahte sunucu.
import type { Istemci, Sunucu } from './mesaj';

export type TasimaDinleyici = {
  acildi(): void;
  mesaj(m: Sunucu): void;
  kapandi(): void;
};

export type Tasima = {
  gonder(m: Istemci): void;
  kapat(): void;
};

// Bir bağlantı açar; açılınca dinleyici.acildi çağrılır.
export type TasimaUretici = (dinleyici: TasimaDinleyici) => Tasima;
