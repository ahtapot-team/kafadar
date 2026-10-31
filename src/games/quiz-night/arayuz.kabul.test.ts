// Quiz Night Faz 1 (issue #222): ekranların saf kuralları — KK-107, KK-108, KK-110, KK-111, KK-112.
// Arayüz test aracı yok (Semih 1C): görünüm kararları saf fonksiyon olarak sınanır; ekran bağlantısı (testID/kaynak sözleşmesi)
// #221 tasarımı gelince bu dosyaya eklenir (#224 öncesi). Dokunma/titreşim/paylaşım telefonda insanlarca doğrulanır.
// SÖZLEŞME (frontend #224 için) — src/games/quiz-night/arayuz.ts (React yok):
//   MODLAR = [{ id:'tek', etiket:'Tek başına' }, { id:'grup', etiket:'Tek telefonda grup' },
//             { id:'oda-kur', etiket:'Oda kur' }, { id:'oda-katil', etiket:'Odaya katıl' }]
//   gorunenModlar(odaAcik = false): Faz 1'de yalnızca 'tek' ve 'grup'; odaAcik=true (Faz 2) dördü
//   paketBasligi(ad) = `Ne kadar ${ad} fanısın?` · PAKET_NOTU = 'Resmî değildir · Spoiler içerir'
//   kokenEtiketi('tr') = 'Türk' · kokenEtiketi('yabanci') = 'Yabancı'
//   KOKEN_CIPLERI = ['tumu','tr','yabanci'] (varsayılan 'tumu') · paketSuz(paketler, cip): koken'e göre süzer, sıra korunur
//   ilerlemeMetni(indeks0, toplam = 10) = '3/10' (indeks0 = 2) · zorlukEtiketi('kolay'|'orta'|'zor') = 'Kolay'|'Orta'|'Zor' (yazıyla)
//   sikRengi(sik, dogru, secilen: number|null): 'ok' | 'nok' | 'notr'
//       secilen null → hepsi 'notr'; doğru şık 'ok'; yanlış seçilen 'nok'; diğerleri 'notr'
//   cevapKilitle(mevcut: number|null, yeni: number): number   ilk seçim kalır (değiştirilemez)
//   SONRAKI_BEKLEME_MS ∈ [1000, 2000] (≈1,5 sn) · SOLO_TITRESIM: yanlış cevapta titreşim (telefonda doğrulanır)
//   grupSikRengi(sik, dogru, gosterildi: boolean): 'ok' | 'notr'   gosterildi=false → doğru dahil hepsi 'notr' (ipucu yok)
//   sonucMetni(puan, toplam = 10) = '8/10'
import { describe, expect, it } from 'vitest';
import { BEKLEYEN } from '../../kabul';

const kabulQuiz = BEKLEYEN.quiz ? it.fails : it;

type Arayuz = {
  MODLAR: { id: string; etiket: string }[];
  gorunenModlar(odaAcik?: boolean): { id: string; etiket: string }[];
  paketBasligi(ad: string): string;
  PAKET_NOTU: string;
  kokenEtiketi(k: 'tr' | 'yabanci'): string;
  KOKEN_CIPLERI: string[];
  paketSuz<T extends { koken: 'tr' | 'yabanci' }>(p: T[], cip: string): T[];
  ilerlemeMetni(indeks: number, toplam?: number): string;
  zorlukEtiketi(z: 'kolay' | 'orta' | 'zor'): string;
  sikRengi(sik: number, dogru: number, secilen: number | null): string;
  cevapKilitle(mevcut: number | null, yeni: number): number;
  SONRAKI_BEKLEME_MS: number;
  grupSikRengi(sik: number, dogru: number, gosterildi: boolean): string;
  sonucMetni(puan: number, toplam?: number): string;
};
const yol = './arayuz';
const yukle = async () =>
  (await import(/* @vite-ignore */ yol)) as unknown as Arayuz;
const SIKLAR = [0, 1, 2, 3];

describe('KK-107: mod seçimi', () => {
  kabulQuiz(
    "KK-107: dört mod tanımlıdır; Faz 1'de yalnızca Tek başına ve Tek telefonda grup görünür",
    async () => {
      const { MODLAR, gorunenModlar } = await yukle();
      expect(MODLAR.map((m) => m.etiket)).toEqual([
        'Tek başına',
        'Tek telefonda grup',
        'Oda kur',
        'Odaya katıl',
      ]);
      expect(gorunenModlar().map((m) => m.id)).toEqual(['tek', 'grup']);
      expect(gorunenModlar(false).map((m) => m.id)).toEqual(['tek', 'grup']);
      expect(gorunenModlar(true).map((m) => m.id)).toEqual([
        'tek',
        'grup',
        'oda-kur',
        'oda-katil',
      ]);
    },
  );
});

