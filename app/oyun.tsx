import { useKeepAwake } from 'expo-keep-awake';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { paketler } from '../src/desteler';
import { useDurum } from '../src/durum';
import { Diyalog, Dugme, Ekran, Yazi } from '../src/ui';

type Gezinme = {
  addListener(
    ad: 'beforeRemove',
    f: (e: { preventDefault(): void; data: { action: unknown } }) => void,
  ): () => void;
  dispatch(eylem: unknown): void;
};

// Oyun ekranı çerçevesi: geri onayı, ekran açık kalır, oyuncu düzenleme.
// Oyunun kendi içeriği (OK mu NOK mu) #7'de bu çerçevenin içine gelir.
export default function Oyun() {
  useKeepAwake(); // oyun sürerken ekran kapanmaz (KK-16)
  const router = useRouter();
  const gezinme = useNavigation<Gezinme>();
  const { oyuncular, kurulum, oyunuBitir } = useDurum();
  const [cikisOnayi, setCikisOnayi] = useState(false);
  const bekleyen = useRef<unknown>(null);
  const izinli = useRef(false);

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

  const paketAdi = paketler.find((p) => p.id === kurulum.paket)?.ad;

  return (
    <Ekran>
      <Yazi tur="etiket" soluk>
        {paketAdi} · {kurulum.tur ? `${kurulum.tur} kart` : 'Sınırsız'}
      </Yazi>
      <Yazi tur="baslik" testID="kart-metni">
        {oyuncular.join(', ')}
      </Yazi>
      <Yazi soluk>Oyun burada başlayacak (OK mu NOK mu, #7).</Yazi>
      <Dugme
        testID="oyuncu-duzenle"
        tur="ikincil"
        etiket="Oyuncular"
        onPress={() =>
          router.push({ pathname: '/oyuncular', params: { oyunda: '1' } })
        }
      />
      <Dugme
        testID="cik"
        tur="ikincil"
        etiket="Çık"
        onPress={() => {
          bekleyen.current = null;
          setCikisOnayi(true);
        }}
      />
      <Diyalog gorunur={cikisOnayi} baslik="Oyundan çık?">
        <Dugme testID="cikis-onay-evet" etiket="Çık" onPress={cik} />
        <Dugme
          testID="cikis-onay-hayir"
          tur="ikincil"
          etiket="Devam et"
          onPress={() => {
            bekleyen.current = null;
            setCikisOnayi(false);
          }}
        />
      </Diyalog>
    </Ekran>
  );
}
