// Açıklama (KK-57): ortalama (bir ondalık, "5,8"), en düşük / en yüksek, oybirliği konfetisi, "Tam bölündünüz".
// "Hareketi azalt" (azalt) açıkken konfeti, sayaç ve giriş animasyonu yok: sade gösterim.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useDurum } from '../../durum';
import { bosluk, hareket } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import type { Ozet } from '../../games/on-on-ama/onon';
import { useSayi } from '../ortak/anim';
import { Konfeti } from '../ortak/konfeti';
import { Cikarma } from '../ortak/cikarma';
import { KartSeridi } from '../ortak/ortak';
import { PaylasDugmesi } from '../ortak/paylasim';
import { ondalik, puanRengi } from './ortak';

type Props = {
  kart: string;
  oyuncular: string[];
  puanlar: Record<string, number>;
  ozet: Ozet;
  onSonraki: () => void;
  onBitir: () => void;
  onPaylas: () => void;
};

const verdi = (kisiler: string[], puan: number) =>
  `${kisiler.join(', ')} ${puan} verdi!`;

export function AcikEkrani({
  kart,
  oyuncular,
  puanlar,
  ozet,
  onSonraki,
  onBitir,
  onPaylas,
}: Props) {
  const { renk, ayar } = useDurum();
  const azalt = useReducedMotion();
  const sayi = useSayi(
    Math.round(ozet.ortalama * 10),
    hareket.cubukDolma,
    azalt,
  );
  // Göster'e hızlı çift dokunuş açıklamayı atlamasın: Sonraki kısa süre pasif.
  const [sonrakiHazir, setSonrakiHazir] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSonrakiHazir(true), 600);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (ozet.oybirligi) titret('basari', ayar.titresim);
    else if (ozet.bolundu) titret('uyari', ayar.titresim);
  }, [ozet.oybirligi, ozet.bolundu, ayar.titresim]);

  const sirali = [...oyuncular]
    .filter((o) => puanlar[o] !== undefined)
    .sort((a, b) => puanlar[b] - puanlar[a]);
  const tekPuan = ozet.enYuksek.puan;

  return (
    <Ekran>
      {ozet.oybirligi && !azalt && (
        <View
          testID="onon-konfeti"
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          <Konfeti renkler={[puanRengi(tekPuan, renk), renk.marka]} />
        </View>
      )}
      <KartSeridi testID="onon-kart-metni" metin={kart} />
      <View style={{ alignItems: 'center', gap: bosluk.xs }}>
        <Yazi tur="etiket" soluk>
          Yeni puan
        </Yazi>
        <Yazi
          tur="baslik"
          testID="onon-ortalama"
          accessibilityLabel={`Ortalama ${ondalik(ozet.ortalama)} üzerinden 10`}
          style={{ fontSize: azalt ? 40 : 84, lineHeight: azalt ? 48 : 92 }}
        >
          {ondalik((azalt ? Math.round(ozet.ortalama * 10) : sayi) / 10)}
          <Yazi tur="baslik" soluk style={{ fontSize: 32 }}>
            /10
          </Yazi>
        </Yazi>
      </View>
      {ozet.oybirligi ? (
        <View style={{ alignItems: 'center', gap: bosluk.xs }}>
          <Cikarma
            testID="onon-oybirligi"
            metin={`Hepiniz ${tekPuan}!`}
            dolgu={puanRengi(tekPuan, renk)}
            egim={-3}
          />
          <Yazi soluk>
            Oybirliği · {oyuncular.length} / {oyuncular.length} aynı puan
          </Yazi>
        </View>
      ) : (
        <>
          {ozet.bolundu && (
            <View style={{ alignItems: 'center' }}>
              <Cikarma
                testID="onon-bolundu"
                metin="Tam bölündünüz!"
                dolgu={renk.marka}
                egim={-3}
              />
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: bosluk.m }}>
            <Cikarma
              testID="onon-en-dusuk"
              metin={verdi(ozet.enDusuk.kisiler, ozet.enDusuk.puan)}
              dolgu={puanRengi(ozet.enDusuk.puan, renk)}
              egim={-3}
            />
            <Cikarma
              testID="onon-en-yuksek"
              metin={verdi(ozet.enYuksek.kisiler, ozet.enYuksek.puan)}
              dolgu={puanRengi(ozet.enYuksek.puan, renk)}
              egim={3}
            />
          </View>
        </>
      )}
      <View style={{ gap: bosluk.s }}>
        {sirali.map((ad) => (
          <View
            key={ad}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: bosluk.s,
            }}
          >
            <Yazi
              numberOfLines={1}
              tur="etiket"
              style={{ width: 72 }}
              accessibilityLabel={`${ad} ${puanlar[ad]} verdi`}
            >
              {ad}
            </Yazi>
            <View
              style={{
                flex: 1,
                height: 24,
                borderRadius: 10,
                borderWidth: 3,
                borderColor: renk.kontur,
                backgroundColor: renk.yuzey,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${puanlar[ad] * 10}%`,
                  height: '100%',
                  backgroundColor: puanRengi(puanlar[ad], renk),
                }}
              />
            </View>
            <Yazi tur="baslik" style={{ width: 28, fontSize: 18 }}>
              {puanlar[ad]}
            </Yazi>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View
        style={{ flexDirection: 'row', gap: bosluk.m, alignItems: 'center' }}
      >
        <View style={{ flex: 1 }}>
          <Dugme
            testID="onon-sonraki"
            etiket="Sonraki kart"
            pasif={!sonrakiHazir}
            onPress={onSonraki}
          />
        </View>
        <PaylasDugmesi testID="onon-paylas" onPress={onPaylas} />
      </View>
      <Dugme
        testID="onon-bitir"
        tur="ikincil"
        etiket="Bitir"
        onPress={onBitir}
      />
    </Ekran>
  );
}
