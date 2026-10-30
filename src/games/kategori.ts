// Oyun kategorileri (PRD v7, KK-79…KK-86): çip eşleşme/görünürlük kuralı ve kart metinleri. Saf mantık, React yok.
import type { Oyun, OyunTuru } from './oyun';

export type CipId = 'tumu' | '2-kisi' | 'kalabalik' | 'cift' | 'aile' | 'quiz';

export const CIPLER: CipId[] = [
  'tumu',
  '2-kisi',
  'kalabalik',
  'cift',
  'aile',
  'quiz',
];

export const CIP_ETIKETI: Record<CipId, string> = {
  tumu: 'Tümü',
  '2-kisi': '2 kişi',
  kalabalik: 'Kalabalık',
  cift: 'Çift',
  aile: 'Aile',
  quiz: 'Quiz',
};

type Kayit = Pick<Oyun, 'minOyuncu' | 'tur' | 'ortam'>;

const UST_SINIR = 12; // genel oyuncu üst sınırı (yeni kişi alanı yok)
const KALABALIK = 6;

export function cipEslesir(cip: CipId, oyun: Kayit): boolean {
  switch (cip) {
    case 'tumu':
      return true;
    case '2-kisi':
      return (oyun.minOyuncu ?? 2) <= 2;
    case 'kalabalik':
      return UST_SINIR >= KALABALIK;
    case 'cift':
    case 'aile':
      return !!oyun.ortam?.includes(cip);
    case 'quiz':
      return oyun.tur === 'quiz';
  }
}

// Yalnızca listeyi gerçekten daraltan çipler (KK-82); hiçbiri daraltmıyorsa satır gösterilmez.
export function gorunenCipler(oyunlar: Kayit[]): CipId[] {
  const daraltan = CIPLER.filter((c) => {
    if (c === 'tumu') return false;
    const n = oyunlar.filter((o) => cipEslesir(c, o)).length;
    return n >= 1 && n < oyunlar.length;
  });
  return daraltan.length ? ['tumu', ...daraltan] : [];
}

export function filtrele<T extends Kayit>(oyunlar: T[], cip: CipId): T[] {
  return oyunlar.filter((o) => cipEslesir(cip, o));
}

// Seçiliye ya da Tümü'ne dokunmak filtreyi kaldırır; tek seçim (KK-83).
export function cipSec(secili: CipId, dokunulan: CipId): CipId {
  return dokunulan === secili ? 'tumu' : dokunulan;
}

const TUR_ETIKETI: Record<OyunTuru, string> = {
  oylama: 'Oylama',
  puanlama: 'Puanlama',
  'gizli-rol': 'Gizli rol',
  quiz: 'Quiz',
};

export const turEtiketi = (tur: OyunTuru): string => TUR_ETIKETI[tur];

export const kisiMetni = (oyun: Pick<Oyun, 'minOyuncu'>): string =>
  `${oyun.minOyuncu ?? 2}–${UST_SINIR} kişi`;
