// Oturum sonu: sade sürüm (ödül kartları ve paylaşım sonraki PR'da).
import type { Oduller } from '../../games/ok-mu-nok/oyun';
import { Dugme, Ekran, Yazi } from '../../ui';

type Props = {
  kartSayisi: number;
  oduller: Oduller;
  kartMetni: (id: string) => string;
  onTekrar: () => void;
  onAnaMenu: () => void;
};

export function BitisEkrani({ kartSayisi, onTekrar, onAnaMenu }: Props) {
  return (
    <Ekran>
      <Yazi tur="baslik">{kartSayisi} kart bitti</Yazi>
      <Dugme testID="tekrar-oyna" etiket="Tekrar oyna" onPress={onTekrar} />
      <Dugme
        testID="ana-menu"
        tur="ikincil"
        etiket="Ana menü"
        onPress={onAnaMenu}
      />
    </Ekran>
  );
}
