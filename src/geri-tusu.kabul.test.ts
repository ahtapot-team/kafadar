// #45: web'de oyun içi Oyuncular → Tamam sonrası "Oyundan çık?" yanlışlıkla açılıyordu.
// Arayüz test aracı yok (Semih 1C): sözleşme kaynak düzeyinde; davranış önizlemede elle doğrulanır.
// Test adları bilerek "KK-" önekiyle başlamaz (PRD KK haritasıyla çakışır, #168); #45-n = issue kriteri n.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { kaynaklar } from './test/yardimci';

const oku = (yol: string) =>
  readFileSync(new URL(`../${yol}`, import.meta.url), 'utf8');

// app/oyun.tsx içindeki popstate işleyicisinin gövdesi.
const popstateGovde = () => {
  const k = oku('app/oyun.tsx');
  const bas = k.indexOf('const geriGeldi');
  const son = k.indexOf("addEventListener('popstate'");
  expect(bas, 'geriGeldi işleyicisi').toBeGreaterThan(-1);
  expect(son, 'popstate dinleyicisi').toBeGreaterThan(bas);
  return k.slice(bas, son);
};

describe('#45: oyun içi Oyuncular → Tamam çıkış penceresi açmaz (web)', () => {
  it('#45-1: Tamam ile dönüş (router.back) popstate\'te "Oyundan çık?" açmaz', () => {
    // Çözüm ya Tamam'da router.back() kullanmamaktır ya da popstate işleyicisi
    // uygulamanın kendi gezinmesini (izinli dışında bir koşulla) yok sayar.
    const oyuncular = oku('app/oyuncular.tsx');
    const bitti = oyuncular.slice(
      oyuncular.indexOf('const bitti'),
      oyuncular.indexOf('return (', oyuncular.indexOf('const bitti')),
    );
    const backKullaniyor = /router\.back\(\)/.test(bitti);
    const govde = popstateGovde();
    const korumalar = [...govde.matchAll(/if \(([^)]*)\) return/g)].map((m) =>
      m[1].trim(),
    );
    const ekKoruma = korumalar.some((k) => k !== 'izinli.current');
    expect(!backKullaniyor || ekKoruma).toBe(true);
  });

  it('#45-1b: oyundan çıkış yolları (Çık, ana menü) hâlâ izinli bayrağıyla onaysız çalışır', () => {
    const k = oku('app/oyun.tsx');
    expect(k).toMatch(/izinli\.current = true/);
    expect(popstateGovde()).toContain('izinli.current');
  });
});

describe('KK-26: oyun ekranında tarayıcı geri tuşu "Oyundan çık?" açar (#45 kriter 2)', () => {
  it('#45-2: popstate dinleyicisi, geçmiş girdisi ve onay açma korunur', () => {
    const k = oku('app/oyun.tsx');
    expect(k).toContain("Platform.OS !== 'web'");
    expect(k).toContain('history.pushState');
    expect(k).toContain("addEventListener('popstate'");
    expect(k).toContain("removeEventListener('popstate'");
    expect(popstateGovde()).toContain('setCikisOnayi(true)');
    expect(k).toContain('Oyundan çık?');
    for (const t of ['cikis-onay-evet', 'cikis-onay-hayir'])
      expect(k, t).toContain(t);
  });

  it('#45-2b: mobil geri (beforeRemove) onayı korunur', () => {
    const k = oku('app/oyun.tsx');
    expect(k).toContain("addListener('beforeRemove'");
    expect(k).toContain('e.preventDefault()');
  });
});

describe('KK-26: oyun dışı ekranlarda Geri değişmeden çalışır (#45 kriter 3)', () => {
  it('#45-3: Geri çubuğu Oyuncular (oyun öncesi), Paket, Ayarlar, Mod ekranlarında durur', () => {
    for (const f of [
      'app/oyuncular.tsx',
      'app/paket.tsx',
      'app/ayarlar.tsx',
      'app/mod.tsx',
    ]) {
      const k = oku(f);
      expect(k, f).toContain('GeriCubugu');
      expect(k, f).toContain('testID="geri"');
    }
    expect(oku('app/oyuncular.tsx')).toMatch(/!oyunda\s*&&\s*<GeriCubugu/);
  });

  it('#45-3b: GeriCubugu önceki ekrana döner, geçmiş yoksa ana ekrana gider', () => {
    const k = oku('src/ui.tsx');
    expect(k).toMatch(/router\.canGoBack\(\)\s*\?\s*router\.back\(\)/);
    expect(k).toContain("router.replace('/')");
  });

  it('#45-3c: popstate koruması yalnızca oyun ekranlarında (oyun dışına sızmaz)', () => {
    const sahipler = kaynaklar('app')
      .filter((d) => d.icerik.includes('popstate'))
      .map((d) => d.f)
      .sort();
    expect(sahipler).toEqual(['app/oda/oyun.tsx', 'app/oyun.tsx']);
    // src/ui.tsx (GeriCubugu) popstate dinlemez.
    expect(oku('src/ui.tsx')).not.toContain('popstate');
  });
});
