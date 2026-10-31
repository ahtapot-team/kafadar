// Quiz Night mod seçimi (KK-107): Tek başına paket seçimine, grup oyuncular ekranına gider. Oda Faz 2.
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { gorunenModlar, type ModId } from '../../src/games/quiz-night/arayuz';
import { useDurum } from '../../src/durum';
import { BilgiDugmesi } from '../../src/tanitim-kutusu';
import { Dugme, Ekran, GeriCubugu, Yazi } from '../../src/ui';

const ACIKLAMA: Record<string, string> = {
  tek: '10 soru, kendi hızında. Süre yok.',
  grup: 'Telefonu tutan okur, herkes sesli cevaplar. 2–12 kişi.',
  'oda-kur': 'Herkes kendi telefonundan oynar.',
  'oda-katil': 'Arkadaşının 6 haneli kodu ile.',
};
const TESTID: Record<string, string> = {
  tek: 'quiz-mod-tek',
  grup: 'quiz-mod-grup',
  'oda-kur': 'quiz-mod-oda-kur',
  'oda-katil': 'quiz-mod-oda-katil',
};

export default function QuizMod() {
  const router = useRouter();
  const { oyunId, oyunAyari, oyunAyariniAyarla, oyunculariAyarla } = useDurum();
  const sec = (mod: ModId) => {
    if (mod === 'oda-kur' || mod === 'oda-katil') {
      router.push(mod === 'oda-kur' ? '/oda/kur' : '/oda/katil'); // kod, QR, lobi mevcut oda akışı (KK-70)
      return;
    }
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
            testID={TESTID[m.id]}
            tur={m.id === 'tek' ? 'birincil' : 'ikincil'}
            etiket={m.etiket}
            onPress={() => sec(m.id)}
          />
          <Yazi soluk>{ACIKLAMA[m.id]}</Yazi>
        </View>
      ))}
    </Ekran>
  );
}
