// Tartışma (KK-48): dönen örnek sorular, isteğe bağlı TOPLAM geri sayım, "Oylamaya geç" istediğin an.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, cizgi, yaricap } from '../../tema';
import { Dugme, Ekran, Yazi } from '../../ui';
import { CasusUst, OyunuBitir } from './ortak';

const SORU_MS = 20_000;

function dakika(ms: number) {
  const sn = Math.ceil(ms / 1000);
  return `${Math.floor(sn / 60)}:${String(sn % 60).padStart(2, '0')}`;
}

export function Tartisma({
  sorular,
  baslangic,
  toplamMs,
  kalanMs,
  onOylamaya,
  onBitir,
  onCik,
}: {
  sorular: string[];
  baslangic: number; // rastgele başlangıç (örnek sorular tohumlu sırayla dönmeye buradan başlar)
  toplamMs: number | null;
  kalanMs: number | null;
  onOylamaya: () => void;
  onBitir: () => void;
  onCik: () => void;
}) {
  const { renk } = useDurum();
  const [i, setI] = useState(baslangic % Math.max(1, sorular.length));
  useEffect(() => {
    const id = setInterval(
      () => setI((x) => (x + 1) % Math.max(1, sorular.length)),
      SORU_MS,
    );
    return () => clearInterval(id);
  }, [sorular.length]);
  return (
    <Ekran>
      <CasusUst orta="Tartışma" onCik={onCik} />
      {toplamMs !== null && kalanMs !== null && (
        <View style={{ alignItems: 'center', gap: bosluk.xs }}>
          <Yazi
            testID="casus-sure"
            tur="baslikXl"
            accessibilityLabel={`Kalan süre ${dakika(kalanMs)}`}
          >
            {dakika(kalanMs)}
          </Yazi>
          <Yazi tur="etiket" soluk>
            / {toplamMs / 60_000} dk
          </Yazi>
        </View>
      )}
      <View
        style={{
          backgroundColor: renk.marka,
          borderWidth: cizgi.kalin,
          borderColor: renk.kontur,
          borderRadius: yaricap.kart,
          padding: bosluk.xl,
          gap: bosluk.m,
          boxShadow: `8px 8px 0 ${renk.golge}`,
        }}
      >
        <Yazi tur="etiket" style={{ color: renk.kontur }}>
          Örnek soru · {i + 1}/{sorular.length}
        </Yazi>
        <Yazi
          testID="casus-soru"
          tur="baslik"
          style={{ color: renk.kontur, fontSize: 28 }}
        >
          {sorular[i]}
        </Yazi>
      </View>
      <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
        Sorular kendiliğinden döner. Kelimeyi söylemek yok!
      </Yazi>
      <View style={{ flex: 1 }} />
      <Dugme
        testID="casus-oylamaya-gec"
        etiket="Oylamaya geç"
        onPress={onOylamaya}
      />
      <OyunuBitir onBitir={onBitir} />
    </Ekran>
  );
}
