import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
  return (
    <SafeAreaProvider>
      <DurumSaglayici depo={depo}>
        <Yigin />
      </DurumSaglayici>
    </SafeAreaProvider>
  );
}
