import { Redirect, useLocalSearchParams } from 'expo-router';

// QR / bağlantı: /oda/123456 → kod önceden dolu katılma ekranı.
export default function KodluGiris() {
  const { kod } = useLocalSearchParams<{ kod: string }>();
  return <Redirect href={{ pathname: '/oda/katil', params: { kod } }} />;
}
