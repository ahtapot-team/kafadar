// 10/10 ama ekranlarının ortak yardımcıları: puan rengi, Türkçe ondalık, ödül alt satırları (saf).
import type { Durum } from '../../games/on-on-ama/onon';

type Renkler = { nok: string; marka: string; ok: string };

// Puan rengi anlama göre (tasarım #107): 0–3 sert, 4–6 kararsız, 7–10 cömert; her zaman sayıyla birlikte.
export const puanRengi = (puan: number, renk: Renkler) =>
  puan <= 3 ? renk.nok : puan <= 6 ? renk.marka : renk.ok;

// 5.8 → "5,8"
export const ondalik = (n: number) => n.toFixed(1).replace('.', ',');

export const ort = (liste: number[]) =>
  liste.length ? liste.reduce((a, b) => a + b, 0) / liste.length : 0;

// Oyuncunun açıklanmış kartlarda verdiği puanların ortalaması.
export const verilenOrtalama = (gecmis: Durum['gecmis'], ad: string) =>
  ort(gecmis.map((g) => g.puanlar[ad]).filter((p) => p !== undefined));

// İki oyuncunun ortak kartlarda puan farkının ortalaması.
export const ikizFarki = (gecmis: Durum['gecmis'], a: string, b: string) =>
  ort(
    gecmis
      .filter((g) => g.puanlar[a] !== undefined && g.puanlar[b] !== undefined)
      .map((g) => Math.abs(g.puanlar[a] - g.puanlar[b])),
  );
