// Oyun tanıtım kartı (PRD v6/v7.1): mevcut Diyalog; ad, kişi sayısı ve metin oyunun kayıt satırından gelir.
// "Tamam" ve geri tuşu kapatır; kartın dışına dokunmak kapatmaz. Yalnızca BilgiDugmesi açar.
import { createContext, useContext, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useDurum } from './durum';
import type { Oyun } from './games/oyun';
import { oyunlar } from './games/registry';
import type { OdaTuru } from './oda/oda';
import { bosluk, cizgi, dokunmaAlani, yaricap } from './tema';
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
        onPress={onTamam}
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

// ⓘ "Nasıl oynanır" (KK-91, KK-92): tek ortak düğme. Hazırlık ekranlarında yazılı hap, oyun ve sonuçta kısa 48px ⓘ (kisa).
// Dokununca kart açılır, ekran değişmez; "Tamam" ya da geri kapatır. Kart kendiliğinden açılmaz (KK-90).
export function BilgiDugmesi({
  oyunId,
  kisa,
}: {
  oyunId: string;
  kisa?: boolean;
}) {
  const { renk } = useDurum();
  const [acik, setAcik] = useState(false);
  const oyun = oyunlar.find((o) => o.id === oyunId);
  if (!oyun?.tanitim) return null;
  return (
    <>
      <Pressable
        testID="nasil-oynanir"
        accessibilityRole="button"
        accessibilityLabel="Nasıl oynanır"
        onPress={() => setAcik(true)}
        style={({ pressed }) => ({
          minHeight: dokunmaAlani,
          minWidth: dokunmaAlani,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
          ...(kisa
            ? {}
            : {
                gap: bosluk.s,
                paddingLeft: 9,
                paddingRight: bosluk.m + 2,
                borderRadius: yaricap.cip,
                borderWidth: cizgi.ince,
                borderColor: renk.kontur,
                backgroundColor: renk.yuzey,
              }),
        })}
      >
        {kisa ? (
          <Yazi tur="dugme">ⓘ</Yazi>
        ) : (
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
            <Yazi tur="cip" style={{ color: renk.kontur }}>
              i
            </Yazi>
          </View>
        )}
        {!kisa && <Yazi tur="etiket">Nasıl oynanır</Yazi>}
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

// Oyun çerçevesi kısa ⓘ'yi üretir (BilgiDugmesi kisa); üst çubuklar onu ✕'in soluna koyar.
export const BilgiYuvasi = createContext<ReactNode>(null);
export const useBilgiYuvasi = () => useContext(BilgiYuvasi);
