import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { isimDuzelt, isimHatasi } from '../../src/core/oyuncular';
import { paketler, type Paket } from '../../src/desteler';
import { useOda } from '../../src/baglanti/baglam';
import type { OnPaket } from '../../src/oda/mesaj';
import { ononPaketleri } from '../../src/oyun-ekranlari/on-on-ama/desteler';
import { useDurum } from '../../src/durum';
import { bosluk } from '../../src/tema';
import { Cip, Dugme, Ekran, GeriCubugu, Girdi, Yazi } from '../../src/ui';

// Oda kur: isim ve paket; kurulunca lobiye (kod + QR) geçilir (KK-29).
export default function OdaKur() {
  const router = useRouter();
  const { istemci, durum } = useOda();
  const [ad, setAd] = useState('');
  const { oyunId } = useDurum();
  const onon = oyunId === '10-10-ama'; // 10/10 ama odası: kendi paketleri (KK-63)
  const [paket, setPaket] = useState<Paket>('arkadas');
  const [onPaket, setOnPaket] = useState<OnPaket>('sevgili');
  const hata = ad ? isimHatasi(ad) : null;
  const bekliyor = durum.baglanti === 'baglaniyor';

  useEffect(() => {
    if (durum.kod && durum.baglanti === 'acik') router.replace('/oda/lobi');
  }, [durum.kod, durum.baglanti, router]);

  return (
    <Ekran>
      <GeriCubugu testID="geri" />
      <Yazi tur="baslik">Oda kur</Yazi>
      <Yazi tur="etiket" soluk>
        Adın
      </Yazi>
      <Girdi
        testID="kur-ad"
        accessibilityLabel="Adın"
        value={ad}
        onChangeText={setAd}
        placeholder="İsim yaz"
        maxLength={24}
      />
      {hata && <Yazi soluk>{hata}</Yazi>}
      <Yazi tur="etiket" soluk>
        Paket
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {onon
          ? ononPaketleri.map((p) => (
              <Cip
                key={p.id}
                testID={`oda-onon-paket-${p.id}`}
                etiket={p.ad}
                secili={onPaket === p.id}
                onPress={() => setOnPaket(p.id as OnPaket)}
              />
            ))
          : paketler.map((p) => (
              <Cip
                key={p.id}
                testID={`kur-paket-${p.id}`}
                etiket={p.ad}
                secili={paket === p.id}
                onPress={() => setPaket(p.id)}
              />
            ))}
      </View>
      {durum.hata && <Yazi testID="kur-hata">{durum.hata.mesaj}</Yazi>}
      <Dugme
        testID="kur-gonder"
        etiket={bekliyor ? 'Oda kuruluyor…' : 'Oda kur'}
        pasif={!isimDuzelt(ad) || !!hata || bekliyor}
        onPress={() =>
          onon
            ? istemci.kur(isimDuzelt(ad), onPaket, 'on-on-ama')
            : istemci.kur(isimDuzelt(ad), paket)
        }
      />
    </Ekran>
  );
}
