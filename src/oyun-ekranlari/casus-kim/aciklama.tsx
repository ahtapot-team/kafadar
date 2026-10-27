// Açıklama (KK-49, KK-50): en çok oyu alanın kartı çevrilir; casus değilse "CASUS DEĞİL!", casussa tahmin hakkı.
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useDurum } from '../../durum';
import { bosluk, easing, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import { CasusUst, OyunuBitir, Sticker } from './ortak';

export function Aciklama({
  secilen,
  oySayisi,
  casusMu,
  onDevam,
  onBitir,
  onCik,
}: {
  secilen: string;
  oySayisi: number;
  casusMu: boolean;
  onDevam: () => void;
  onBitir: () => void;
  onCik: () => void;
}) {
  const { renk, ayar } = useDurum();
  const azalt = useReducedMotion();
  const cevir = useSharedValue(azalt ? 1 : 0);
  useEffect(() => {
    if (azalt) return;
    cevir.value = withDelay(
      500,
      withTiming(1, {
        duration: 450,
        easing: Easing.bezier(...easing.yumusak),
      }),
    );
    const t = setTimeout(() => titret('uyari', ayar.titresim), 700);
    return () => clearTimeout(t);
  }, [azalt, cevir, ayar.titresim]);
  const stil = useAnimatedStyle(() => ({
    transform: [
      { rotate: '-3deg' },
      { scaleX: Math.abs(1 - 2 * cevir.value) * 0.9 + 0.1 },
    ],
  }));
  return (
    <Ekran>
      <CasusUst orta={`${secilen} · ${oySayisi} oy`} onCik={onCik} />
      <View
        testID="casus-aciklama"
        style={{ flex: 1, justifyContent: 'center', gap: bosluk.xl }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: renk.marka2,
              borderWidth: 4,
              borderColor: renk.kontur,
              borderRadius: yaricap.kart,
              padding: bosluk.xl,
              alignItems: 'center',
              gap: bosluk.m,
              minHeight: 280,
              justifyContent: 'center',
              boxShadow: `8px 8px 0 ${renk.golge}`,
            },
            stil,
          ]}
        >
          <Yazi tur="baslikXl" style={{ color: renk.kontur }}>
            {secilen}
          </Yazi>
          <Yazi tur="etiket" style={{ color: renk.kontur }}>
            {casusMu ? 'Casus' : 'Casus değil'}
          </Yazi>
          {casusMu ? null : (
            <Sticker renkAdi="marka">
              <Yazi tur="baslik" style={{ color: renk.kontur }}>
                DEĞİL!
              </Yazi>
            </Sticker>
          )}
        </Animated.View>
        <Yazi soluk style={{ textAlign: 'center' }}>
          {casusMu
            ? `Ama daha bitmedi: ${secilen} kelimeyi bilirse casus kazanır.`
            : 'Yanlış kişi. Casus aranızda saklanmayı başarıyor…'}
        </Yazi>
      </View>
      <Dugme
        testID="casus-devam"
        etiket={casusMu ? `${secilen} tahmin etsin` : 'Casusu göster'}
        onPress={onDevam}
      />
      <OyunuBitir onBitir={onBitir} />
    </Ekran>
  );
}
