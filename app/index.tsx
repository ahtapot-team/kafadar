import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { tanitimGerekli, tanitimGorulduMu } from '../src/core/tanitim';
import { depo } from '../src/depo';
import type { Oyun } from '../src/games/oyun';
import { oyunlar } from '../src/games/registry';
import { TanitimKarti } from '../src/tanitim-kutusu';
import { useDurum } from '../src/durum';
import {
  cizgi,
  dokunmaAlani,
  easing,
  hareket,
  kenarBosluk,
  yaricap,
} from '../src/tema';
import { Diyalog, Dugme, Ekran, Yazi } from '../src/ui';

// Logo açılışı ≤1 sn (KK-1). "Hareketi azalt" açıksa yalnızca kısa solma.
function Logo() {
  const { renk } = useDurum();
  const ilerleme = useSharedValue(0);
  useEffect(() => {
    let iptal = false;
    AccessibilityInfo.isReduceMotionEnabled().then((azalt) => {
      if (iptal) return;
      ilerleme.value = withTiming(1, {
        duration: azalt ? hareket.azaltilmisSolma : hareket.logo,
        easing: azalt ? Easing.linear : Easing.bezier(...easing.yay),
      });
    });
    return () => {
      iptal = true;
    };
  }, [ilerleme]);
  const stil = useAnimatedStyle(() => ({
    opacity: Math.min(1, ilerleme.value * 2),
    transform: [{ scale: 0.6 + 0.4 * ilerleme.value }, { rotate: '-4deg' }],
  }));
  return (
    <Animated.View
      testID="logo"
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: renk.marka,
          borderWidth: cizgi.kalin,
          borderColor: renk.kontur,
          borderRadius: yaricap.dugme,
          paddingHorizontal: 16,
          paddingVertical: 8,
          boxShadow: `5px 5px 0 ${renk.golge}`,
        },
        stil,
      ]}
    >
      <Yazi tur="baslikXl" style={{ color: renk.kontur }}>
        Kafadar
      </Yazi>
    </Animated.View>
  );
}

// Sabit ayarlar ikonu: ekranın sağ üstünde, kaydırınca da yerinde durur (KK-27); yalnızca ana ekranda.
function AyarlarIkonu() {
  const router = useRouter();
  const { renk } = useDurum();
  const ust = useSafeAreaInsets().top;
  return (
    <Pressable
      testID="ayarlar"
      accessibilityRole="button"
      accessibilityLabel="Ayarlar"
      onPress={() => router.push('/ayarlar')}
      style={{
        position: 'absolute',
        top: ust + 8,
        right: kenarBosluk,
        width: dokunmaAlani,
        height: dokunmaAlani,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: renk.yuzey,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Yazi>⚙️</Yazi>
    </Pressable>
  );
}

export default function Ana() {
  const router = useRouter();
  const { yarimOyunVar, oyunuBitir, hazir, oyunuSec } = useDurum();
  const [soruldu, setSoruldu] = useState(false);
  const [tanitim, setTanitim] = useState<Oyun | null>(null);
  const gir = (oyun: Oyun) => {
    oyunuSec(oyun.id);
    router.push(oyun.modSecimi ? '/mod' : '/oyuncular');
  };
  return (
    <View style={{ flex: 1 }}>
      <Ekran>
        <Logo />
        <Yazi soluk>Bir oyun seç, telefonu ele ver.</Yazi>
        {oyunlar.map((oyun) =>
          !oyun.aktif ? (
            <Dugme
              key={oyun.id}
              tur="ikincil"
              pasif
              testID={`ana-oyun-yakinda-${oyun.id}`}
              etiket={`${oyun.ad} · Yakında`}
              onPress={() => {}}
            />
          ) : (
            <Dugme
              key={oyun.id}
              testID={`ana-oyun-${oyun.id}`}
              etiket={oyun.ad}
              onPress={async () => {
                // İlk seçimde (bu telefonda) önce tanıtım kartı; görüldüyse eskisi gibi tek dokunuş (KK-73, KK-78).
                const goruldu = await tanitimGorulduMu(depo, oyun.id);
                if (oyun.tanitim && tanitimGerekli(goruldu, 'secim'))
                  setTanitim(oyun);
                else gir(oyun);
              }}
            />
          ),
        )}
        {tanitim && (
          <TanitimKarti
            oyun={tanitim}
            gorunur
            onTamam={() => {
              const o = tanitim;
              setTanitim(null);
              gir(o);
            }}
            onKapat={() => setTanitim(null)} // geri tuşu: ana ekranda kal, görüldü sayılmaz (KK-74)
          />
        )}
        <Diyalog
          gorunur={hazir && yarimOyunVar && !soruldu}
          baslik="Yarım kalan oyun var"
        >
          <Dugme
            testID="devam-et"
            etiket="Devam et"
            onPress={() => {
              setSoruldu(true);
              router.push('/oyun');
            }}
          />
          <Dugme
            testID="yeni-oyun"
            tur="ikincil"
            etiket="Yeni oyun"
            onPress={() => {
              oyunuBitir();
              setSoruldu(true);
            }}
          />
        </Diyalog>
      </Ekran>
      <AyarlarIkonu />
    </View>
  );
}
