import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// KK-60: 3 paket × ≥100 kart, her kart "10/10 ama" içerir, tekrarsız (tr), ≤140 karakter, boş yok.
// Taslak md biçimi (docs/desteler/onon-*.md): "N. kart metni". JSON (content/onon/<deck_id>.json) md ile aynı içerik.
const PAKETLER = ['onon-arkadas', 'onon-gundelik', 'onon-sevgili'];
const tr = (s: string) => s.toLocaleLowerCase('tr');
const oku = (yol: string) =>
  readFileSync(new URL(`../../../${yol}`, import.meta.url), 'utf8');
const kartlar = (deste: string) =>
  oku(`docs/desteler/${deste}.md`)
    .split('\n')
    .filter((s) => /^\d+\.\s/.test(s))
    .map((s) => ({
      no: Number(/^(\d+)\./.exec(s)![1]),
      metin: s.replace(/^\d+\.\s+/, '').trim(),
    }));

describe('KK-60: 10/10 ama içeriği (md taslağı)', () => {
  for (const deste of PAKETLER) {
    it(`${deste}: ≥100 kart, her kart "10/10 ama" içerir, tekrarsız, ≤140, numaralar ardışık`, () => {
      const k = kartlar(deste);
      expect(k.length).toBeGreaterThanOrEqual(100);
      expect(k.map((x) => x.no)).toEqual(k.map((_, i) => i + 1));
      expect(k.filter((x) => !x.metin)).toEqual([]);
      expect(
        k.filter((x) => !/10\/10 ama/.test(x.metin)).map((x) => x.metin),
      ).toEqual([]);
      expect(k.filter((x) => x.metin.length > 140).map((x) => x.metin)).toEqual(
        [],
      );
      const tekrar = k
        .map((x) => tr(x.metin))
        .filter((m, i, a) => a.indexOf(m) !== i);
      expect(tekrar, 'yinelenen kart').toEqual([]);
    });
  }

  it('paketler arasında aynı kart yok (oyuncu iki pakette aynı soruyu görmesin)', () => {
    const hepsi = PAKETLER.flatMap((p) => kartlar(p).map((x) => tr(x.metin)));
    expect(new Set(hepsi).size).toBe(hepsi.length);
  });
});

describe('KK-60: JSON desteler (content/onon/<deck_id>.json, md ile aynı)', () => {
  type Deste = {
    deck_id: string;
    version: number;
    lang: string;
    cards: { id: string; text: string }[];
  };
  for (const deste of PAKETLER) {
    it(`${deste}.json: şema, md ile aynı metinler ve sıra, kimlikler benzersiz`, () => {
      const yol = `content/onon/${deste}.json`;
      expect(existsSync(new URL(`../../../${yol}`, import.meta.url)), yol).toBe(
        true,
      );
      const j = JSON.parse(oku(yol)) as Deste;
      expect(j.deck_id).toBe(deste);
      expect(j.lang).toBe('tr');
      expect(j.version).toBeGreaterThanOrEqual(1);
      expect(j.cards.map((c) => c.text)).toEqual(
        kartlar(deste).map((x) => x.metin),
      );
      expect(new Set(j.cards.map((c) => c.id)).size).toBe(j.cards.length);
      expect(j.cards.every((c) => c.id && c.text.length <= 140)).toBe(true);
    });
  }
});
