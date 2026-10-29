// Casusun kelime tahmini (KK-50): 6 şık (doğru kelime + aynı paketten 5 kelime).
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, cizgi, dokunmaAlani, yaricap } from '../../tema';
import { Dugme, Ekran, Yazi } from '../../ui';
import { CasusUst, OyunuBitir } from './ortak';

export function Tahmin({
  kim,
  ipucu,
  siklar,
  onTahmin,
  onBitir,
  onCik,
}: {
  kim: string;
  ipucu: string;
  siklar: string[];
  onTahmin: (kelime: string) => void;
  onBitir: () => void;
  onCik: () => void;
}) {
  const { renk } = useDurum();
  const [secili, setSecili] = useState<string | null>(null);
  return (
    <Ekran>
      <CasusUst orta={`${kim} tahmin ediyor`} onCik={onCik} />
      <Yazi tur="baslik">Kelime neydi?</Yazi>
      <Yazi soluk>İpucun: {ipucu}</Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {siklar.map((s, i) => (
          <Pressable
            key={s}
            testID={`casus-tahmin-${i}`}
            accessibilityRole="button"
            accessibilityLabel={s}
            accessibilityState={{ selected: secili === s }}
            onPress={() => setSecili(s)}
            style={{
              width: '47%',
              minHeight: dokunmaAlani + 16,
              alignItems: 'center',
              justifyContent: 'center',
              padding: bosluk.m,
              borderRadius: yaricap.cip,
              borderWidth: cizgi.ince,
              borderColor: renk.kontur,
              backgroundColor: secili === s ? renk.marka2 : renk.yuzey,
            }}
          >
            <Yazi
              tur="dugme"
              style={{
                fontSize: 17,
                textAlign: 'center',
                color: secili === s ? renk.kontur : renk.metin,
              }}
            >
              {s}
            </Yazi>
          </Pressable>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <Dugme
        testID="casus-tahmin-gonder"
        etiket="Kesin cevabım"
        pasif={!secili}
        onPress={() => secili && onTahmin(secili)}
      />
      <OyunuBitir onBitir={onBitir} />
    </Ekran>
  );
}
