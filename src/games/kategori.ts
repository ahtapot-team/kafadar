// Oyun kategorileri (PRD v7.1, KK-79…KK-89): kişi sayısı çipleri ve eşleşme kuralı. Saf mantık, React yok.
import type { Oyun } from './oyun';

export type CipId = 'tumu' | '2-kisi' | '3-5-kisi' | '6-uzeri-kisi';

// Dört çip her zaman görünür (KK-82).
export const CIPLER: CipId[] = ['tumu', '2-kisi', '3-5-kisi', '6-uzeri-kisi'];

export const CIP_ETIKETI: Record<CipId, string> = {
  tumu: 'Tümü',
  '2-kisi': '2 kişi',
  '3-5-kisi': '3–5 kişi',
  '6-uzeri-kisi': '6+ kişi',
};

export const BOS_LISTE_METNI = 'Bu kişi sayısına uygun oyun henüz yok.';

type Kayit = Pick<Oyun, 'minOyuncu'>;

const UST_SINIR = 12; // genel oyuncu üst sınırı (yeni kişi alanı yok)

const ARALIK: Record<Exclude<CipId, 'tumu'>, [number, number]> = {
  '2-kisi': [2, 2],
  '3-5-kisi': [3, 5],
  '6-uzeri-kisi': [6, UST_SINIR],
};

// Oyunun kişi aralığı [minOyuncu ?? 2, 12] çipin aralığıyla kesişiyorsa eşleşir.
export function cipEslesir(cip: CipId, oyun: Kayit): boolean {
  if (cip === 'tumu') return true;
  const [alt, ust] = ARALIK[cip];
  const min = Math.max(oyun.minOyuncu ?? 2, 2);
  return min <= ust && UST_SINIR >= alt;
}

export function filtrele<T extends Kayit>(oyunlar: T[], cip: CipId): T[] {
  return oyunlar.filter((o) => cipEslesir(cip, o));
}

// Seçiliye ya da Tümü'ne dokunmak filtreyi kaldırır; tek seçim (KK-83).
export function cipSec(secili: CipId, dokunulan: CipId): CipId {
  return dokunulan === secili ? 'tumu' : dokunulan;
}

export const kisiMetni = (oyun: Kayit): string =>
  `${Math.max(oyun.minOyuncu ?? 2, 2)}–${UST_SINIR} kişi`;
