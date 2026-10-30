// Ortak bileşenler (tasarım sistemi v1): Ekran, Yazi, Dugme, Cip, Diyalog, GeriCubugu.
import { useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDurum } from './durum';
import {
  bosluk,
  cizgi,
  dokunmaAlani,
  dugmeYuksekligi,
  kenarBosluk,
  yaricap,
  yazi,
  perde,
} from './tema';

const YAZI_UST_SINIR = 1.6; // sistem yazı büyütmesinde taşmayı önler (KK-18)

export function Yazi({
  tur = 'govde',
  soluk,
  style,
  ...p
}: {
  tur?: keyof typeof yazi;
  soluk?: boolean;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  numberOfLines?: number;
}) {
  const { renk } = useDurum();
  return (
    <Text
      maxFontSizeMultiplier={YAZI_UST_SINIR}
      style={[
        yazi[tur],
        { color: soluk ? renk.metinSoluk : renk.metin },
        style,
      ]}
      {...p}
    />
  );
}

// Kaydırılabilir ekran: güvenli alanlar + büyük yazıda taşma olmaz.
export function Ekran({ children }: { children: ReactNode }) {
  const { renk } = useDurum();
  const k = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: renk.zemin }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: kenarBosluk,
        paddingTop: k.top + bosluk.l,
        paddingBottom: k.bottom + bosluk.xl,
        gap: bosluk.l,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

type DugmeTuru = 'birincil' | 'ikincil';

export function Dugme({
  etiket,
  onPress,
  tur = 'birincil',
  pasif,
  testID,
  erisilebilirEtiket,
  ek,
}: {
  etiket: string;
  onPress: () => void;
  tur?: DugmeTuru;
  pasif?: boolean;
  testID?: string;
  erisilebilirEtiket?: string;
  ek?: ReactNode; // etiketin altında ikinci satır (ana ekran oyun kartı: tür rozeti + kişi sayısı); varsa sola hizalanır
}) {
  const { renk } = useDurum();
  const [basili, setBasili] = useState(false);
  const dolgu = tur === 'birincil' ? renk.marka : renk.yuzey;
  const yaziRengi = tur === 'birincil' ? renk.kontur : renk.metin;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={erisilebilirEtiket ?? etiket}
      accessibilityState={{ disabled: !!pasif }}
      disabled={pasif}
      onPress={onPress}
      onPressIn={() => setBasili(true)}
      onPressOut={() => setBasili(false)}
      style={{
        minHeight: dugmeYuksekligi,
        borderRadius: yaricap.dugme,
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        backgroundColor: dolgu,
        justifyContent: 'center',
        alignItems: ek ? 'flex-start' : 'center',
        paddingHorizontal: bosluk.xl,
        paddingVertical: ek ? bosluk.m : 0,
        gap: bosluk.s,
        opacity: pasif ? 0.45 : 1,
        boxShadow: basili
          ? `1px 1px 0 ${renk.golge}`
          : `5px 5px 0 ${renk.golge}`,
        transform: basili ? [{ translateX: 3 }, { translateY: 3 }] : [],
      }}
    >
      <Text
        maxFontSizeMultiplier={YAZI_UST_SINIR}
        style={[yazi.dugme, { color: yaziRengi, textAlign: 'center' }]}
      >
        {etiket}
      </Text>
      {ek}
    </Pressable>
  );
}

