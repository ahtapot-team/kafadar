// Açılış ilerlemesi (KK-95, KK-96): yüzde = süre ve hazırlığın küçüğü; yalnızca ileri gider.
import type { Saat } from './saat';

export const MIN_SURE_MS = 3000;
export type AcilisDurumu = { yuzde: number; gecti: boolean };
export function acilisOlustur(saat: Saat) {
  const basla = saat();
  let oran = 0; // hazırlık oranı 0–1
  let bitti = false;
  let atla = false;
  let enYuksek = 0;
  const durum = (): AcilisDurumu => {
    const sure = atla ? 1 : Math.min(1, (saat() - basla) / MIN_SURE_MS);
    const hazir = bitti ? 1 : oran;
    const yuzde = Math.floor(Math.min(sure, hazir) * 100);
    enYuksek = Math.max(enYuksek, yuzde);
    return { yuzde: enYuksek, gecti: enYuksek === 100 };
  };
  return {
    durum,
    hazirlikOrani(o: number) {
      oran = Math.max(oran, Math.min(1, Math.max(0, o)));
    },
    hazirlikBitti() {
      bitti = true;
    },
    dokun() {
      atla = true;
    },
  };
}
