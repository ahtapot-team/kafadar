// "Herkes gördü": ilk soruyu soracak kişiyi çark seçer (KK-48). 2,5 sn cubic-bezier(.16,1,.3,1); hareketi azaltta dönmez.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useDurum } from '../../durum';
import { bosluk, cizgi, easing, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import { CasusUst, Sticker } from './ortak';

const YARICAP = 110;

export function Cark({
  oyuncular,
  baslayan,
  gorenSayisi,
  onBasla,
  onCik,
}: {
  oyuncular: string[];
  baslayan: string;
  gorenSayisi: number;
  onBasla: () => void;
  onCik: () => void;
}) {
  const { renk, ayar } = useDurum();
  const azalt = useReducedMotion();
  const n = oyuncular.length;
  const aci = 360 / n;
  const hedef = oyuncular.indexOf(baslayan);
  const donus = useSharedValue(azalt ? -hedef * aci : 0);
  const [bitti, setBitti] = useState(azalt);
  useEffect(() => {
    if (azalt) {
      setBitti(true);
      return;
    }
    donus.value = withTiming(
      360 * 3 - hedef * aci,
      { duration: 2500, easing: Easing.bezier(...easing.cubuk) },
      (b) => {
        if (b) runOnJS(setBitti)(true);
      },
    );
  }, [azalt, donus, hedef, aci]);
  useEffect(() => {
    if (bitti) titret('basari', ayar.titresim);
  }, [bitti, ayar.titresim]);
  const stil = useAnimatedStyle(() => ({
    transform: [{ rotate: `${donus.value}deg` }],
  }));
  return (
    <Ekran>
      <CasusUst orta={`${gorenSayisi} / ${n} gördü`} onCik={onCik} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: bosluk.xl,
        }}
      >
        <View
          style={{
            width: YARICAP * 2 + 70,
            height: YARICAP * 2 + 70,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              zIndex: 2,
              width: 0,
              height: 0,
              borderLeftWidth: 12,
              borderRightWidth: 12,
              borderTopWidth: 22,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: renk.marka,
            }}
          />
          <Animated.View
            style={[
              {
                width: YARICAP * 2 + 70,
                height: YARICAP * 2 + 70,
                alignItems: 'center',
                justifyContent: 'center',
              },
              stil,
            ]}
          >
            {oyuncular.map((ad, i) => (
              <View
                key={ad}
                style={{
                  position: 'absolute',
                  transform: [
                    { rotate: `${i * aci}deg` },
                    { translateY: -YARICAP },
                  ],
                  paddingHorizontal: bosluk.m,
                  paddingVertical: bosluk.xs,
                  borderRadius: yaricap.cip,
                  borderWidth: cizgi.ince,
                  borderColor: renk.kontur,
                  backgroundColor: i % 2 === 0 ? renk.marka2 : renk.yuzey,
                }}
              >
                <Yazi
                  tur="etiket"
                  style={{ color: i % 2 === 0 ? renk.kontur : renk.metin }}
                >
                  {ad}
                </Yazi>
              </View>
            ))}
          </Animated.View>
          <View
            style={{
              position: 'absolute',
              width: 36,
              height: 36,
              borderRadius: yaricap.dugme,
              borderWidth: cizgi.kalin,
              borderColor: renk.kontur,
              backgroundColor: renk.zemin,
            }}
          />
        </View>
        {bitti && (
          <Sticker>
            <Yazi
              testID="casus-baslayan"
              tur="baslik"
              style={{ color: renk.kontur, fontSize: 26 }}
            >
              İlk soru {baslayan}'den!
            </Yazi>
          </Sticker>
        )}
      </View>
      <Dugme
        testID="casus-cark-devam"
        etiket="Tartışmaya başla"
        pasif={!bitti}
        onPress={onBasla}
      />
    </Ekran>
  );
}
