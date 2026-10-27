// Paylaşım görseli (KK-13): ekran dışında 360×640 çizilir, 1080×1920 PNG olarak yakalanıp sistem paylaşım menüsüne verilir.
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
import type { Oduller, Oy } from '../../games/ok-mu-nok/oyun';
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

const Satir = ({
  oy,
  sayi,
  toplam,
}: {
  oy: Oy;
  sayi: number;
  toplam: number;
}) => {
  const dolgu = oy === 'OK' ? r.ok : r.nok;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: font.kalin, fontSize: 15, color: dolgu }}>
          {oy === 'OK' ? '👍 OK' : '👎 NOK'}
        </Text>
        <Text style={{ fontFamily: font.kalin, fontSize: 15, color: dolgu }}>
          {sayi}
        </Text>
      </View>
      <View
        style={{
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: r.kontur,
          backgroundColor: r.yuzey,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${(sayi / Math.max(1, toplam)) * 100}%`,
            height: '100%',
            backgroundColor: dolgu,
          }}
        />
      </View>
    </View>
  );
};

export function KartPaylasimi({
  kart,
  sonuc,
  oylar,
  oyuncular,
  paket,
}: {
  kart: string;
  sonuc: string;
  oylar: Record<string, Oy>;
  oyuncular: string[];
  paket: string;
}) {
  const veren = oyuncular.filter((o) => oylar[o]);
  const ok = veren.filter((o) => oylar[o] === 'OK').length;
  return (
    <>
      <View
        style={{
          backgroundColor: r.marka,
          borderWidth: 3,
          borderColor: r.kontur,
          borderRadius: 22,
          padding: 18,
          transform: [{ rotate: '-3deg' }],
          boxShadow: `5px 5px 0 ${r.golge}`,
        }}
      >
        <Text style={{ fontFamily: font.kalin, fontSize: 11, color: r.kontur }}>
          DURUM
        </Text>
        <Text
          style={{
            fontFamily: font.kalin,
            fontSize: 24,
            color: r.kontur,
            marginTop: 6,
          }}
        >
          {kart}
        </Text>
      </View>
      <Text style={{ fontFamily: font.kalin, fontSize: 30, color: r.metin }}>
        {sonuc}
      </Text>
      <Satir oy="OK" sayi={ok} toplam={veren.length} />
      <Satir oy="NOK" sayi={veren.length - ok} toplam={veren.length} />
      <View style={{ flex: 1 }} />
      <Text
        style={{
          fontFamily: font.kalin,
          fontSize: 12,
          color: r.metinSoluk,
          textAlign: 'center',
        }}
      >
        Kafadar ile oynandı · {veren.length} kişi · {paket} destesi
      </Text>
    </>
  );
}

export function OdulPaylasimi({
  oduller,
  kartMetni,
  kartSayisi,
}: {
  oduller: Oduller;
  kartMetni: (id: string) => string;
  kartSayisi: number;
}) {
  const kartlar = [
    { ad: 'Aykırı ruh', satir: oduller.aykiriRuh.join(', '), dolgu: r.marka },
    {
      ad: 'Ruh ikizleri',
      satir: oduller.ruhIkizleri.map(([a, b]) => `${a} & ${b}`).join(', '),
      dolgu: r.marka2,
    },
    {
      ad: 'Olay kart',
      satir: oduller.olayKart.map((id) => `“${kartMetni(id)}”`).join(' '),
      dolgu: r.yuzey,
    },
  ].filter((k) => k.satir);
  return (
    <>
      <Text style={{ fontFamily: font.kalin, fontSize: 30, color: r.metin }}>
        Gecenin ödülleri
      </Text>
      {kartlar.map((k) => (
        <View
          key={k.ad}
          style={{
            backgroundColor: k.dolgu,
            borderWidth: 3,
            borderColor: r.kontur,
            borderRadius: 20,
            padding: 14,
            boxShadow: `4px 4px 0 ${r.golge}`,
          }}
        >
          <Text
            style={{
              fontFamily: font.kalin,
              fontSize: 11,
              color: k.dolgu === r.yuzey ? r.metin : r.kontur,
            }}
          >
            {k.ad.toUpperCase()}
          </Text>
          <Text
            style={{
              fontFamily: font.kalin,
              fontSize: 20,
              color: k.dolgu === r.yuzey ? r.metin : r.kontur,
            }}
          >
            {k.satir}
          </Text>
        </View>
      ))}
      <View style={{ flex: 1 }} />
      <Text
        style={{
          fontFamily: font.kalin,
          fontSize: 12,
          color: r.metinSoluk,
          textAlign: 'center',
        }}
      >
        Kafadar ile oynandı · {kartSayisi} kart
      </Text>
    </>
  );
}
