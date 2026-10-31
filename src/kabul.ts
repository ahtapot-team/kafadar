// Bekleyen (henüz yazılmamış işe ait) kabul testleri için bayraklar (yalnızca açık işler).
// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/MIMARI.md).
// quiz: Quiz Night Faz 1 (#221–#226). Backend (#223) saf modülleri + içerik şemasını, frontend (#224) kayıt/ekran/belgeleri bitirince silinir.
export const BEKLEYEN = { quiz: true };
