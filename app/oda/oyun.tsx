import { Redirect, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useOda } from '../../src/baglanti/baglam';
import { BeklemeEkrani } from '../../src/oda-ui/bekle';
import { FinalEkrani } from '../../src/oda-ui/final';
import { SoruEkrani } from '../../src/oda-ui/soru';
import { YenidenBaglaniyor } from '../../src/oda-ui/yeniden';
import { ayrilanlar } from '../../src/oda/ozet';
import { useDurum } from '../../src/durum';
import { bosluk, yaricap } from '../../src/tema';
import { Diyalog, Dugme, Ekran, Yazi } from '../../src/ui';

type Gezinme = {
  addListener(
    ad: 'beforeRemove',
    f: (e: { preventDefault(): void }) => void,
  ): () => void;
};

// Oda oyunu: aşamaya göre soru / bekleme (KK-32…KK-35). Sunucu her değişimde yeni görünüm gönderir.
export default function OdaOyun() {
  const router = useRouter();
  const { istemci, durum } = useOda();
  const gezinme = useNavigation<Gezinme>();
  const { renk } = useDurum();
  const [degistirNo, setDegistirNo] = useState<number | null>(null); // "Cevabı değiştir" açık olan soru
  const [cikisOnayi, setCikisOnayi] = useState(false);
  const [ayrilan, setAyrilan] = useState<string | null>(null);
  const izinli = useRef(false);
  const onceki = useRef<string[]>([]);
  const g = durum.gorunum;
  const bitti = g?.asama === 'bitti';

  // Android geri tuşu / iOS geri hareketi: oyun sürerken "Odadan çık?" sorar; final'de sormadan ayrılır (#73).
  useEffect(
    () =>
      gezinme.addListener('beforeRemove', (e) => {
        if (izinli.current) return;
        if (bitti) {
          istemci.ayril();
          return;
        }
        e.preventDefault();
        setCikisOnayi(true);
      }),
    [gezinme, bitti, istemci],
  );

  // Başka oyuncu ayrılınca ("X ayrıldı") kısa süre gösterilir; oyun kalanlarla sürer (KK-38).
  const adlar = g?.oyuncular.map((o) => o.ad).join('\u0000') ?? '';
  useEffect(() => {
    const simdi = adlar ? adlar.split('\u0000') : [];
    const gidenler =
      g?.asama === 'soru' ? ayrilanlar(onceki.current, simdi) : [];
    onceki.current = simdi;
    if (!gidenler.length) return;
    setAyrilan(`${gidenler.join(', ')} ayrıldı`);
    const t = setTimeout(() => setAyrilan(null), 4000);
    return () => clearTimeout(t);
  }, [adlar, g?.asama]);

  const odadanCik = () => {
    izinli.current = true;
    setCikisOnayi(false);
    istemci.ayril();
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };

  if (!durum.kod)
    return (
      <Ekran>
        <Yazi tur="baslik">Oda bulunamadı</Yazi>
        {durum.hata && <Yazi soluk>{durum.hata.mesaj}</Yazi>}
        <Dugme etiket="Ana ekran" onPress={() => router.replace('/')} />
      </Ekran>
    );

  if (!g)
    return (
      <Ekran>
        <Yazi tur="baslik">Bağlanıyor…</Yazi>
        {durum.baglanti === 'yeniden' && <YenidenBaglaniyor />}
      </Ekran>
    );

  if (g.asama === 'lobi') return <Redirect href="/oda/lobi" />;

  if (g.asama === 'soru') {
    const cevapladi = g.benimOyum != null && degistirNo !== g.soruNo;
    return (
      <>
        {cevapladi ? (
          <BeklemeEkrani
            durum={durum}
            onDegistir={() => setDegistirNo(g.soruNo ?? null)}
            onCik={() => setCikisOnayi(true)}
          />
        ) : (
          <SoruEkrani
            durum={durum}
            onOyla={(oy) => {
              istemci.cevapla(oy);
              setDegistirNo(null);
            }}
            onCik={() => setCikisOnayi(true)}
          />
        )}
        {ayrilan && (
          <View
            testID="oda-ayrildi"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={{
              position: 'absolute',
              top: 12,
              left: bosluk.l,
              right: bosluk.l,
              padding: bosluk.m,
              borderRadius: yaricap.cip,
              borderWidth: 3,
              borderColor: renk.kontur,
              backgroundColor: renk.marka,
            }}
          >
            <Yazi tur="etiket" style={{ color: renk.kontur }}>
              {ayrilan}
            </Yazi>
          </View>
        )}
        <Diyalog gorunur={cikisOnayi} baslik="Odadan çık?">
          <Yazi style={{ color: '#0B0920' }}>
            Odadan ayrılırsın; önceki cevapların finalde kalır, ödüllere
            girmezsin.
          </Yazi>
          <Dugme testID="cikis-onay-evet" etiket="Çık" onPress={odadanCik} />
          <Dugme
            testID="cikis-onay-hayir"
            tur="ikincil"
            etiket="Oyuna dön"
            onPress={() => setCikisOnayi(false)}
          />
        </Diyalog>
      </>
    );
  }

  // 'bitti': final (kuran çıkınca / tek oyuncu kalınca önce "Oda kapandı", KK-38). Tekrar oyna = yeni mod seçimi.
  const cik = (hedef: '/' | '/mod') => {
    izinli.current = true;
    istemci.ayril();
    router.replace(hedef);
  };
  return (
    <FinalEkrani
      durum={durum}
      onTekrar={() => cik('/mod')}
      onAnaMenu={() => cik('/')}
    />
  );
}
