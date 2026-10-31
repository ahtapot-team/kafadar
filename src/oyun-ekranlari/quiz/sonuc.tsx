// Quiz Night sonuç ekranı (KK-111, KK-112, KK-114): birinci 🏆 ve unvanıyla en üstte; sıra #244 saf fonksiyonundan.
import { Text, View } from 'react-native';
import { useDurum } from '../../durum';
import {
  paylasimKarti,
  sonucMetni,
  sonucSatirlari,
} from '../../games/quiz-night/arayuz';
import { turSonucu, type Durum } from '../../games/quiz-night/quiz';
import { useBilgiYuvasi } from '../../tanitim-kutusu';
import { bosluk, cizgi, font, renkler, yaricap } from '../../tema';
import { Dugme, Ekran, Yazi } from '../../ui';
import { IkonDugme } from '../ortak/ortak';
import { GizliPaylasim, PaylasDugmesi, usePaylas } from '../ortak/paylasim';
import { paketBasligi } from '../../games/quiz-night/arayuz';
import { quizPaketi } from './paketler';

const r = renkler.koyu;
const kt = (fontSize: number) => ({
  fontFamily: font.kalin,
  fontSize,
  color: r.kontur,
});

// Paylaşım kartı (9:16, koyu tema): paket, birinci(ler) ya da oyuncunun kendisi, puan, unvan. Soru/cevap yok.
function Kart({
  k,
  baslik,
}: {
  k: ReturnType<typeof paylasimKarti>;
  baslik: string;
}) {
  return (
    <View
      testID="quiz-kart"
      style={{
        marginTop: 90,
        backgroundColor: r.marka,
        borderWidth: 3,
        borderColor: r.kontur,
        borderRadius: 22,
        padding: 18,
        gap: 6,
        transform: [{ rotate: '-3deg' }],
        boxShadow: `5px 5px 0 ${r.golge}`,
      }}
    >
      <Text style={kt(11)}>
        {k.kupa ? '🏆 ' : ''}
        {baslik.toLocaleUpperCase('tr')}
      </Text>
      {k.kupa && <Text style={kt(28)}>{k.adlar.join(' & ')}</Text>}
      <Text style={kt(72)}>{k.puan}</Text>
      <Text style={kt(18)}>{k.unvan}</Text>
    </View>
  );
}

type Sonuc = ReturnType<typeof turSonucu>;
type Veri = {
  ad: string;
  baslik: string;
  unvanlar: string[];
  sonuc: Sonuc;
  kisi: number; // 1 = tek başına
  dogruMu?: boolean[]; // yalnız tek başına
  ust?: string; // oda: üst satırın başındaki oda kodu
};
type Props = { durum: Durum } & Record<
  'onCik' | 'onTekrar' | 'onBaskaPaket' | 'onAnaMenu',
  () => void
>;

export function QuizSonuc({ durum, onBaskaPaket, ...o }: Props) {
  const paket = quizPaketi(durum.paket);
  const v: Veri = {
    ad: paket.ad,
    baslik: paketBasligi(paket),
    unvanlar: paket.unvanlar,
    sonuc: turSonucu(durum),
    kisi: durum.oyuncular.length,
    dogruMu: durum.cevaplar[0].map((sik, k) => sik === durum.sorular[k].dogru),
  };
  return <QuizSonucGorunum v={v} onBaskaPaket={onBaskaPaket} {...o} />;
}

