import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Qr } from '../../src/baglanti/qr';
import { useOda } from '../../src/baglanti/baglam';
import { useDurum } from '../../src/durum';
import { bosluk, yaricap } from '../../src/tema';
import { Dugme, Ekran, Yazi } from '../../src/ui';

// Lobi (KK-31): kod, QR (kuran), katılanlar; Başlat yalnızca kuranda. Kopunca "Yeniden bağlanıyor…" (KK-37).
export default function Lobi() {
  const router = useRouter();
  const { renk } = useDurum();
  const { istemci, durum } = useOda();
  const g = durum.gorunum;

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
              borderRadius: yaricap.cip,
              borderWidth: 3,
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
              borderWidth: 3,
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
      {g && g.asama !== 'lobi' && (
        <Yazi testID="lobi-basladi">Oyun başladı…</Yazi>
      )}
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
      {durum.baglanti === 'yeniden' && (
        <View
          testID="yeniden-baglaniyor"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            left: bosluk.l,
            right: bosluk.l,
            top: '35%',
            padding: bosluk.xl,
            borderRadius: yaricap.kart,
            borderWidth: 4,
            borderColor: renk.kontur,
            backgroundColor: renk.marka2,
            gap: bosluk.s,
          }}
        >
          <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 26 }}>
            Yeniden bağlanıyor…
          </Yazi>
          <Yazi style={{ color: renk.kontur }}>
            Odadaki yerin duruyor. Bağlanınca açık olan soruya katılırsın; kaçan
            sorular "boş" sayılır.
          </Yazi>
        </View>
      )}
    </Ekran>
  );
}
