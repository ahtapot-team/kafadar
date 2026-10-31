/* eslint-disable @typescript-eslint/no-require-imports -- Metro varlıkları yalnız sabit require ile bağlar */
// Oyun görselleri: Metro `require`'ı sabit yol ister, bu yüzden kayıttaki `gorsel` yolu burada kaynağa çevrilir (KK-127).
import type { ImageSourcePropType } from 'react-native';

const NESNE: Record<string, ImageSourcePropType> = {
  'assets/gorsel/ok-mu-nok.webp': require('../assets/gorsel/ok-mu-nok.webp'),
  'assets/gorsel/on-on-ama.webp': require('../assets/gorsel/on-on-ama.webp'),
  'assets/gorsel/casus-kim.webp': require('../assets/gorsel/casus-kim.webp'),
  'assets/gorsel/quiz-night.webp': require('../assets/gorsel/quiz-night.webp'),
};

// Desen katmanı: nesne dosyasının adıyla aynı, assets/gorsel/desen/ altında.
const DESEN: Record<string, ImageSourcePropType> = {
  'assets/gorsel/ok-mu-nok.webp': require('../assets/gorsel/desen/ok-mu-nok.webp'),
  'assets/gorsel/on-on-ama.webp': require('../assets/gorsel/desen/on-on-ama.webp'),
  'assets/gorsel/casus-kim.webp': require('../assets/gorsel/desen/casus-kim.webp'),
  'assets/gorsel/quiz-night.webp': require('../assets/gorsel/desen/quiz-night.webp'),
};

export const nesneKaynagi = (yol: string): ImageSourcePropType | undefined =>
  NESNE[yol];
export const desenKaynagi = (yol: string): ImageSourcePropType | undefined =>
  DESEN[yol];
export const ayarlarKaynagi: ImageSourcePropType = require('../assets/gorsel/ayarlar.webp');

// İkon zemini: renk token adı (Bileşen 14); kayıtta olmayan oyun `marka` alır.
const ZEMIN: Record<string, 'marka' | 'marka2' | 'golge' | 'gece'> = {
  'ok-mu-nok': 'marka',
  '10-10-ama': 'marka2',
  'casus-kim': 'golge',
  'quiz-night': 'gece',
};
export const zeminAdi = (id: string) => ZEMIN[id] ?? 'marka';