// Tek telefon (grup / tek) ve oda sonucu aynı görünümü paylaşır (KK-111, KK-113).
export function QuizSonucGorunum({
  v,
  onCik,
  onTekrar,
  onBaskaPaket,
  onAnaMenu,
}: Omit<Props, 'durum' | 'onBaskaPaket'> & {
  v: Veri;
  onBaskaPaket?: () => void;
}) {
  const { renk } = useDurum();
  const bilgi = useBilgiYuvasi();
  const paylas = usePaylas();
  const paket = { ad: v.ad, unvanlar: v.unvanlar };
  const grup = v.kisi > 1;
  const sonuc = v.sonuc;
  const satirlar = sonucSatirlari(sonuc, paket.unvanlar);
  const birinciler = satirlar.filter((s) => s.birinci);
  const kart = paylasimKarti({
    mod: grup ? 'grup' : 'tek',
    paket: paket.ad,
    sonuc,
    unvanlar: paket.unvanlar,
  });
  const dogruMu = v.dogruMu ?? [];
  return (
    <Ekran>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.m }}
      >
        <IkonDugme
          testID="cik"
          simge="✕"
          etiket="Oyundan çık"
          onPress={onCik}
        />
        <Yazi tur="etiket" soluk style={{ flex: 1, textAlign: 'center' }}>
          {paket.ad} ·{' '}
          {grup ? `${v.ust ?? 'Grup'} · ${v.kisi} kişi` : 'Tek başına'}
        </Yazi>
        {bilgi}
      </View>
      <View testID="quiz-sonuc" style={{ gap: bosluk.m }}>
        <View
          testID="quiz-birinci"
          style={{
            backgroundColor: renk.marka,
            borderWidth: cizgi.kalin,
            borderColor: renk.kontur,
            borderRadius: yaricap.dugme,
            padding: bosluk.l,
            gap: bosluk.xs,
            boxShadow: `5px 5px 0 ${renk.golge}`,
          }}
        >
          <Yazi tur="etiket" style={{ color: renk.kontur }}>
            {grup
              ? `🏆 ${birinciler.length > 1 ? 'Ortak birinci' : 'Birinci'}`
              : v.baslik}
          </Yazi>
          {grup && (
            <Yazi tur="baslik" style={{ color: renk.kontur }}>
              {birinciler.map((b) => b.ad).join(' & ')}
            </Yazi>
          )}
          <Yazi tur="baslikXl" style={{ color: renk.kontur }}>
            {sonucMetni(sonuc[0].dogru)}
          </Yazi>
          <Yazi tur="dugme" style={{ color: renk.kontur, fontSize: 19 }}>
            {birinciler[0].unvan}
          </Yazi>
        </View>
        {!grup && (
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.xs }}
          >
            {dogruMu.map((d, i) => (
              <Yazi
                key={i}
                tur="etiket"
                accessibilityLabel={`${i + 1}. soru ${d ? 'doğru' : 'yanlış'}`}
                style={{ color: d ? renk.okMetin : renk.nokMetin }}
              >
                {d ? '✓' : '✕'}
              </Yazi>
            ))}
          </View>
        )}
        {grup &&
          satirlar
            .filter((s) => !s.birinci)
            .map((s, i) => (
              <View
                key={s.ad}
                testID={`quiz-sira-${i}`}
                style={{
                  gap: 2,
                  padding: bosluk.m,
                  borderRadius: yaricap.dugme,
                  backgroundColor: renk.yuzey,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  {[`${s.sira}. ${s.ad}`, s.puan].map((m, k) => (
                    <Yazi key={k} tur="dugme" style={{ fontSize: 18 }}>
                      {m}
                    </Yazi>
                  ))}
                </View>
                <Yazi soluk>{s.unvan}</Yazi>
              </View>
            ))}
      </View>
      <PaylasDugmesi
        testID="quiz-paylas"
        bicim="birincil"
        onPress={paylas.paylas}
      />
      <View style={{ flexDirection: 'row', gap: bosluk.m }}>
        {(
          [
            ['quiz-tekrar', 'Tekrar', onTekrar],
            ['quiz-baska-paket', 'Başka paket', onBaskaPaket],
          ] as const
        )
          .filter(([, , f]) => f)
          .map(([id, etiket, onPress]) => (
            <View key={id} style={{ flex: 1 }}>
              <Dugme
                testID={id}
                tur="ikincil"
                etiket={etiket}
                onPress={onPress!}
              />
            </View>
          ))}
      </View>
      <Dugme tur="ikincil" etiket="Ana ekran" onPress={onAnaMenu} />
      <GizliPaylasim gorunum={paylas.ref} baslik="Quiz Night">
        <Kart k={kart} baslik={v.baslik} />
      </GizliPaylasim>
    </Ekran>
  );
}
