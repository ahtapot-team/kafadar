import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useOda } from '../../src/baglanti/baglam';
import { BeklemeEkrani } from '../../src/oda-ui/bekle';
import { FinalEkrani } from '../../src/oda-ui/final';
import { SoruEkrani } from '../../src/oda-ui/soru';
import { YenidenBaglaniyor } from '../../src/oda-ui/yeniden';
import { Dugme, Ekran, Yazi } from '../../src/ui';

// Oda oyunu: aşamaya göre soru / bekleme (KK-32…KK-35). Sunucu her değişimde yeni görünüm gönderir.
export default function OdaOyun() {
  const router = useRouter();
  const { istemci, durum } = useOda();
  const [degistirNo, setDegistirNo] = useState<number | null>(null); // "Cevabı değiştir" açık olan soru
  const g = durum.gorunum;

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
    return cevapladi ? (
      <BeklemeEkrani
        durum={durum}
        onDegistir={() => setDegistirNo(g.soruNo ?? null)}
      />
    ) : (
      <SoruEkrani
        durum={durum}
        onOyla={(oy) => {
          istemci.cevapla(oy);
          setDegistirNo(null);
        }}
      />
    );
  }

  // 'bitti': final (kuran çıkınca / tek oyuncu kalınca önce "Oda kapandı", KK-38). Tekrar oyna = yeni mod seçimi.
  const cik = (hedef: '/' | '/mod') => {
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
