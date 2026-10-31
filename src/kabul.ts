// Bekleyen (henüz yazılmamış işe ait) kabul testleri için bayraklar (yalnızca açık işler).
// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/MIMARI.md).
// Görsel yenileme (#290, PRD v11, KK-127…136; testler #293):
//   anaEkranV11   → frontend #295: ikon ızgarası, dock, üst kart, uzun basma, emoji yok, erişilebilirlik
//   paketEkranV11 → frontend #296: büyük paket kartları (app/quiz/paket.tsx)
export const BEKLEYEN: Record<string, boolean> = {
  anaEkranV11: true,
  paketEkranV11: true,
};
