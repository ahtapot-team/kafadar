// Quiz Night mod seçimi (KK-107): Tek başına paket seçimine, grup oyuncular ekranına gider. Oda Faz 2.
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { gorunenModlar } from '../../src/games/quiz-night/arayuz';
import { useDurum } from '../../src/durum';
import { BilgiDugmesi } from '../../src/tanitim-kutusu';
import { Dugme, Ekran, GeriCubugu, Yazi } from '../../src/ui';

const ACIKLAMA: Record<string, string> = {
  tek: '10 soru, kendi hızında. Süre yok.',
  grup: 'Telefonu tutan okur, herkes sesli cevaplar. 2–12 kişi.',
};

export default function QuizMod() {
  const router = useRouter();
  const { oyunId, oyunAyari, oyunAyariniAyarla, oyunculariAyarla } = useDurum();
  const sec = (mod: 'tek' | 'grup') => {
    oyunAyariniAyarla({ ...oyunAyari, mod });
    if (mod === 'tek') {
      oyunculariAyarla(['Sen']); // tek başına: oyuncular ekranı atlanır
      router.push('/quiz/paket');
    } else router.push('/oyuncular');
  };
  return (
    <Ekran>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <GeriCubugu testID="geri" />
        <BilgiDugmesi oyunId={oyunId ?? ''} />
      </View>
      <Yazi tur="baslik">Nasıl oynuyoruz?</Yazi>
      {gorunenModlar().map((m) => (
        <View key={m.id} style={{ gap: 8 }}>
          <Dugme
            testID={m.id === 'tek' ? 'quiz-mod-tek' : 'quiz-mod-grup'}
            tur={m.id === 'tek' ? 'birincil' : 'ikincil'}
            etiket={m.etiket}
            onPress={() => sec(m.id as 'tek' | 'grup')}
          />
          <Yazi soluk>{ACIKLAMA[m.id]}</Yazi>
        </View>
      ))}
    </Ekran>
  );
}
