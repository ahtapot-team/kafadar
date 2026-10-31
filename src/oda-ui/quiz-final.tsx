// Quiz Night oda sonucu (KK-113, KK-111, KK-114): grup sonucuyla aynı görünüm; birinci 🏆 ve unvanıyla en üstte.
import type { IstemciDurumu } from '../oda/istemci';
import { quizPaketleri } from '../oyun-ekranlari/quiz/paketler';
import { QuizSonucGorunum } from '../oyun-ekranlari/quiz/sonuc';
import { Ekran, Yazi } from '../ui';

export function QuizOdaFinal({
  durum,
  onTekrar,
  onAnaMenu,
}: {
  durum: IstemciDurumu;
  onTekrar: () => void;
  onAnaMenu: () => void;
}) {
  const f = durum.quizFinal;
  if (!f)
    return (
      <Ekran>
        <Yazi tur="baslik">Sonuçlar hazırlanıyor…</Yazi>
      </Ekran>
    );
  const paket = quizPaketleri.find((p) => p.ad === f.paket) ?? quizPaketleri[0];
  return (
    <QuizSonucGorunum
      v={{
        ad: f.paket,
        unvanlar: paket.unvanlar,
        sonuc: f.siralama,
        kisi: f.siralama.length,
        ust: 'Oda',
      }}
      onCik={onAnaMenu}
      onTekrar={onTekrar}
      onAnaMenu={onAnaMenu}
    />
  );
}
