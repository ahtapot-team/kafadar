import { useRouter } from 'expo-router';
import { Dugme, Ekran, GeriCubugu, Yazi } from '../src/ui';

// OK mu NOK mu mod seçimi (KK-28). Tek telefon modu değişmeden çevrimdışı çalışır.
export default function Mod() {
  const router = useRouter();
  return (
    <Ekran>
      <GeriCubugu testID="geri" />
      <Yazi tur="baslik">Nasıl oynuyoruz?</Yazi>
      <Dugme
        testID="mod-tek-telefon"
        etiket="Tek telefon"
        onPress={() => router.push('/oyuncular')}
      />
      <Yazi soluk>Telefon elden ele, internet gerekmez.</Yazi>
      <Dugme
        testID="mod-oda-kur"
        tur="ikincil"
        etiket="Oda kur"
        onPress={() => router.push('/oda/kur')}
      />
      <Yazi soluk>Herkes kendi telefonundan oynar.</Yazi>
      <Dugme
        testID="mod-odaya-katil"
        tur="ikincil"
        etiket="Odaya katıl"
        onPress={() => router.push('/oda/katil')}
      />
      <Yazi soluk>Arkadaşının 6 haneli kodu ile.</Yazi>
      <Yazi tur="etiket" soluk>
        Oda modunda 10 soru, her biri 15 sn. Sonuçlar en sonda.
      </Yazi>
    </Ekran>
  );
}