// Seçilebilir çip (paket, tur uzunluğu): seçiliyken marka dolgulu.
// `kategori`: ana ekran filtre çipi (#171): seçiliyken marka2 dolgu, ✓ ön eki, gölge; basınca gölge küçülür.
export function Cip({
  etiket,
  secili,
  onPress,
  testID,
  kategori,
}: {
  etiket: string;
  secili?: boolean;
  onPress?: () => void;
  testID?: string;
  kategori?: boolean;
}) {
  const { renk } = useDurum();
  const [basili, setBasili] = useState(false);
  const kat = kategori
    ? {
        boxShadow: secili
          ? basili
            ? `1px 1px 0 ${renk.golge}`
            : `5px 5px 0 ${renk.golge}`
          : undefined,
        transform:
          secili && basili ? [{ translateX: 3 }, { translateY: 3 }] : [],
      }
    : null;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={etiket}
      accessibilityState={{ selected: !!secili }}
      onPress={onPress}
      onPressIn={() => setBasili(true)}
      onPressOut={() => setBasili(false)}
      style={{
        ...kat,
        minHeight: dokunmaAlani,
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: kategori ? 1 : 0, // kişi çipleri satırı doldurur
        paddingHorizontal: kategori ? bosluk.s : bosluk.l,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: secili
          ? kategori
            ? renk.marka2
            : renk.marka
          : renk.yuzey,
      }}
    >
      <Text
        maxFontSizeMultiplier={YAZI_UST_SINIR}
        style={[
          kategori ? yazi.cip : [yazi.dugme, { fontSize: 17 }],
          { color: secili ? renk.kontur : renk.metin },
        ]}
      >
        {kategori && secili ? '✓ ' : ''}
        {etiket}
      </Text>
    </Pressable>
  );
}

// Kart görünümlü diyalog ("Oyundan çık?", "Devam et / Yeni oyun").
export function Diyalog({
  gorunur,
  baslik,
  children,
  onKapat,
  animasyonsuz,
  baslikTestID,
}: {
  gorunur: boolean;
  baslik: string;
  children: ReactNode;
  onKapat?: () => void; // Android geri tuşu; verilmezse geri tuşu pencereyi kapatmaz
  animasyonsuz?: boolean; // "Hareketi azalt"
  baslikTestID?: string;
}) {
  const { renk } = useDurum();
  return (
    <Modal
      transparent
      visible={gorunur}
      animationType={animasyonsuz ? 'none' : 'fade'}
      statusBarTranslucent
      onRequestClose={onKapat}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: perde,
          justifyContent: 'center',
          padding: kenarBosluk,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: renk.marka,
            borderWidth: cizgi.kalin,
            borderColor: renk.kontur,
            borderRadius: yaricap.kart,
            padding: bosluk.xl,
            gap: bosluk.l,
            boxShadow: `8px 8px 0 ${renk.golge}`,
          }}
        >
          <Text
            testID={baslikTestID}
            maxFontSizeMultiplier={YAZI_UST_SINIR}
            accessibilityRole="header"
            style={[yazi.baslik, { color: renk.kontur }]}
          >
            {baslik}
          </Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

// Oyun dışı ekranların ortak üst çubuğu (KK-26): görünür "Geri", ≥48px, ekran okuyucu etiketli.
// Bir önceki ekrana döner; girilen oyuncular ve seçimler durumda korunur. Geçmiş yoksa ana ekrana gider.
export function GeriCubugu({ testID }: { testID: string }) {
  const router = useRouter();
  const { renk } = useDurum();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Geri"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={{
        alignSelf: 'flex-start',
        minHeight: dokunmaAlani,
        minWidth: dokunmaAlani,
        flexDirection: 'row',
        alignItems: 'center',
        gap: bosluk.s,
        paddingHorizontal: bosluk.l,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: renk.yuzey,
      }}
    >
      <Yazi>←</Yazi>
      <Yazi tur="etiket">Geri</Yazi>
    </Pressable>
  );
}

// Tek satırlık metin girdisi (isim, oda kodu): 48px+, kalın kenarlı.
export function Girdi({ style, ...p }: TextInputProps) {
  const { renk } = useDurum();
  return (
    <TextInput
      placeholderTextColor={renk.metinSoluk}
      style={[
        {
          minHeight: dokunmaAlani,
          paddingHorizontal: bosluk.l,
          borderRadius: yaricap.cip,
          borderWidth: cizgi.ince,
          borderColor: renk.kontur,
          backgroundColor: renk.yuzey,
          color: renk.metin,
          fontSize: 17,
        },
        style,
      ]}
      {...p}
    />
  );
}
