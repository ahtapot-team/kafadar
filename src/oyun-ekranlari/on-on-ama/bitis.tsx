// Oturum sonu ödülleri (KK-58): En acımasız, Melek kalpli, Ruh ikizleri.
import { View } from 'react-native';
import { bosluk } from '../../tema';
import { Dugme, Ekran, Yazi } from '../../ui';
import type { Oduller } from '../../games/on-on-ama/onon';
import { PaylasDugmesi } from '../ortak/paylasim';
import { OdulKarti } from '../ortak/odul';

type Props = {
  kartSayisi: number;
  oduller: Oduller;
  altSatir: {
    acimasiz: (ad: string) => string;
    melek: (ad: string) => string;
    ikiz: (a: string, b: string) => string;
  };
  onTekrar: () => void;
  onAnaMenu: () => void;
  onPaylas: () => void;
};

export function BitisEkrani({
  kartSayisi,
  oduller,
  altSatir,
  onTekrar,
  onAnaMenu,
  onPaylas,
}: Props) {
  return (
    <Ekran>
      <Yazi tur="etiket" soluk>
        {kartSayisi} kart bitti
      </Yazi>
      <Yazi tur="baslik">Gecenin ödülleri</Yazi>
      {oduller.enAcimasiz.length > 0 && (
        <OdulKarti
          testID="onon-odul-en-acimasiz"
          baslik="En acımasız"
          renkAdi="nok"
          satirlar={oduller.enAcimasiz}
          notlar={oduller.enAcimasiz.map(altSatir.acimasiz)}
        />
      )}
      {oduller.melekKalpli.length > 0 && (
        <OdulKarti
          testID="onon-odul-melek-kalpli"
          baslik="Melek kalpli"
          renkAdi="ok"
          satirlar={oduller.melekKalpli}
          notlar={oduller.melekKalpli.map(altSatir.melek)}
        />
      )}
      {oduller.ruhIkizleri.length > 0 && (
        <OdulKarti
          testID="onon-odul-ruh-ikizleri"
          baslik="Ruh ikizleri"
          renkAdi="marka2"
          satirlar={oduller.ruhIkizleri.map(([a, b]) => `${a} & ${b}`)}
          notlar={oduller.ruhIkizleri.map(([a, b]) => altSatir.ikiz(a, b))}
        />
      )}
      {kartSayisi === 0 && (
        <Yazi soluk>Henüz açıklanan kart yok, ödül de yok.</Yazi>
      )}
      <View style={{ flex: 1 }} />
      <View
        style={{ flexDirection: 'row', gap: bosluk.m, alignItems: 'center' }}
      >
        <View style={{ flex: 1 }}>
          <Dugme
            testID="onon-tekrar-oyna"
            etiket="Tekrar oyna"
            onPress={onTekrar}
          />
        </View>
        <PaylasDugmesi testID="onon-paylas" onPress={onPaylas} />
      </View>
      <Dugme
        testID="onon-ana-menu"
        tur="ikincil"
        etiket="Ana menü"
        onPress={onAnaMenu}
      />
    </Ekran>
  );
}
