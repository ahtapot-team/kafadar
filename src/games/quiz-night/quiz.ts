// Quiz Night saf kuralları (KK-109, KK-111, KK-112, KK-114). React yok; Node doğrudan çalıştırır.
import { karistir, rngOlustur } from '../../core/rng.ts';

export type Zorluk = 'kolay' | 'orta' | 'zor';
export type Soru = {
  id: string;
  metin: string;
  secenekler: string[];
  dogru: number;
  zorluk: Zorluk;
  tur: 'olay' | 'dunya';
};

// Tur dizilimi: 3 kolay, 4 orta, 3 zor — kolaydan zora (KK-109).
export const TUR_DIZILIMI: readonly [Zorluk, number][] = [
  ['kolay', 3],
  ['orta', 4],
  ['zor', 3],
];
export const TUR_SORU_SAYISI = 10;

function sikKaristir(s: Soru, rng: () => number): Soru {
  const dogruMetin = s.secenekler[s.dogru];
  const secenekler = karistir(s.secenekler, rng);
  return { ...s, secenekler, dogru: secenekler.indexOf(dogruMetin) };
}

// Havuzdan tohumlu tur seçer. `onceki`: bir önceki turun soru id'leri; mümkün olduğunca dışlanır,
// havuz yetmezse eksik kadarı önceki turdan tamamlanır. Havuzu değiştirmez.
export function turSec(
  havuz: readonly Soru[],
  tohum: number,
  onceki: readonly string[] = [],
): Soru[] {
  const rng = rngOlustur(tohum);
  const dislanan = new Set(onceki);
  const tur: Soru[] = [];
  for (const [zorluk, n] of TUR_DIZILIMI) {
    const adaylar = havuz.filter((s) => s.zorluk === zorluk);
    const yeni = karistir(
      adaylar.filter((s) => !dislanan.has(s.id)),
      rng,
    );
    const eski = karistir(
      adaylar.filter((s) => dislanan.has(s.id)),
      rng,
    );
    for (const s of [...yeni, ...eski].slice(0, n))
      tur.push(sikKaristir(s, rng));
  }
  return tur;
}

// Puan = doğru sayısı; yanlış puan düşürmez, hız bonusu yok (KK-114).
export const puan = (dogruMu: readonly boolean[]): number =>
  dogruMu.filter(Boolean).length;

// 0–3 → [0], 4–6 → [1], 7–9 → [2], 10 → [3] (KK-111).
export function unvanSec(unvanlar: readonly string[], p: number): string {
  const basamak = p >= 10 ? 3 : p >= 7 ? 2 : p >= 4 ? 1 : 0;
  return unvanlar[basamak];
}

// Doğru sayısına göre azalan; eşit doğru aynı sıra, eşitlerde girdi sırası korunur (KK-112).
export function siralama(
  oyuncular: readonly { ad: string; dogru: number }[],
): { ad: string; dogru: number; sira: number }[] {
  const sirali = oyuncular
    .map((o, i) => ({ ...o, i }))
    .sort((a, b) => b.dogru - a.dogru || a.i - b.i);
  let sira = 0;
  return sirali.map(({ ad, dogru }, k) => {
    if (k === 0 || sirali[k - 1].dogru !== dogru) sira = k + 1;
    return { ad, dogru, sira };
  });
}

// --- Tek başına ve tek telefonda grup durum makinesi ---
export type Durum = {
  paket: string;
  sorular: Soru[];
  oyuncular: string[]; // 1 kişi = tek başına
  soru: number; // şu anki soru sırası
  cevaplar: (number | null)[][]; // [oyuncu][soru] = seçilen şık
  asama: 'soru' | 'sonuc';
};

export function baslat(
  paket: string,
  havuz: readonly Soru[],
  tohum: number,
  oyuncular: readonly string[],
  onceki: readonly string[] = [],
): Durum {
  const sorular = turSec(havuz, tohum, onceki);
  return {
    paket,
    sorular,
    oyuncular: [...oyuncular],
    soru: 0,
    cevaplar: oyuncular.map(() => sorular.map(() => null)),
    asama: 'soru',
  };
}

// Cevap kilitlidir: aynı oyuncu aynı soruyu bir kez cevaplar.
export function cevapla(d: Durum, oyuncu: number, sik: number): Durum {
  if (d.asama !== 'soru' || sik < 0 || sik > 3) return d;
  if (d.cevaplar[oyuncu]?.[d.soru] !== null) return d;
  const cevaplar = d.cevaplar.map((c, i) =>
    i === oyuncu ? c.map((x, k) => (k === d.soru ? sik : x)) : c,
  );
  return { ...d, cevaplar };
}

export const herkesCevapladi = (d: Durum): boolean =>
  d.cevaplar.every((c) => c[d.soru] !== null);

// Herkes cevapladıysa sonraki soruya (ya da sonuca) geçer.
export function ilerle(d: Durum): Durum {
  if (d.asama !== 'soru' || !herkesCevapladi(d)) return d;
  return d.soru + 1 >= d.sorular.length
    ? { ...d, asama: 'sonuc' }
    : { ...d, soru: d.soru + 1 };
}

export const dogruSayilari = (d: Durum): number[] =>
  d.cevaplar.map((c) =>
    puan(c.map((sik, k) => sik !== null && sik === d.sorular[k]?.dogru)),
  );

export const turSonucu = (d: Durum) =>
  siralama(d.oyuncular.map((ad, i) => ({ ad, dogru: dogruSayilari(d)[i] })));

export function durumGecerliMi(x: unknown): x is Durum {
  const d = x as Durum | null;
  if (!d || typeof d !== 'object') return false;
  if (!Array.isArray(d.sorular) || d.sorular.length !== TUR_SORU_SAYISI)
    return false;
  if (!Array.isArray(d.oyuncular) || d.oyuncular.length < 1) return false;
  if (!Number.isInteger(d.soru) || d.soru < 0 || d.soru >= d.sorular.length)
    return false;
  if (d.asama !== 'soru' && d.asama !== 'sonuc') return false;
  if (typeof d.paket !== 'string') return false;
  return (
    Array.isArray(d.cevaplar) &&
    d.cevaplar.length === d.oyuncular.length &&
    d.cevaplar.every(
      (c) =>
        Array.isArray(c) &&
        c.length === d.sorular.length &&
        c.every((s) => s === null || (Number.isInteger(s) && s >= 0 && s < 4)),
    ) &&
    d.sorular.every(
      (s) =>
        Array.isArray(s?.secenekler) &&
        s.secenekler.length === 4 &&
        Number.isInteger(s.dogru) &&
        s.dogru >= 0 &&
        s.dogru < 4,
    )
  );
}
