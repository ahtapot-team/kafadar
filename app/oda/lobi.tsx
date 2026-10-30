import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Qr } from '../../src/baglanti/qr';
import { useOda } from '../../src/baglanti/baglam';
import { useDurum } from '../../src/durum';
import { odaTuru } from '../../src/oda/istemci';
import { BilgiDugmesi, odaOyunId } from '../../src/tanitim-kutusu';
import { bosluk, cizgi, yaricap } from '../../src/tema';
import { YenidenBaglaniyor } from '../../src/oda-ui/yeniden';
import { Dugme, Ekran, Yazi } from '../../src/ui';

// Lobi (KK-31): kod, QR (kuran), katılanlar; Başlat yalnızca kuranda. Kopunca "Yeniden bağlanıyor…" (KK-37).
export default function Lobi() {
  const router = useRouter();
  const { renk } = useDurum();
  const { istemci, durum } = useOda();
  const g = durum.gorunum;
  // Odanın oyunu (kodla katılan hangi oyundan gelirse gelsin): kart bu oyunun kartıdır.
  const oyunId = odaOyunId(odaTuru(durum));

  useEffect(() => {
    if (g && g.asama !== 'lobi') router.replace('/oda/oyun');
  }, [g, router]);

  if (!durum.kod)
    return (
      <Ekran>
        <Yazi tur="baslik">Oda bulunamadı</Yazi>
        {durum.hata && <Yazi soluk>{durum.hata.mesaj}</Yazi>}
        <Dugme etiket="Ana ekran" onPress={() => router.replace('/')} />
      </Ekran>
    );

  const ayril = () => {
    istemci.ayril();
    router.replace('/');
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
        <View
          style={{
            paddingHorizontal: bosluk.m,
            minHeight: 32,
            justifyContent: 'center',
            borderRadius: yaricap.cip,
            borderWidth: cizgi.ince,
            borderColor: renk.kontur,
            backgroundColor: renk.marka2,
          }}
        >
          <Yazi tur="etiket" style={{ color: renk.kontur }}>
            ODA
          </Yazi>
        </View>
        <BilgiDugmesi oyunId={oyunId} />
      </View>
      <Yazi tur="etiket" soluk>
        Oda kodu
      </Yazi>
      <View
        testID="oda-kodu"
        accessible
        accessibilityLabel={`Oda kodu ${durum.kod.split('').join(' ')}`}
        style={{ flexDirection: 'row', gap: bosluk.m }}
      >
        {durum.kod.split('').map((h, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              aspectRatio: 1,
              maxHeight: 76,
              marginLeft: i === 3 ? bosluk.m : 0, // 3+3 gruplu gösterim
              borderRadius: yaricap.cip,
              borderWidth: cizgi.ince,
              borderColor: renk.kontur,
              backgroundColor: renk.marka,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Yazi tur="baslik" style={{ color: renk.kontur }}>
              {h}
            </Yazi>
          </View>
        ))}
      </View>
      {g?.baslatGorunur && (
        <View
          style={{ flexDirection: 'row', gap: bosluk.l, alignItems: 'center' }}
        >
          <Qr testID="oda-qr" veri={Linking.createURL(`oda/${durum.kod}`)} />
          <Yazi soluk style={{ flex: 1 }}>
            Kameranla okut ya da kodu söyle.
          </Yazi>
        </View>
      )}
      {g && !g.baslatGorunur && (
        <Yazi testID="lobi-bekle" tur="baslik" style={{ fontSize: 28 }}>
          İçeridesin!
        </Yazi>
      )}
      <Yazi tur="etiket" soluk>
        {g?.oyuncular.length ?? 0} kişi odada · en az 2, en çok 12
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
        {g?.oyuncular.map((o, i) => (
          <View
            key={`${o.ad}-${i}`}
            testID={`lobi-oyuncu-${i}`}
            style={{
              paddingHorizontal: bosluk.m,
              paddingVertical: bosluk.xs,
              borderRadius: yaricap.cip,
              borderWidth: cizgi.ince,
              borderColor: renk.kontur,
              backgroundColor: i === 0 ? renk.marka : renk.yuzey,
              opacity: o.bagli ? 1 : 0.5,
            }}
          >
            <Yazi
              tur="etiket"
              style={{ color: i === 0 ? renk.kontur : renk.metin }}
            >
              {o.ad}
              {o.ad === durum.ad ? ' (sen)' : ''}
              {i === 0 ? ' ★' : ''}
              {o.bagli ? '' : ' · bağlantı yok'}
            </Yazi>
          </View>
        ))}
      </View>
      {durum.hata && <Yazi testID="lobi-hata">{durum.hata.mesaj}</Yazi>}
      <View style={{ flex: 1 }} />
      {g?.baslatGorunur && (
        <Dugme
          testID="lobi-baslat"
          etiket={`Başlat · ${g.oyuncular.length} kişi`}
          pasif={!g.baslatAktif}
          onPress={() => istemci.baslat()}
        />
      )}
      {g && !g.baslatGorunur && (
        <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
          {g.oyuncular[0]?.ad} oyunu başlatınca ilk soru herkese aynı anda
          gelecek.
        </Yazi>
      )}
      <Dugme
        testID="lobi-ayril"
        tur="ikincil"
        etiket="Odadan ayrıl"
        onPress={ayril}
      />
      {durum.baglanti === 'yeniden' && <YenidenBaglaniyor />}
    </Ekran>
  );
}
