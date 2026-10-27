// Oda ekranlarının ortak üst satırı: oda rozeti (marka-2), ortada başlık, sağda süre ya da boşluk.
import { Pressable, View } from 'react-native';
import { useDurum } from '../durum';
import { bosluk, dokunmaAlani, yaricap } from '../tema';
import { Yazi } from '../ui';

export function OdaUst({
  kod,
  orta,
  sag,
  sagTestID,
  onCik,
}: {
  kod: string;
  orta: string;
  sag?: string;
  sagTestID?: string;
  onCik?: () => void; // oyun içi çıkış ikonu: "Odadan çık?" (#73)
}) {
  const { renk } = useDurum();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.m }}>
      <View
        style={{
          paddingHorizontal: bosluk.m,
          minHeight: 32,
          justifyContent: 'center',
          borderRadius: yaricap.cip,
          borderWidth: 3,
          borderColor: renk.kontur,
          backgroundColor: renk.marka2,
        }}
      >
        <Yazi tur="etiket" style={{ color: renk.kontur }}>
          {kod}
        </Yazi>
      </View>
      <Yazi tur="etiket" soluk style={{ flex: 1, textAlign: 'center' }}>
        {orta}
      </Yazi>
      <Yazi
        testID={sagTestID}
        tur="etiket"
        style={{ minWidth: 40, textAlign: 'right' }}
      >
        {sag ?? ''}
      </Yazi>
      {onCik && (
        <Pressable
          testID="oda-cik"
          accessibilityRole="button"
          accessibilityLabel="Odadan çık"
          onPress={onCik}
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
          <Yazi>✕</Yazi>
        </Pressable>
      )}
    </View>
  );
}
