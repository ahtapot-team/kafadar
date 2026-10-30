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
import { tanitimGerekli, tanitimGorulduMu } from '../src/core/tanitim';
import { depo } from '../src/depo';
import {
  CIP_ETIKETI,
  cipSec,
  filtrele,
  gorunenCipler,
  kisiMetni,
  turEtiketi,
  type CipId,
} from '../src/games/kategori';
import type { Oyun } from '../src/games/oyun';
import { oyunlar } from '../src/games/registry';
import { TanitimKarti } from '../src/tanitim-kutusu';
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

// Oyun kartının ikinci satırı: tür rozeti + kişi sayısı (KK-84).
function KartAlt({ oyun }: { oyun: Oyun }) {
  const { renk } = useDurum();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.m }}>
      <View
        style={{
          backgroundColor: renk.kontur,
          borderRadius: yaricap.kucuk,
          paddingHorizontal: bosluk.s,
          paddingVertical: bosluk.xs,
        }}
      >
        <Yazi
          tur="etiket"
          testID={`oyun-tur-${oyun.id}`}
          style={{ color: renk.marka }}
        >
          {turEtiketi(oyun.tur)}
        </Yazi>
      </View>
      <Yazi testID={`oyun-kisi-${oyun.id}`} style={{ color: renk.kontur }}>
        👥 {kisiMetni(oyun)}
      </Yazi>
    </View>
  );
}

export default function Ana() {
  const router = useRouter();
  const { yarimOyunVar, oyunuBitir, hazir, oyunuSec } = useDurum();
  const [soruldu, setSoruldu] = useState(false);
  const [tanitim, setTanitim] = useState<Oyun | null>(null);
  const [cip, setCip] = useState<CipId>('tumu'); // seçim kalıcı değil (KK-81)
  const cipler = gorunenCipler(oyunlar);
  const gir = (oyun: Oyun) => {
    oyunuSec(oyun.id);
    router.push(oyun.modSecimi ? '/mod' : '/oyuncular');
  };
  return (
    <View style={{ flex: 1 }}>
      <Ekran>
        <Logo />
        <Yazi soluk>Bir oyun seç, telefonu ele ver.</Yazi>
        {cipler.length > 0 && (
          <ScrollView
            testID="kategori-cipleri"
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginHorizontal: -kenarBosluk }}
            contentContainerStyle={{
              paddingHorizontal: kenarBosluk,
              paddingBottom: bosluk.s,
              gap: bosluk.s,
            }}
          >
            {cipler.map((c) => (
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
        )}
        {filtrele(oyunlar, cip).map((oyun) =>
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
              erisilebilirEtiket={`${oyun.ad}, ${turEtiketi(oyun.tur)}, ${kisiMetni(oyun)}`}
              ek={<KartAlt oyun={oyun} />}
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
