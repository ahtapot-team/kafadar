// #198/#199: v8 açılış ekranı telefonda (native) çöküyordu; web'de görünmez. Kaynak sözleşmesi testleri.
// Sözleşme:
//   1) withTiming/withSpring/withDecay/withDelay/withSequence/withRepeat geri çağrısı UI thread'inde çalışır;
//      içinde JS fonksiyonu yalnızca runOnJS(fn)(…) ya da scheduleOnRN(fn, …) ile çağrılır.
//   2) app/_layout.tsx <Yigin />'ı yazı tipi hazır (ya da hatalı) olunca render eder (aksi halde ekranlar sistem fontunda kalır);
//      açılış aşamasına (asama) bağlı değildir ve açılış ekranı üstüne biner.
import { describe, expect, it } from 'vitest';
import { dosyaIcerik, kaynaklar } from './test/yardimci';

const ANIMASYON = /\bwith(?:Timing|Spring|Decay|Delay|Sequence|Repeat)\s*\(/g;
const ANAHTAR = new Set(['if', 'for', 'while', 'switch', 'return', 'function']);

// `bas` (açılış parantezinden sonraki indeks) için eşleşen kapanışa kadar gövde.
const govde = (s: string, bas: number) => {
  let d = 1;
  for (let i = bas; i < s.length; i++) {
    if (s[i] === '(') d++;
    else if (s[i] === ')' && --d === 0) return s.slice(bas, i);
  }
  return s.slice(bas);
};

// Geri çağrı gövdelerinde runOnJS/scheduleOnRN dışındaki fonksiyon çağrıları.
const ihlaller = (kaynak: string) => {
  const sonuc: string[] = [];
  for (const m of kaynak.matchAll(ANIMASYON)) {
    const arg = govde(kaynak, (m.index ?? 0) + m[0].length);
    const ok = arg.indexOf('=>');
    if (ok < 0) continue;
    const cb = arg
      .slice(ok + 2)
      .replace(/\b(?:runOnJS|scheduleOnRN)\s*\([^)]*\)(?:\s*\([^)]*\))?/g, '');
    for (const c of cb.matchAll(/([A-Za-z_$][\w$.]*)\s*\(/g))
      if (
        !ANAHTAR.has(c[1]) &&
        !/^with(Timing|Spring|Decay|Delay|Sequence|Repeat)$/.test(c[1])
      )
        sonuc.push(c[1]);
  }
  return sonuc;
};

describe('#198: animasyon geri çağrılarında JS fonksiyonu runOnJS/scheduleOnRN ile çağrılır', () => {
  it('K1: src/acilis geri çağrısı onBitti()yi doğrudan çağırmaz', () => {
    const ekran = dosyaIcerik('src/acilis/ekran.tsx');
    expect(ekran).toMatch(ANIMASYON);
    expect(ihlaller(ekran)).toEqual([]);
  });

  it('K1: app ve src kaynaklarında korumasız geri çağrı yok', () => {
    const kotu = [...kaynaklar('app'), ...kaynaklar('src')]
      .map(({ f, icerik }) => ({ f, c: ihlaller(icerik) }))
      .filter((x) => x.c.length > 0);
    expect(kotu).toEqual([]);
  });

  it('K1: denetleyici doğru çalışır (korumalı geçer, korumasız yakalanır)', () => {
    expect(
      ihlaller('x.value = withTiming(0, {}, (b) => { if (b) onBitti(); });'),
    ).toEqual(['onBitti']);
    expect(
      ihlaller(
        'x.value = withTiming(0, {}, (b) => { if (b) runOnJS(onBitti)(); });',
      ),
    ).toEqual([]);
    expect(
      ihlaller(
        'x.value = withTiming(0, {}, (b) => { if (b) scheduleOnRN(onBitti); });',
      ),
    ).toEqual([]);
    expect(
      ihlaller('x.value = withDelay(150, withTiming(0, { duration: 1 }));'),
    ).toEqual([]);
  });
});

describe('#198: _layout yığını yazı tipi hazır olunca render eder', () => {
  it('K6: <Yigin /> yalnızca yazı tipi hazır/hatalı koşuluna bağlıdır, açılış aşamasına değil', () => {
    const l = dosyaIcerik('app/_layout.tsx');
    expect(l).toMatch(
      /\(fontHazir\s*\|\|\s*!!fontHatasi\)\s*&&\s*<Yigin\s*\/>/,
    );
    expect(l).not.toMatch(/asama\s*!==\s*'acilis'/);
  });

  it('K2: açılış ekranı yığından sonra (üstte) render edilir', () => {
    const l = dosyaIcerik('app/_layout.tsx');
    expect(l.indexOf('<Yigin')).toBeGreaterThan(0);
    expect(l.indexOf('<AcilisEkrani')).toBeGreaterThan(l.lastIndexOf('<Yigin'));
  });
});
