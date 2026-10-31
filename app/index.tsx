import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
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
  kartEtiketi,
  kisiMetni,
  type CipId,
} from '../src/games/kategori';
import type { Oyun } from '../src/games/oyun';
import { oyunlar } from '../src/games/registry';
import { ustKartSec, type SonOynanan } from '../src/games/ust-kart';
import {
  ayarlarKaynagi,
  desenKaynagi,
  nesneKaynagi,
  zeminAdi,
} from '../src/gorsel';
import { depo } from '../src/depo';
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
import { Cip, Diyalog, Dugme, Yazi } from '../src/ui';

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

const SON_ANAHTAR = 'kafadar.sonOynanan';
const IPUCU = 'Kuralları görmek için oyuna basılı tut';

// Sabit ayarlar düğmesi: ekranın sağ üstünde, kaydırınca da yerinde durur (KK-27); yalnızca ana ekranda.
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
      <Image
        source={ayarlarKaynagi}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ width: 30, height: 30 }}
      />
    </Pressable>
  );
}

// "Hareketi azalt" açıksa basma animasyonu yerine yalnız opaklık değişir (KK-135).
function useHareketAzalt() {
  const [azalt, setAzalt] = useState(false);
  useEffect(() => {
    let iptal = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!iptal) setAzalt(v);
    });
    return () => {
      iptal = true;
    };
  }, []);
  return azalt;
}

// Oyun ikonu: zemin (token) + desen + taşan nesne (Bileşen 14).
function Ikon({ oyun, boyut }: { oyun: Oyun; boyut?: number }) {
  const { renk } = useDurum();
  const zemin = renk[zeminAdi(oyun.id)];
  const desen = desenKaynagi(oyun.gorsel);
  const nesne = nesneKaynagi(oyun.gorsel);
  const kucuk = boyut !== undefined;
  return (
    <View
      style={{
        width: kucuk ? boyut : '100%',
        aspectRatio: 1,
        borderRadius: kucuk ? 18 : 38,
        borderWidth: kucuk ? cizgi.ince : cizgi.kalin,
        borderColor: renk.kontur,
        backgroundColor: zemin,
        overflow: 'hidden',
        boxShadow: kucuk ? undefined : `6px 6px 0 ${renk.golge}`,
      }}
    >
      {desen && (
        <Image
          source={desen}
          resizeMode="cover"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      )}
      {nesne && (
        <Image
          testID={`ana-oyun-gorsel-${kucuk ? 'ust-' : ''}${oyun.id}`}
          source={nesne}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            left: '-10%',
            top: '-10%',
          }}
        />
      )}
    </View>
  );
}

// Izgara kartı: dokununca açılır, basılı tutunca tanıtım kartı (KK-130).
function OyunKarti({
  oyun,
  onAc,
  onTanitim,
}: {
  oyun: Oyun;
  onAc: () => void;
  onTanitim: () => void;
}) {
  const azalt = useHareketAzalt();
  if (!oyun.aktif)
    return (
      <View
        testID={`ana-oyun-yakinda-${oyun.id}`}
        accessible
        accessibilityLabel={`${oyun.ad}, yakında`}
        style={{ width: '48%', opacity: 0.55 }}
      >
        <Ikon oyun={oyun} />
        <Yazi tur="dugme" style={{ marginTop: bosluk.m, fontSize: 17 }}>
          {oyun.ad}
        </Yazi>
        <Yazi soluk>Yakında</Yazi>
      </View>
    );
  return (
    <Pressable
      testID={`ana-oyun-${oyun.id}`}
      accessibilityRole="button"
      accessibilityLabel={kartEtiketi(oyun)}
      accessibilityActions={[{ name: 'tanitim', label: 'Nasıl oynanır' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'tanitim') onTanitim();
      }}
      onPress={onAc}
      onLongPress={onTanitim}
      delayLongPress={500}
      style={({ pressed }) => ({
        width: '48%',
        minHeight: dokunmaAlani,
        opacity: pressed && azalt ? 0.7 : 1,
        transform: [{ scale: pressed && !azalt ? 0.94 : 1 }],
      })}
    >
      <Ikon oyun={oyun} />
      <Yazi tur="dugme" style={{ marginTop: bosluk.m, fontSize: 17 }}>
        {oyun.ad}
      </Yazi>
      <Yazi
        testID={`oyun-kisi-${oyun.id}`}
        soluk
        style={{ fontSize: 13, fontWeight: '700' }}
      >
        {kisiMetni(oyun)}
      </Yazi>
    </Pressable>
  );
}

