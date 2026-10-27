import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useNavigation, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { oyunlar } from '../src/games/registry';
import { desteler } from '../src/desteler';
import { useDurum } from '../src/durum';
import { Diyalog, Dugme } from '../src/ui';

type Gezinme = {
  addListener(
    ad: 'beforeRemove',
    f: (e: { preventDefault(): void; data: { action: unknown } }) => void,
  ): () => void;
  dispatch(eylem: unknown): void;
};

// Oyun çerçevesi: geri onayı, ekran açık kalır. İçeriği seçilen oyunun ekranı çizer (registry'den).
export default function Oyun() {
  const router = useRouter();
  const gezinme = useNavigation<Gezinme>();
  const { oyunId, kurulum, oyunuBitir } = useDurum();
  const [cikisOnayi, setCikisOnayi] = useState(false);
  const izinli = useRef(false);

  const oyun =
    oyunlar.find((o) => o.id === oyunId && o.ekran) ??
    oyunlar.find((o) => o.aktif && o.ekran);
  const OyunEkrani = useMemo(
    () => (oyun?.ekran ? lazy(oyun.ekran) : null),
    [oyun],
  );

  // Oyun sürerken ekran kapanmaz (KK-16). Web'de çağrılmaz: Wake Lock desteği yok/uyarı verir.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    activateKeepAwakeAsync('oyun').catch(() => {});
    return () => void deactivateKeepAwake('oyun');
  }, []);

  // Android geri tuşu ve iOS kaydırarak geri: onay iste (KK-15).
  useEffect(
    () =>
      gezinme.addListener('beforeRemove', (e) => {
        if (izinli.current) return;
        e.preventDefault();
        setCikisOnayi(true);
      }),
    [gezinme],
  );

  // Web: tarayıcı geri tuşu beforeRemove'u tetiklemez. Aynı adresli bir ek geçmiş girdisi koyup
  // geri gelince onayı açıyoruz (KK-15 web'de de geçerli).
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    window.history.pushState(null, '', window.location.href);
    const geriGeldi = () => {
      if (izinli.current) return;
      window.history.pushState(null, '', window.location.href);
      setCikisOnayi(true);
    };
    window.addEventListener('popstate', geriGeldi);
    return () => window.removeEventListener('popstate', geriGeldi);
  }, []);

  const cik = () => {
    izinli.current = true;
    setCikisOnayi(false);
    oyunuBitir();
    // Çıkınca oyun dışı ekranlara değil ana ekrana dön (oyuna geri dönüş yok, KK-26).
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };

  return (
    <>
      <Suspense fallback={null}>
        {OyunEkrani && (
          <OyunEkrani
            deste={desteler[kurulum.paket]}
            uzunluk={kurulum.tur}
            onCik={() => {
              setCikisOnayi(true);
            }}
            onOyuncular={() =>
              router.push({ pathname: '/oyuncular', params: { oyunda: '1' } })
            }
            onAnaMenu={cik}
          />
        )}
      </Suspense>
      <Diyalog gorunur={cikisOnayi} baslik="Oyundan çık?">
        <Dugme testID="cikis-onay-evet" etiket="Çık" onPress={cik} />
        <Dugme
          testID="cikis-onay-hayir"
          tur="ikincil"
          etiket="Oyuna dön"
          onPress={() => {
            setCikisOnayi(false);
          }}
        />
      </Diyalog>
    </>
  );
}
