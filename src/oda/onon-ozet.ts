/* eslint-disable @typescript-eslint/no-unused-vars -- iskelet: gövdeler #121'de yazılır */
// 10/10 ama oda modu istemci türetmeleri (saf, React'sız). İSKELET (#125 → frontend #121): gövdeler henüz yok.
import type { Aciklama, OnOnFinal } from './oda';

// Final kişisel kartı (KK-69): "Deniz, bu odada ortalaman 7,4 · odanın ortalamasından 1,8 cömert · Ruh ikizin: Mert ·
// En yüksek 10 · En düşük 3 · 1 boş". Ortalamalar `verilen` ham puanlarından hesaplanır (yuvarlanmış alanlardan değil).
export type OnOnKisisel = {
  ortalama: number | null; // bu oyuncunun verdiği puanların ortalaması, bir ondalık; hiç puanı yoksa null
  odaFarki: number | null; // ortalama − odanın ortalaması (odadaki herkesin tüm verilen puanlarının ortalaması), bir ondalık; işaretli (+ cömert, − acımasız)
  ikiz: string | null; // ruh ikizlerinden biri (ilk ikiz); yoksa null
  enYuksek: number | null;
  enDusuk: number | null;
  bos: number; // puan vermediği kart sayısı
};

export function onOnKisisel(_f: OnOnFinal, _ad: string): OnOnKisisel {
  throw new Error('10/10 ama istemci türetmeleri henüz yazılmadı (#121)');
}

// Açıklamada çubuk sırası: puan azalan; eşitlikte `puanlar` kayıt (oyuncu) sırası; boş (null) en sonda.
export function puanSirasi(
  _a: Aciklama,
): { ad: string; puan: number | null }[] {
  throw new Error('10/10 ama istemci türetmeleri henüz yazılmadı (#121)');
}
