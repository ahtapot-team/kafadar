// Oybirliğinde konfeti (KK-11): ~60 parça, 1500 ms, yerçekimi easing'i; oy rengi + marka. Hareketi azaltta çizilmez.
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { rngOlustur } from '../../core/rng';
import { hareket } from '../../tema';

const PARCA = 60;

function Parca({
  x,
  hiz,
  donus,
  renk,
  gecikme,
}: {
  x: number;
  hiz: number;
  donus: number;
  renk: string;
  gecikme: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      gecikme,
      withTiming(1, {
        duration: hareket.konfeti,
        easing: Easing.in(Easing.quad),
      }),
    );
  }, [p, gecikme]);
  const stil = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, p.value - 0.8) * 5,
    transform: [
      { translateX: (p.value - 0.5) * hiz * 60 },
      {
        translateY:
          -120 * Math.sin(Math.min(1, p.value * 2.2) * Math.PI) * 0.6 +
          p.value * p.value * 700,
      },
      { rotate: `${p.value * donus}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 120,
          left: `${x}%`,
          width: 10,
          height: 16,
          backgroundColor: renk,
        },
        stil,
      ]}
    />
  );
}

export function Konfeti({ renkler }: { renkler: string[] }) {
  const parcalar = useMemo(() => {
    const r = rngOlustur(11);
    return Array.from({ length: PARCA }, (_, i) => ({
      x: r() * 100,
      hiz: r() * 2 + 0.5,
      donus: (r() - 0.5) * 900,
      gecikme: r() * 150,
      renk: renkler[i % renkler.length],
    }));
  }, [renkler]);
  return (
    <View
      testID="konfeti"
      pointerEvents="none"
      style={{ position: 'absolute', inset: 0 }}
    >
      {parcalar.map((p, i) => (
        <Parca key={i} {...p} />
      ))}
    </View>
  );
}
