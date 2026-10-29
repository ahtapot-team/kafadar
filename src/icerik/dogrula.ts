// Oyuna göre içerik doğrulayıcısı seçimi (scripts/icerik-dogrula.ts). Node doğrudan çalıştırdığı için
// içe aktarmalar .ts uzantılıdır; uygulama bu dosyayı içe aktarmaz.
import { type Deste, desteHatalari } from '../core/deste.ts';
import { casusDesteHatalari } from '../games/casus-kim/deste.ts';
import type { CasusDeste } from '../games/casus-kim/casus.ts';
import type { Oyun } from './kayit.ts';

export const icerikHatalari = (oyun: Oyun, deste: unknown): string[] =>
  oyun === 'casus-kim'
    ? casusDesteHatalari(deste as CasusDeste)
    : desteHatalari(deste as Deste);