describe('KK-108: paket kartı ve Türk / Yabancı süzgeci', () => {
  kabulQuiz(
    'KK-108: başlık düz metin "Ne kadar <ad> fanısın?", etiketler ve not',
    async () => {
      const { paketBasligi, kokenEtiketi, PAKET_NOTU } = await yukle();
      expect(paketBasligi('Kurtlar Vadisi')).toBe(
        'Ne kadar Kurtlar Vadisi fanısın?',
      );
      expect(paketBasligi('X')).toBe('Ne kadar X fanısın?');
      expect(kokenEtiketi('tr')).toBe('Türk');
      expect(kokenEtiketi('yabanci')).toBe('Yabancı');
      expect(PAKET_NOTU).toBe('Resmî değildir · Spoiler içerir');
    },
  );

  kabulQuiz(
    "KK-108: çipler Tümü · Türk · Yabancı; süzgeç koken'e göre, sıra korunur; Tümü hepsini verir",
    async () => {
      const { KOKEN_CIPLERI, paketSuz } = await yukle();
      expect(KOKEN_CIPLERI).toEqual(['tumu', 'tr', 'yabanci']);
      const p = [
        { id: 'a', koken: 'tr' as const },
        { id: 'b', koken: 'yabanci' as const },
        { id: 'c', koken: 'tr' as const },
      ];
      expect(paketSuz(p, 'tumu').map((x) => x.id)).toEqual(['a', 'b', 'c']);
      expect(paketSuz(p, 'tr').map((x) => x.id)).toEqual(['a', 'c']);
      expect(paketSuz(p, 'yabanci').map((x) => x.id)).toEqual(['b']);
    },
  );
});

describe('KK-110: soru ekranı (tek başına)', () => {
  kabulQuiz('KK-110: "3/10" ilerleme ve zorluk yazıyla', async () => {
    const { ilerlemeMetni, zorlukEtiketi } = await yukle();
    expect(ilerlemeMetni(0)).toBe('1/10');
    expect(ilerlemeMetni(2)).toBe('3/10');
    expect(ilerlemeMetni(9)).toBe('10/10');
    expect(ilerlemeMetni(2, 10)).toBe('3/10');
    expect(zorlukEtiketi('kolay')).toBe('Kolay');
    expect(zorlukEtiketi('orta')).toBe('Orta');
    expect(zorlukEtiketi('zor')).toBe('Zor');
  });

  kabulQuiz(
    'KK-110: doğru şık ok, yanlış seçilen nok, diğerleri nötr; cevap öncesi hepsi nötr',
    async () => {
      const { sikRengi } = await yukle();
      for (const d of SIKLAR) {
        expect(SIKLAR.map((s) => sikRengi(s, d, null))).toEqual(
          Array(4).fill('notr'),
        );
        expect(SIKLAR.map((s) => sikRengi(s, d, d))).toEqual(
          SIKLAR.map((s) => (s === d ? 'ok' : 'notr')),
        );
      }
      const yanlis = SIKLAR.map((s) => sikRengi(s, 1, 3)); // doğru 1, seçilen 3
      expect(yanlis).toEqual(['notr', 'ok', 'notr', 'nok']);
    },
  );

  kabulQuiz(
    'KK-110: ilk cevap kilitlenir, değiştirilemez; ~1,5 sn sonra sıradaki soru',
    async () => {
      const { cevapKilitle, SONRAKI_BEKLEME_MS } = await yukle();
      expect(cevapKilitle(null, 2)).toBe(2);
      expect(cevapKilitle(2, 0)).toBe(2);
      expect(cevapKilitle(0, 3)).toBe(0); // 0 da kilitli sayılır (falsy tuzağı)
      expect(SONRAKI_BEKLEME_MS).toBeGreaterThanOrEqual(1000);
      expect(SONRAKI_BEKLEME_MS).toBeLessThanOrEqual(2000);
    },
  );
});

describe('KK-112: grup modunda doğru cevap "Cevabı göster"e kadar belli olmaz', () => {
  kabulQuiz(
    'KK-112: gösterilmeden hiçbir şık farklı görünmez; gösterilince yalnızca doğru ok',
    async () => {
      const { grupSikRengi } = await yukle();
      for (const d of SIKLAR) {
        expect(SIKLAR.map((s) => grupSikRengi(s, d, false))).toEqual(
          Array(4).fill('notr'),
        );
        expect(SIKLAR.map((s) => grupSikRengi(s, d, true))).toEqual(
          SIKLAR.map((s) => (s === d ? 'ok' : 'notr')),
        );
      }
    },
  );
});

describe('KK-111: sonuç ekranı puan metni', () => {
  kabulQuiz('KK-111: büyük puan "8/10" biçiminde', async () => {
    const { sonucMetni } = await yukle();
    expect(sonucMetni(8)).toBe('8/10');
    expect(sonucMetni(0)).toBe('0/10');
    expect(sonucMetni(10, 10)).toBe('10/10');
  });
});
