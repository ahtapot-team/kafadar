// Titreşim: tasarım "Titreşim ve ses" tablosu. Ayarlardan kapatılabilir (KK-20).
import * as Haptics from 'expo-haptics';

const eylem = {
  secim: () => Haptics.selectionAsync(),
  dugme: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  geriSayim: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  uyari: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  basari: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

export type TitresimTuru = keyof typeof eylem;

export const titret = (tur: TitresimTuru, acik: boolean) => {
  if (acik) eylem[tur]().catch(() => {});
};
