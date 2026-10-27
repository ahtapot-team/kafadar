// Soru ekranı (KK-32, KK-33): soru metni, sunucu saatine göre geri sayım, dev OK/NOK; süre içinde değiştirilebilir.
import { Pressable, View } from 'react-native';
import { type IstemciDurumu } from '../oda/istemci';
import type { Oy } from '../oda/oda';
import { useDurum } from '../durum';
import { bosluk, yaricap } from '../tema';
import { titret } from '../titresim';
import { Ekran, Yazi } from '../ui';
import { useKalan } from './kalan';
import { OdaUst } from './ust';
import { YenidenBaglaniyor } from './yeniden';

function Dev({
  oy,
  secili,
  onPress,
}: {
  oy: Oy;
  secili: boolean;
  onPress: () => void;
}) {
  const { renk } = useDurum();
  const dolgu = oy === 'OK' ? renk.ok : renk.nok;
  return (
    <Pressable
      testID={oy === 'OK' ? 'oda-oy-ok' : 'oda-oy-nok'}
      accessibilityRole="button"
      accessibilityLabel={oy}
      accessibilityState={{ selected: secili }}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 140,
        borderRadius: yaricap.kart,
        borderWidth: 4,
        borderColor: renk.kontur,
        backgroundColor: secili ? dolgu : renk.yuzey,
        alignItems: 'center',
        justifyContent: 'center',
        gap: bosluk.xs,
        boxShadow: `5px 5px 0 ${renk.golge}`,
      }}
    >
      <Yazi
        tur="baslik"
        style={{
          color: secili
            ? renk.kontur
            : oy === 'OK'
              ? renk.okMetin
              : renk.nokMetin,
        }}
      >
        {oy === 'OK' ? '👍' : '👎'}
      </Yazi>
      <Yazi
        tur="baslik"
        style={{
          fontSize: 28,
          color: secili
            ? renk.kontur
            : oy === 'OK'
              ? renk.okMetin
              : renk.nokMetin,
        }}
      >
        {oy}
      </Yazi>
    </Pressable>
  );
}

export function SoruEkrani({
  durum,
  onOyla,
}: {
  durum: IstemciDurumu;
  onOyla: (oy: Oy) => void;
}) {
  const { renk, ayar } = useDurum();
  const g = durum.gorunum!;
  const kalan = useKalan(durum);
  const sn = Math.ceil(kalan / 1000);
  return (
    <Ekran>
      <OdaUst kod={g.kod} orta={`Soru ${g.soruNo} / 10`} sag={String(sn)} />
      <View
        style={{
          height: 8,
          borderRadius: 99,
          backgroundColor: renk.yuzey,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.min(100, (kalan / 15000) * 100)}%`,
            borderRadius: 99,
            backgroundColor: renk.marka,
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: renk.marka,
          borderWidth: 4,
          borderColor: renk.kontur,
          borderRadius: yaricap.kart,
          padding: bosluk.xl,
          gap: bosluk.m,
          boxShadow: `8px 8px 0 ${renk.golge}`,
        }}
      >
        <Yazi tur="etiket" style={{ color: renk.kontur }}>
          Durum
        </Yazi>
        <Yazi
          testID="oda-soru"
          tur="baslik"
          style={{ color: renk.kontur, fontSize: 28 }}
        >
          {g.soru?.text}
        </Yazi>
      </View>
      <View
        testID="oda-geri-sayim"
        accessibilityLabel={`${sn} saniye`}
        accessibilityLiveRegion="polite"
      />
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', gap: bosluk.l }}>
        {(['OK', 'NOK'] as const).map((oy) => (
          <Dev
            key={oy}
            oy={oy}
            secili={g.benimOyum === oy}
            onPress={() => {
              titret('secim', ayar.titresim);
              onOyla(oy);
            }}
          />
        ))}
      </View>
      <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
        Süre bitene kadar fikrini değiştirebilirsin.
      </Yazi>
      {durum.baglanti === 'yeniden' && <YenidenBaglaniyor />}
    </Ekran>
  );
}
