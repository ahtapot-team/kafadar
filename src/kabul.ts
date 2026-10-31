// Bekleyen (henüz yazılmamış işe ait) kabul testleri için bayraklar (yalnızca açık işler).
// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/MIMARI.md).
// Quiz Night Faz 1 (#221–#226): her bayrağı ilgili işi bitiren PR siler.
// Quiz Night Faz 2 (#252): #253 (oda kuralları, protokol, sunucu, smoke) `quizOda`yı, #254 (oda ekranları) `quizOdaEkran`ı siler.
export const BEKLEYEN: Record<string, boolean> = {
  quizOda: true,
  quizOdaEkran: true,
};
