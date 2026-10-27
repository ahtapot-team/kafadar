import { useKeepAwake } from 'expo-keep-awake';
import { useNavigation, useRouter } from 'expo-router';
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
  useKeepAwake(); // oyun sürerken ekran kapanmaz (KK-16)
  const router = useRouter();
  const gezinme = useNavigation<Gezinme>();
  const { oyunId, kurulum, oyunuBitir } = useDurum();
  const [cikisOnayi, setCikisOnayi] = useState(false);
  const bekleyen = useRef<unknown>(null);
  const izinli = useRef(false);

  const oyun =
    oyunlar.find((o) => o.id === oyunId && o.ekran) ??
    oyunlar.find((o) => o.aktif && o.ekran);
  const OyunEkrani = useMemo(
    () => (oyun?.ekran ? lazy(oyun.ekran) : null),
    [oyun],
  );

  // Android geri tuşu ve iOS kaydırarak geri: onay iste (KK-15).
  useEffect(
    () =>
      gezinme.addListener('beforeRemove', (e) => {
        if (izinli.current) return;
        e.preventDefault();
        bekleyen.current = e.data.action;
        setCikisOnayi(true);
      }),
    [gezinme],
  );

  const cik = () => {
    izinli.current = true;
    setCikisOnayi(false);
    oyunuBitir();
    if (bekleyen.current) gezinme.dispatch(bekleyen.current);
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
              bekleyen.current = null;
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
            bekleyen.current = null;
            setCikisOnayi(false);
          }}
        />
      </Diyalog>
    </>
  );
}
