// Önceki turun soru id'leri cihazda saklanır (KK-109): yeni tur aynı soruları mümkün olduğunca tekrarlamaz.
import type { Depo } from '../../core/kayit.ts';

export const ONCEKI_ANAHTAR = (paketId: string) =>
  `kafadar:quiz-onceki:${paketId}`;

// Yalnız son turun id'leri tutulur (üzerine yazar).
export const oncekiKaydet = (
  depo: Depo,
  paketId: string,
  sorular: readonly { id: string }[],
): Promise<void> =>
  depo.setItem(
    ONCEKI_ANAHTAR(paketId),
    JSON.stringify(sorular.map((s) => s.id)),
  );

export async function oncekiOku(
  depo: Depo,
  paketId: string,
): Promise<string[]> {
  try {
    const ham = await depo.getItem(ONCEKI_ANAHTAR(paketId));
    const x: unknown = ham ? JSON.parse(ham) : null;
    return Array.isArray(x) && x.every((i) => typeof i === 'string') ? x : [];
  } catch {
    return [];
  }
}
