// 10/10 ama oda modu: kart + gizli puan (KK-64, KK-65) ve "Puanın alındı ✓ · n/N" bekleme ekranı.
// Puan süre bitene kadar değiştirilebilir; başkalarının puanı açıklamaya kadar gelmez (görünümde yoktur).
import { Pressable, View } from 'react-native';
import { type IstemciDurumu } from '../oda/istemci';
import { puanRengi } from '../oyun-ekranlari/on-on-ama/ortak';
import { useDurum } from '../durum';
import { bosluk, cizgi, dokunmaAlani, yaricap } from '../tema';
import { titret } from '../titresim';
import { Dugme, Ekran, Yazi } from '../ui';
import { useKalan } from './kalan';
import { OdaUst } from './ust';
import { YenidenBaglaniyor } from './yeniden';

const TUSLAR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function OnKart({
  metin,
  buyuk,
  testID,
}: {
  metin: string;
  buyuk?: boolean;
  testID: string;
}) {
  const { renk } = useDurum();
  return (
    <View
      accessibilityLabel={`Kart: ${metin}`}
      style={{
        backgroundColor: renk.marka,
        borderWidth: buyuk ? 4 : 3,
        borderColor: renk.kontur,
        borderRadius: buyuk ? yaricap.kart : yaricap.cip,
        padding: buyuk ? bosluk.l : bosluk.m,
        boxShadow: `${buyuk ? 5 : 3}px ${buyuk ? 5 : 3}px 0 ${renk.golge}`,
      }}
    >
      <Yazi
        testID={testID}
        style={{
          color: renk.kontur,
          fontSize: buyuk ? 22 : 16,
          lineHeight: buyuk ? 28 : 22,
        }}
      >
        {metin}
      </Yazi>
    </View>
  );
}

export function OnPuanEkrani({
  durum,
  onPuan,
  onCik,
}: {
  durum: IstemciDurumu;
  onPuan: (puan: number) => void;
  onCik: () => void;
}) {
  const { renk, ayar } = useDurum();
  const g = durum.gorunum!;
  const sn = Math.ceil(useKalan(durum) / 1000);
  return (
    <Ekran>
      <OdaUst
        kod={g.kod}
        orta={`Kart ${g.soruNo} / 10`}
        sag={String(sn)}
        sagTestID="oda-geri-sayim"
        onCik={onCik}
      />
      <OnKart testID="oda-onon-kart-metni" metin={g.soru?.text ?? ''} buyuk />
      <Yazi tur="etiket" soluk>
        Senin puanın · gizli
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
        {TUSLAR.map((p) => {
          const secili = g.benimPuanim === p;
          return (
            <Pressable
              key={p}
              testID={`oda-onon-puan-${p}`}
              accessibilityRole="button"
              accessibilityLabel={`${p} puan`}
              accessibilityState={{
                selected: secili,
                disabled: durum.baglanti !== 'acik',
              }}
              disabled={durum.baglanti !== 'acik'} // bağlantı yokken puan yutulmasın
              onPress={() => {
                titret('secim', ayar.titresim);
                onPuan(p);
              }}
              style={{
                flexBasis: p === 10 ? '48%' : '22.5%',
                flexGrow: p === 10 ? 1 : 0,
                minHeight: 56,
                borderRadius: yaricap.cip,
                borderWidth: cizgi.ince,
                borderColor: renk.kontur,
                backgroundColor: secili ? renk.ok : renk.yuzey,
                borderBottomWidth: 9,
                borderBottomColor: secili ? renk.kontur : puanRengi(p, renk),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Yazi
                tur="baslik"
                style={{
                  fontSize: 24,
                  color: secili ? renk.kontur : renk.metin,
                }}
              >
                {p}
              </Yazi>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
        Süre bitene kadar değiştirebilirsin. Puanlar açıklamaya kadar kimseye
        gitmez.
      </Yazi>
      {durum.baglanti === 'yeniden' && <YenidenBaglaniyor />}
    </Ekran>
  );
}

export function OnBeklemeEkrani({
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
      <OdaUst
        kod={g.kod}
        orta={`Kart ${g.soruNo} / 10`}
        sag={String(sn)}
        onCik={onCik}
      />
      <OnKart testID="oda-onon-kart-metni" metin={g.soru?.text ?? ''} />
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
            Puanın alındı ✓
          </Yazi>
        </View>
        <Yazi
          testID="oda-onon-puanim"
          tur="etiket"
          style={{ textAlign: 'center' }}
        >
          Senin puanın: {g.benimPuanim}
        </Yazi>
        <Yazi
          testID="oda-bekle-sayac"
          tur="baslikXl"
          style={{ textAlign: 'center' }}
        >
          {g.cevapladi.length}/{g.toplam}
        </Yazi>
        <Yazi soluk style={{ textAlign: 'center' }}>
          puan verdi. Kim kaç verdi, birazdan.
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
                  minHeight: dokunmaAlani / 2,
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
        Herkes puan verince beklemeden açıklama gelir.
      </Yazi>
      <Dugme
        testID="oda-onon-puani-degistir"
        tur="ikincil"
        etiket="Puanı değiştir"
        onPress={onDegistir}
      />
      {durum.baglanti === 'yeniden' && <YenidenBaglaniyor />}
    </Ekran>
  );
}
