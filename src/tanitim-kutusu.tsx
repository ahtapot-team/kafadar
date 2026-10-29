// Oyun tanıtım kartı (PRD v6, KK-73…KK-77): mevcut Diyalog; ad, kişi sayısı ve metin oyunun kayıt satırından gelir.
// "Tamam" görüldü işaretler ve kapatır; geri tuşu işaretlemeden kapatır (onKapat); kartın dışına dokunmak kapatmaz.
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { tanitimiIsaretle } from './core/tanitim';
import { depo } from './depo';
import { useDurum } from './durum';
import type { Oyun } from './games/oyun';
import { oyunlar } from './games/registry';
import type { OdaTuru } from './oda/oda';
import { bosluk, dokunmaAlani, yaricap } from './tema';
import { Diyalog, Yazi } from './ui';

export function TanitimKarti({
  oyun,
  gorunur,
  onTamam,
  onKapat,
}: {
  oyun: Oyun;
  gorunur: boolean;
  onTamam: () => void;
  onKapat: () => void;
}) {
  const { renk } = useDurum();
  const azalt = useReducedMotion();
  if (!oyun.tanitim) return null;
  const tamam = async () => {
    await tanitimiIsaretle(depo, oyun.id);
    onTamam();
  };
  return (
    <Diyalog
      gorunur={gorunur}
      baslik={oyun.ad}
      baslikTestID="tanitim-baslik"
      onKapat={onKapat}
      animasyonsuz={azalt}
    >
      <View
        testID="tanitim-kart"
        accessible
        accessibilityLabel={`${oyun.ad}. ${oyun.tanitim.kisi}. ${oyun.tanitim.metin}`}
        style={{ gap: bosluk.m }}
      >
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: bosluk.m,
            paddingVertical: bosluk.xs,
            borderRadius: yaricap.cip,
            backgroundColor: renk.kontur,
          }}
        >
          <Yazi
            testID="tanitim-kisi"
            tur="etiket"
            style={{ color: renk.marka }}
          >
            {oyun.tanitim.kisi}
          </Yazi>
        </View>
        <Yazi testID="tanitim-metin" style={{ color: renk.kontur }}>
          {oyun.tanitim.metin}
        </Yazi>
      </View>
      <Pressable
        testID="tanitim-tamam"
        accessibilityRole="button"
        accessibilityLabel="Tamam"
        onPress={tamam}
        style={{
          minHeight: dokunmaAlani,
          borderRadius: yaricap.dugme,
          backgroundColor: renk.kontur,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Yazi tur="etiket" style={{ color: renk.marka }}>
          Tamam
        </Yazi>
      </Pressable>
    </Diyalog>
  );
}

// "Nasıl oynanır?" (KK-76): üst çubuğun sağında "?" rozetli 48px hap; aynı kartı açar ve "Tamam"la kapanır.
export function TanitimBaglantisi({
  oyunId,
  testID,
  etiket,
}: {
  oyunId: string;
  testID: string;
  etiket: string;
}) {
  const { renk } = useDurum();
  const [acik, setAcik] = useState(false);
  const oyun = oyunlar.find((o) => o.id === oyunId);
  if (!oyun?.tanitim) return null;
  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={etiket}
        onPress={() => setAcik(true)}
        style={{
          minHeight: dokunmaAlani,
          flexDirection: 'row',
          alignItems: 'center',
          gap: bosluk.s,
          paddingHorizontal: bosluk.m,
          borderRadius: yaricap.cip,
          borderWidth: 3,
          borderColor: renk.marka,
          backgroundColor: renk.yuzey,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: yaricap.yuvarlak,
            backgroundColor: renk.marka,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Yazi tur="etiket" style={{ color: renk.kontur }}>
            ?
          </Yazi>
        </View>
        <Yazi tur="etiket">{etiket}</Yazi>
      </Pressable>
      <TanitimKarti
        oyun={oyun}
        gorunur={acik}
        onTamam={() => setAcik(false)}
        onKapat={() => setAcik(false)}
      />
    </>
  );
}

// Odanın oyunundan kayıt satırı kimliği (kodla katılan hangi oyundan gelirse gelsin odanın oyununun kartı açılır).
export const odaOyunId = (tur: OdaTuru | null) =>
  tur === 'on-on-ama' ? '10-10-ama' : 'ok-mu-nok';
