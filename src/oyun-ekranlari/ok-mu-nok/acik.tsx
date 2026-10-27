// Açıklama anı: sade sürüm (çubuklar, sarsıntı ve konfeti sonraki PR'da).
import { useDurum } from '../../durum';
import type { Oy, Sonuc } from '../../games/ok-mu-nok/oyun';
import { Dugme, Ekran, Yazi } from '../../ui';

type Props = {
  oyuncular: string[];
  oylar: Record<string, Oy>;
  sonuc: Sonuc;
  onSonraki: () => void;
  onBitir: () => void;
};

export function AcikEkrani({
  oyuncular,
  oylar,
  sonuc,
  onSonraki,
  onBitir,
}: Props) {
  const { renk } = useDurum();
  return (
    <Ekran>
      <Yazi tur="baslik" testID="sonuc-metni">
        {sonuc.metin}
      </Yazi>
      {oyuncular.map((o) => (
        <Yazi
          key={o}
          style={{ color: oylar[o] === 'OK' ? renk.okMetin : renk.nokMetin }}
        >
          {o}: {oylar[o]}
        </Yazi>
      ))}
      <Dugme testID="sonraki" etiket="Sonraki kart" onPress={onSonraki} />
      <Dugme testID="bitir" tur="ikincil" etiket="Bitir" onPress={onBitir} />
    </Ekran>
  );
}
