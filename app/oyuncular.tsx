import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import {
  baslayabilir,
  ekleyebilir,
  isimDuzelt,
  isimHatasi,
  taslakEkle,
  ISIM_MAKS,
} from '../src/core/oyuncular';
import { useDurum } from '../src/durum';
import { bosluk, dokunmaAlani, yaricap } from '../src/tema';
import { Dugme, Ekran, Yazi } from '../src/ui';

// Oyun öncesi: oyuncu listesi kurulur. `?oyunda=1` ile oyun ortasında düzenlenir (KK-6).
export default function Oyuncular() {
  const router = useRouter();
  const { oyunda } = useLocalSearchParams<{ oyunda?: string }>();
  const { renk, oyuncular, oyunculariAyarla, gecenEkip } = useDurum();
  const [ad, setAd] = useState('');
  const hata = ad ? isimHatasi(ad) : null;
  // Girdide yazılı isim "Devam"da otomatik eklenir; düğme buna göre açılır (#26).
  const taslakli = taslakEkle(oyuncular, ad);
  const taslakVar = taslakli.length > oyuncular.length;
  const durum = baslayabilir(taslakli);

  const ekle = () => {
    if (!taslakVar) return;
    oyunculariAyarla(taslakli);
    setAd('');
  };

  const bitti = () => {
    if (taslakVar) {
      oyunculariAyarla(taslakli);
      setAd('');
    }
    if (oyunda) router.back();
    else router.push('/paket');
  };

  return (
    <Ekran>
      <Yazi tur="baslik">Oyuncular</Yazi>
      <Yazi soluk>
        {oyuncular.length} / 12 kişi. Boş kareye dokunmanın cezası yok, isimler
        de.
      </Yazi>
      {oyuncular.map((o, i) => (
        <View
          key={o}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: dokunmaAlani,
          }}
        >
          <Yazi testID={`oyuncu-satir-${i}`}>{o}</Yazi>
          <Pressable
            testID={`oyuncu-sil-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`${o} oyuncusunu çıkar`}
            onPress={() => oyunculariAyarla(oyuncular.filter((x) => x !== o))}
            style={{
              minWidth: dokunmaAlani,
              minHeight: dokunmaAlani,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Yazi>✕</Yazi>
          </Pressable>
        </View>
      ))}
      {ekleyebilir(oyuncular) && (
        <View style={{ gap: bosluk.s }}>
          <TextInput
            testID="oyuncu-ad-girdisi"
            accessibilityLabel="Oyuncu adı"
            value={ad}
            onChangeText={setAd}
            onSubmitEditing={ekle}
            placeholder="İsim yaz"
            placeholderTextColor={renk.metinSoluk}
            maxLength={ISIM_MAKS + 8}
            returnKeyType="done"
            style={{
              minHeight: dokunmaAlani,
              paddingHorizontal: bosluk.l,
              borderRadius: yaricap.cip,
              borderWidth: 3,
              borderColor: renk.kontur,
              backgroundColor: renk.yuzey,
              color: renk.metin,
              fontSize: 17,
            }}
          />
          {hata && (
            <Yazi soluk testID="oyuncu-hata">
              {hata}
            </Yazi>
          )}
          <Dugme
            testID="oyuncu-ekle"
            tur="ikincil"
            etiket="Ekle"
            pasif={!isimDuzelt(ad) || !!hata}
            onPress={ekle}
          />
        </View>
      )}
      {gecenEkip.length > 0 && oyuncular.length === 0 && (
        <Dugme
          testID="gecen-ekip"
          tur="ikincil"
          etiket="Geçen seferki ekip"
          onPress={() => oyunculariAyarla(gecenEkip)}
        />
      )}
      {!durum.tamam && (
        <Yazi tur="etiket" testID="basla-neden">
          {durum.neden}
        </Yazi>
      )}
      <Dugme
        testID="basla"
        etiket={taslakVar ? 'Ekle ve devam' : oyunda ? 'Tamam' : 'Devam'}
        pasif={!durum.tamam}
        onPress={bitti}
      />
    </Ekran>
  );
}
