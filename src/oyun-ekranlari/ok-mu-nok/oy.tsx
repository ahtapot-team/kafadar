// Oy girişi (KK-10): telefonu tutan kişi her isme OK / NOK işaretler; herkes işaretlenince "Göster" açılır.
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, cizgi, dokunmaAlani, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import type { Oy } from '../../games/ok-mu-nok/oyun';
import { KartSeridi, UstCubuk } from '../ortak/ortak';

type Props = {
  kart: string;
  oyuncular: string[];
  oylar: Record<string, Oy>;
  gosterAktif: boolean;
  onOyla: (oyuncu: string, oy: Oy) => void;
  onGoster: () => void;
  onAtla: () => void;
  onOyuncular: () => void;
  onCik: () => void;
};

function OyDugmesi({
  ad,
  oy,
  secili,
  i,
  onPress,
}: {
  ad: string;
  oy: Oy;
  secili: boolean;
  i: number;
  onPress: () => void;
}) {
  const { renk } = useDurum();
  const dolgu = oy === 'OK' ? renk.ok : renk.nok;
  return (
    <Pressable
      testID={`oy-${i}-${oy === 'OK' ? 'ok' : 'nok'}`}
      accessibilityRole="button"
      accessibilityLabel={`${ad} için ${oy}`}
      accessibilityState={{ selected: secili }}
      onPress={onPress}
      style={{
        minHeight: dokunmaAlani,
        minWidth: 84,
        paddingHorizontal: bosluk.m,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: secili ? dolgu : renk.yuzey,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Yazi
        tur="etiket"
        style={{ color: secili ? renk.kontur : renk.metinSoluk }}
      >
        {oy === 'OK' ? '👍 OK' : '👎 NOK'}
      </Yazi>
    </Pressable>
  );
}

export function OyEkrani({
  kart,
  oyuncular,
  oylar,
  gosterAktif,
  onOyla,
  onGoster,
  onAtla,
  onOyuncular,
  onCik,
}: Props) {
  const { ayar } = useDurum();
  const verilen = oyuncular.filter((o) => oylar[o]).length;
  return (
    <Ekran>
      <UstCubuk
        orta={`${verilen} / ${oyuncular.length} işaretlendi`}
        onCik={onCik}
      />
      <KartSeridi testID="kart-metni" metin={kart} />
      <Yazi tur="baslik">Kim ne dedi?</Yazi>
      {oyuncular.map((ad, i) => (
        <View
          key={ad}
          style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.s }}
        >
          <Yazi numberOfLines={1} style={{ flex: 1 }}>
            {ad}
          </Yazi>
          {(['OK', 'NOK'] as const).map((oy) => (
            <OyDugmesi
              key={oy}
              ad={ad}
              oy={oy}
              i={i}
              secili={oylar[ad] === oy}
              onPress={() => {
                titret('secim', ayar.titresim);
                onOyla(ad, oy);
              }}
            />
          ))}
        </View>
      ))}
      <View style={{ flex: 1 }} />
      <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
        {gosterAktif ? 'Hazır!' : 'Herkes işaretlenince açılır'}
      </Yazi>
      <Dugme
        testID="goster"
        etiket="Göster"
        pasif={!gosterAktif}
        onPress={onGoster}
      />
      <View style={{ flexDirection: 'row', gap: bosluk.m }}>
        <View style={{ flex: 1 }}>
          <Dugme testID="atla" tur="ikincil" etiket="Atla" onPress={onAtla} />
        </View>
        <View style={{ flex: 1 }}>
          <Dugme
            testID="oyuncu-duzenle"
            tur="ikincil"
            etiket="Oyuncular"
            onPress={onOyuncular}
          />
        </View>
      </View>
    </Ekran>
  );
}
