// Casus kim hazırlık (KK-43, KK-48): paket, casus sayısı, isteğe bağlı toplam tartışma süresi; "Kartları dağıt".
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { casusSiniri } from '../../src/oyun-ekranlari/casus-kim/sinir';
import { useDurum } from '../../src/durum';
import { TanitimBaglantisi } from '../../src/tanitim-kutusu';
import { bosluk, cizgi, dokunmaAlani, yaricap } from '../../src/tema';
import { Cip, Dugme, Ekran, GeriCubugu, Yazi } from '../../src/ui';
import { casusPaketleri } from '../../src/oyun-ekranlari/casus-kim/desteler';

const SURELER: { id: string; ad: string; dk: 3 | 5 | 8 | null }[] = [
  { id: 'kapali', ad: 'Kapalı', dk: null },
  { id: '3', ad: '3 dk', dk: 3 },
  { id: '5', ad: '5 dk', dk: 5 },
  { id: '8', ad: '8 dk', dk: 8 },
];

function Adim({
  testID,
  etiket,
  simge,
  pasif,
  onPress,
}: {
  testID: string;
  etiket: string;
  simge: string;
  pasif: boolean;
  onPress: () => void;
}) {
  const { renk } = useDurum();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={etiket}
      accessibilityState={{ disabled: pasif }}
      disabled={pasif}
      onPress={onPress}
      style={{
        width: dokunmaAlani,
        height: dokunmaAlani,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: renk.yuzey,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pasif ? 0.4 : 1,
      }}
    >
      <Yazi tur="baslik" style={{ fontSize: 24 }}>
        {simge}
      </Yazi>
    </Pressable>
  );
}

export default function Hazirlik() {
  const router = useRouter();
  const { oyuncular, oyunAyari, oyunAyariniAyarla, oyunuBaslat } = useDurum();
  const sinir = casusSiniri(oyuncular.length);
  const [paket, setPaket] = useState(casusPaketleri[0].id);
  const [sayi, setSayi] = useState(1);
  const [sure, setSure] = useState<3 | 5 | 8 | null>(null);

  const dagit = () => {
    oyunAyariniAyarla({
      ...oyunAyari,
      paket,
      casusSayisi: Math.min(sayi, sinir),
      sureDk: sure,
    });
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
        <TanitimBaglantisi
          oyunId="casus-kim"
          testID="tanitim-nasil"
          etiket="Nasıl oynanır?"
        />
      </View>
      <Yazi tur="baslik">Hazırlık</Yazi>
      <Yazi tur="etiket" soluk>
        Casus kim · {oyuncular.length} oyuncu
      </Yazi>
      <Yazi tur="etiket" soluk>
        Paket
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {casusPaketleri.map((p) => (
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
        Casus sayısı
      </Yazi>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.l }}
      >
        <Adim
          testID="casus-sayi-azalt"
          etiket="Casus sayısını azalt"
          simge="−"
          pasif={sayi <= 1}
          onPress={() => setSayi(sayi - 1)}
        />
        <Yazi
          testID="casus-sayi"
          tur="baslik"
          style={{ minWidth: 48, textAlign: 'center' }}
          accessibilityLabel={`${sayi} casus`}
        >
          {sayi}
        </Yazi>
        <Adim
          testID="casus-sayi-artir"
          etiket="Casus sayısını artır"
          simge="+"
          pasif={sayi >= sinir}
          onPress={() => setSayi(sayi + 1)}
        />
      </View>
      <Yazi soluk>
        {oyuncular.length} kişide en çok {sinir} casus olabilir. Casuslar
        birbirini bilmez.
      </Yazi>
      <Yazi tur="etiket" soluk>
        Toplam tartışma süresi
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {SURELER.map((s) => (
          <Cip
            key={s.id}
            testID={`casus-sure-${s.id}`}
            etiket={s.ad}
            secili={sure === s.dk}
            onPress={() => setSure(s.dk)}
          />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <Dugme testID="casus-basla" etiket="Kartları dağıt" onPress={dagit} />
    </Ekran>
  );
}
