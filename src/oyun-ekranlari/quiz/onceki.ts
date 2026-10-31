// Önceki turun soruları (KK-109): ekranlar depoyu bilmeden okur.
import { depo } from '../../depo';
import { oncekiOku } from '../../games/quiz-night/onceki';

export const oncekiSorular = (paketId: string) => oncekiOku(depo, paketId);
