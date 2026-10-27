// Final verisinden ekranlar için türetmeler (saf). Final: oda.ts `final()` çıktısı.
import type { Final } from './oda';

// Tüm sorularda cevap verenler içinde OK payı (%); boşlar dışarıda (KK-36).
export function okYuzde(f: Final): number {
  const ok = f.yuzdeler.reduce((t, y) => t + y.ok, 0);
  const nok = f.yuzdeler.reduce((t, y) => t + y.nok, 0);
  return ok + nok === 0 ? 0 : Math.round((100 * ok) / (ok + nok));
}

// En tartışmalı soru(lar): kim hangi yanda (kimNeDedi soru sırasına göre indekslenir).
export function tartismali(f: Final) {
  return f.enTartismali.flatMap((kartId) => {
    const i = f.yuzdeler.findIndex((y) => y.kartId === kartId);
    if (i < 0) return [];
    const taraf = (oy: 'OK' | 'NOK') =>
      Object.keys(f.kimNeDedi).filter((ad) => f.kimNeDedi[ad][i] === oy);
    return [{ no: i + 1, kartId, ok: taraf('OK'), nok: taraf('NOK') }];
  });
}

// Kişisel kart: "7/10 çoğunlukla aynıydın", kendi OK/NOK/boş sayıları, ruh ikizi (varsa).
export function kisisel(f: Final, ad: string) {
  const cevaplar = f.kimNeDedi[ad] ?? [];
  const say = (oy: 'OK' | 'NOK' | null) =>
    cevaplar.filter((c) => c === oy).length;
  const cift = f.oduller.ruhIkizleri.find((p) => p.includes(ad));
  return {
    ayni: f.ayniOlan[ad] ?? 0,
    toplam: f.yuzdeler.length,
    ok: say('OK'),
    nok: say('NOK'),
    bos: say(null),
    ikiz: cift ? (cift[0] === ad ? cift[1] : cift[0]) : null,
  };
}

// Erken biten oyun (kuran çıktı / tek oyuncu kaldı, KK-38): tamamlanan soru sayısı SORU_SAYISI'ndan azdır.
export const erkenBitti = (f: Final, soruSayisi: number) =>
  f.yuzdeler.length < soruSayisi;
