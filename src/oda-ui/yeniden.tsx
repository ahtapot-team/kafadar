// "Yeniden bağlanıyor…" kartı (KK-37): oda ekranlarında bağlantı kopunca üstte görünür.
import { View } from 'react-native';
import { useDurum } from '../durum';
import { bosluk, cizgi, yaricap } from '../tema';
import { Yazi } from '../ui';

export function YenidenBaglaniyor() {
  const { renk } = useDurum();
  return (
    <View
      testID="yeniden-baglaniyor"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        left: bosluk.l,
        right: bosluk.l,
        top: '35%',
        padding: bosluk.xl,
        borderRadius: yaricap.kart,
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        backgroundColor: renk.marka2,
        gap: bosluk.s,
      }}
    >
      <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 26 }}>
        Yeniden bağlanıyor…
      </Yazi>
      <Yazi style={{ color: renk.kontur }}>
        Odadaki yerin duruyor. Bağlanınca açık olan soruya katılırsın; kaçan
        sorular "boş" sayılır.
      </Yazi>
    </View>
  );
}
