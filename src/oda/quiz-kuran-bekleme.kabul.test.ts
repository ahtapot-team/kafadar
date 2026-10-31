// #260: Quiz Night odasında "Kuran kişi bekleniyor…" yazısı yetki devrinden sonra YENİ yetkiliyi göstermeli (KK-68 yetki kuralı).
// SÖZLEŞME (frontend #260): QuizGorunum.yetkiliAd: string — şu anki yetkilinin (kuran bağlıysa kuran, değilse sırayla ilk bağlı) adı;
// src/oda-ui/quiz-soru.tsx bekleme yazısında `g.yetkiliAd` kullanır, `oyuncular[0]` KULLANMAZ.
import { describe, expect, it } from 'vitest';
import { dosyaIcerik } from '../test/yardimci';
import * as odaModulu from './oda';

type Durum = { tur: string };
type Soru = {
  id: string;
  metin: string;
  secenekler: string[];
  dogru: number;
  zorluk: 'kolay' | 'orta' | 'zor';
  tur: 'olay' | 'dunya';
};
type Api = {
  odaKur(s: {
    kod: string;
    kurucuAd: string;
    tohum: number;
    simdi: number;
    tur: 'quiz-night';
    quiz: { id: string; ad: string; unvanlar: string[]; sorular: Soru[] };
  }): { durum: Durum; kimlik: string };
  isle(
    d: Durum,
    o: Record<string, unknown>,
    t: number,
  ): { durum: Durum; kimlik?: string; hata?: { kod: string } };
  gorunum(
    d: Durum,
    k: string,
    t: number,
  ): { aciklama?: unknown; yetkiliAd?: string };
  QUIZ_SORU_MS: number;
};
const O = odaModulu as unknown as Api;
const T0 = 1_000_000;
const sorular: Soru[] = (['kolay', 'orta', 'zor'] as const).flatMap((z) =>
  Array.from({ length: 8 }, (_, i) => ({
    id: `${z}-${i}`,
    metin: `${z} ${i}?`,
    secenekler: ['a', 'b', 'c', 'd'],
    dogru: i % 4,
    zorluk: z,
    tur: 'dunya' as const,
  })),
);

function aciklamadaOda() {
  const k = O.odaKur({
    kod: '123456',
    kurucuAd: 'Ali',
    tohum: 3,
    simdi: T0,
    tur: 'quiz-night',
    quiz: { id: 'x', ad: 'X', unvanlar: ['a', 'b', 'c', 'd'], sorular },
  });
  const ayse = O.isle(k.durum, { tip: 'katil', ad: 'Ayşe' }, T0);
  const can = O.isle(ayse.durum, { tip: 'katil', ad: 'Can' }, T0);
  const id = [k.kimlik, ayse.kimlik!, can.kimlik!];
  let d = O.isle(can.durum, { tip: 'baslat', kimlik: id[0] }, T0).durum;
  const t = T0 + O.QUIZ_SORU_MS + 5;
  d = O.isle(d, { tip: 'zaman' }, t).durum; // süre doldu → açıklama
  return { d, id, t };
}

describe('#260: kuran bekleme yazısı yetkiliyi göstermeli', () => {
  it('yetkiliAd: kuran bağlıyken kuranın adı, herkesin görünümünde', () => {
    const { d, id, t } = aciklamadaOda();
    for (const i of [0, 1, 2])
      expect(O.gorunum(d, id[i], t).yetkiliAd, `görünüm ${i}`).toBe('Ali');
  });

  it('yetkiliAd: kuran kopunca yeni yetkili (ilk bağlı oyuncu) görünür; dönünce kuran geri gelir', () => {
    const { d, id, t } = aciklamadaOda();
    const kopuk = O.isle(d, { tip: 'kop', kimlik: id[0] }, t + 1).durum;
    expect(O.gorunum(kopuk, id[2], t + 1).yetkiliAd).toBe('Ayşe');
    const geri = O.isle(kopuk, { tip: 'don', kimlik: id[0] }, t + 2).durum;
    expect(O.gorunum(geri, id[2], t + 2).yetkiliAd).toBe('Ali');
  });

  it('yetkiliAd: kuran ayrılırsa yeni yetkili görünür', () => {
    const { d, id, t } = aciklamadaOda();
    const ayrildi = O.isle(d, { tip: 'ayril', kimlik: id[0] }, t + 1).durum;
    expect(O.gorunum(ayrildi, id[2], t + 1).yetkiliAd).toBe('Ayşe');
  });

  it('ekran: bekleme yazısı yetkiliAd kullanır, oyuncular[0] değil', () => {
    const kaynak = dosyaIcerik('src/oda-ui/quiz-soru.tsx');
    expect(kaynak).toMatch(/Kuran kişi bekleniyor[^]*?yetkiliAd/);
    expect(kaynak).not.toMatch(/oyuncular\[0\]/);
  });
});
