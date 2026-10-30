// Açılış ekranı (issue 192, tasarım B · Renkli çıkartma): her açılışta bir kez, en az 3 sn; dokununca geçer (KK-94…KK-99).
// Kurallar saftır (src/core/acilis.ts, soz.ts); burası yalnızca çizer.
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import sozDosyasi from '../../content/acilis/sozler.json';
import { acilisOlustur } from '../core/acilis';
import { rngOlustur } from '../core/rng';
import { gercekSaat } from '../core/saat';
import { type Soz, sozAltYazisi, sozSec } from '../core/soz';
import { useDurum } from '../durum';
import { oyunlar } from '../games/registry';
import { bosluk, cizgi, easing, hareket, kenarBosluk, yaricap } from '../tema';
import { Yazi } from '../ui';

const SOZLER = sozDosyasi.sozler as Soz[];
const OYUN_BILGI = Object.fromEntries(
  oyunlar.map((o) => [o.id, { ad: o.ad, emoji: o.emoji }]),
);
const EMOJI = 48;
const BALON = 64;
const ADIM_MS = 80;
const SURME_MS = 300;
// Girişte yerine oturan öğe: sıra, gecikmeyi belirler; "Hareketi azalt" açıksa yerinde 150 ms solar.
function Giris({
  sira,
  azalt,
  baslangic,
  children,
  style,
}: {
  sira: number;
  azalt: boolean;
  baslangic: number;
  children: React.ReactNode;
  style?: object;
}) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      azalt ? 0 : baslangic + sira * ADIM_MS,
      withTiming(1, {
        duration: azalt ? hareket.azaltilmisSolma : hareket.sticker,
        easing: azalt ? Easing.linear : Easing.bezier(...easing.yay),
      }),
    );
  }, [v, azalt, baslangic, sira]);
  const stil = useAnimatedStyle(() => ({
    opacity: Math.min(1, v.value * 2),
    transform: azalt ? [] : [{ scale: 0.6 + 0.4 * v.value }],
  }));
  return <Animated.View style={[style, stil]}>{children}</Animated.View>;
}
export function AcilisEkrani({
  fontHazir,
  onGec,
  onBitti,
}: {
  fontHazir: boolean; // yazı tipi yüklendi ya da yüklenemedi (sistem fontuyla devam)
  onGec: () => void; // %100: asıl uygulama arkada açılır
  onBitti: () => void; // solma bitti: açılış ekranı kaldırılır
}) {
  const { renk, hazir: ayarHazir } = useDurum();
  const ek = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [azalt, setAzalt] = useState(false);
  const [akis] = useState(() => acilisOlustur(gercekSaat));
  const [soz] = useState(() => sozSec(SOZLER, rngOlustur(Date.now())));
  const [yuzde, setYuzde] = useState(0);
  const [cubukGenislik, setCubukGenislik] = useState(0);
  const [ofset, setOfset] = useState<number | null>(null);
  const ustY = useRef(0);
  useEffect(() => {
    let iptal = false;
    AccessibilityInfo.isReduceMotionEnabled().then((a) => {
      if (!iptal) setAzalt(a);
    });
    return () => {
      iptal = true;
    };
  }, []);
  useEffect(() => {
    akis.hazirlikOrani((fontHazir ? 0.5 : 0) + (ayarHazir ? 0.5 : 0));
    if (fontHazir && ayarHazir) akis.hazirlikBitti();
  }, [akis, fontHazir, ayarHazir]);
  const [gecti, setGecti] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      const d = akis.durum();
      setYuzde(d.yuzde);
      if (d.gecti) setGecti(true);
    }, 50);
    return () => clearInterval(t);
  }, [akis]);
  // %100 olunca asıl uygulama arkada açılır, bu ekran solarak kalkar.
  const solma = useSharedValue(1);
  useEffect(() => {
    if (!gecti) return;
    onGec();
    solma.value = withTiming(
      0,
      { duration: hareket.ekranGecisi, easing: Easing.linear },
      (bitti) => {
        if (bitti) onBitti();
      },
    );
  }, [gecti, onGec, onBitti, solma]);
  const solmaStil = useAnimatedStyle(() => ({ opacity: solma.value }));
  // Logo ilk karede ekranın ortasındadır (sistem açılış görseliyle aynı yer), sonra yerine süzülür.
  const kayma = useSharedValue(0);
  useEffect(() => {
    if (ofset == null) return;
    kayma.value = ofset;
    kayma.value = withDelay(
      150,
      withTiming(0, {
        duration: azalt ? 0 : SURME_MS,
        easing: Easing.bezier(...easing.yumusak),
      }),
    );
  }, [ofset, azalt, kayma]);
  const logoStil = useAnimatedStyle(() => ({
    transform: [{ translateY: kayma.value }],
  }));
  const rozet = sozAltYazisi(soz, OYUN_BILGI);
  const balonSol = Math.min(
    Math.max(cubukGenislik * (yuzde / 100) - BALON / 2, 0),
    Math.max(cubukGenislik - BALON, 0),
  );
  const girisBas = azalt ? 0 : 150 + SURME_MS;
  const emojiler = ['ok-mu-nok', 'casus-kim', '10-10-ama'].map(
    (id) => OYUN_BILGI[id]?.emoji,
  );
  return (
    <Animated.View
      testID="acilis-ekran"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: renk.zemin },
        solmaStil,
      ]}
    >
      <Pressable
        onPress={() => akis.dokun()}
        accessibilityHint="Geçmek için dokun"
        style={{
          flex: 1,
          paddingTop: ek.top,
          paddingBottom: ek.bottom + bosluk.l,
          paddingHorizontal: kenarBosluk,
        }}
      >
        <View
          style={{ flex: 1, justifyContent: 'center' }}
          onLayout={(e) => {
            ustY.current = e.nativeEvent.layout.y;
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {emojiler.map((e, i) => (
              <Giris
                key={i}
                sira={i + 1}
                azalt={azalt}
                baslangic={girisBas}
                style={{
                  marginTop: i === 1 ? 0 : bosluk.xl,
                  marginBottom: bosluk.l,
                  width: EMOJI,
                  height: EMOJI,
                  borderRadius: EMOJI / 2,
                  backgroundColor: renk.yuzey,
                  borderWidth: cizgi.ince,
                  borderColor: renk.kontur,
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `3px 3px 0 ${renk.golge}`,
                }}
              >
                <Yazi style={{ fontSize: 22, lineHeight: 28 }}>{e}</Yazi>
              </Giris>
            ))}
          </View>
          <Animated.View
            style={[{ alignSelf: 'center' }, logoStil]}
            onLayout={(e) => {
              const { y, height: h } = e.nativeEvent.layout;
              setOfset(height / 2 - (ek.top + ustY.current + y + h / 2));
            }}
          >
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: renk.marka2,
                borderWidth: cizgi.kalin,
                borderColor: renk.kontur,
                borderRadius: yaricap.dugme,
                transform: [
                  { rotate: '4deg' },
                  { translateX: 6 },
                  { translateY: 10 },
                ],
              }}
            />
            <View
              style={{
                backgroundColor: renk.marka,
                borderWidth: cizgi.kalin,
                borderColor: renk.kontur,
                borderRadius: yaricap.dugme,
                paddingHorizontal: bosluk.l,
                paddingVertical: bosluk.s,
                boxShadow: `5px 5px 0 ${renk.golge}`,
                transform: [{ rotate: '-4deg' }],
              }}
            >
              <Yazi
                tur="baslikXl"
                testID="acilis-ad"
                style={{ color: renk.kontur }}
              >
                Kafadar
              </Yazi>
            </View>
          </Animated.View>
          <View style={{ marginTop: bosluk.xl }}>
            <View
              onLayout={(e) => setCubukGenislik(e.nativeEvent.layout.width)}
              style={{ height: BALON + bosluk.xl }}
            >
              <View
                style={{
                  position: 'absolute',
                  left: balonSol,
                  bottom: bosluk.xl + bosluk.s,
                  width: BALON,
                  alignItems: 'center',
                  backgroundColor: renk.kontur,
                  borderRadius: yaricap.kucuk,
                  paddingVertical: bosluk.xs,
                }}
              >
                <Yazi
                  tur="cip"
                  testID="acilis-yuzde"
                  style={{ color: renk.marka, fontVariant: ['tabular-nums'] }}
                >
                  {`%${yuzde}`}
                </Yazi>
              </View>
              <View
                testID="acilis-cubuk"
                accessibilityRole="progressbar"
                accessibilityLabel={`Yükleniyor, yüzde ${yuzde}`}
                accessibilityValue={{ min: 0, max: 100, now: yuzde }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: bosluk.xl,
                  backgroundColor: renk.yuzey,
                  borderWidth: cizgi.kalin,
                  borderColor: renk.kontur,
                  borderRadius: yaricap.dugme,
                  overflow: 'hidden',
                  boxShadow: `5px 5px 0 ${renk.golge}`,
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${yuzde}%`,
                    backgroundColor: renk.marka,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            backgroundColor: renk.yuzey,
            borderWidth: cizgi.kalin,
            borderColor: renk.kontur,
            borderRadius: yaricap.dugme,
            padding: bosluk.l,
            paddingTop: bosluk.xl,
            boxShadow: `5px 5px 0 ${renk.golge}`,
            transform: [{ rotate: '-1.5deg' }],
          }}
        >
          <Yazi
            tur="baslikXl"
            style={{
              position: 'absolute',
              top: -bosluk.m,
              left: bosluk.m,
              color: renk.marka,
              lineHeight: 64,
            }}
          >
            “
          </Yazi>
          <Yazi testID="acilis-soz">{soz.text}</Yazi>
          {rozet && (
            <View
              style={{
                alignSelf: 'flex-start',
                marginTop: bosluk.m,
                backgroundColor: renk.kontur,
                borderRadius: yaricap.kucuk,
                paddingHorizontal: bosluk.m,
                paddingVertical: bosluk.xs,
              }}
            >
              <Yazi
                tur="cip"
                testID="acilis-soz-oyun"
                style={{ color: renk.marka }}
              >
                {rozet}
              </Yazi>
            </View>
          )}
        </View>
        <Yazi
          tur="etiket"
          soluk
          style={{ textAlign: 'center', marginTop: bosluk.l }}
        >
          Geçmek için dokun
        </Yazi>
      </Pressable>
    </Animated.View>
  );
}
