// Final dağılımı (KK-36): B Ekolayzer (10 sütun yükselir, dokununca soru açılır); hareketi azaltta A liste.
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { Final } from '../oda/oda';
import { okYuzde } from '../oda/ozet';
import { useDurum } from '../durum';
import { bosluk, easing, yaricap } from '../tema';
import { Yazi } from '../ui';
import { kartMetni } from './metin';

type Y = Final['yuzdeler'][number];

function Sutun({
  y,
  i,
  secili,
  onPress,
}: {
  y: Y;
  i: number;
  secili: boolean;
  onPress: () => void;
}) {
  const { renk } = useDurum();
  const yukselis = useSharedValue(0);
  useEffect(() => {
    yukselis.value = withDelay(
      i * 70,
      withTiming(1, { duration: 500, easing: Easing.bezier(...easing.yay) }),
    );
  }, [i, yukselis]);
  const stil = useAnimatedStyle(() => ({
    transform: [{ scaleY: yukselis.value }],
  }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Soru ${i + 1}: ${y.ok} OK, ${y.nok} NOK, ${y.bos} boş`}
      accessibilityState={{ selected: secili }}
      style={{ flex: 1, alignItems: 'center', gap: bosluk.xs }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: 240,
            borderRadius: yaricap.cip,
            borderWidth: 3,
            borderColor: secili ? renk.marka : renk.kontur,
            backgroundColor: renk.yuzey,
            overflow: 'hidden',
            transformOrigin: 'bottom',
          },
          stil,
        ]}
      >
        <View style={{ flex: y.bos || 0.0001, backgroundColor: renk.yuzey }} />
        <View style={{ flex: y.nok || 0.0001, backgroundColor: renk.nok }} />
        <View style={{ flex: y.ok || 0.0001, backgroundColor: renk.ok }} />
      </Animated.View>
      <Yazi
        tur="etiket"
        style={{ color: secili ? renk.marka : renk.metinSoluk }}
      >
        {i + 1}
      </Yazi>
    </Pressable>
  );
}

function Satir({ y, i }: { y: Y; i: number }) {
  const { renk } = useDurum();
  const toplam = Math.max(1, y.ok + y.nok + y.bos);
  return (
    <View style={{ gap: bosluk.xs }}>
      <Yazi tur="etiket" soluk numberOfLines={1}>
        {i + 1}. {kartMetni(y.kartId, i + 1)}
      </Yazi>
      <View
        style={{
          flexDirection: 'row',
          height: 18,
          borderRadius: 9,
          borderWidth: 3,
          borderColor: renk.kontur,
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: y.ok, backgroundColor: renk.ok }} />
        <View style={{ flex: y.nok, backgroundColor: renk.nok }} />
        <View style={{ flex: y.bos, backgroundColor: renk.yuzey }} />
      </View>
      <Yazi tur="etiket" style={{ color: renk.okMetin }}>
        %{Math.round((100 * y.ok) / toplam)} OK
      </Yazi>
    </View>
  );
}

export function Dagilim({
  f,
  secili,
  onSec,
}: {
  f: Final;
  secili: number;
  onSec: (i: number) => void;
}) {
  const { renk } = useDurum();
  const azalt = useReducedMotion();
  const sec = f.yuzdeler[secili];
  return (
    <View testID="final-yuzdeler" style={{ gap: bosluk.l }}>
      <Yazi tur="etiket" soluk>
        Bu oda
      </Yazi>
      <View
        style={{ flexDirection: 'row', alignItems: 'baseline', gap: bosluk.m }}
      >
        <Yazi tur="baslikXl" style={{ color: renk.okMetin }}>
          %{okYuzde(f)}
        </Yazi>
        <Yazi tur="baslikXl">OK</Yazi>
      </View>
      {azalt ? (
        f.yuzdeler.map((y, i) => <Satir key={y.kartId} y={y} i={i} />)
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: bosluk.xs }}>
            {f.yuzdeler.map((y, i) => (
              <Sutun
                key={y.kartId}
                y={y}
                i={i}
                secili={i === secili}
                onPress={() => onSec(i)}
              />
            ))}
          </View>
          {sec && (
            <View
              style={{
                padding: bosluk.m,
                borderRadius: yaricap.cip,
                borderWidth: 3,
                borderColor: renk.kontur,
                backgroundColor: renk.yuzey,
              }}
            >
              <Yazi tur="etiket">
                S{secili + 1} · {kartMetni(sec.kartId, secili + 1)} · {sec.ok}{' '}
                OK · {sec.nok} NOK{sec.bos ? ` · ${sec.bos} boş` : ''}
              </Yazi>
            </View>
          )}
        </>
      )}
    </View>
  );
}
