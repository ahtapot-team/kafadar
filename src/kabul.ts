// Bekleyen (henüz yazılmamış işe ait) kabul testleri için bayraklar (yalnızca açık işler).
// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/MIMARI.md).
// Quiz Night Faz 1 (#221–#226): her bayrağı ilgili işi bitiren PR siler.
// Quiz Night kategorileri (#261–#264, PRD v10): içerik/şema #263 (backend), ekran ve saf kurallar #264 (frontend).
export const BEKLEYEN: Record<string, boolean> = {
  quizBaslikNeyin: true, // #275 siler: src/games/quiz-night/paket-baslik.kabul.test.ts
  quizKategoriIcerik: true, // #263 siler: KK-120, KK-125 (src/icerik/quiz-kategori.kabul.test.ts)
};
