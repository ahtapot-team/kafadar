// Bekleme (KK-34): "Cevabın alındı ✓ · 6/8 cevapladı"; kimin cevapladığı görünür, ne dediği görünmez (KK-35).
import { View } from 'react-native';
import { type IstemciDurumu } from '../oda/istemci';
import { useDurum } from '../durum';
import { bosluk, cizgi, yaricap } from '../tema';
import { Dugme, Ekran, Yazi } from '../ui';
import { useKalan } from './kalan';
import { OdaUst } from './ust';
import { YenidenBaglaniyor } from './yeniden';

export function BeklemeEkrani({
  durum,
  onDegistir,
  onCik,
}: {
  durum: IstemciDurumu;
  onDegistir: () => void;
  onCik: () => void;
}) {
  const { renk } = useDurum();
  const g = durum.gorunum!;
  const sn = Math.ceil(useKalan(durum) / 1000);
  return (
    <Ekran>
      <OdaUst kod={g.kod} orta={`Soru ${g.soruNo} / 10`} onCik={onCik} />
      <Yazi tur="etiket" style={{ alignSelf: 'flex-end' }}>
        {String(sn)}
      </Yazi>
      <View style={{ flex: 1, justifyContent: 'center', gap: bosluk.l }}>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: renk.marka,
            borderWidth: cizgi.kalin,
            borderColor: renk.kontur,
            borderRadius: yaricap.dugme,
            paddingHorizontal: bosluk.l,
            paddingVertical: bosluk.m,
            boxShadow: `5px 5px 0 ${renk.golge}`,
          }}
        >
          <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 30 }}>
            Cevabın alındı ✓
          </Yazi>
        </View>
        <Yazi
          testID="oda-bekle-sayac"
          tur="baslikXl"
          style={{ textAlign: 'center' }}
        >
          {g.cevapladi.length}/{g.toplam}
        </Yazi>
        <Yazi soluk style={{ textAlign: 'center' }}>
          cevapladı. Kim ne dedi en sonda.
        </Yazi>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: bosluk.s,
            justifyContent: 'center',
          }}
        >
          {g.oyuncular.map((o) => {
            const tamam = g.cevapladi.includes(o.ad);
            return (
              <View
                key={o.ad}
                style={{
                  paddingHorizontal: bosluk.m,
                  paddingVertical: bosluk.xs,
                  borderRadius: yaricap.cip,
                  borderWidth: cizgi.ince,
                  borderColor: renk.kontur,
                  backgroundColor: tamam ? renk.yuzey : 'transparent',
                  opacity: tamam ? 1 : 0.5,
                }}
              >
                <Yazi tur="etiket">
                  {tamam ? '✓ ' : ''}
                  {o.ad}
                </Yazi>
              </View>
            );
          })}
        </View>
      </View>
      <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
        Herkes cevaplayınca beklemeden sonraki soru gelir.
      </Yazi>
      <Dugme
        testID="oda-degistir"
        tur="ikincil"
        etiket="Cevabı değiştir"
        onPress={onDegistir}
      />
      {durum.baglanti === 'yeniden' && <YenidenBaglaniyor />}
    </Ekran>
  );
}
