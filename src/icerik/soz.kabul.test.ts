// v8 KK-98: açılış sözleri tek JSON dosyasında, `npm run icerik` denetler — issue #191.
// SÖZLEŞME (frontend için):
//   content/acilis/sozler.json → { "version": 1, "lang": "tr", "sozler": [{ "id": "s-001", "text": "…", "oyun": "casus-kim" | … | "genel" }] }
//       oyun = src/games/registry kimliği ('ok-mu-nok', '10-10-ama', 'casus-kim') ya da 'genel'
//   src/icerik/soz.ts (Node doğrudan çalıştırır: içe aktarmalar .ts uzantılı, React yok)
//       → sozHatalari(dosya: unknown, aktifOyunlar: readonly string[]): string[]  (boş dizi = geçerli)
//         denetler: boş metin · 140 karakter üstü · tekrar eden metin/id · bilinmeyen oyun kimliği ·
//         her aktif oyunda ve 'genel'de en az 10 söz · biçim bozuksa (dizi yok, id yok…) hata, atmaz
//   scripts/icerik-dogrula.ts → bu dosyayı `sozHatalari` ile denetler (hata varsa 1 ile çıkar)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { oyunlar } from '../games/registry';

type Soz = { id: string; text: string; oyun: string };
type Dosya = { version: number; lang: string; sozler: Soz[] };
type SozDogrula = {
  sozHatalari(dosya: unknown, aktifOyunlar: readonly string[]): string[];
};

const yol = './soz';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as SozDogrula;
const oku = (dosya: string) =>
  readFileSync(new URL(`../../${dosya}`, import.meta.url), 'utf8');

const AKTIF = ['ok-mu-nok', '10-10-ama', 'casus-kim'];

// Geçerli taban: her aktif oyuna 10, genele 10 benzersiz söz.
const taban = (): Dosya => ({
  version: 1,
  lang: 'tr',
  sozler: [...AKTIF, 'genel'].flatMap((oyun) =>
    Array.from({ length: 10 }, (_, i) => ({
      id: `${oyun}-${i + 1}`,
      text: `${oyun} için ${i + 1}. söz`,
      oyun,
    })),
  ),
});
const boz = (f: (d: Dosya) => void) => {
  const d = taban();
  f(d);
  return d;
};

describe('KK-98: söz dosyası denetimi (saf fonksiyon)', () => {
  it('KK-98: geçerli dosya hatasız', async () => {
    const { sozHatalari } = await yukle();
    expect(sozHatalari(taban(), AKTIF)).toEqual([]);
  });

  it('KK-98: boş (yalnız boşluk) söz reddedilir', async () => {
    const { sozHatalari } = await yukle();
    expect(
      sozHatalari(
        boz((d) => (d.sozler[0].text = '   ')),
        AKTIF,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      sozHatalari(
        boz((d) => (d.sozler[0].text = '')),
        AKTIF,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('KK-98: 140 karakter geçerli, 141 reddedilir', async () => {
    const { sozHatalari } = await yukle();
    expect(
      sozHatalari(
        boz((d) => (d.sozler[0].text = 'a'.repeat(140))),
        AKTIF,
      ),
    ).toEqual([]);
    expect(
      sozHatalari(
        boz((d) => (d.sozler[0].text = 'a'.repeat(141))),
        AKTIF,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('KK-98: tekrar eden söz reddedilir (büyük/küçük harf ve baştaki/sondaki boşluk fark etmez)', async () => {
    const { sozHatalari } = await yukle();
    expect(
      sozHatalari(
        boz((d) => (d.sozler[1].text = d.sozler[0].text)),
        AKTIF,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      sozHatalari(
        boz(
          (d) =>
            (d.sozler[1].text = ` ${d.sozler[0].text.toLocaleUpperCase('tr')} `),
        ),
        AKTIF,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('KK-98: tekrar eden id reddedilir', async () => {
    const { sozHatalari } = await yukle();
    expect(
      sozHatalari(
        boz((d) => (d.sozler[1].id = d.sozler[0].id)),
        AKTIF,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('KK-98: bilinmeyen oyun kimliği reddedilir', async () => {
    const { sozHatalari } = await yukle();
    expect(
      sozHatalari(
        boz((d) => (d.sozler[0].oyun = 'yok-oyun')),
        AKTIF,
      ).length,
    ).toBeGreaterThan(0);
  });

  it("KK-98: bir aktif oyunda ya da genelde 10'dan az söz reddedilir", async () => {
    const { sozHatalari } = await yukle();
    for (const oyun of [...AKTIF, 'genel'])
      expect(
        sozHatalari(
          boz((d) => {
            const i = d.sozler.findIndex((s) => s.oyun === oyun);
            d.sozler.splice(i, 1);
          }),
          AKTIF,
        ).length,
        oyun,
      ).toBeGreaterThan(0);
  });

  it('KK-98: biçimi bozuk dosya atmadan hata döndürür', async () => {
    const { sozHatalari } = await yukle();
    for (const bozuk of [null, {}, { sozler: 'x' }, { sozler: [{}] }])
      expect(sozHatalari(bozuk, AKTIF).length).toBeGreaterThan(0);
  });
});

describe('KK-98: gerçek söz dosyası ve npm run icerik', () => {
  it('KK-98: content/acilis/sozler.json geçerli; her aktif oyunda ve genelde en az 10 söz', async () => {
    const { sozHatalari } = await yukle();
    const d = JSON.parse(oku('content/acilis/sozler.json')) as Dosya;
    expect(d.lang).toBe('tr');
    expect(Number.isInteger(d.version)).toBe(true);
    const aktif = oyunlar.filter((o) => o.aktif).map((o) => o.id);
    expect(sozHatalari(d, aktif)).toEqual([]);
    for (const oyun of [...aktif, 'genel'])
      expect(
        d.sozler.filter((s) => s.oyun === oyun).length,
        oyun,
      ).toBeGreaterThanOrEqual(10);
  });

  it('KK-98: scripts/icerik-dogrula.ts söz dosyasını sozHatalari ile denetler ve hatada 1 ile çıkar', () => {
    const betik = oku('scripts/icerik-dogrula.ts');
    expect(betik).toContain('acilis/sozler.json');
    expect(betik).toContain('sozHatalari');
    expect(betik).toMatch(/process\.exit\(hataVar \? 1 : 0\)/);
    expect(oku('package.json')).toContain(
      '"icerik": "node scripts/icerik-dogrula.ts"',
    );
  });
});
