// Casus kim paylaşım görseli (9:16): sonuç, kelime, casus. Renk kuralı: yeşil yalnızca grup kazandı, kırmızı yalnızca casus kazandı (KK-52).
import { Text, View } from 'react-native';
import type { Sonuc } from '../../games/casus-kim/casus';
import { font, renkler } from '../../tema';

const r = renkler.koyu;

export function PaylasimIcerik({
  sonuc,
  ipucu,
}: {
  sonuc: Sonuc;
  ipucu: string;
}) {
  const baslik =
    sonuc.kazanan === 'grup'
      ? 'Casusu yakaladık!'
      : sonuc.kazanan === 'casus'
        ? 'Casus kazandı!'
        : 'Oyun bitirildi';
  const dolgu =
    sonuc.kazanan === 'grup'
      ? r.ok
      : sonuc.kazanan === 'casus'
        ? r.nok
        : r.marka;
  return (
    <>
      <Text
        style={{ fontFamily: font.kalin, fontSize: 12, color: r.metinSoluk }}
      >
        CASUS KİM
      </Text>
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: dolgu,
          borderWidth: 3,
          borderColor: r.kontur,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          transform: [{ rotate: '-4deg' }],
          boxShadow: `4px 4px 0 ${r.golge}`,
        }}
      >
        <Text style={{ fontFamily: font.kalin, fontSize: 24, color: r.kontur }}>
          {baslik}
        </Text>
      </View>
      <Text
        style={{ fontFamily: font.kalin, fontSize: 12, color: r.metinSoluk }}
      >
        KELİME
      </Text>
      <Text style={{ fontFamily: font.kalin, fontSize: 44, color: r.metin }}>
        {sonuc.kelime}
      </Text>
      <Text
        style={{ fontFamily: font.kalin, fontSize: 14, color: r.metinSoluk }}
      >
        Casus: {sonuc.casuslar.join(', ')} · İpucu: {ipucu}
      </Text>
      <View style={{ flex: 1 }} />
      <Text
        style={{
          fontFamily: font.kalin,
          fontSize: 12,
          color: r.metinSoluk,
          textAlign: 'center',
        }}
      >
        Kafadar ile oynandı · Casus kim
      </Text>
    </>
  );
}
