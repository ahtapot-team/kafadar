// Quiz Night paketleri (content/quiz): yalnızca sunucuda yüklenir. Uygulama paketine girmez; `kaynaklar` ve `uyum` burada atılır (KK-113).
import { uygulamaPaketi } from '../../src/icerik/quiz.ts';
import type { QuizPaketi } from '../../src/oda/oda';
import askIMemnu from '../../content/quiz/ask-i-memnu.json';
import hababamSinifi from '../../content/quiz/hababam-sinifi.json';
import prisonBreak from '../../content/quiz/prison-break.json';
import galatasaray from '../../content/quiz/galatasaray.json';
import fenerbahce from '../../content/quiz/fenerbahce.json';
import besiktas from '../../content/quiz/besiktas.json';
import manifest from '../../content/quiz/manifest.json';
import emirCanIgrek from '../../content/quiz/emir-can-igrek.json';
import blok3 from '../../content/quiz/blok3.json';
import mabelMatiz from '../../content/quiz/mabel-matiz.json';

const PAKETLER = [
  askIMemnu,
  hababamSinifi,
  prisonBreak,
  galatasaray,
  fenerbahce,
  besiktas,
  manifest,
  emirCanIgrek,
  blok3,
  mabelMatiz,
].map((j) => uygulamaPaketi(j));

export function quizPaketiBul(id: string): QuizPaketi | undefined {
  const p = PAKETLER.find((x) => x.id === id);
  return p && ({ ...p } as unknown as QuizPaketi);
}
