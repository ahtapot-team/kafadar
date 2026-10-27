// Kart çevrilir, ardından 3-2-1 geri sayım (KK-9). Süreler tasarım hareket tablosundan.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useDurum } from '../../durum';
import { bosluk, easing, hareket, yaricap, yazi } from '../../tema';
import { titret } from '../../titresim';
import { Ekran, Yazi } from '../../ui';
import { UstCubuk } from './ortak';

type Props = {
  metin: string;
  sira: number;
  toplam: string; // "20" ya da "∞"
  paket: string;
  onBitti: () => void;
  onCik: () => void;
};

export function KartEkrani({
  metin,
  sira,
  toplam,
  paket,
  onBitti,
  onCik,
}: Props) {
  const { renk, ayar } = useDurum();
  const azalt = useReducedMotion();
  const cevirme = useSharedValue(azalt ? 0 : 180);
  const [sayi, setSayi] = useState<number | null>(null);
  const olcek = useSharedValue(1);

  useEffect(() => {
    titret('dugme', ayar.titresim); // çevirmede hafif titreşim
    cevirme.value = withTiming(0, {
      duration: azalt ? hareket.azaltilmisSolma : hareket.kartCevirme,
      easing: Easing.bezier(...easing.yumusak),
    });
    const t = setTimeout(
      () => setSayi(3),
      azalt ? hareket.azaltilmisSolma : hareket.kartCevirme,
    );
    return () => clearTimeout(t);
  }, [azalt, cevirme, ayar.titresim]);

  useEffect(() => {
    if (sayi === null) return;
    titret('geriSayim', ayar.titresim); // her saniye orta titreşim (KK-9)
    if (!azalt) {
      olcek.value = 1.4;
      olcek.value = withTiming(1, {
        duration: hareket.sayiGirisi,
        easing: Easing.bezier(...easing.yay),
      });
    }
    const t = setTimeout(
      () => (sayi > 1 ? setSayi(sayi - 1) : onBitti()),
      hareket.geriSayimAdimi,
    );
    return () => clearTimeout(t);
  }, [sayi, azalt, olcek, onBitti, ayar.titresim]);

  const on = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${cevirme.value}deg` },
      { rotate: '-3deg' },
    ],
  }));
  const arka = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${cevirme.value + 180}deg` },
      { rotate: '-3deg' },
    ],
  }));
  const sayiStil = useAnimatedStyle(() => ({
    transform: [{ scale: olcek.value }],
  }));

  const yuz = {
    position: 'absolute' as const,
    inset: 0,
    borderRadius: yaricap.kart,
    borderWidth: 4,
    borderColor: renk.kontur,
    backfaceVisibility: 'hidden' as const,
    boxShadow: `8px 8px 0 ${renk.golge}`,
  };

  return (
    <Ekran>
      <UstCubuk orta={`Kart ${sira} / ${toplam}`} sag={paket} onCik={onCik} />
      <View
        style={{
          height: 380,
          marginVertical: bosluk.xl,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: yaricap.kart,
            borderWidth: 4,
            borderColor: renk.kontur,
            backgroundColor: renk.marka2,
            transform: [{ rotate: '5deg' }],
          }}
        />
        <Animated.View style={[yuz, { backgroundColor: renk.marka2 }, arka]} />
        <Animated.View
          style={[
            yuz,
            {
              backgroundColor: renk.marka,
              padding: bosluk.xl,
              justifyContent: 'space-between',
            },
            on,
          ]}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: renk.kontur,
              borderRadius: yaricap.cip,
              paddingHorizontal: bosluk.m,
              paddingVertical: bosluk.xs,
            }}
          >
            <Yazi tur="etiket" style={{ color: renk.marka }}>
              Durum
            </Yazi>
          </View>
          <Text
            testID="kart-metni"
            maxFontSizeMultiplier={1.3}
            adjustsFontSizeToFit
            minimumFontScale={0.67}
            style={[yazi.baslik, { color: renk.kontur }]}
          >
            {metin}
          </Text>
          <Yazi tur="etiket" style={{ color: renk.kontur }}>
            OK mu, NOK mu?
          </Yazi>
        </Animated.View>
      </View>
      <View
        testID="geri-sayim"
        accessibilityLabel={sayi === null ? 'Hazırlanıyor' : `${sayi} saniye`}
        accessibilityLiveRegion="polite"
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: bosluk.l,
        }}
      >
        {[3, 2, 1].map((n) => {
          const aktif = sayi === n;
          const halka = {
            width: aktif ? 72 : 44,
            height: aktif ? 72 : 44,
            borderRadius: yaricap.yuvarlak,
            borderWidth: 3,
            borderColor: renk.kontur,
            backgroundColor: aktif ? renk.metin : renk.yuzey,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
          };
          return aktif ? (
            <Animated.View key={n} style={[halka, sayiStil]}>
              <Text style={[yazi.baslik, { color: renk.zemin }]}>{n}</Text>
            </Animated.View>
          ) : (
            <View key={n} style={halka}>
              <Yazi soluk>{n}</Yazi>
            </View>
          );
        })}
      </View>
      <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
        Başparmaklar hazır!
      </Yazi>
    </Ekran>
  );
}
