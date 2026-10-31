import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { oyunlar } from './registry';

// KK-77: tanıtım metni oyunun kayıt satırından (registry) gelir ve PRD v6 "Tanıtım metinleri" tablosuyla aynıdır.
const prd = readFileSync(new URL('../../docs/PRD.md', import.meta.url), 'utf8');
function prdTablosu() {
  const i = prd.indexOf('### Tanıtım metinleri');
  const kalan = prd.slice(i);
  const son = kalan.slice(3).search(/\n#{2,3} /);
  const govde = son < 0 ? kalan : kalan.slice(0, son + 3);
  return govde
    .split('\n')
    .filter((s) => s.startsWith('|') && !/^\|\s*(Oyun|-)/.test(s))
    .map((s) => s.split('|').map((x) => x.trim()))
    .map(([, oyun, kisi, metin]) => ({ oyun, kisi, metin }));
}

describe("KK-77: tanıtım metinleri registry'den", () => {
  const tablo = prdTablosu();

  it('PRD tablosunda dört oyun var (OK mu NOK mu, Casus kim, 10/10 ama, Quiz Night)', () => {
    expect(tablo.map((t) => t.oyun)).toEqual([
      'OK mu NOK mu',
      'Casus kim',
      '10/10 ama',
      'Quiz Night',
    ]);
  });

  it('aktif her oyunun kayıt satırında tanitim {kisi, metin} var ve PRD tablosuyla aynı', () => {
    const aktifler = oyunlar.filter((o) => o.aktif);
    expect(aktifler.length).toBeGreaterThanOrEqual(3);
    for (const o of aktifler) {
      const satir = tablo.find((t) => t.oyun === o.ad);
      expect(satir, `PRD tablosunda ${o.ad} yok`).toBeDefined();
      expect(o.tanitim?.kisi, o.ad).toBe(satir!.kisi);
      expect(o.tanitim?.metin, o.ad).toBe(satir!.metin);
    }
  });

  it('metinler dolu; kişi sayısı "N–M kişi" biçiminde; oyuncu sınırıyla uyumlu (Casus kim 3–12)', () => {
    for (const o of oyunlar.filter((x) => x.aktif)) {
      expect(o.tanitim?.metin?.trim().length ?? 0, o.ad).toBeGreaterThan(40);
      expect(o.tanitim?.kisi, o.ad).toMatch(/^\d+–\d+ kişi$/);
    }
    const casus = oyunlar.find((o) => o.id === 'casus-kim')!;
    expect(casus.tanitim?.kisi).toBe(`${casus.minOyuncu}–12 kişi`);
  });
});
