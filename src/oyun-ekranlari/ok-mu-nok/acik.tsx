// Açıklama anı (KK-11): çubuklar ~2 sn'de dolar, sayılar birlikte artar; tek azınlıkta sarsıntı.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useDurum } from '../../durum';
import { bosluk, easing, hareket, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import type { Oy, Sonuc } from '../../games/ok-mu-nok/oyun';
import { useSayi } from './anim';
import { Konfeti } from './konfeti';
import { IkonDugme, KartSeridi } from './ortak';

type Props = {
  kart: string;
  oyuncular: string[];
  oylar: Record<string, Oy>;
  sonuc: Sonuc;
  onSonraki: () => void;
  onBitir: () => void;
  onPaylas: () => void;
};

function Cubuk({
  oy,
  isimler,
  toplam,
}: {
  oy: Oy;
  isimler: string[];
  toplam: number;
}) {
  const { renk } = useDurum();
  const azalt = useReducedMotion();
  const dolgu = oy === 'OK' ? renk.ok : renk.nok;
  const yaziRengi = oy === 'OK' ? renk.okMetin : renk.nokMetin;
  const oran = useSharedValue(azalt ? isimler.length / toplam : 0);
  const sayi = useSayi(isimler.length, hareket.cubukDolma, azalt);
  useEffect(() => {
    oran.value = withTiming(isimler.length / toplam, {
      duration: azalt ? hareket.azaltilmisSolma : hareket.cubukDolma,
      easing: Easing.bezier(...easing.cubuk),
    });
  }, [oran, isimler.length, toplam, azalt]);
  const stil = useAnimatedStyle(() => ({ width: `${oran.value * 100}%` }));
  const ad = oy === 'OK' ? '👍 OK' : '👎 NOK';
  return (
    <View style={{ gap: bosluk.s }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Yazi tur="etiket" style={{ color: yaziRengi }}>
          {ad}
        </Yazi>
        <Yazi
          tur="baslik"
          testID={`sayi-${oy.toLowerCase()}`}
          style={{ color: yaziRengi, fontSize: 28 }}
        >
          {sayi}
        </Yazi>
      </View>
      <View
        style={{
          height: 28,
          borderRadius: yaricap.cip,
          borderWidth: 3,
          borderColor: renk.kontur,
          backgroundColor: renk.yuzey,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          testID={`cubuk-${oy.toLowerCase()}`}
          style={[{ height: '100%', backgroundColor: dolgu }, stil]}
        />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
        {isimler.map((n) => (
          <View
            key={n}
            style={{
              paddingHorizontal: bosluk.m,
              paddingVertical: bosluk.xs,
              borderRadius: yaricap.cip,
              borderWidth: 3,
              borderColor: renk.kontur,
              backgroundColor: dolgu,
            }}
          >
            <Yazi tur="etiket" style={{ color: renk.kontur }}>
              {n}
            </Yazi>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AcikEkrani({
  kart,
  oyuncular,
  oylar,
  sonuc,
  onSonraki,
  onBitir,
  onPaylas,
}: Props) {
  const { renk, ayar } = useDurum();
  const azalt = useReducedMotion();
  const veren = oyuncular.filter((o) => oylar[o]);
  const sarsinti = useSharedValue(0);
  // Göster'e hızlı çift dokunuş açıklamayı atlamasın: Sonraki kısa süre pasif.
  const [sonrakiHazir, setSonrakiHazir] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSonrakiHazir(true), 600);
    return () => clearTimeout(t);
  }, []);
  const giris = useSharedValue(azalt ? 1 : 0);

  useEffect(() => {
    // Çubuklar dolunca sticker girer; tek azınlıkta sarsıntı + uyarı, oybirliğinde başarı titreşimi.
    const t = setTimeout(
      () => {
        if (sonuc.tip === 'tekAzinlik') titret('uyari', ayar.titresim);
        if (sonuc.tip === 'oybirligi') titret('basari', ayar.titresim);
      },
      azalt ? hareket.azaltilmisSolma : hareket.cubukDolma,
    );
    if (!azalt) {
      giris.value = withDelay(
        hareket.cubukDolma,
        withTiming(1, {
          duration: hareket.sticker,
          easing: Easing.bezier(...easing.yay),
        }),
      );
      if (sonuc.tip === 'tekAzinlik')
        sarsinti.value = withDelay(
          hareket.cubukDolma + hareket.sticker,
          withSequence(
            ...[8, -8, 8, -8, 8, -8, 8, 0].map((x) =>
              withTiming(x, {
                duration: hareket.sarsinti / 8,
                easing: Easing.linear,
              }),
            ),
          ),
        );
    }
    return () => clearTimeout(t);
  }, [azalt, giris, sarsinti, sonuc.tip, ayar.titresim]);

  const stickerStil = useAnimatedStyle(() => ({
    opacity: giris.value,
    transform: [
      { translateX: sarsinti.value },
      { scale: 0.6 + 0.4 * giris.value },
      { rotate: `${-10 + 6 * giris.value}deg` },
    ],
  }));

  return (
    <Ekran>
      <KartSeridi testID="kart-metni" metin={kart} />
      {sonuc.tip === 'oybirligi' && !azalt && (
        <Konfeti
          renkler={[
            veren.every((o) => oylar[o] === 'OK') ? renk.ok : renk.nok,
            renk.marka,
          ]}
        />
      )}
      <View
        style={{
          minHeight: 120,
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: renk.marka,
              borderWidth: 4,
              borderColor: renk.kontur,
              borderRadius: yaricap.dugme,
              paddingHorizontal: bosluk.l,
              paddingVertical: bosluk.m,
              boxShadow: `5px 5px 0 ${renk.golge}`,
            },
            stickerStil,
          ]}
        >
          <Yazi
            tur="baslik"
            testID="sonuc-metni"
            style={{ color: renk.kontur }}
          >
            {sonuc.metin}
          </Yazi>
        </Animated.View>
      </View>
      <Cubuk
        oy="OK"
        isimler={veren.filter((o) => oylar[o] === 'OK')}
        toplam={veren.length}
      />
      <Cubuk
        oy="NOK"
        isimler={veren.filter((o) => oylar[o] === 'NOK')}
        toplam={veren.length}
      />
      <View style={{ flex: 1 }} />
      <View
        style={{ flexDirection: 'row', gap: bosluk.m, alignItems: 'center' }}
      >
        <View style={{ flex: 1 }}>
          <Dugme
            testID="sonraki"
            etiket="Sonraki kart"
            pasif={!sonrakiHazir}
            onPress={onSonraki}
          />
        </View>
        <IkonDugme
          testID="paylas"
          simge="⇪"
          etiket="Paylaş"
          onPress={onPaylas}
        />
      </View>
      <Dugme testID="bitir" tur="ikincil" etiket="Bitir" onPress={onBitir} />
    </Ekran>
  );
}
