import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { isimDuzelt, isimHatasi } from '../../src/core/oyuncular';
import { useOda } from '../../src/baglanti/baglam';
import { Dugme, Ekran, GeriCubugu, Girdi, Yazi } from '../../src/ui';

const IZINLI = /[^A-HJ-NP-Z2-9]/g; // O, 0, I, 1 yok (KK-29)

// Odaya katıl: kod + isim; hatalar Türkçe ve net (KK-30). `?kod=` QR'dan gelir.
export default function OdayaKatil() {
  const router = useRouter();
  const { kod: gelenKod } = useLocalSearchParams<{ kod?: string }>();
  const { istemci, durum } = useOda();
  const [kod, setKod] = useState(
    (gelenKod ?? '').toUpperCase().replace(IZINLI, '').slice(0, 4),
  );
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
      <Girdi
        testID="katil-kod"
        accessibilityLabel="Oda kodu"
        value={kod}
        onChangeText={(t) =>
          setKod(t.toUpperCase().replace(IZINLI, '').slice(0, 4))
        }
        placeholder="ZEPA"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={4}
        style={{
          fontSize: 40,
          letterSpacing: 12,
          textAlign: 'center',
          minHeight: 72,
        }}
      />
      <Yazi soluk>
        Harf ve rakam karışmasın diye kodlarda O, 0, I ve 1 yok.
      </Yazi>
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
        pasif={kod.length < 4 || !isimDuzelt(ad) || !!hata || bekliyor}
        onPress={() => istemci.katil(kod, isimDuzelt(ad))}
      />
    </Ekran>
  );
}
