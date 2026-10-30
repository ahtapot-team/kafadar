import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AcilisEkrani } from '../src/acilis/ekran';
import { OdaSaglayici } from '../src/baglanti/baglam';
import { depo } from '../src/depo';
import { DurumSaglayici, useDurum } from '../src/durum';
import { hareket } from '../src/tema';

function Yigin() {
  const { renk, ayar } = useDurum();
  return (
    <>
      <StatusBar style={ayar.tema === 'koyu' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: renk.zemin },
          animationDuration: hareket.ekranGecisi,
        }}
      />
    </>
  );
}

export default function Layout() {
  const [fontHazir, fontHatasi] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_800ExtraBold,
  });
  // Açılış ekranı yazı tipi ve ayarlar okunurken görünür (boş ekran yok); yazı tipi yüklenemezse sistem fontuyla devam edilir.
  const [asama, setAsama] = useState<'acilis' | 'gecis' | 'bitti'>('acilis');
  const gec = useCallback(() => setAsama('gecis'), []);
  const bitti = useCallback(() => setAsama('bitti'), []);
  return (
    <SafeAreaProvider>
      <DurumSaglayici depo={depo}>
        <OdaSaglayici depo={depo}>
          <Yigin />
          {asama !== 'bitti' && (
            <AcilisEkrani
              fontHazir={fontHazir || !!fontHatasi}
              onGec={gec}
              onBitti={bitti}
            />
          )}
        </OdaSaglayici>
      </DurumSaglayici>
    </SafeAreaProvider>
  );
}
