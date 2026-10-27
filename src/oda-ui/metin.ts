import { desteler } from '../desteler';

// Final yalnızca kart kimliği taşır; metin uygulamadaki gömülü desteden bulunur (kimlikler desteler arası benzersiz).
export const kartMetni = (kartId: string, no: number): string =>
  Object.values(desteler)
    .flatMap((d) => d.cards)
    .find((k) => k.id === kartId)?.text ?? `Soru ${no}`;
