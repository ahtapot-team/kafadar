// Sonuç (KK-50, KK-52): yeşil yalnızca "grup casusu yakaladı", kırmızı yalnızca "casus kazandı"; oyun bitirilirse kazanan yok.
import { View } from 'react-native';
import { useDurum } from '../../durum';
import type { Sonuc } from '../../games/casus-kim/casus';
import { bosluk, yaricap } from '../../tema';
import { Dugme, Ekran, Yazi } from '../../ui';
import { PaylasDugmesi } from '../ortak/paylasim';
import { Sticker } from './ortak';

export function SonucEkrani({
  sonuc,
  ipucu,
  neden,
  onTekrar,
  onPaylas,
  onAnaMenu,
}: {
  sonuc: Sonuc;
  ipucu: string;
  neden: string; // "Ayşe kelimeyi bildi:" / "Grup yanlış kişiyi seçti:" …
  onTekrar: () => void;
  onPaylas: () => void;
  onAnaMenu: () => void;
}) {
  const { renk } = useDurum();
  const baslik =
    sonuc.kazanan === 'grup'
      ? 'Casusu yakaladınız!'
      : sonuc.kazanan === 'casus'
        ? 'Casus kazandı!'
        : 'Oyun bitirildi';
  const sticker =
    sonuc.kazanan === 'grup'
      ? 'ok'
      : sonuc.kazanan === 'casus'
        ? 'nok'
        : 'marka';
  const cip = (t: string) => (
    <View
      key={t}
      style={{
        paddingHorizontal: bosluk.m,
        paddingVertical: bosluk.xs,
        borderRadius: yaricap.cip,
        borderWidth: 3,
        borderColor: renk.kontur,
        backgroundColor: renk.yuzey,
      }}
    >
      <Yazi tur="etiket">{t}</Yazi>
    </View>
  );
  return (
    <Ekran>
      <View
        testID="casus-sonuc"
        style={{ flex: 1, justifyContent: 'center', gap: bosluk.l }}
      >
        <Sticker renkAdi={sticker}>
          <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 30 }}>
            {baslik}
          </Yazi>
        </Sticker>
        <Yazi soluk>
          {sonuc.kazanan === null ? 'Kazanan yok. İşte cevaplar:' : neden}
        </Yazi>
        <Yazi tur="baslikXl">{sonuc.kelime}</Yazi>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
          {[`Casus: ${sonuc.casuslar.join(', ')}`, `İpucu: ${ipucu}`].map(cip)}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: bosluk.m }}>
        <View style={{ flex: 1 }}>
          <Dugme
            testID="casus-tekrar"
            etiket="Tekrar oyna"
            onPress={onTekrar}
          />
        </View>
        <PaylasDugmesi
          testID="casus-paylas"
          bicim="ikincil"
          onPress={onPaylas}
        />
      </View>
      <Dugme
        testID="casus-ana-menu"
        tur="ikincil"
        etiket="Ana menü"
        onPress={onAnaMenu}
      />
    </Ekran>
  );
}
