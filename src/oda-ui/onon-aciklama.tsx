// 10/10 ama oda modu: herkeste aynı ortak açıklama (KK-67) ve "Sonraki kart" yetkisi (KK-68).
// Boş (puan vermeyen) ortalamaya ve uçlara girmez, çubukta kesik "—" görünür. "Hareketi azalt" (azalt) açıkken konfeti yok.
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { type IstemciDurumu } from '../oda/istemci';
import { puanSirasi } from '../oda/onon-ozet';
import { Konfeti } from '../oyun-ekranlari/ortak/konfeti';
import { Cikarma } from '../oyun-ekranlari/ortak/cikarma';
import { ondalik, puanRengi } from '../oyun-ekranlari/on-on-ama/ortak';
import { useDurum } from '../durum';
import { bosluk, cizgi, yaricap } from '../tema';
import { Dugme, Ekran, Yazi } from '../ui';
import { OnKart } from './onon-puan';
import { OdaUst } from './ust';
import { YenidenBaglaniyor } from './yeniden';

const verdi = (kisiler: string[], puan: number) =>
  `${kisiler.join(', ')} ${puan} verdi!`;

export function OnAciklamaEkrani({
  durum,
  onSonraki,
  onCik,
}: {
  durum: IstemciDurumu;
  onSonraki: () => void;
  onCik: () => void;
}) {
  const { renk } = useDurum();
  const azalt = useReducedMotion();
  const g = durum.gorunum!;
  const a = g.aciklama!;
  const kuran = g.oyuncular[0]?.ad ?? '';
  return (
    <Ekran>
      {a.oybirligi && !azalt && (
        <View
          testID="oda-onon-konfeti"
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          <Konfeti
            renkler={[puanRengi(a.enYuksek?.puan ?? 5, renk), renk.marka]}
          />
        </View>
      )}
      <OdaUst
        kod={g.kod}
        orta={`Kart ${g.soruNo} / 10 · açıklama`}
        onCik={onCik}
      />
      <OnKart testID="oda-onon-kart-metni" metin={g.soru?.text ?? ''} />
      <View style={{ alignItems: 'center' }}>
        <Yazi
          tur="baslik"
          testID="oda-onon-ortalama"
          accessibilityLabel={
            a.ortalama === null
              ? 'Kimse puan vermedi'
              : `Ortalama ${ondalik(a.ortalama)} üzerinden 10`
          }
          style={{ fontSize: azalt ? 36 : 68, lineHeight: azalt ? 44 : 74 }}
        >
          {a.ortalama === null ? '—' : ondalik(a.ortalama)}
          {a.ortalama !== null && (
            <Yazi tur="baslik" soluk style={{ fontSize: 26 }}>
              /10
            </Yazi>
          )}
        </Yazi>
      </View>
      {a.oybirligi && a.enYuksek ? (
        <View style={{ alignItems: 'center', gap: bosluk.xs }}>
          <Cikarma
            testID="oda-onon-oybirligi"
            metin={`Hepiniz ${a.enYuksek.puan}!`}
            dolgu={puanRengi(a.enYuksek.puan, renk)}
            egim={-3}
          />
          <Yazi soluk>Oybirliği</Yazi>
        </View>
      ) : (
        <>
          {a.bolundu && (
            <View style={{ alignItems: 'center' }}>
              <Cikarma
                testID="oda-onon-bolundu"
                metin="Tam bölündünüz!"
                dolgu={renk.marka}
                egim={-3}
              />
            </View>
          )}
          {a.enDusuk && a.enYuksek && (
            <View style={{ flexDirection: 'row', gap: bosluk.m }}>
              <Cikarma
                testID="oda-onon-en-dusuk"
                metin={verdi(a.enDusuk.kisiler, a.enDusuk.puan)}
                dolgu={puanRengi(a.enDusuk.puan, renk)}
                egim={-3}
              />
              <Cikarma
                testID="oda-onon-en-yuksek"
                metin={verdi(a.enYuksek.kisiler, a.enYuksek.puan)}
                dolgu={puanRengi(a.enYuksek.puan, renk)}
                egim={3}
              />
            </View>
          )}
        </>
      )}
      <View style={{ gap: bosluk.xs }}>
        {puanSirasi(a).map(({ ad, puan }, i) => (
          <View
            key={ad}
            testID={`oda-onon-satir-${i}`}
            accessibilityLabel={`${ad} ${puan === null ? 'puan vermedi' : `${puan} verdi`}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: bosluk.s,
            }}
          >
            <Yazi
              numberOfLines={1}
              tur="etiket"
              soluk={puan === null}
              style={{ width: 72 }}
            >
              {ad}
            </Yazi>
            <View
              style={{
                flex: 1,
                height: 22,
                borderRadius: yaricap.kucuk,
                borderWidth: cizgi.ince,
                borderColor: renk.kontur,
                borderStyle: puan === null ? 'dashed' : 'solid',
                backgroundColor: renk.yuzey,
                overflow: 'hidden',
              }}
            >
              {puan !== null && (
                <View
                  style={{
                    width: `${puan * 10}%`,
                    height: '100%',
                    backgroundColor: puanRengi(puan, renk),
                  }}
                />
              )}
            </View>
            <Yazi
              tur="baslik"
              soluk={puan === null}
              style={{ width: 28, fontSize: 17 }}
            >
              {puan === null ? '—' : puan}
            </Yazi>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      {g.sonrakiGorunur ? (
        <Dugme
          testID="oda-onon-sonraki"
          etiket="Sonraki kart"
          onPress={onSonraki}
        />
      ) : (
        <View
          testID="oda-onon-kuran-bekleniyor"
          accessibilityLiveRegion="polite"
          style={{
            minHeight: 58,
            borderRadius: yaricap.dugme,
            borderWidth: cizgi.kalin,
            borderStyle: 'dashed',
            borderColor: renk.kontur,
            backgroundColor: renk.yuzey,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: bosluk.m,
          }}
        >
          <Yazi tur="etiket" soluk>
            Kuran kişi bekleniyor… {kuran} ★
          </Yazi>
        </View>
      )}
      {durum.baglanti === 'yeniden' && <YenidenBaglaniyor />}
    </Ekran>
  );
}
