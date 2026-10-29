// Gizli kart (KK-44, KK-45, KK-46): içerik YALNIZCA basılıyken ağaçta bulunur; bırakınca hemen kapanır.
// Casus ve normal kart aynı renk, düzen ve boyutla çizilir (yan bakışta ayırt edilemez). Arka plana alınınca kapanır.
import { useEffect, useState } from 'react';
import { AppState, Platform, Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import { bosluk, cizgi, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Yazi } from '../../ui';

// Uygulama arka plana alınınca (AppState / web'de visibilitychange) true; açık kartı kapatmak için çağıran `gizlendi`'yi verir.
export function useGizli(gizlendi: () => void): boolean {
  const [gizli, setGizli] = useState(false);
  useEffect(() => {
    const degisti = (g: boolean) => {
      setGizli(g);
      if (g) gizlendi();
    };
    if (Platform.OS === 'web') {
      const f = () => degisti(document.visibilityState !== 'visible');
      document.addEventListener('visibilitychange', f);
      return () => document.removeEventListener('visibilitychange', f);
    }
    const s = AppState.addEventListener('change', (k) =>
      degisti(k !== 'active'),
    );
    return () => s.remove();
  }, [gizlendi]);
  return gizli;
}

// Rolü gösteren kart gövdesi: casus ve normal için TEK bileşen, yalnızca metinler farklı.
function KartGovdesi({ ana, alt }: { ana: string; alt: string }) {
  const { renk } = useDurum();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: renk.marka2,
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        borderRadius: yaricap.kart,
        padding: bosluk.xl,
        justifyContent: 'center',
        gap: bosluk.m,
        boxShadow: `8px 8px 0 ${renk.golge}`,
      }}
    >
      <Yazi tur="etiket" style={{ color: renk.kontur }}>
        Rolün
      </Yazi>
      <Yazi
        tur="baslik"
        style={{ color: renk.kontur, fontSize: 34, lineHeight: 40 }}
      >
        {ana}
      </Yazi>
      <Yazi style={{ color: renk.kontur }}>{alt}</Yazi>
    </View>
  );
}

export function GizliKart({
  rol,
  onAcildi,
}: {
  rol: { rol: 'casus' | 'normal'; metin: string } | null;
  onAcildi: () => void; // ilk kez açıldı (Gördüm düğmesini açmak için)
}) {
  const { renk, ayar } = useDurum();
  const [basili, setBasili] = useState(false);
  const gizli = useGizli(() => setBasili(false));
  const goster = basili && !gizli && rol !== null;
  return (
    <Pressable
      testID="casus-kart"
      accessibilityRole="button"
      accessibilityLabel="Kartı görmek için basılı tut"
      accessibilityHint="Bırakınca kart kapanır"
      onPressIn={() => {
        setBasili(true);
        titret('dugme', ayar.titresim); // casus ve normal için aynı titreşim
        onAcildi();
      }}
      onPressOut={() => setBasili(false)}
      style={{ flex: 1, justifyContent: 'center' }}
    >
      <View style={{ height: 360 }}>
        {goster ? (
          rol.rol === 'casus' ? (
            <KartGovdesi ana="Sen casussun" alt={`İpucu: ${rol.metin}`} />
          ) : (
            <KartGovdesi
              ana={`Kelime: ${rol.metin}`}
              alt="Casus bilmiyor. Ele verme."
            />
          )
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: renk.yuzey,
              borderWidth: cizgi.kalin,
              borderColor: renk.kontur,
              borderRadius: yaricap.kart,
              alignItems: 'center',
              justifyContent: 'center',
              gap: bosluk.s,
              boxShadow: `8px 8px 0 ${renk.golge}`,
            }}
          >
            <Yazi tur="baslik" style={{ fontSize: 28, textAlign: 'center' }}>
              Görmek için basılı tut
            </Yazi>
            <Yazi tur="etiket" soluk>
              Bırakınca kart kapanır.
            </Yazi>
          </View>
        )}
      </View>
    </Pressable>
  );
}
