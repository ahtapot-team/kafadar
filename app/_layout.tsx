import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
  // Yazı tipi yüklenemezse sistem fontuyla devam edilir.
  if (!fontHazir && !fontHatasi) return null;
  return (
    <SafeAreaProvider>
      <DurumSaglayici depo={depo}>
        <OdaSaglayici depo={depo}>
          <Yigin />
        </OdaSaglayici>
      </DurumSaglayici>
    </SafeAreaProvider>
  );
}
