import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  BOS_LISTE_METNI,
  CIP_ETIKETI,
  CIPLER,
  cipSec,
  filtrele,
  kisiMetni,
  type CipId,
} from '../src/games/kategori';
import type { Oyun } from '../src/games/oyun';
import { oyunlar } from '../src/games/registry';
import { useDurum } from '../src/durum';
import {
  bosluk,
  cizgi,
  dokunmaAlani,
  easing,
  hareket,
  kenarBosluk,
  yaricap,
} from '../src/tema';
import { Cip, Diyalog, Dugme, Ekran, Yazi } from '../src/ui';

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

// Oyun kartının ikinci satırı: kişi sayısı (KK-84).
function KartAlt({ oyun }: { oyun: Oyun }) {
  const { renk } = useDurum();
  return (
    <Yazi testID={`oyun-kisi-${oyun.id}`} style={{ color: renk.kontur }}>
      👥 {kisiMetni(oyun)}
    </Yazi>
  );
}

export default function Ana() {
  const router = useRouter();
  const { yarimOyunVar, oyunuBitir, hazir, oyunuSec, renk } = useDurum();
  const [soruldu, setSoruldu] = useState(false);
  const [cip, setCip] = useState<CipId>('tumu'); // seçim kalıcı değil (KK-81)
  const liste = filtrele(oyunlar, cip);
  const gir = (oyun: Oyun) => {
    oyunuSec(oyun.id);
    router.push(oyun.modSecimi ? '/mod' : '/oyuncular');
  };
  return (
    <View style={{ flex: 1 }}>
      <Ekran>
        <Logo />
        <ScrollView
          testID="kategori-cipleri"
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginHorizontal: -kenarBosluk }}
          contentContainerStyle={{
            paddingHorizontal: kenarBosluk,
            paddingBottom: bosluk.s,
            gap: bosluk.s,
            flexGrow: 1,
          }}
        >
          {CIPLER.map((c) => (
            <Cip
              key={c}
              kategori
              testID={`cip-${c}`}
              etiket={CIP_ETIKETI[c]}
              secili={cip === c}
              onPress={() => setCip(cipSec(cip, c))}
            />
          ))}
        </ScrollView>
        {liste.length === 0 && (
          <View
            testID="kategori-bos"
            style={{
              borderWidth: cizgi.ince,
              borderStyle: 'dashed',
              borderColor: renk.metin,
              borderRadius: yaricap.kart,
              padding: bosluk.xl,
            }}
          >
            <Yazi soluk style={{ textAlign: 'center' }}>
              {BOS_LISTE_METNI}
            </Yazi>
          </View>
        )}
        {liste.map((oyun) =>
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
              erisilebilirEtiket={`${oyun.ad}, ${kisiMetni(oyun)}`}
              ek={<KartAlt oyun={oyun} />}
              onPress={() => gir(oyun)}
            />
          ),
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
