import { describe, expect, it } from 'vitest';
import { kaynaklar } from '../test/yardimci';

// Refactor #138 (docs/MIMARI.md): ortak ekran parçaları `src/oyun-ekranlari/ortak/` altında; hiçbir oyun klasörü
// başka bir oyun klasöründen import etmez, hiçbir yer ok-mu-nok'un ortak parçalarını (artık ortak/'ta) kullanmaz.
const OYUNLAR = ['ok-mu-nok', 'on-on-ama', 'casus-kim'];
const importlar = (icerik: string) =>
  [...icerik.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

describe('#138: ortak ekran parçaları', () => {
  it('bir oyunun ekran klasörü başka bir oyunun klasöründen import etmez', () => {
    const ihlal: string[] = [];
    for (const oyun of OYUNLAR)
      for (const { f, icerik } of kaynaklar(`src/oyun-ekranlari/${oyun}`))
        for (const yol of importlar(icerik))
          for (const baska of OYUNLAR.filter((x) => x !== oyun))
            if (new RegExp(`(^|/)${baska}(/|$)`).test(yol))
              ihlal.push(`${f} → ${yol}`);
    expect(ihlal).toEqual([]);
  });

  it("ok-mu-nok'un geri sayım, konfeti, animasyon, paylaşım ve üst çubuk parçaları ortak/'a taşındı; kimse eski yoldan import etmez", () => {
    const ihlal: string[] = [];
    const tum = [...kaynaklar('app'), ...kaynaklar('src')];
    for (const { f, icerik } of tum)
      for (const yol of importlar(icerik))
        if (/ok-mu-nok\/(ortak|konfeti|anim|kart|paylasim)$/.test(yol))
          ihlal.push(`${f} → ${yol}`);
    expect(ihlal).toEqual([]);
  });

  it('ortak parçalar ortak/ klasöründe ve oyun klasörlerinden import etmez (tek yönlü bağımlılık)', () => {
    const ortak = kaynaklar('src/oyun-ekranlari/ortak');
    expect(ortak.length).toBeGreaterThan(0);
    for (const { f, icerik } of ortak)
      for (const yol of importlar(icerik))
        expect(yol, f).not.toMatch(
          /(^|\/)(ok-mu-nok|on-on-ama|casus-kim)(\/|$)/,
        );
  });
});
