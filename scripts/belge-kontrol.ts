// Belgeler (CLAUDE.md, docs/MIMARI.md) kodla uyumlu mu? Kullanım:
//   node scripts/belge-kontrol.ts [--kok <dizin>]
// İhlalde hangi kural ve hangi satırın bozulduğunu yazar, çıkış kodu 1.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MAKS_SATIR = 120;

const argumanlar = process.argv.slice(2);
const kokIndeks = argumanlar.indexOf('--kok');
const kok = resolve(kokIndeks >= 0 ? (argumanlar[kokIndeks + 1] ?? '.') : '.');

const hatalar: string[] = [];
const hata = (kural: string, ayrinti: string) =>
  hatalar.push(`[${kural}] ${ayrinti}`);

function oku(yol: string): string | null {
  const tam = join(kok, yol);
  return existsSync(tam) ? readFileSync(tam, 'utf8') : null;
}

const claude = oku('CLAUDE.md');
const mimari = oku('docs/MIMARI.md');
if (claude === null) hata('dosya', 'CLAUDE.md bulunamadı');
if (mimari === null) hata('dosya', 'docs/MIMARI.md bulunamadı');

// 1) CLAUDE.md en fazla 120 satır.
if (claude !== null) {
  const satir = claude.replace(/\n$/, '').split('\n').length;
  if (satir > MAKS_SATIR) {
    hata(
      'CLAUDE.md-uzunluk',
      `CLAUDE.md ${satir} satır; en fazla ${MAKS_SATIR} olmalı (satır ${MAKS_SATIR + 1}'den sonrasını kısalt)`,
    );
  }
}

const belgeMetni = `${claude ?? ''}\n${mimari ?? ''}`;

// 2) registry.ts'teki her oyun CLAUDE.md ya da docs/MIMARI.md'de geçer.
const kayit = oku('src/games/registry.ts');
if (kayit === null) {
  hata('oyun-listesi', 'src/games/registry.ts bulunamadı');
} else {
  kayit.split('\n').forEach((satir, i) => {
    const m = /\bid:\s*'([^']+)'/.exec(satir);
    if (m && !belgeMetni.includes(m[1])) {
      hata(
        'oyun-listesi',
        `oyun '${m[1]}' (src/games/registry.ts:${i + 1}) CLAUDE.md ya da docs/MIMARI.md'de geçmiyor`,
      );
    }
  });
}

// 3) package.json'daki her script CLAUDE.md'de geçer.
const paket = oku('package.json');
if (paket === null) {
  hata('script-listesi', 'package.json bulunamadı');
} else if (claude !== null) {
  const betikler = Object.keys(
    (JSON.parse(paket).scripts ?? {}) as Record<string, string>,
  );
  for (const ad of betikler) {
    const aranan =
      ad === 'start' || ad === 'test' ? `npm ${ad}` : `npm run ${ad}`;
    const var_ = claude.includes(aranan) || claude.includes(`\`${ad}\``);
    if (!var_)
      hata(
        'script-listesi',
        `package.json betiği '${ad}' CLAUDE.md'de geçmiyor (${aranan})`,
      );
  }
}

// 4) Belgelerde anılan src/, docs/, sunucu/, scripts/ yolları var olmalı.
function suslu(yol: string): string[] {
  const m = /\{([^{}]*)\}/.exec(yol);
  if (!m) return [yol];
  return m[1].split(',').flatMap((parca) => suslu(yol.replace(m[0], parca)));
}

const YOL = /(?<![\w./-])((?:src|docs|sunucu|scripts)\/[\w./{},@-]*)/g;

function yollariKontrolEt(dosya: string, metin: string | null) {
  if (metin === null) return;
  metin.split('\n').forEach((satir, i) => {
    for (const eslesme of satir.matchAll(YOL)) {
      const ham = eslesme[1].replace(/[.,;:]+$/, '').replace(/\/+$/, '');
      if (ham.includes('*')) continue;
      for (const yol of suslu(ham)) {
        if (!existsSync(join(kok, yol))) {
          hata('yol', `'${yol}' yolu yok (${dosya}:${i + 1})`);
        }
      }
    }
  });
}

yollariKontrolEt('CLAUDE.md', claude);
yollariKontrolEt('docs/MIMARI.md', mimari);

if (hatalar.length > 0) {
  console.error(`belge:kontrol başarısız (${hatalar.length} ihlal):`);
  for (const h of hatalar) console.error(`  ${h}`);
  process.exit(1);
}
console.log('belge:kontrol tamam: CLAUDE.md ve docs/MIMARI.md kodla uyumlu.');
