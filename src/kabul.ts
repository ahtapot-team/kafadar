// Bekleyen (henüz yazılmamış işe ait) kabul testleri için bayraklar (yalnızca açık işler).
// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/MIMARI.md).
// Quiz Night Faz 1 (#221–#226): her bayrağı ilgili işi bitiren PR siler.
export const BEKLEYEN = {
  quizKayit: true, // #224: registry kaydı + belgeler (KK-106/119)
};
