// 10/10 ama desteleri: adlar ve desteler içerik kaydından (src/icerik) gelir. Paket seçimi testID'leri sözleşmedeki adlarla.
import type { Deste } from '../../core/deste';
import { paketler } from '../../icerik';

export const ononPaketleri: {
  id: string;
  ad: string;
  testID: string;
  deste: Deste;
}[] = paketler.flatMap((p) =>
  p.oyun === 'on-on-ama'
    ? [{ id: p.paketId, ad: p.ad, testID: p.testID, deste: p.deste as Deste }]
    : [],
);
