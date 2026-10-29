// Oyun ekranlarının ortak parçaları: üst çubuk ve ikon düğmesi.
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, cizgi, dokunmaAlani, yaricap } from '../../tema';
import { Yazi } from '../../ui';

export function IkonDugme({
  simge,
  etiket,
  onPress,
  testID,
}: {
  simge: string;
  etiket: string;
  onPress: () => void;
  testID?: string;
}) {
  const { renk } = useDurum();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={etiket}
      onPress={onPress}
      style={{
        width: dokunmaAlani,
        height: dokunmaAlani,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: renk.yuzey,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Yazi>{simge}</Yazi>
    </Pressable>
  );
}

export function UstCubuk({
  orta,
  sag,
  onCik,
}: {
  orta: string;
  sag?: string;
  onCik: () => void;
}) {
  const { renk } = useDurum();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.m }}>
      <IkonDugme testID="cik" simge="✕" etiket="Oyundan çık" onPress={onCik} />
      <Yazi tur="etiket" soluk style={{ flex: 1, textAlign: 'center' }}>
        {orta}
      </Yazi>
      {sag ? (
        <View
          style={{
            minHeight: 32,
            justifyContent: 'center',
            paddingHorizontal: bosluk.m,
            borderRadius: yaricap.cip,
            backgroundColor: renk.marka2,
          }}
        >
          <Yazi tur="etiket" style={{ color: renk.kontur }}>
            {sag}
          </Yazi>
        </View>
      ) : (
        <View style={{ width: dokunmaAlani }} />
      )}
    </View>
  );
}

// KK-25: kart metni geri sayımdan sonra kaybolmaz; küçülüp üstte durur (oy girişi ve açıklama anında).
// Yazı 16pt'nin altına inmez, uzun metin satır kaydırır.
export function KartSeridi({
  metin,
  testID,
}: {
  metin: string;
  testID: string;
}) {
  const { renk } = useDurum();
  return (
    <View
      accessibilityLabel={`Kart: ${metin}`}
      style={{
        backgroundColor: renk.marka,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        borderRadius: yaricap.cip,
        padding: bosluk.m,
        boxShadow: `3px 3px 0 ${renk.golge}`,
      }}
    >
      <Yazi
        testID={testID}
        style={{ color: renk.kontur, fontSize: 16, lineHeight: 22 }}
      >
        {metin}
      </Yazi>
    </View>
  );
}
