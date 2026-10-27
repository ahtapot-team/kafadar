// 10/10 ama paylaşım görselleri (KK-58): ekran dışında 360×640 çizilir, 1080×1920 PNG olarak yakalanır (9:16).
// Altyapı OK mu NOK mu ile ortak (usePaylas, GizliPaylasim); içerik tasarım #107 paylasim.html'e göre, her zaman koyu tema.
import { Text, View } from 'react-native';
import type { Oduller, Ozet } from '../../games/on-on-ama/onon';
import { font, renkler } from '../../tema';
import { ondalik, puanRengi } from './ortak';

const r = renkler.koyu;
export const BASLIK = '10/10 ama';

export function KartPaylasimi({
  kart,
  ozet,
  puanlar,
  oyuncular,
  paket,
}: {
  kart: string;
  ozet: Ozet;
  puanlar: Record<string, number>;
  oyuncular: string[];
  paket: string;
}) {
  const sirali = oyuncular
    .filter((o) => puanlar[o] !== undefined)
    .sort((a, b) => puanlar[b] - puanlar[a]);
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
        <Text style={{ fontFamily: font.kalin, fontSize: 22, color: r.kontur }}>
          {kart}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={{ fontFamily: font.kalin, fontSize: 64, color: r.metin }}>
          {ondalik(ozet.ortalama)}
        </Text>
        <Text
          style={{ fontFamily: font.kalin, fontSize: 18, color: r.metinSoluk }}
        >
          /10 yeni puan
        </Text>
      </View>
      {sirali.map((ad) => (
        <View
          key={ad}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Text
            numberOfLines={1}
            style={{
              width: 70,
              fontFamily: font.kalin,
              fontSize: 14,
              color: r.metin,
            }}
          >
            {ad}
          </Text>
          <View
            style={{
              flex: 1,
              height: 18,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: r.kontur,
              backgroundColor: r.yuzey,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${puanlar[ad] * 10}%`,
                height: '100%',
                backgroundColor: puanRengi(puanlar[ad], r),
              }}
            />
          </View>
          <Text
            style={{
              width: 22,
              fontFamily: font.kalin,
              fontSize: 14,
              color: r.metin,
            }}
          >
            {puanlar[ad]}
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
        Kafadar ile oynandı · {sirali.length} kişi · {paket}
      </Text>
    </>
  );
}

export function OdulPaylasimi({
  oduller,
  altSatir,
  kartSayisi,
}: {
  oduller: Oduller;
  altSatir: {
    acimasiz: (ad: string) => string;
    melek: (ad: string) => string;
    ikiz: (a: string, b: string) => string;
  };
  kartSayisi: number;
}) {
  const kartlar = [
    {
      ad: 'En acımasız',
      satir: oduller.enAcimasiz.join(', '),
      not: oduller.enAcimasiz.map(altSatir.acimasiz).join(' · '),
      dolgu: r.nok,
    },
    {
      ad: 'Melek kalpli',
      satir: oduller.melekKalpli.join(', '),
      not: oduller.melekKalpli.map(altSatir.melek).join(' · '),
      dolgu: r.ok,
    },
    {
      ad: 'Ruh ikizleri',
      satir: oduller.ruhIkizleri.map(([a, b]) => `${a} & ${b}`).join(', '),
      not: oduller.ruhIkizleri.map(([a, b]) => altSatir.ikiz(a, b)).join(' · '),
      dolgu: r.marka2,
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
            style={{ fontFamily: font.kalin, fontSize: 11, color: r.kontur }}
          >
            {k.ad.toUpperCase()}
          </Text>
          <Text
            style={{ fontFamily: font.kalin, fontSize: 20, color: r.kontur }}
          >
            {k.satir}
          </Text>
          <Text
            style={{ fontFamily: font.kalin, fontSize: 12, color: r.kontur }}
          >
            {k.not}
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
