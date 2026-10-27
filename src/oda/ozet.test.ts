import { describe, expect, it } from 'vitest';
import { erkenBitti, kisisel, okYuzde, tartismali } from './ozet';
import type { Final } from './oda';

const f: Final = {
  yuzdeler: [
    { kartId: 'a', ok: 3, nok: 1, bos: 0 },
    { kartId: 'b', ok: 2, nok: 2, bos: 0 },
    { kartId: 'c', ok: 0, nok: 3, bos: 1 },
  ],
  enTartismali: ['b'],
  oduller: { aykiriRuh: ['Can'], ruhIkizleri: [['Ali', 'Ayşe']] },
  kimNeDedi: {
    Ali: ['OK', 'OK', 'NOK'],
    Ayşe: ['OK', 'NOK', 'NOK'],
    Mert: ['OK', 'OK', 'NOK'],
    Can: ['NOK', 'NOK', null],
  },
  ayniOlan: { Ali: 3, Ayşe: 2, Mert: 3, Can: 1 },
};

describe('oda final özetleri (KK-36)', () => {
  it('toplam OK yüzdesi boşları hesaba katmaz', () => {
    expect(okYuzde(f)).toBe(Math.round((100 * 5) / 11)); // ok 5, nok 6
    expect(okYuzde({ ...f, yuzdeler: [] })).toBe(0);
  });
  it('en tartışmalı soruda kim hangi yanda', () => {
    expect(tartismali(f)).toEqual([
      { no: 2, kartId: 'b', ok: ['Ali', 'Mert'], nok: ['Ayşe', 'Can'] },
    ]);
  });
  it('kişisel kart: aynı olunan sayı, OK/NOK/boş, ruh ikizi', () => {
    expect(kisisel(f, 'Can')).toEqual({
      ayni: 1,
      toplam: 3,
      ok: 0,
      nok: 2,
      bos: 1,
      ikiz: null,
    });
    expect(kisisel(f, 'Ali').ikiz).toBe('Ayşe');
    expect(kisisel(f, 'Ayşe').ikiz).toBe('Ali');
  });
  it('erken biten oyun (KK-38)', () => {
    expect(erkenBitti(f, 10)).toBe(true);
    expect(
      erkenBitti({ ...f, yuzdeler: Array(10).fill(f.yuzdeler[0]) }, 10),
    ).toBe(false);
  });
});
