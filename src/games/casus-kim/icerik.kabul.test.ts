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

describe("KK-51: Casus kim içeriği (md taslağı, 100'lük paketler: Murat)", () => {
  for (const deste of PAKETLER) {
    it(`${deste}: ≥100 kelime, ≥10 örnek soru, biçim doğru, tekrarsız, ipucu kelimeyi içermez`, () => {
      const { kelimeler, sorular } = ayristir(deste);
      expect(kelimeler.length).toBeGreaterThanOrEqual(100);
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

// KK-7/KK-21 (Murat 27.10.2026: desteler 100'e): OK mu NOK mu md desteleri.
describe('KK-7: OK mu NOK mu md desteleri 100 kart', () => {
  for (const deste of ['arkadas', 'cift', 'aile']) {
    it(`${deste}: ≥100 kart, tekrarsız, ≤140 karakter`, () => {
      const kartlar = oku(`docs/desteler/${deste}.md`)
        .split('\n')
        .filter((s) => /^\d+\.\s/.test(s))
        .map((s) => s.replace(/^\d+\.\s+/, '').trim());
      expect(kartlar.length).toBeGreaterThanOrEqual(100);
      expect(new Set(kartlar.map(tr)).size, 'kart tekrarı').toBe(
        kartlar.length,
      );
      for (const k of kartlar) {
        expect(k.length, k).toBeGreaterThan(0);
        expect(k.length, k).toBeLessThanOrEqual(140);
      }
    });
  }
});

// KK-7: OK mu NOK mu JSON desteleri md ile aynı metinleri taşır (#87).
describe('KK-7: OK mu NOK mu JSON desteleri md ile eşit', () => {
  for (const deste of ['arkadas', 'cift', 'aile']) {
    it(`${deste}.json: md ile aynı 100 metin, sürüm ≥2, kimlikler benzersiz`, () => {
      const json = JSON.parse(oku(`content/decks/${deste}.json`)) as {
        version: number;
        cards: { id: string; text: string }[];
      };
      const md = oku(`docs/desteler/${deste}.md`)
        .split('\n')
        .filter((s) => /^\d+\.\s/.test(s))
        .map((s) => s.replace(/^\d+\.\s+/, '').trim());
      expect(json.cards.map((c) => c.text)).toEqual(md);
      expect(json.version).toBeGreaterThanOrEqual(2);
      expect(new Set(json.cards.map((c) => c.id)).size).toBe(json.cards.length);
    });
  }
});
