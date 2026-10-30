import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from './kabul';
import { dosyaIcerik } from './test/yardimci';

// #165 belge:kontrol sözleşmesi:
//  - betik `scripts/belge-kontrol.ts`, çalıştırma `node scripts/belge-kontrol.ts [--kok <dizin>]`
//    (`--kok` verilmezse çalışma dizini; kural yolları o kökten okunur).
//  - kural ihlalinde çıkış kodu 1, hangi kural/öğe bozuldu ise çıktıda (stdout+stderr) adı geçer.
//  - oyun listesi `src/games/registry.ts` içindeki `id: '<oyun>'` metinlerinden okunur.
const kokDizin = new URL('../', import.meta.url).pathname;
const KALEMLER = [
  'CLAUDE.md',
  'package.json',
  'app',
  'content',
  'design',
  'docs',
  'public',
  'scripts',
  'src',
  'sunucu',
  'web',
  '.github',
];

const calistir = (kok: string) => {
  const s = spawnSync(
    process.execPath,
    [join(kokDizin, 'scripts/belge-kontrol.ts'), '--kok', kok],
    { encoding: 'utf8' },
  );
  return { kod: s.status, cikti: `${s.stdout}\n${s.stderr}` };
};

// Gerçek deponun (node_modules/.git hariç) geçici kopyası; test bozuk hâli üzerinde dener.
const kopya = () => {
  const d = mkdtempSync(join(tmpdir(), 'belge-'));
  for (const k of KALEMLER) {
    if (!existsSync(join(kokDizin, k))) continue;
    cpSync(join(kokDizin, k), join(d, k), {
      recursive: true,
      filter: (y) => !y.includes('node_modules'),
    });
  }
  return d;
};

const kabulBelge = BEKLEYEN.belge ? it.fails : it;

describe('#165 belge:kontrol', () => {
  kabulBelge('KK-1: main üzerindeki belgeler kontrolü geçer (çıkış 0)', () => {
    const r = calistir(kokDizin);
    expect(r.cikti).not.toMatch(/Cannot find module|ERR_MODULE_NOT_FOUND/);
    expect(r.kod).toBe(0);
  });

  kabulBelge(
    'KK-2: 121 satırlık CLAUDE.md satır sınırı mesajıyla kırılır',
    () => {
      const d = kopya();
      const yol = join(d, 'CLAUDE.md');
      const satir = readFileSync(yol, 'utf8').split('\n').length;
      appendFileSync(yol, '\n'.repeat(Math.max(0, 122 - satir)) + 'dolgu\n');
      const r = calistir(d);
      expect(r.kod).toBe(1);
      expect(r.cikti).toContain('CLAUDE.md');
      expect(r.cikti).toContain('120');
    },
  );

  kabulBelge(
    'KK-3: belgede geçmeyen registry oyunu oyun adıyla kırılır',
    () => {
      const d = kopya();
      const yol = join(d, 'src/games/registry.ts');
      const kaynak = readFileSync(yol, 'utf8').replace(
        'export const oyunlar: Oyun[] = [',
        "export const oyunlar: Oyun[] = [\n  { ...({} as Oyun), id: 'yeni-oyun-xyz' },",
      );
      writeFileSync(yol, kaynak);
      const r = calistir(d);
      expect(r.kod).toBe(1);
      expect(r.cikti).toContain('yeni-oyun-xyz');
    },
  );

  kabulBelge(
    'KK-4: belgede geçmeyen package.json betiği adıyla kırılır',
    () => {
      const d = kopya();
      const yol = join(d, 'package.json');
      const p = JSON.parse(readFileSync(yol, 'utf8'));
      p.scripts['yeni-betik-xyz'] = 'echo x';
      writeFileSync(yol, JSON.stringify(p, null, 2));
      const r = calistir(d);
      expect(r.kod).toBe(1);
      expect(r.cikti).toContain('yeni-betik-xyz');
    },
  );

  kabulBelge(
    'KK-5: belgede olmayan yol (src/yok.ts) yolla birlikte kırılır',
    () => {
      const d = kopya();
      appendFileSync(join(d, 'docs/MIMARI.md'), '\nBkz. `src/yok.ts`\n');
      const r = calistir(d);
      expect(r.kod).toBe(1);
      expect(r.cikti).toContain('src/yok.ts');
    },
  );

  kabulBelge(
    'KK-6: CI "belge" adımı belge:kontrol çalıştırır, yeni bağımlılık yok, belgede listeli',
    () => {
      const ci = dosyaIcerik('.github/workflows/ci.yml');
      expect(ci).toMatch(/name:\s*Belge/i);
      expect(ci).toContain('npm run belge:kontrol');
      const p = JSON.parse(dosyaIcerik('package.json'));
      expect(p.scripts['belge:kontrol']).toContain('scripts/belge-kontrol.ts');
      // yeni bağımlılık yok: betik yalnızca node: yerleşiklerini içe aktarır
      const betik = dosyaIcerik('scripts/belge-kontrol.ts');
      const importlar = [...betik.matchAll(/from\s+'([^']+)'/g)].map(
        (m) => m[1],
      );
      expect(importlar.length).toBeGreaterThan(0);
      for (const i of importlar) expect(i.startsWith('node:')).toBe(true);
      // CLAUDE.md komut tablosunda satırı var
      expect(dosyaIcerik('CLAUDE.md')).toContain('npm run belge:kontrol');
    },
  );
});
