// Ödül kartı (oturum sonu): başlık, ödül alan kişi(ler) ve isteğe bağlı alt satır; metin dışarıdan verilir.
import { View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, yaricap } from '../../tema';
import { Yazi } from '../../ui';

export function OdulKarti({
  testID,
  baslik,
  renkAdi,
  satirlar,
  notlar,
}: {
  testID: string;
  baslik: string;
  renkAdi: 'marka' | 'marka2' | 'yuzey' | 'nok' | 'ok';
  satirlar: string[];
  notlar?: string[];
}) {
  const { renk } = useDurum();
  const yazi = renkAdi === 'yuzey' ? renk.metin : renk.kontur;
  return (
    <View
      testID={testID}
      style={{
        backgroundColor: renk[renkAdi],
        borderWidth: 4,
        borderColor: renk.kontur,
        borderRadius: yaricap.kart,
        padding: bosluk.l,
        gap: bosluk.xs,
        boxShadow: `5px 5px 0 ${renk.golge}`,
      }}
    >
      <Yazi tur="etiket" style={{ color: yazi }}>
        {baslik}
      </Yazi>
      {satirlar.map((s, i) => (
        <View key={s}>
          <Yazi tur="baslik" style={{ color: yazi, fontSize: 24 }}>
            {s}
          </Yazi>
          {notlar && (
            <Yazi style={{ color: yazi, fontSize: 14 }}>{notlar[i]}</Yazi>
          )}
        </View>
      ))}
    </View>
  );
}
