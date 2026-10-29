// Oturum sonu ödülleri (KK-12): Aykırı ruh, Ruh ikizleri, Olay kart.
import { View } from 'react-native';
import { bosluk } from '../../tema';
import { Dugme, Ekran, Yazi } from '../../ui';
import type { Oduller } from '../../games/ok-mu-nok/oyun';
import { PaylasDugmesi } from '../ortak/paylasim';
import { OdulKarti } from '../ortak/odul';

type Props = {
  kartSayisi: number;
  oduller: Oduller;
  kartMetni: (id: string) => string;
  onTekrar: () => void;
  onAnaMenu: () => void;
  onPaylas: () => void;
};

export function BitisEkrani({
  kartSayisi,
  oduller,
  kartMetni,
  onTekrar,
  onAnaMenu,
  onPaylas,
}: Props) {
  const { ikizler, aykiri, olay } = {
    aykiri: oduller.aykiriRuh,
    ikizler: oduller.ruhIkizleri.map(([a, b]) => `${a} & ${b}`),
    olay: oduller.olayKart.map((id) => `“${kartMetni(id)}”`),
  };
  return (
    <Ekran>
      <Yazi tur="etiket" soluk>
        {kartSayisi} kart bitti
      </Yazi>
      <Yazi tur="baslik">Gecenin ödülleri</Yazi>
      {aykiri.length > 0 && (
        <OdulKarti
          testID="odul-aykiri-ruh"
          baslik="Aykırı ruh"
          renkAdi="marka"
          satirlar={aykiri}
        />
      )}
      {ikizler.length > 0 && (
        <OdulKarti
          testID="odul-ruh-ikizleri"
          baslik="Ruh ikizleri"
          renkAdi="marka2"
          satirlar={ikizler}
        />
      )}
      {olay.length > 0 && (
        <OdulKarti
          testID="odul-olay-kart"
          baslik="Olay kart"
          renkAdi="yuzey"
          satirlar={olay}
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
          <Dugme testID="tekrar-oyna" etiket="Tekrar oyna" onPress={onTekrar} />
        </View>
        <PaylasDugmesi testID="paylas" onPress={onPaylas} />
      </View>
      <Dugme
        testID="ana-menu"
        tur="ikincil"
        etiket="Ana menü"
        onPress={onAnaMenu}
      />
    </Ekran>
  );
}
