import { describe, expect, it } from 'vitest';
import {
  KAYIT_SURUMU,
  OYUN_ANAHTARI,
  oyunKaydet,
  oyunOku,
} from '../../core/kayit';
import { type Durum, durumGecerliMi, isle, yeniOyun } from './oyun';
import { depoYap } from '../../test/yardimci';

const gecerli = (): Durum =>
  isle(
    yeniOyun({
      oyuncular: ['Ali', 'Ayşe'],
      deste: {
        deck_id: 't',
        version: 1,
        lang: 'tr',
        cards: [
          { id: 'a', text: 'Bir' },
          { id: 'b', text: 'İki' },
        ],
      },
      uzunluk: 10,
      tohum: 1,
    }),
    { tip: 'oyla', oyuncu: 'Ali', oy: 'OK', t: 1000 },
  );

// Sürümü doğru (KAYIT_SURUMU) ama içeriği bozuk durumlar: arayüz bunlarda çöküyordu (#27).
const bozuklar: [string, (d: Record<string, unknown>) => void][] = [
  ['kartlar yok', (d) => delete d.kartlar],
  ['kartlar dizi değil', (d) => (d.kartlar = 'x')],
  ['kartlar boş', (d) => (d.kartlar = [])],
  ['kart metinsiz', (d) => (d.kartlar = [{ id: 'a' }])],
  ['sıra aralık dışı', (d) => (d.sira = 99)],
  ['sıra sayı değil', (d) => (d.sira = 'a')],
  ['oyuncular yok', (d) => delete d.oyuncular],
  ['oyuncular boş', (d) => (d.oyuncular = [])],
  ['oyuncular sayı dizisi', (d) => (d.oyuncular = [1, 2])],
  ['oylar bozuk', (d) => (d.oylar = { Ali: 'belki' })],
  ['aşama bilinmiyor', (d) => (d.asama = 'uyku')],
  ['geçmiş bozuk', (d) => (d.gecmis = [{}])],
  ['deste yok', (d) => delete d.deste],
  ['uzunluk geçersiz', (d) => (d.uzunluk = 7)],
];

describe('#27: sürümü doğru ama bozuk kayıt', () => {
  it('geçerli durum şemayı geçer', () => {
    expect(durumGecerliMi(gecerli())).toBe(true);
  });

  it.each(bozuklar)('%s: reddedilir', (_ad, boz) => {
    const d = JSON.parse(JSON.stringify(gecerli())) as Record<string, unknown>;
    boz(d);
    expect(durumGecerliMi(d)).toBe(false);
  });

  it('oyunOku bozuk içerikte null döner, kaydı siler, çökmez', async () => {
    for (const [, boz] of bozuklar) {
      const depo = depoYap();
      const d = JSON.parse(JSON.stringify(gecerli())) as Record<
        string,
        unknown
      >;
      boz(d);
      depo.veri.set(
        OYUN_ANAHTARI,
        JSON.stringify({ surum: KAYIT_SURUMU, durum: d }),
      );
      expect(await oyunOku<Durum>(depo, durumGecerliMi)).toBeNull();
      expect(depo.veri.has(OYUN_ANAHTARI)).toBe(false);
    }
  });

  it('geçerli kayıt aynen geri gelir', async () => {
    const depo = depoYap();
    await oyunKaydet(depo, gecerli());
    expect(await oyunOku<Durum>(depo, durumGecerliMi)).toEqual(gecerli());
  });
});
