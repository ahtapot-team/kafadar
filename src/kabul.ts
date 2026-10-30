// Bekleyen (henüz yazılmamış işe ait) kabul testleri için bayraklar (yalnızca açık işler).
// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// İlgili iş bitince geliştirici false yapar; bayrak açıkken "geçen" test CI'ı kırar.
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/MIMARI.md).
// Yeni özellikte QA şöyle ekler:
//   import { it } from 'vitest';  BEKLEYEN = { ozellik: true };  export const kabulOzellik = BEKLEYEN.ozellik ? it.fails : it;
export const BEKLEYEN = { belge: true };
