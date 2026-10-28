// Puan tabanlı oyunların ortak ödül kuralları (10/10 ama tek telefon + oda modu, KK-58, KK-69).
// Saf: ondalık yuvarlama hatası olmasın diye oranlar tam sayıyla karşılaştırılır.

// Oturum sonu ödülleri (KK-58). Yalnızca hâlâ oyunda olanlar ve açıklanmış kartlardan hesaplanır.
export type Oduller = {
  enAcimasiz: string[]; // verdiği puanların ortalaması en düşük olan(lar); herkes eşitse boş
  melekKalpli: string[]; // ortalaması en yüksek olan(lar); herkes eşitse boş
  ruhIkizleri: [string, string][]; // ortak kartlarda puan farkının ortalaması en küçük ikili(ler); ikili oyuncu sırasıyla
};

// Kesirleri tam sayıyla karşılaştırır (ondalık yuvarlama hatası olmasın): a/b ile c/d.
type Oran = { s: number; n: number }; // toplam, adet
const kucukMu = (a: Oran, b: Oran) => a.s * b.n < b.s * a.n;
const esitMi = (a: Oran, b: Oran) => a.s * b.n === b.s * a.n;

// Oran listesinden en küçüğü (ya da en büyüğü) olanların anahtarları.
function uclar<T>(liste: { k: T; o: Oran }[], enKucuk: boolean): T[] {
  if (liste.length === 0) return [];
  let en = liste[0].o;
  for (const { o } of liste)
    if (enKucuk ? kucukMu(o, en) : kucukMu(en, o)) en = o;
  return liste.filter(({ o }) => esitMi(o, en)).map(({ k }) => k);
}

// Yalnızca hâlâ oyunda olanlar ve açıklanmış kartlardan hesaplanır (KK-58).
// Ödül kuralları tek yerde (tek telefon ve oda modu): `oyuncular` yalnızca hâlâ oyunda olanlar,
// `gecmis` açıklanmış kartlar (puan vermeyen oyuncunun anahtarı yoktur).
export function oduluHesapla(
  oyuncular: string[],
  gecmis: { puanlar: Record<string, number | undefined> }[],
): Oduller {
  const ort: { k: string; o: Oran }[] = [];
  for (const ad of oyuncular) {
    const p = gecmis
      .map((g) => g.puanlar[ad])
      .filter((x): x is number => x !== undefined);
    if (p.length > 0)
      ort.push({ k: ad, o: { s: p.reduce((a, b) => a + b, 0), n: p.length } });
  }
  const hepsiEsit = ort.every(({ o }) => esitMi(o, ort[0].o));
  const ikizler: { k: [string, string]; o: Oran }[] = [];
  oyuncular.forEach((a, i) =>
    oyuncular.slice(i + 1).forEach((b) => {
      const ortak = gecmis.filter(
        (g) => g.puanlar[a] !== undefined && g.puanlar[b] !== undefined,
      );
      if (ortak.length > 0)
        ikizler.push({
          k: [a, b],
          o: {
            s: ortak.reduce(
              (t, g) => t + Math.abs(g.puanlar[a]! - g.puanlar[b]!),
              0,
            ),
            n: ortak.length,
          },
        });
    }),
  );
  return {
    enAcimasiz: hepsiEsit ? [] : uclar(ort, true),
    melekKalpli: hepsiEsit ? [] : uclar(ort, false),
    ruhIkizleri: uclar(ikizler, true),
  };
}
