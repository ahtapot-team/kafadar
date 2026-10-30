import { it } from 'vitest';

// Bekleyen (henüz yazılmamış işe ait) kabul testleri için bayraklar (yalnızca açık işler).
// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// İlgili iş bitince geliştirici false yapar; bayrak açıkken "geçen" test CI'ı kırar.
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/MIMARI.md).
// acilisV8 = v8 açılış ekranı ve sözler (KK-94…KK-100, #191 testleri, #192 uygulama).
export const BEKLEYEN = { acilisV8: true };
export const kabulAcilis = BEKLEYEN.acilisV8 ? it.fails : it;
