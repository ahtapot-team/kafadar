import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { oyunlar } from '../src/games/registry';
import { useDurum } from '../src/durum';
import { easing, hareket } from '../src/tema';
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
          borderWidth: 4,
          borderColor: renk.kontur,
          borderRadius: 20,
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

export default function Ana() {
  const router = useRouter();
  const { yarimOyunVar, oyunuBitir, hazir, oyunuSec } = useDurum();
  const [soruldu, setSoruldu] = useState(false);
  return (
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
            onPress={() => {
              oyunuSec(oyun.id);
              router.push('/oyuncular');
            }}
          />
        ),
      )}
      <Dugme
        tur="ikincil"
        testID="ayarlar"
        etiket="Ayarlar"
        onPress={() => router.push('/ayarlar')}
      />
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
  );
}
