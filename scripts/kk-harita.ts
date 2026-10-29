// KK → test eşlemesi (docs/KK-HARITA.md) üretir: PRD'deki her kabul kriterinin hangi test dosyalarında ve gerçek-cihaz
// listesinde geçtiğini test adlarındaki/yorumlardaki "KK-nn" ifadelerinden çıkarır.
//   node scripts/kk-harita.ts            → docs/KK-HARITA.md'yi yazar
//   node scripts/kk-harita.ts --kontrol  → CI: her KK'nin testi ya da cihaz maddesi var mı (yoksa 1 ile çıkar); dosya bayatsa yalnızca uyarır
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const kok = new URL('../', import.meta.url).pathname;
const oku = (yol: string) => readFileSync(join(kok, yol), 'utf8');
const HARITA = 'docs/KK-HARITA.md';

// "KK-7", "KK-28…KK-40", "KK-55…62" biçimlerini sayılara açar.
function kkler(metin: string): number[] {
  const sonuc = new Set<number>();
  for (const m of metin.matchAll(/KK-(\d+)(?:\s*[…–-]\s*(?:KK-)?(\d+))?/g)) {
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (b >= a && b - a <= 60) for (let n = a; n <= b; n++) sonuc.add(n);
    else sonuc.add(a);
  }
  return [...sonuc];
}

// PRD: "- [ ] KK-nn: ..." satırları.
const prd = [
  ...oku('docs/PRD.md').matchAll(/^- \[[ x]\] KK-(\d+):\s*(.*)$/gm),
].map((m) => ({
  no: Number(m[1]),
  baslik: m[2].replace(/\|/g, '/').slice(0, 90),
}));

function dosyalar(klasor: string, kosul: (f: string) => boolean): string[] {
  return readdirSync(join(kok, klasor), { recursive: true })
    .map(String)
    .filter((f) => !f.includes('node_modules') && kosul(f))
    .map((f) => `${klasor}/${f}`)
    .sort();
}
const testler = [
  ...dosyalar('src', (f) => /\.test\.ts$/.test(f)),
  ...dosyalar('sunucu/test', (f) => /\.ts$/.test(f)),
];
const testHaritasi = new Map<number, Set<string>>();
for (const t of testler)
  for (const n of kkler(oku(t))) {
    if (!testHaritasi.has(n)) testHaritasi.set(n, new Set());
    testHaritasi.get(n)!.add(t.replace(/^src\//, ''));
  }
const cihaz = new Set(kkler(oku('docs/GERCEK-CIHAZ-KONTROL.md')));

const satirlar = prd.map(({ no, baslik }) => {
  const t = [...(testHaritasi.get(no) ?? [])];
  const testHucre = t.length ? t.map((x) => `\`${x}\``).join(', ') : '—';
  return `| KK-${no} | ${baslik} | ${testHucre} | ${cihaz.has(no) ? 'cihaz' : '—'} |`;
});
const yok = prd.filter(({ no }) => !testHaritasi.has(no) && !cihaz.has(no));
const metin = `# KK → test haritası (otomatik üretilir: \`npm run kk-harita\`; elle düzenleme)

PRD'deki her kabul kriteri için "KK-nn" ifadesi geçen test dosyaları ve gerçek-cihaz listesi. CI her KK'nin en az bir testi ya da cihaz maddesi olduğunu denetler.

| KK | Kriter (PRD, kısaltılmış) | Test dosyaları | Gerçek cihaz |
|---|---|---|---|
${satirlar.join('\n')}
`;

if (process.argv.includes('--kontrol')) {
  let hata = false;
  if (yok.length) {
    console.error(
      `Testi ya da cihaz maddesi olmayan KK: ${yok.map((y) => `KK-${y.no}`).join(', ')}`,
    );
    hata = true;
  }
  let mevcut = '';
  try {
    mevcut = oku(HARITA);
  } catch {
    // dosya yok
  }
  if (mevcut !== metin)
    console.warn(
      `Uyarı: ${HARITA} bayat; "npm run kk-harita" ile yenileyin (CI'ı kırmaz).`,
    );
  process.exit(hata ? 1 : 0);
}
writeFileSync(join(kok, HARITA), metin);
console.log(`${HARITA} yazıldı: ${prd.length} KK, ${yok.length} eksik`);
if (yok.length) console.log('Eksik:', yok.map((y) => `KK-${y.no}`).join(', '));
