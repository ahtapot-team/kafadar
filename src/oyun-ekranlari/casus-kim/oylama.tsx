// Açık oylama (KK-49): herkes sırayla kimi gösterdiğini seçer; eşitlikte yalnızca eşit kalanlar arasında bir kez daha.
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, dokunmaAlani, yaricap } from '../../tema';
import { Dugme, Ekran, Yazi } from '../../ui';
import { CasusUst, OyunuBitir } from './ortak';

export function Oylama({
  oyuncular,
  adaylar,
  oylar,
  tur,
  onOyla,
  onBitirOylama,
  onBitir,
  onCik,
}: {
  oyuncular: string[];
  adaylar: string[];
  oylar: Record<string, string>;
  tur: 1 | 2;
  onOyla: (oyveren: string, secilen: string) => void;
  onBitirOylama: () => void;
  onBitir: () => void;
  onCik: () => void;
}) {
  const { renk } = useDurum();
  const [duzenle, setDuzenle] = useState<string | null>(null); // oyu değiştirilmek istenen oyuncu
  const siradaki = oyuncular.find((p) => !oylar[p]) ?? null;
  const aktif = duzenle ?? siradaki;
  const verilen = oyuncular.filter((p) => oylar[p]).length;
  const kalan = oyuncular.length - verilen;
  return (
    <Ekran>
      <CasusUst
        orta={`${verilen} / ${oyuncular.length} girildi`}
        onCik={onCik}
      />
      <Yazi testID="casus-oylama" tur="baslik">
        Kim kimi gösteriyor?
      </Yazi>
      {tur === 2 && (
        <View
          style={{
            padding: bosluk.m,
            borderRadius: yaricap.cip,
            borderWidth: 3,
            borderColor: renk.kontur,
            backgroundColor: renk.yuzey,
          }}
        >
          <Yazi tur="etiket">
            Eşitlik! Yalnızca {adaylar.join(' ve ')} arasında bir kez daha
            oylayın. Yine eşitse casuslar kazanır.
          </Yazi>
        </View>
      )}
      {oyuncular.map((p) => (
        <Pressable
          key={p}
          onPress={() => setDuzenle(p)}
          accessibilityRole="button"
          accessibilityLabel={`${p}${oylar[p] ? `, ${oylar[p]} seçti` : ', henüz seçmedi'}`}
          style={{
            minHeight: dokunmaAlani,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: bosluk.l,
            borderRadius: yaricap.cip,
            borderWidth: aktif === p ? 4 : 3,
            borderColor: aktif === p ? renk.marka : renk.kontur,
            backgroundColor: renk.yuzey,
          }}
        >
          <Yazi tur="etiket">{p} →</Yazi>
          <Yazi
            tur="etiket"
            style={{ color: oylar[p] ? renk.marka2 : renk.metinSoluk }}
          >
            {oylar[p] ?? 'seç'}
          </Yazi>
        </Pressable>
      ))}
      {aktif && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
          {adaylar
            .filter((a) => a !== aktif)
            .map((a, i) => (
              <Pressable
                key={a}
                testID={`casus-oyla-${i}`}
                accessibilityRole="button"
                accessibilityLabel={`${aktif} için ${a}`}
                onPress={() => {
                  onOyla(aktif, a);
                  setDuzenle(null);
                }}
                style={{
                  minHeight: dokunmaAlani,
                  justifyContent: 'center',
                  paddingHorizontal: bosluk.l,
                  borderRadius: yaricap.cip,
                  borderWidth: 3,
                  borderColor: renk.kontur,
                  backgroundColor: renk.marka2,
                }}
              >
                <Yazi tur="etiket" style={{ color: renk.kontur }}>
                  {a}
                </Yazi>
              </Pressable>
            ))}
        </View>
      )}
      <View style={{ flex: 1 }} />
      <Dugme
        testID="casus-oy-bitir"
        etiket={kalan > 0 ? `Kartı çevir · ${kalan} kişi kaldı` : 'Kartı çevir'}
        pasif={kalan > 0}
        onPress={onBitirOylama}
      />
      <OyunuBitir onBitir={onBitir} />
    </Ekran>
  );
}
