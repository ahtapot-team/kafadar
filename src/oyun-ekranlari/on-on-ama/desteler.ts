// 10/10 ama desteleri (content/onon/*.json, mantık #106). Paket seçimi testID'leri sözleşmedeki adlarla.
import arkadas from '../../../content/onon/onon-arkadas.json';
import gundelik from '../../../content/onon/onon-gundelik.json';
import sevgili from '../../../content/onon/onon-sevgili.json';
import type { Deste } from '../../core/deste';

export const ononPaketleri: {
  id: string;
  ad: string;
  testID: string;
  deste: Deste;
}[] = [
  {
    id: 'sevgili',
    ad: 'Sevgili adayı',
    testID: 'onon-paket-sevgili',
    deste: sevgili,
  },
  {
    id: 'arkadas',
    ad: 'Arkadaş',
    testID: 'onon-paket-arkadas',
    deste: arkadas,
  },
  {
    id: 'gundelik',
    ad: 'Gündelik hayat',
    testID: 'onon-paket-gundelik',
    deste: gundelik,
  },
];
