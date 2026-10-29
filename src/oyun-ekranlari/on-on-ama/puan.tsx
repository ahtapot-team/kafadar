// Puan girişi (KK-56, KK-59): telefonu tutan kişi her isme 0–10 puan verir; herkes girince "Göster" açılır.
// Satıra dokun → o kişi seçilir; tuş takımı 6+5 (≥48px). Puan açıklamaya kadar değiştirilebilir.
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, cizgi, dokunmaAlani, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import { KartSeridi, UstCubuk } from '../ortak/ortak';
import { puanRengi } from './ortak';

type Props = {
  kart: string;
  oyuncular: string[];
  puanlar: Record<string, number>;
  gosterAktif: boolean;
  onPuan: (oyuncu: string, puan: number) => void;
  onGoster: () => void;
  onAtla: () => void;
  onOyuncular: () => void;
  onCik: () => void;
};

const TUSLAR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function PuanEkrani({
  kart,
  oyuncular,
  puanlar,
  gosterAktif,
  onPuan,
  onGoster,
  onAtla,
  onOyuncular,
  onCik,
}: Props) {
  const { renk, ayar } = useDurum();
  const girilen = oyuncular.filter((o) => puanlar[o] !== undefined).length;
  const ilkBos = oyuncular.findIndex((o) => puanlar[o] === undefined);
  const [secilen, setSecilen] = useState<number | null>(null);
  const aktif = Math.min(
    secilen ?? (ilkBos >= 0 ? ilkBos : 0),
    oyuncular.length - 1,
  );
  const aktifAd = oyuncular[aktif];

  const ver = (p: number) => {
    titret('secim', ayar.titresim);
    onPuan(aktifAd, p);
    // Sıradaki puansız kişiye geç; herkes girdiyse seçim yerinde kalır.
    const sonraki = oyuncular.findIndex(
      (o, i) => i !== aktif && puanlar[o] === undefined,
    );
    setSecilen(sonraki >= 0 ? sonraki : aktif);
  };

  return (
    <Ekran>
      <UstCubuk
        orta={`${girilen} / ${oyuncular.length} girildi`}
        onCik={onCik}
      />
      <KartSeridi testID="onon-kart-metni" metin={kart} />
      {oyuncular.map((ad, i) => {
        const p = puanlar[ad];
        const sec = i === aktif;
        return (
          <Pressable
            key={ad}
            testID={`onon-oyuncu-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`${ad}${p === undefined ? ', puan girilmedi' : `, ${p} puan`}`}
            accessibilityState={{ selected: sec }}
            onPress={() => setSecilen(i)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: dokunmaAlani,
              paddingLeft: bosluk.m,
              paddingRight: bosluk.s,
              borderRadius: yaricap.cip,
              borderWidth: cizgi.ince,
              borderColor: sec ? renk.metin : renk.kontur,
              backgroundColor: renk.yuzey,
            }}
          >
            <Yazi numberOfLines={1} style={{ flex: 1 }}>
              {ad}
            </Yazi>
            <View
              style={{
                minWidth: 44,
                height: 36,
                borderRadius: yaricap.kucuk,
                borderWidth: cizgi.ince,
                borderColor: renk.kontur,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  p === undefined ? renk.zemin : puanRengi(p, renk),
              }}
            >
              <Yazi
                tur="baslik"
                style={{
                  fontSize: 18,
                  color: p === undefined ? renk.metinSoluk : renk.kontur,
                }}
              >
                {p === undefined ? '–' : p}
              </Yazi>
            </View>
          </Pressable>
        );
      })}
      <View
        style={{
          padding: bosluk.m,
          gap: bosluk.s,
          borderRadius: yaricap.kart,
          borderWidth: cizgi.ince,
          borderColor: renk.kontur,
          backgroundColor: renk.yuzey,
          boxShadow: `5px 5px 0 ${renk.golge}`,
        }}
      >
        <Yazi tur="baslik" style={{ fontSize: 18 }}>
          {aktifAd} kaç verdi?
        </Yazi>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
          {TUSLAR.map((p) => {
            const secili = puanlar[aktifAd] === p;
            return (
              <Pressable
                key={p}
                testID={`onon-puan-${aktif}-${p}`}
                accessibilityRole="button"
                accessibilityLabel={`${aktifAd} için ${p}`}
                accessibilityState={{ selected: secili }}
                onPress={() => ver(p)}
                style={{
                  // 6 + 5 tuş: ilk satır 0–5, ikinci satır 6–10 (genişlik paylaşımı)
                  flexBasis: p <= 5 ? '14.5%' : '18.5%',
                  flexGrow: 1,
                  minHeight: dokunmaAlani,
                  borderRadius: yaricap.cip,
                  borderWidth: cizgi.ince,
                  borderColor: renk.kontur,
                  backgroundColor: secili ? renk.ok : renk.zemin,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Yazi
                  tur="baslik"
                  style={{
                    fontSize: 22,
                    color: secili ? renk.kontur : renk.metin,
                  }}
                >
                  {p}
                </Yazi>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
        {gosterAktif ? 'Hazır!' : 'Herkes puan verince açılır'}
      </Yazi>
      <Dugme
        testID="onon-goster"
        etiket="Göster"
        pasif={!gosterAktif}
        onPress={onGoster}
      />
      <View style={{ flexDirection: 'row', gap: bosluk.m }}>
        <View style={{ flex: 1 }}>
          <Dugme
            testID="onon-atla"
            tur="ikincil"
            etiket="Atla"
            onPress={onAtla}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Dugme
            testID="onon-oyuncular"
            tur="ikincil"
            etiket="Oyuncular"
            onPress={onOyuncular}
          />
        </View>
      </View>
    </Ekran>
  );
}
