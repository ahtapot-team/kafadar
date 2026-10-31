// Quiz Night paket denetimi (KK-115). Node doğrudan çalıştırır: React yok, içe aktarmalar .ts uzantılı.
export const HAVUZ_EN_AZ = 20;
export const HAVUZ_EN_FAZLA = 30;
export const ZORLUK_EN_AZ = 6;
export const METIN_EN_FAZLA = 140;
export const SIK_EN_FAZLA = 40;
export const KAYNAK_EN_AZ = 4;
export const UYUM_EN_AZ = 0.75;
const ZORLUKLAR = ['kolay', 'orta', 'zor'];
const TURLER = ['olay', 'dunya'];

const nesneMi = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const dolu = (x: unknown): x is string =>
  typeof x === 'string' && x.trim() !== '';
const normal = (t: string) =>
  t.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr');

function soruHatalari(s: unknown, yer: string): string[] {
  if (!nesneMi(s)) return [`${yer}: soru nesne değil`];
  const h: string[] = [];
  if (!dolu(s.id)) h.push(`${yer}: id yok`);
  if (!dolu(s.metin)) h.push(`${yer}: boş metin`);
  else if (s.metin.length > METIN_EN_FAZLA)
    h.push(
      `${yer}: metin ${s.metin.length} karakter (en fazla ${METIN_EN_FAZLA})`,
    );
  const sik = s.secenekler;
  if (!Array.isArray(sik) || sik.length !== 4)
    h.push(`${yer}: tam 4 şık olmalı`);
  else {
    sik.forEach((x, i) => {
      if (!dolu(x)) h.push(`${yer}: ${i + 1}. şık boş`);
      else if (x.length > SIK_EN_FAZLA)
        h.push(
          `${yer}: ${i + 1}. şık ${x.length} karakter (en fazla ${SIK_EN_FAZLA})`,
        );
    });
    const n = sik.filter(dolu).map(normal);
    if (new Set(n).size !== n.length) h.push(`${yer}: aynı şık tekrar ediyor`);
  }
  if (
    !Number.isInteger(s.dogru) ||
    (s.dogru as number) < 0 ||
    (s.dogru as number) > 3
  )
    h.push(`${yer}: dogru 0–3 tam sayı olmalı`);
  if (typeof s.zorluk !== 'string' || !ZORLUKLAR.includes(s.zorluk))
    h.push(`${yer}: zorluk kolay/orta/zor olmalı`);
  if (typeof s.tur !== 'string' || !TURLER.includes(s.tur))
    h.push(`${yer}: tur olay/dunya olmalı`);
  const k = s.kaynaklar;
  if (!Array.isArray(k) || k.length < KAYNAK_EN_AZ)
    h.push(`${yer}: en az ${KAYNAK_EN_AZ} kaynak gerekir`);
  else
    k.forEach((x, i) => {
      if (!nesneMi(x) || !dolu(x.ad) || !dolu(x.url))
        h.push(`${yer}: ${i + 1}. kaynakta ad ve url gerekir`);
    });
  if (typeof s.uyum !== 'number' || !(s.uyum >= UYUM_EN_AZ) || s.uyum > 1)
    h.push(`${yer}: uyum ${UYUM_EN_AZ}–1 arası sayı olmalı`);
  return h;
}

// Boş dizi = geçerli. Biçim bozuksa atmaz, hata döndürür.
export function quizHatalari(dosya: unknown): string[] {
  if (!nesneMi(dosya)) return ['paket nesne değil'];
  const h: string[] = [];
  for (const alan of ['id', 'ad', 'emoji'])
    if (!dolu(dosya[alan])) h.push(`${alan} boş`);
  if (dosya.koken !== 'tr' && dosya.koken !== 'yabanci')
    h.push('koken tr ya da yabanci olmalı');
  const u = dosya.unvanlar;
  if (!Array.isArray(u) || u.length !== 4 || !u.every(dolu))
    h.push('tam 4 dolu unvan olmalı');
  const sorular = dosya.sorular;
  if (!Array.isArray(sorular)) return [...h, 'sorular dizisi yok'];
  if (sorular.length < HAVUZ_EN_AZ || sorular.length > HAVUZ_EN_FAZLA)
    h.push(
      `havuz ${sorular.length} soru (${HAVUZ_EN_AZ}–${HAVUZ_EN_FAZLA} olmalı)`,
    );
  sorular.forEach((s, i) => h.push(...soruHatalari(s, `soru #${i + 1}`)));
  const gecerli = sorular.filter(nesneMi);
  for (const z of ZORLUKLAR) {
    const n = gecerli.filter((s) => s.zorluk === z).length;
    if (n < ZORLUK_EN_AZ) h.push(`${z} sorusu ${n} (en az ${ZORLUK_EN_AZ})`);
  }
  const olay = gecerli.filter((s) => s.tur === 'olay').length;
  if (olay * 2 >= sorular.length)
    h.push(
      `olay sorusu havuzun yarısından az olmalı (${olay}/${sorular.length})`,
    );
  const idler = gecerli.map((s) => s.id).filter(dolu);
  if (new Set(idler).size !== idler.length) h.push('tekrar eden soru id');
  const metinler = gecerli
    .map((s) => s.metin)
    .filter(dolu)
    .map(normal);
  if (new Set(metinler).size !== metinler.length)
    h.push('tekrar eden soru metni');
  return h;
}

// Uygulamaya giren paket: kaynaklar ve uyum girmez.
export function uygulamaPaketi(dosya: unknown) {
  const p = dosya as {
    id: string;
    ad: string;
    emoji: string;
    koken: string;
    unvanlar: string[];
    sorular: {
      id: string;
      metin: string;
      secenekler: string[];
      dogru: number;
      zorluk: string;
      tur: string;
    }[];
  };
  return {
    id: p.id,
    ad: p.ad,
    emoji: p.emoji,
    koken: p.koken,
    unvanlar: p.unvanlar,
    sorular: p.sorular.map(({ id, metin, secenekler, dogru, zorluk, tur }) => ({
      id,
      metin,
      secenekler,
      dogru,
      zorluk,
      tur,
    })),
  };
}
