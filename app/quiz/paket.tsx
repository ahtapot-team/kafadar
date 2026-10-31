// Quiz Night paket seçimi (KK-121, KK-122): kategori çipleri (paketi olanlar) ve paket kartları.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
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
import { bosluk, cizgi, yaricap } from '../../src/tema';
import { Cip, Ekran, GeriCubugu, Yazi } from '../../src/ui';
import { quizPaketleri } from '../../src/oyun-ekranlari/quiz/paketler';

const CIP_TESTID: Record<(typeof KATEGORI_CIPLERI)[number], string> = {
  tumu: 'quiz-kategori-tumu',
  'dizi-film': 'quiz-kategori-dizi-film',
  muzik: 'quiz-kategori-muzik',
  spor: 'quiz-kategori-spor',
};
const DAIRE: Record<Kategori, 'marka' | 'marka2' | 'golge'> = {
  'dizi-film': 'marka',
  muzik: 'marka2',
  spor: 'golge',
};

export default function QuizPaketSec() {
  const router = useRouter();
  const { renk, oyunId, oyunAyari, oyunAyariniAyarla, oyunuBaslat } =
    useDurum();
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
      <Yazi tur="baslik">Hangi dizi?</Yazi>
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
        <Pressable
          key={p.id}
          testID={`quiz-paket-${p.id}`}
          accessibilityRole="button"
          accessibilityLabel={paketBasligi(p)}
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
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: cizgi.ince,
              borderColor: renk.kontur,
              backgroundColor: renk[DAIRE[p.kategori]],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Yazi tur="baslik">{p.emoji}</Yazi>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Yazi tur="dugme">{paketBasligi(p)}</Yazi>
            <Yazi
              testID={`quiz-paket-notu-${p.id}`}
              tur="etiket"
              soluk
              style={{ fontSize: 11 }}
            >
              {kokenMetni(p)
                ? `${kokenMetni(p)!.toLocaleUpperCase('tr')} · `
                : ''}
              {paketNotu(p.kategori)}
            </Yazi>
          </View>
        </Pressable>
      ))}
    </Ekran>
  );
}
