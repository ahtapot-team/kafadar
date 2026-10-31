// Quiz Night paket seçimi (KK-108): Tümü · Türk · Yabancı süzgeci, "Ne kadar <ad> fanısın?" kartları.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  KOKEN_CIPLERI,
  KOKEN_CIP_ETIKETI,
  PAKET_NOTU,
  kokenEtiketi,
  paketBasligi,
  paketSuz,
  type KokenCipi,
} from '../../src/games/quiz-night/arayuz';
import { oncekiOku } from '../../src/games/quiz-night/onceki';
import { depo } from '../../src/depo';
import { useDurum } from '../../src/durum';
import { BilgiDugmesi } from '../../src/tanitim-kutusu';
import { bosluk, cizgi, yaricap } from '../../src/tema';
import { Cip, Ekran, GeriCubugu, Yazi } from '../../src/ui';
import { quizPaketleri } from '../../src/oyun-ekranlari/quiz/paketler';

const KOKEN_TESTID: Record<KokenCipi, string> = {
  tumu: 'quiz-koken-tumu',
  tr: 'quiz-koken-tr',
  yabanci: 'quiz-koken-yabanci',
};

export default function QuizPaketSec() {
  const router = useRouter();
  const { renk, oyunId, oyunAyari, oyunAyariniAyarla, oyunuBaslat } =
    useDurum();
  const [cip, setCip] = useState<KokenCipi>('tumu');

  const basla = async (paketId: string) => {
    const onceki = await oncekiOku(depo, paketId); // aynı soruların tekrarını azaltır (KK-109)
    oyunAyariniAyarla({ ...oyunAyari, paket: paketId, onceki });
    oyunuBaslat();
    router.replace('/oyun');
  };

  return (
    <Ekran>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <GeriCubugu testID="geri" />
        <BilgiDugmesi oyunId={oyunId ?? ''} />
      </View>
      <Yazi tur="baslik">Hangi dizi?</Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
        {KOKEN_CIPLERI.map((c) => (
          <Cip
            key={c}
            testID={KOKEN_TESTID[c]}
            etiket={KOKEN_CIP_ETIKETI[c]}
            secili={cip === c}
            onPress={() => setCip(c)}
          />
        ))}
      </View>
      {paketSuz(quizPaketleri, cip).map((p) => (
        <Pressable
          key={p.id}
          testID={`quiz-paket-${p.id}`}
          accessibilityRole="button"
          accessibilityLabel={paketBasligi(p.ad)}
          onPress={() => basla(p.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: bosluk.m,
            padding: bosluk.m,
            minHeight: 72,
            borderRadius: yaricap.dugme,
            borderWidth: cizgi.kalin,
            borderColor: renk.kontur,
            backgroundColor: renk.yuzey,
            boxShadow: `5px 5px 0 ${renk.golge}`,
          }}
        >
          <Yazi tur="baslik">{p.emoji}</Yazi>
          <View style={{ flex: 1, gap: 2 }}>
            <Yazi tur="dugme">{paketBasligi(p.ad)}</Yazi>
            <Yazi
              testID={`quiz-paket-notu-${p.id}`}
              tur="etiket"
              soluk
              style={{ fontSize: 11 }}
            >
              {kokenEtiketi(p.koken)} · {PAKET_NOTU}
            </Yazi>
          </View>
        </Pressable>
      ))}
      <Yazi
        testID="quiz-paket-notu"
        tur="etiket"
        soluk
        style={{ fontSize: 11 }}
      >
        {PAKET_NOTU}
      </Yazi>
    </Ekran>
  );
}
