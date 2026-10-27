import { useRouter } from 'expo-router';
import { Dugme, Ekran, Yazi } from '../src/ui';

// Geçersiz adres: sade Türkçe sayfa (yönlendiricinin varsayılan İngilizce ekranı yerine).
export default function BulunamadiEkrani() {
  const router = useRouter();
  return (
    <Ekran>
      <Yazi tur="baslik">Sayfa bulunamadı</Yazi>
      <Yazi soluk>Aradığın sayfa yok ya da taşınmış olabilir.</Yazi>
      <Dugme
        testID="ana-ekrana-don"
        etiket="Ana ekrana dön"
        onPress={() => router.replace('/')}
      />
    </Ekran>
  );
}
