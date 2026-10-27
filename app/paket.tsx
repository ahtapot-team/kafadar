import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { paketler, type Paket } from '../src/desteler';
import { useDurum } from '../src/durum';
import { bosluk } from '../src/tema';
import { Cip, Dugme, Ekran, Yazi } from '../src/ui';

const turler: { id: string; ad: string; deger: 10 | 20 | null }[] = [
  { id: '10', ad: '10 kart', deger: 10 },
  { id: '20', ad: '20 kart', deger: 20 },
  { id: 'sinirsiz', ad: 'Sınırsız', deger: null },
];

export default function PaketSec() {
  const router = useRouter();
  const { kurulum, kurulumuAyarla, oyunuBaslat } = useDurum();
  const { paket, tur } = kurulum;
  const setPaket = (p: Paket) => kurulumuAyarla({ ...kurulum, paket: p });
  const setTur = (t: 10 | 20 | null) => kurulumuAyarla({ ...kurulum, tur: t });

  const basla = () => {
    oyunuBaslat();
    router.replace('/oyun');
  };

  return (
    <Ekran>
      <Yazi tur="baslik">Paket ve süre</Yazi>
      <Yazi tur="etiket" soluk>
        Paket
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {paketler.map((p) => (
          <Cip
            key={p.id}
            testID={`paket-${p.id}`}
            etiket={p.ad}
            secili={paket === p.id}
            onPress={() => setPaket(p.id)}
          />
        ))}
      </View>
      <Yazi tur="etiket" soluk>
        Tur uzunluğu
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {turler.map((t) => (
          <Cip
            key={t.id}
            testID={`tur-${t.id}`}
            etiket={t.ad}
            secili={tur === t.deger}
            onPress={() => setTur(t.deger)}
          />
        ))}
      </View>
      <Dugme testID="oyunu-baslat" etiket="Başla" onPress={basla} />
    </Ekran>
  );
}
