// Açılış sözü seçimi (KK-97): saf; rastgelelik çağıranın verdiği rng'den gelir.
import type { Rng } from './rng';

export type Soz = { id: string; text: string; oyun: string }; // oyun: oyun kimliği ya da 'genel'

export const sozSec = (sozler: readonly Soz[], rng: Rng): Soz =>
  sozler[Math.floor(rng() * sozler.length)];
// Oyuna ait sözün rozeti ("🕵️ Casus kim"); genel sözde yok.
export function sozAltYazisi(
  soz: Soz,
  oyunlar: Record<string, { ad: string; emoji: string }>,
): string | null {
  const o = oyunlar[soz.oyun];
  return o ? `${o.emoji} ${o.ad}` : null;
}
