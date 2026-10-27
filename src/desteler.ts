import aile from '../content/decks/aile.json';
import arkadas from '../content/decks/arkadas.json';
import cift from '../content/decks/cift.json';
import type { Deste } from './core/deste';

export type Paket = 'arkadas' | 'cift' | 'aile';
export const paketler: { id: Paket; ad: string }[] = [
  { id: 'arkadas', ad: 'Arkadaş' },
  { id: 'cift', ad: 'Çift' },
  { id: 'aile', ad: 'Aile' },
];
export const desteler: Record<Paket, Deste> = { arkadas, cift, aile };
