import { durumGecerliMi as casusGecerliMi } from './casus-kim/casus';
import { okMuNok } from './ok-mu-nok';
import { durumGecerliMi as okGecerliMi } from './ok-mu-nok/oyun';
import { durumGecerliMi as ononGecerliMi } from './on-on-ama/onon';
import type { Oyun } from './oyun';

// Yeni oyun: modülünü yazıp buraya bir satır eklemek yeterli.
export const oyunlar: Oyun[] = [
  {
    ...okMuNok,
    modSecimi: true,
    ekran: () => import('../oyun-ekranlari/ok-mu-nok'),
    gecerliMi: okGecerliMi,
  },
  {
    id: '10-10-ama',
    ad: '10/10 ama',
    aktif: true,
    kurulum: '/onon/hazirlik',
    ekran: () => import('../oyun-ekranlari/on-on-ama'),
    gecerliMi: ononGecerliMi,
  },
  {
    id: 'casus-kim',
    ad: 'Casus kim',
    aktif: true,
    minOyuncu: 3,
    kurulum: '/casus/hazirlik',
    ekran: () => import('../oyun-ekranlari/casus-kim'),
    gecerliMi: casusGecerliMi,
  },
];
