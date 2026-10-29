// Oda kodunu açan QR (KK-29): qrcode-generator ile üretilir, View'larla çizilir (native modül yok).
import qrcode from 'qrcode-generator';
import { useMemo } from 'react';
import { View } from 'react-native';
import { renkler, yaricap } from '../tema';

export function Qr({
  veri,
  boyut = 150,
  testID,
}: {
  veri: string;
  boyut?: number;
  testID?: string;
}) {
  const satirlar = useMemo(() => {
    const q = qrcode(0, 'M');
    q.addData(veri);
    q.make();
    const n = q.getModuleCount();
    return Array.from({ length: n }, (_, y) =>
      Array.from({ length: n }, (_, x) => q.isDark(y, x)),
    );
  }, [veri]);
  const hucre = boyut / (satirlar.length + 2); // 1 hücre sessiz bölge
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel="Oda kodunu açan QR"
      style={{
        width: boyut,
        height: boyut,
        backgroundColor: '#fff',
        padding: hucre,
        borderRadius: yaricap.kucuk,
      }}
    >
      {satirlar.map((s, y) => (
        <View key={y} style={{ flexDirection: 'row', height: hucre }}>
          {s.map((k, x) => (
            <View
              key={x}
              style={{
                width: hucre,
                height: hucre,
                backgroundColor: k ? renkler.koyu.kontur : renkler.acik.yuzey,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
