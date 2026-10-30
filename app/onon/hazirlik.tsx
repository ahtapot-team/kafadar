// 10/10 ama hazırlık: paket ve tur uzunluğu; "Başla" oyunu açar (paket/uzunluk oyunAyari'nda, oyuna özel).
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useDurum } from '../../src/durum';
import { ononPaketleri } from '../../src/oyun-ekranlari/on-on-ama/desteler';
import { BilgiDugmesi } from '../../src/tanitim-kutusu';
import { bosluk } from '../../src/tema';
import { Cip, Dugme, Ekran, GeriCubugu, Yazi } from '../../src/ui';

const TURLER: { id: string; ad: string; deger: 10 | 20 | null }[] = [
  { id: '10', ad: '10 kart', deger: 10 },
  { id: '20', ad: '20 kart', deger: 20 },
  { id: 'sinirsiz', ad: 'Sınırsız', deger: null },
];

export default function OnOnHazirlik() {
  const router = useRouter();
  const { oyuncular, oyunAyari, oyunAyariniAyarla, oyunuBaslat } = useDurum();
  const [paket, setPaket] = useState(ononPaketleri[0].id);
  const [tur, setTur] = useState<10 | 20 | null>(20);

  const basla = () => {
    oyunAyariniAyarla({ ...oyunAyari, paket, uzunluk: tur });
    oyunuBaslat();
    router.replace('/oyun');
  };

  return (
    <Ekran>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <GeriCubugu testID="geri" />
        <BilgiDugmesi oyunId="10-10-ama" />
      </View>
      <Yazi tur="baslik">Paket ve süre</Yazi>
      <Yazi tur="etiket" soluk>
        10/10 ama · {oyuncular.length} oyuncu
      </Yazi>
      <Yazi tur="etiket" soluk>
        Paket
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {ononPaketleri.map((p) => (
          <Cip
            key={p.id}
            testID={p.testID}
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
        {TURLER.map((t) => (
          <Cip
            key={t.id}
            testID={`onon-tur-${t.id}`}
            etiket={t.ad}
            secili={tur === t.deger}
            onPress={() => setTur(t.deger)}
          />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <Dugme testID="onon-basla" etiket="Başla" onPress={basla} />
    </Ekran>
  );
}
