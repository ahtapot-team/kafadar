// Casus kim kelime desteleri (content/casus/*.json). Paket seçimi testID'leri sözleşmedeki adlarla.
import meslekler from '../../../content/casus/casus-meslekler.json';
import yerler from '../../../content/casus/casus-yerler.json';
import yiyecek from '../../../content/casus/casus-yiyecek.json';
import type { CasusDeste } from '../../games/casus-kim/casus';

export const casusPaketleri: {
  id: string;
  ad: string;
  testID: string;
  deste: CasusDeste;
}[] = [
  { id: 'yerler', ad: 'Yerler', testID: 'casus-paket-yerler', deste: yerler },
  {
    id: 'yiyecek',
    ad: 'Yiyecek-İçecek',
    testID: 'casus-paket-yiyecek',
    deste: yiyecek,
  },
  {
    id: 'meslekler',
    ad: 'Meslekler',
    testID: 'casus-paket-meslekler',
    deste: meslekler,
  },
];
