// Paylaşım altyapısı (KK-13): ekran dışında 360×640 çizilir, 1080×1920 PNG olarak yakalanıp sistem paylaşım menüsüne verilir.
// Tüm oyunlar ve oda finali bunu kullanır; oyuna özel içerik oyunun kendi klasöründedir.
// Renkler her zaman koyu tema (tasarım: design/2-ekranlar/paylasim.html).
import * as Sharing from 'expo-sharing';
import {
  useCallback,
  useRef,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { font, renkler } from '../../tema';

const r = renkler.koyu;
export const PAYLASIM_GENISLIK = 1080;
export const PAYLASIM_YUKSEKLIK = 1920;

export function usePaylas() {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const paylas = useCallback(async () => {
    if (!ref.current || !(await Sharing.isAvailableAsync())) return;
    const uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
      width: PAYLASIM_GENISLIK,
      height: PAYLASIM_YUKSEKLIK,
      result: 'tmpfile',
    });
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Kafadar',
    });
  }, []);
  return { ref, paylas };
}

export function GizliPaylasim({
  gorunum,
  children,
  baslik = 'OK mu NOK mu?',
}: {
  gorunum: RefObject<ComponentRef<typeof View> | null>;
  children: ReactNode;
  baslik?: string;
}) {
  return (
    <View
      ref={gorunum}
      collapsable={false}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -2000,
        top: 0,
        width: 360,
        height: 640,
        backgroundColor: r.zemin,
        padding: 24,
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: r.marka,
            borderWidth: 3,
            borderColor: r.kontur,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 4,
            transform: [{ rotate: '-4deg' }],
            boxShadow: `3px 3px 0 ${r.golge}`,
          }}
        >
          <Text
            style={{ fontFamily: font.kalin, fontSize: 24, color: r.kontur }}
          >
            Kafadar!
          </Text>
        </View>
        <Text
          style={{ fontFamily: font.kalin, fontSize: 13, color: r.metinSoluk }}
        >
          {baslik}
        </Text>
      </View>
      {children}
    </View>
  );
}
