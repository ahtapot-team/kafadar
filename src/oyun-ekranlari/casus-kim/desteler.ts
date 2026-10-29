// Casus kim kelime desteleri: adlar ve desteler içerik kaydından (src/icerik) gelir. Paket seçimi testID'leri sözleşmedeki adlarla.
import { paketler } from '../../icerik';
import type { CasusDeste } from '../../games/casus-kim/casus';

export const casusPaketleri: {
  id: string;
  ad: string;
  testID: string;
  deste: CasusDeste;
}[] = paketler.flatMap((p) =>
  p.oyun === 'casus-kim'
    ? [
        {
          id: p.paketId,
          ad: p.ad,
          testID: p.testID,
          deste: p.deste as CasusDeste,
        },
      ]
    : [],
);
