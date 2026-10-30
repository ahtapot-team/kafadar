// Casus kim ortak parçalar: üst satır (rozet, aşama, ✕) ve "Oyunu bitir" (her aşamada, onaylı; KK-48).
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { useBilgiYuvasi } from '../../tanitim-kutusu';
import { bosluk, cizgi, dokunmaAlani, renkler, yaricap } from '../../tema';
import { Diyalog, Dugme, Yazi } from '../../ui';

export function CasusUst({ orta, onCik }: { orta: string; onCik: () => void }) {
  const { renk } = useDurum();
  const bilgi = useBilgiYuvasi();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.m }}>
      <View
        style={{
          paddingHorizontal: bosluk.m,
          minHeight: 32,
          justifyContent: 'center',
          borderRadius: yaricap.cip,
          borderWidth: cizgi.ince,
          borderColor: renk.kontur,
          backgroundColor: renk.marka2,
        }}
      >
        <Yazi tur="etiket" style={{ color: renk.kontur }}>
          Casus kim
        </Yazi>
      </View>
      <Yazi tur="etiket" soluk style={{ flex: 1, textAlign: 'center' }}>
        {orta}
      </Yazi>
      {bilgi}
      <Pressable
        testID="cik"
        accessibilityRole="button"
        accessibilityLabel="Oyundan çık"
        onPress={onCik}
        style={{
          width: dokunmaAlani,
          height: dokunmaAlani,
          borderRadius: yaricap.cip,
          borderWidth: cizgi.ince,
          borderColor: renk.kontur,
          backgroundColor: renk.yuzey,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Yazi>✕</Yazi>
      </Pressable>
    </View>
  );
}

// Moderatör oyunu her aşamada bitirebilir: casuslar ve kelime gösterilir, kazanan ilan edilmez.
export function OyunuBitir({ onBitir }: { onBitir: () => void }) {
  const [soruyor, setSoruyor] = useState(false);
  return (
    <>
      <Dugme
        testID="casus-bitir"
        tur="ikincil"
        etiket="Oyunu bitir"
        onPress={() => setSoruyor(true)}
      />
      <Diyalog gorunur={soruyor} baslik="Oyunu bitir?">
        <Yazi style={{ color: renkler.koyu.kontur }}>
          Casuslar ve kelime gösterilir, kazanan ilan edilmez.
        </Yazi>
        <Dugme
          testID="casus-bitir-evet"
          etiket="Evet, bitir"
          onPress={() => {
            setSoruyor(false);
            onBitir();
          }}
        />
        <Dugme
          tur="ikincil"
          etiket="Vazgeç"
          onPress={() => setSoruyor(false)}
        />
      </Diyalog>
    </>
  );
}

export function Sticker({
  children,
  renkAdi = 'marka',
  egim = -4,
}: {
  children: ReactNode;
  renkAdi?: 'marka' | 'marka2' | 'ok' | 'nok';
  egim?: number;
}) {
  const { renk } = useDurum();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: renk[renkAdi],
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        borderRadius: yaricap.dugme,
        paddingHorizontal: bosluk.l,
        paddingVertical: bosluk.m,
        transform: [{ rotate: `${egim}deg` }],
        boxShadow: `5px 5px 0 ${renk.golge}`,
      }}
    >
      {children}
    </View>
  );
}
