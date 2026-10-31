// Quiz Night paketleri: içerik JSON'ları burada uygulama biçimine çevrilir (kaynaklar/uyum girmez).
import ask from '../../../content/quiz/ask-i-memnu.json';
import hababam from '../../../content/quiz/hababam-sinifi.json';
import prison from '../../../content/quiz/prison-break.json';
import galatasaray from '../../../content/quiz/galatasaray.json';
import fenerbahce from '../../../content/quiz/fenerbahce.json';
import type { Kategori, Koken } from '../../games/quiz-night/arayuz';
import type { Soru } from '../../games/quiz-night/quiz';
import { uygulamaPaketi } from '../../icerik/quiz';

export type QuizPaket = {
  id: string;
  ad: string;
  emoji: string;
  kategori: Kategori;
  koken?: Koken;
  baslik?: string;
  unvanlar: string[];
  sorular: Soru[];
};

export const quizPaketleri = [
  ask,
  hababam,
  prison,
  galatasaray,
  fenerbahce,
].map((d) => uygulamaPaketi(d) as unknown as QuizPaket);

export const quizPaketi = (id: string) =>
  quizPaketleri.find((p) => p.id === id) ?? quizPaketleri[0];
