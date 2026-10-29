import type { Deste } from './core/deste';
import { paketler as kayit } from './icerik';
import type { PaketId } from './icerik/kayit';

// OK mu NOK mu paketleri: adlar ve desteler içerik kaydından (src/icerik) gelir.
export type Paket = PaketId<'ok-mu-nok'>;
const okPaketleri = kayit.filter((p) => p.oyun === 'ok-mu-nok');
export const paketler = okPaketleri.map((p) => ({
  id: p.paketId as Paket,
  ad: p.ad,
}));
export const desteler = Object.fromEntries(
  okPaketleri.map((p) => [p.paketId, p.deste]),
) as Record<Paket, Deste>;
