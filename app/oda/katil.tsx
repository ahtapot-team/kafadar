import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { isimDuzelt, isimHatasi } from '../../src/core/oyuncular';
import { useOda } from '../../src/baglanti/baglam';
import { useDurum } from '../../src/durum';
import { bosluk, cizgi, yaricap } from '../../src/tema';
import { Dugme, Ekran, GeriCubugu, Girdi, Yazi } from '../../src/ui';

const HANE = 6; // KK-29: 6 haneli rakam kodu
const sayiYap = (t: string) => t.replace(/\D/g, '').slice(0, HANE);

// Odaya katıl: kod + isim; hatalar Türkçe ve net (KK-30). `?kod=` QR'dan gelir.
export default function OdayaKatil() {
  const router = useRouter();
  const { kod: gelenKod } = useLocalSearchParams<{ kod?: string }>();
  const { renk } = useDurum();
  const { istemci, durum } = useOda();
  const [kod, setKod] = useState(sayiYap(gelenKod ?? ''));
  const [ad, setAd] = useState('');
  const hata = ad ? isimHatasi(ad) : null;
  const bekliyor = durum.baglanti === 'baglaniyor';

  useEffect(() => {
    if (durum.kod && durum.baglanti === 'acik') router.replace('/oda/lobi');
  }, [durum.kod, durum.baglanti, router]);

  return (
    <Ekran>
      <GeriCubugu testID="geri" />
      <Yazi tur="baslik">Kodu gir</Yazi>
      {/* 6 kutu: görünür kutular yalnızca gösterir; tek şeffaf sayı girdisi üstte durur (sayı tuş takımı). */}
      <View style={{ height: 76, justifyContent: 'center' }}>
        <View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', gap: bosluk.s }}
        >
          {Array.from({ length: HANE }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 76,
                marginLeft: i === 3 ? bosluk.m : 0, // 3+3 gruplu gösterim
                borderRadius: yaricap.cip,
                borderWidth: cizgi.ince,
                borderColor: i === kod.length ? renk.marka : renk.kontur,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Yazi tur="baslik">{kod[i] ?? ''}</Yazi>
            </View>
          ))}
        </View>
        <Girdi
          testID="katil-kod"
          accessibilityLabel="Oda kodu"
          value={kod}
          onChangeText={(t) => setKod(sayiYap(t))}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={32} // yapıştırılan "482 913" önce sayiYap'tan geçer, 6 haneye orada kırpılır
          autoCorrect={false}
          caretHidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.02,
            color: 'transparent', // girdideki metin kutuların arkasında görünmesin
            fontSize: 40,
          }}
        />
      </View>
      <Yazi soluk>Odayı kuran kişinin gösterdiği 6 haneli kodu gir.</Yazi>
      <Yazi tur="etiket" soluk>
        Adın
      </Yazi>
      <Girdi
        testID="katil-ad"
        accessibilityLabel="Adın"
        value={ad}
        onChangeText={setAd}
        placeholder="İsim yaz"
        maxLength={24}
      />
      {hata && <Yazi soluk>{hata}</Yazi>}
      {durum.hata && (
        <Yazi
          testID="katil-hata"
          accessibilityLabel={`Hata: ${durum.hata.mesaj}`}
        >
          ⚠ {durum.hata.mesaj}
        </Yazi>
      )}
      <Dugme
        testID="katil-gonder"
        etiket={
          bekliyor ? 'Katılınıyor…' : durum.hata ? 'Tekrar dene' : 'Katıl'
        }
        pasif={kod.length < HANE || !isimDuzelt(ad) || !!hata || bekliyor}
        onPress={() => istemci.katil(kod, isimDuzelt(ad))}
      />
    </Ekran>
  );
}