// Üstte tek kart: son oynanan ya da öne çıkan (KK-129).
function UstKart({
  son,
  onAc,
}: {
  son: SonOynanan | null;
  onAc: (oyun: Oyun) => void;
}) {
  const { renk } = useDurum();
  const k = ustKartSec(son, oyunlar);
  return (
    <View
      testID="ust-kart"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: bosluk.m,
        padding: bosluk.m,
        backgroundColor: renk.yuzey,
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        borderRadius: 26,
        boxShadow: `6px 6px 0 ${renk.golge}`,
      }}
    >
      <Ikon oyun={k.oyun} boyut={62} />
      <View style={{ flex: 1 }}>
        <Yazi
          testID="ust-kart-etiket"
          soluk
          style={{
            fontSize: 12,
            fontWeight: '800',
            textTransform: 'uppercase',
          }}
        >
          {k.etiket}
        </Yazi>
        <Yazi tur="dugme" numberOfLines={1} style={{ fontSize: 17 }}>
          {k.oyun.ad}
        </Yazi>
        {k.altSatir && (
          <Yazi
            soluk
            numberOfLines={1}
            style={{ fontSize: 13, fontWeight: '700' }}
          >
            {k.altSatir}
          </Yazi>
        )}
      </View>
      <View style={{ width: 96 }}>
        <Dugme
          testID="ust-kart-oyna"
          etiket="Oyna"
          onPress={() => onAc(k.oyun)}
        />
      </View>
    </View>
  );
}

function BosKutu() {
  const { renk } = useDurum();
  return (
    <View
      testID="kategori-bos"
      style={{
        minHeight: 185,
        justifyContent: 'center',
        borderWidth: cizgi.kalin,
        borderStyle: 'dashed',
        borderColor: renk.metinSoluk,
        borderRadius: yaricap.dugme,
        padding: bosluk.xl,
      }}
    >
      <Yazi soluk style={{ textAlign: 'center' }}>
        {BOS_LISTE_METNI}
      </Yazi>
    </View>
  );
}

function Ipucu() {
  return (
    <Yazi
      soluk
      style={{ fontSize: 13, fontWeight: '700', textAlign: 'center' }}
    >
      {IPUCU}
    </Yazi>
  );
}

function DockEtiket() {
  return (
    <Yazi
      soluk
      style={{ fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}
    >
      Kaç kişisiniz?
    </Yazi>
  );
}

const DOCK_YUKSEKLIK = 128;

export default function Ana() {
  const router = useRouter();
  const { yarimOyunVar, oyunuBitir, hazir, oyunuSec, renk, oyuncular } =
    useDurum();
  const alt = useSafeAreaInsets().bottom;
  const [soruldu, setSoruldu] = useState(false);
  const [cip, setCip] = useState<CipId>('tumu'); // seçim kalıcı değil (KK-81)
  const [sonOynanan, setSonOynanan] = useState<SonOynanan | null>(null);
  const [tanitim, setTanitim] = useState<Oyun | null>(null);
  useEffect(() => {
    depo
      .getItem(SON_ANAHTAR)
      .then((v) => v && setSonOynanan(JSON.parse(v) as SonOynanan))
      .catch(() => {});
  }, []);
  const liste = filtrele(oyunlar, cip);
  const gir = (oyun: Oyun) => {
    const son = {
      oyunId: oyun.id,
      kisi: Math.max(oyuncular.length, oyun.minOyuncu ?? 2),
    };
    depo.setItem(SON_ANAHTAR, JSON.stringify(son)).catch(() => {});
    oyunuSec(oyun.id);
    router.push(oyun.modSecimi ? '/mod' : '/oyuncular');
  };
  const ust = useSafeAreaInsets().top;
  return (
    <View style={{ flex: 1, backgroundColor: renk.zemin }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: kenarBosluk,
          paddingTop: ust + bosluk.l,
          paddingBottom: DOCK_YUKSEKLIK + alt + bosluk.xl,
          gap: bosluk.l,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Logo />
        <UstKart son={sonOynanan} onAc={gir} />
        {liste.length === 0 ? (
          <BosKutu />
        ) : (
          <>
            <View
              testID="ana-izgara"
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                rowGap: 22,
              }}
            >
              {liste.map((oyun) => (
                <OyunKarti
                  key={oyun.id}
                  oyun={oyun}
                  onAc={() => gir(oyun)}
                  onTanitim={() => setTanitim(oyun)}
                />
              ))}
            </View>
            <Ipucu />
          </>
        )}
      </ScrollView>
      <View
        testID="kisi-dock"
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 18 + alt,
          paddingTop: 10,
          paddingHorizontal: 12,
          paddingBottom: 12,
          gap: bosluk.s,
          borderRadius: 32,
          borderWidth: cizgi.ince,
          borderColor: renk.kontur,
          backgroundColor: renk.dock,
        }}
      >
        <DockEtiket />
        <ScrollView
          testID="kategori-cipleri"
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: bosluk.s, flexGrow: 1 }}
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
      </View>
      <AyarlarIkonu />
      {tanitim && (
        <TanitimKarti
          oyun={tanitim}
          gorunur
          onTamam={() => setTanitim(null)}
          onKapat={() => setTanitim(null)}
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
    </View>
  );
}
