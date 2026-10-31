// Quiz Night paket seçimi (KK-121, KK-122): kategori çipleri (paketi olanlar) ve paket kartları.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import {
  KATEGORI_CIPLERI,
  gorunenKategoriCipleri,
  kategoriEtiketi,
  kategoriSec,
  kokenMetni,
  paketBasligi,
  paketNotu,
  paketSuz,
  type Kategori,
  type KategoriCipi,
} from '../../src/games/quiz-night/arayuz';
import { oncekiSorular } from '../../src/oyun-ekranlari/quiz/onceki';
import { useDurum } from '../../src/durum';
import { BilgiDugmesi } from '../../src/tanitim-kutusu';
import { kategoriDeseni, nesneKaynagi } from '../../src/gorsel';
import { bosluk, cizgi, dokunmaAlani } from '../../src/tema';
import { Cip, Ekran, GeriCubugu, useHareketAzalt, Yazi } from '../../src/ui';
import { quizPaketleri } from '../../src/oyun-ekranlari/quiz/paketler';

const CIP_TESTID: Record<(typeof KATEGORI_CIPLERI)[number], string> = {
  tumu: 'quiz-kategori-tumu',
  'dizi-film': 'quiz-kategori-dizi-film',
  muzik: 'quiz-kategori-muzik',
  spor: 'quiz-kategori-spor',
};
const ZEMIN: Record<Kategori, 'marka' | 'marka2' | 'golge'> = {
  'dizi-film': 'marka',
  muzik: 'marka2',
  spor: 'golge',
};

type Paket = (typeof quizPaketleri)[number];

// Büyük paket kartı (Bileşen 16): kategori zemini + deseni, taşan 3D nesne, sol tarafta metin.
function PaketKarti({ p, onAc }: { p: Paket; onAc: () => void }) {
  const { renk } = useDurum();
  const hareketAzalt = useHareketAzalt();
  const desen = kategoriDeseni(p.kategori);
  const nesne = nesneKaynagi(p.gorsel);
  return (
    <Pressable
      testID={`quiz-paket-${p.id}`}
      accessibilityRole="button"
      accessibilityLabel={paketBasligi(p)}
      onPress={onAc}
      style={({ pressed }) => ({
        marginTop: 24,
        minHeight: 135,
        borderRadius: 24,
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        backgroundColor: renk[ZEMIN[p.kategori]],
        boxShadow: `6px 6px 0 ${renk.golge}`,
        opacity: pressed && hareketAzalt ? 0.7 : 1,
        transform: [{ scale: pressed && !hareketAzalt ? 0.97 : 1 }],
      })}
    >
      {desen && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <Image
            testID={`quiz-paket-desen-${p.kategori}`}
            source={desen}
            resizeMode="cover"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      )}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          gap: 4,
          minHeight: dokunmaAlani,
          paddingTop: 22,
          paddingRight: 116,
          paddingBottom: 16,
          paddingLeft: 16,
        }}
      >
        <Yazi tur="dugme" style={{ fontSize: 18, color: renk.kontur }}>
          {paketBasligi(p)}
        </Yazi>
        <Yazi
          testID={`quiz-paket-notu-${p.id}`}
          tur="etiket"
          style={{ fontSize: 12, fontWeight: '700', color: renk.kontur }}
        >
          {kokenMetni(p) ? `${kokenMetni(p)!.toLocaleUpperCase('tr')} · ` : ''}
          {paketNotu(p.kategori)}
        </Yazi>
      </View>
      {nesne && (
        <Image
          testID={`quiz-paket-gorsel-${p.id}`}
          source={nesne}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            position: 'absolute',
            right: 4,
            top: -24,
            width: 112,
            height: 112,
          }}
        />
      )}
    </Pressable>
  );
}

export default function QuizPaketSec() {
  const router = useRouter();
  const { oyunId, oyunAyari, oyunAyariniAyarla, oyunuBaslat } = useDurum();
  const cipler = gorunenKategoriCipleri(quizPaketleri);
  const [cip, setCip] = useState<KategoriCipi>('tumu');

  const basla = async (paketId: string) => {
    const onceki = await oncekiSorular(paketId); // aynı soruların tekrarını azaltır (KK-109)
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
      <Yazi tur="baslik">Neyin fanısın?</Yazi>
      {cipler.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}>
          {cipler.map((c) => (
            <Cip
              key={c}
              kategori
              testID={CIP_TESTID[c]}
              etiket={kategoriEtiketi(c)}
              secili={cip === c}
              onPress={() => setCip(kategoriSec(cip, c))}
            />
          ))}
        </View>
      )}
      {paketSuz(quizPaketleri, cip).map((p) => (
        <PaketKarti key={p.id} p={p} onAc={() => basla(p.id)} />
      ))}
    </Ekran>
  );
}
