// Oyun ekranlarının ortak parçaları: üst çubuk ve ikon düğmesi.
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, dokunmaAlani, yaricap } from '../../tema';
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
        borderWidth: 3,
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
