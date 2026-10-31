// Quiz Night oyun ekranı (#224): soru → (grupta işaretleme) → sonuç. Kayıt/devam ortak oturum hook'unda (KK-14).
// Tur biterken soru id'leri saklanır, yeni turda turSec'e verilir (KK-109).
import { useRouter } from 'expo-router';
import { depo } from '../../depo';
import { useDurum } from '../../durum';
import type { OyunEkraniProps } from '../../games/oyun';
import { oncekiKaydet, oncekiOku } from '../../games/quiz-night/onceki';
import {
  type Durum,
  cevapla,
  durumGecerliMi,
  ilerle,
  turSec,
} from '../../games/quiz-night/quiz';
import { Ekran } from '../../ui';
import { useOyunOturumu } from '../ortak/useOyunOturumu';
import { quizPaketi } from './paketler';
import { QuizSonuc } from './sonuc';
import { QuizSoru } from './soru';

export type Olay =
  | { tip: 'cevap'; oyuncu: number; sik: number }
  | { tip: 'ilerle' }
  // Grup: telefonu tutan, doğru bilenleri işaretler; bilmeyenler yanlış sayılır.
  | { tip: 'grup'; bilenler: number[] };

export function isle(d: Durum, o: Olay): Durum {
  if (o.tip === 'cevap') return cevapla(d, o.oyuncu, o.sik);
  if (o.tip === 'ilerle') return ilerle(d);
  const dogru = d.sorular[d.soru].dogru;
  const hepsi = d.oyuncular.reduce(
    (x, _, i) =>
      cevapla(x, i, o.bilenler.includes(i) ? dogru : (dogru + 1) % 4),
    d,
  );
  return ilerle(hepsi);
}

export function yeniTur(
  paketId: string,
  oyuncular: string[],
  onceki: string[],
): Durum {
  const paket = quizPaketi(paketId);
  const sorular = turSec(paket.sorular, Date.now(), onceki);
  return {
    paket: paket.id,
    sorular,
    oyuncular,
    soru: 0,
    cevaplar: oyuncular.map(() => sorular.map(() => null)),
    asama: 'soru',
  };
}

export default function QuizEkrani({ onCik, onAnaMenu }: OyunEkraniProps) {
  const router = useRouter();
  const { oyuncular, oyunAyari, oyunuBitir } = useDurum();
  const liste = oyuncular.length ? oyuncular : ['Sen'];
  const { durum, gonder, baslat } = useOyunOturumu<Durum, Olay>({
    isle,
    gecerliMi: durumGecerliMi,
    baslangic: () =>
      yeniTur(
        String(oyunAyari.paket ?? ''),
        liste,
        (oyunAyari.onceki as string[] | undefined) ?? [],
      ),
    onOlay: (eski, yeni) => {
      if (eski.asama === 'soru' && yeni.asama === 'sonuc')
        oncekiKaydet(depo, yeni.paket, yeni.sorular).catch(() => {});
    },
  });
  if (!durum) return <Ekran>{null}</Ekran>;

  if (durum.asama === 'sonuc')
    return (
      <QuizSonuc
        durum={durum}
        onCik={onCik}
        onTekrar={async () =>
          baslat(
            yeniTur(
              durum.paket,
              durum.oyuncular,
              await oncekiOku(depo, durum.paket),
            ),
          )
        }
        onBaskaPaket={() => {
          oyunuBitir();
          router.push('/quiz/paket');
        }}
        onAnaMenu={onAnaMenu}
      />
    );
  return <QuizSoru durum={durum} gonder={gonder} onCik={onCik} />;
}
