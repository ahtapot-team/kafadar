import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { kabulCasusMantik } from '../../kabul';
import type { CasusDeste } from './casus';

// KK-51: içerik testi. Taslak md biçimi: "N. kelime — ipucu" (## Kelimeler) ve "N. soru" (## Örnek sorular).
const PAKETLER = ['casus-yerler', 'casus-yiyecek', 'casus-meslekler'];
const tr = (s: string) => s.toLocaleLowerCase('tr');
const oku = (yol: string) =>
  readFileSync(new URL(`../../../${yol}`, import.meta.url), 'utf8');

function bolum(md: string, baslik: string): string[] {
  const i = md.indexOf(`## ${baslik}`);
  if (i < 0) return [];
  const kalan = md.slice(i + baslik.length + 3);
  const son = kalan.search(/\n## /);
  return (son < 0 ? kalan : kalan.slice(0, son))
    .split('\n')
    .filter((s) => /^\d+\.\s/.test(s));
}

function ayristir(deste: string) {
  const md = oku(`docs/desteler/${deste}.md`);
  const kelimeler = bolum(md, 'Kelimeler').map((s) => {
    const m = /^(\d+)\.\s+(.+?)\s+[—–-]\s+(.+)$/.exec(s);
    return m
      ? { no: Number(m[1]), kelime: m[2].trim(), ipucu: m[3].trim() }
      : null;
  });
  const sorular = bolum(md, 'Örnek sorular').map((s) =>
    s.replace(/^\d+\.\s+/, '').trim(),
  );
  return { kelimeler, sorular };
}

describe('KK-51: Casus kim içeriği (md taslağı)', () => {
  for (const deste of PAKETLER) {
    it(`${deste}: ≥50 kelime, ≥10 örnek soru, biçim doğru, tekrarsız, ipucu kelimeyi içermez`, () => {
      const { kelimeler, sorular } = ayristir(deste);
      expect(kelimeler.length).toBeGreaterThanOrEqual(50);
      expect(sorular.length).toBeGreaterThanOrEqual(10);
      expect(
        kelimeler.every((k) => k !== null),
        'her satır "N. kelime — ipucu"',
      ).toBe(true);
      const k = kelimeler.filter((x) => x !== null);
      expect(k.map((x) => x.no)).toEqual(k.map((_, i) => i + 1));
      expect(new Set(k.map((x) => tr(x.kelime))).size, 'kelime tekrarı').toBe(
        k.length,
      );
      expect(new Set(sorular.map(tr)).size, 'soru tekrarı').toBe(
        sorular.length,
      );
      for (const { kelime, ipucu } of k) {
        expect(kelime.length, kelime).toBeLessThanOrEqual(30);
        expect(ipucu.length, ipucu).toBeLessThanOrEqual(40);
        expect(tr(ipucu), `${kelime} — ${ipucu}`).not.toContain(tr(kelime));
        expect(tr(kelime), `${kelime} — ${ipucu}`).not.toContain(tr(ipucu));
      }
      for (const s of sorular) expect(s.length, s).toBeLessThanOrEqual(80);
    });
  }
});

// Deste şeması (JSON, backend #78): content/casus/<deck_id>.json md ile aynı kelime ve ipuçlarını taşır.
describe('KK-51: Casus kim desteleri JSON şemasıyla yüklenir', () => {
  for (const deste of PAKETLER) {
    kabulCasusMantik(`${deste}.json şemaya uyar ve md ile aynıdır`, () => {
      const json = JSON.parse(oku(`content/casus/${deste}.json`)) as CasusDeste;
      expect(json.deck_id).toBe(deste);
      expect(Number.isInteger(json.version)).toBe(true);
      expect(json.lang).toBe('tr');
      const { kelimeler, sorular } = ayristir(deste);
      expect(json.sorular).toEqual(sorular);
      expect(json.cards.map((c) => [c.kelime, c.ipucu])).toEqual(
        kelimeler.map((x) => [x!.kelime, x!.ipucu]),
      );
      expect(new Set(json.cards.map((c) => c.id)).size).toBe(json.cards.length);
      expect(json.cards.every((c) => c.id.startsWith(`${deste}-`))).toBe(true);
    });
  }
});
