import { Switch, View } from 'react-native';
import { useDurum } from '../src/durum';
import { Ekran, GeriCubugu, Yazi } from '../src/ui';

function Satir({
  ad,
  deger,
  onDegis,
  testID,
}: {
  ad: string;
  deger: boolean;
  onDegis: (v: boolean) => void;
  testID: string;
}) {
  const { renk } = useDurum();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
      }}
    >
      <Yazi>{ad}</Yazi>
      <Switch
        testID={testID}
        accessibilityLabel={ad}
        value={deger}
        onValueChange={onDegis}
        trackColor={{ true: renk.marka, false: renk.yuzey }}
        thumbColor={renk.kontur}
      />
    </View>
  );
}

export default function Ayarlar() {
  const { ayar, ayarla } = useDurum();
  return (
    <Ekran>
      <GeriCubugu testID="geri" />
      <Yazi tur="baslik">Ayarlar</Yazi>
      <Satir
        testID="ayar-ses"
        ad="Ses"
        deger={ayar.ses}
        onDegis={(ses) => ayarla({ ses })}
      />
      <Satir
        testID="ayar-titresim"
        ad="Titreşim"
        deger={ayar.titresim}
        onDegis={(titresim) => ayarla({ titresim })}
      />
      <Satir
        testID="ayar-tema"
        ad="Koyu tema"
        deger={ayar.tema === 'koyu'}
        onDegis={(koyu) => ayarla({ tema: koyu ? 'koyu' : 'acik' })}
      />
    </Ekran>
  );
}
