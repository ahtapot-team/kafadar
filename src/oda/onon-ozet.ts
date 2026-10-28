// 10/10 ama oda modu istemci türetmeleri (saf, React'sız). Saf, React'sız.
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

const bir = (n: number) => Math.round(n * 10) / 10;
const sayilar = (l: (number | null)[]) =>
  l.filter((x): x is number => x !== null);
const ort = (l: number[]) => l.reduce((a, b) => a + b, 0) / l.length;

export function onOnKisisel(f: OnOnFinal, ad: string): OnOnKisisel {
  const verilen = f.kisisel[ad]?.verilen ?? [];
  const benim = sayilar(verilen);
  const oda = sayilar(Object.values(f.kisisel).flatMap((k) => k.verilen));
  const ortalama = benim.length ? ort(benim) : null;
  const ikiz = f.oduller.ruhIkizleri.find((c) => c.includes(ad));
  return {
    ortalama: ortalama === null ? null : bir(ortalama),
    odaFarki:
      ortalama === null || !oda.length ? null : bir(ortalama - ort(oda)),
    ikiz: ikiz ? (ikiz[0] === ad ? ikiz[1] : ikiz[0]) : null,
    enYuksek: benim.length ? Math.max(...benim) : null,
    enDusuk: benim.length ? Math.min(...benim) : null,
    bos: verilen.length - benim.length,
  };
}

// Açıklamada çubuk sırası: puan azalan; eşitlikte `puanlar` kayıt (oyuncu) sırası; boş (null) en sonda.
export function puanSirasi(a: Aciklama): { ad: string; puan: number | null }[] {
  return Object.entries(a.puanlar)
    .map(([ad, puan], i) => ({ ad, puan, i }))
    .sort((x, y) =>
      x.puan === y.puan
        ? x.i - y.i
        : x.puan === null
          ? 1
          : y.puan === null
            ? -1
            : y.puan - x.puan,
    )
    .map(({ ad, puan }) => ({ ad, puan }));
}
