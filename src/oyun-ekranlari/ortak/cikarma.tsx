// Açıklamada kısa "çıkartma" etiketi (en düşük/en yüksek, oybirliği, bölündünüz): metin dışarıdan verilir.
import { View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, cizgi, yaricap } from '../../tema';
import { Yazi } from '../../ui';

export function Cikarma({
  testID,
  metin,
  dolgu,
  egim,
}: {
  testID: string;
  metin: string;
  dolgu: string;
  egim: number;
}) {
  const { renk } = useDurum();
  return (
    <View
      testID={testID}
      style={{
        backgroundColor: dolgu,
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        borderRadius: yaricap.cip,
        paddingHorizontal: bosluk.m,
        paddingVertical: bosluk.s,
        boxShadow: `4px 4px 0 ${renk.golge}`,
        transform: [{ rotate: `${egim}deg` }],
        flexShrink: 1,
      }}
    >
      <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 20 }}>
        {metin}
      </Yazi>
    </View>
  );
}
