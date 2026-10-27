import { okMuNok } from './ok-mu-nok';
import type { Oyun } from './oyun';

// Yeni oyun: modülünü yazıp buraya bir satır eklemek yeterli.
export const oyunlar: Oyun[] = [
  okMuNok,
  { id: '10-10-ama', ad: '10/10 ama', aktif: false },
  { id: 'casus-kim', ad: 'Casus kim', aktif: false },
];
