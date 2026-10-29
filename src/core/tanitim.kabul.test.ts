import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { kabulTanitimMantik as kabul } from '../kabul';
import {
  EKIP_ANAHTARI,
  OYUN_ANAHTARI,
  type Depo,
  oyunKaydet,
  oyunOku,
} from './kayit';
import {
  TANITIM_ANAHTARI,
  tanitimGerekli,
  tanitimGorulduMu,
  tanitimiIsaretle,
} from './tanitim';
import { depoYap } from '../test/yardimci';

// KK-73, KK-74, KK-75, KK-78: görüldü bilgisi ve gösterim politikası. Sahte depo, ağsız.
const bozukDepo = (hata: 'oku' | 'yaz'): Depo => ({
  getItem: async () => {
    if (hata === 'oku') throw new Error('depo okunamadı');
    return null;
  },
  setItem: async () => {
    if (hata === 'yaz') throw new Error('depo yazılamadı');
  },
  removeItem: async () => {},
});

describe('KK-73/KK-74: görüldü bilgisi', () => {
  kabul(
    'ilk kez: görülmedi; "Tamam" sonrası görüldü; yeniden başlatmada (aynı depo) kalır',
    async () => {
      const depo = depoYap();
      expect(await tanitimGorulduMu(depo, 'ok-mu-nok')).toBe(false);
      await tanitimiIsaretle(depo, 'ok-mu-nok');
      expect(await tanitimGorulduMu(depo, 'ok-mu-nok')).toBe(true);
      // Uygulama kapanıp açılınca: yalnızca depo kalır, bellek yok.
      expect(await tanitimGorulduMu(depo, 'ok-mu-nok')).toBe(true);
      expect(depo.veri.has(TANITIM_ANAHTARI)).toBe(true);
    },
  );

  kabul(
    'her oyun ayrı tutulur; bir oyunu işaretlemek diğerlerini ne gösterir ne siler',
    async () => {
      const depo = depoYap();
      await tanitimiIsaretle(depo, 'casus-kim');
      expect(await tanitimGorulduMu(depo, 'casus-kim')).toBe(true);
      expect(await tanitimGorulduMu(depo, 'ok-mu-nok')).toBe(false);
      expect(await tanitimGorulduMu(depo, '10-10-ama')).toBe(false);
      await tanitimiIsaretle(depo, 'ok-mu-nok');
      await tanitimiIsaretle(depo, 'casus-kim'); // tekrar işaretlemek zararsız
      expect(await tanitimGorulduMu(depo, 'casus-kim')).toBe(true);
      expect(await tanitimGorulduMu(depo, 'ok-mu-nok')).toBe(true);
      expect(await tanitimGorulduMu(depo, '10-10-ama')).toBe(false);
    },
  );

  kabul(
    'görülmedi sayılan her durumda gösterilir: bozuk kayıt, yanlış tür, depo okuma hatası; çökmez',
    async () => {
      for (const ham of [
        'bozuk{',
        '[]',
        'null',
        '42',
        '"x"',
        '{"ok-mu-nok":"evet"}',
        '{"ok-mu-nok":1}',
      ]) {
        const depo = depoYap();
        depo.veri.set(TANITIM_ANAHTARI, ham);
        expect(await tanitimGorulduMu(depo, 'ok-mu-nok'), ham).toBe(false);
      }
      expect(await tanitimGorulduMu(bozukDepo('oku'), 'ok-mu-nok')).toBe(false);
    },
  );

  kabul(
    'bozuk kayıttan sonra "Tamam" kaydı düzeltir; depo yazma hatası akışı bozmaz',
    async () => {
      const depo = depoYap();
      depo.veri.set(TANITIM_ANAHTARI, 'bozuk{');
      await tanitimiIsaretle(depo, 'ok-mu-nok');
      expect(await tanitimGorulduMu(depo, 'ok-mu-nok')).toBe(true);
      await expect(
        tanitimiIsaretle(bozukDepo('yaz'), 'ok-mu-nok'),
      ).resolves.toBeUndefined();
    },
  );

  kabul(
    'yarım oyun ve son ekip kayıtlarına dokunmaz; oyun kaydı silinse tanıtım kalır',
    async () => {
      const depo = depoYap();
      await oyunKaydet(depo, { asama: 'oy' });
      depo.veri.set(EKIP_ANAHTARI, JSON.stringify(['Ali', 'Ayşe']));
      const once = [depo.veri.get(OYUN_ANAHTARI), depo.veri.get(EKIP_ANAHTARI)];
      await tanitimiIsaretle(depo, 'ok-mu-nok');
      expect([
        depo.veri.get(OYUN_ANAHTARI),
        depo.veri.get(EKIP_ANAHTARI),
      ]).toEqual(once);
      depo.veri.set(OYUN_ANAHTARI, 'bozuk{'); // bozuk oyun kaydı temizlenir
      expect(await oyunOku(depo)).toBeNull();
      expect(await tanitimGorulduMu(depo, 'ok-mu-nok')).toBe(true);
    },
  );
});

describe('KK-73/KK-75/KK-78: gösterim politikası', () => {
  kabul(
    'ana ekrandan ilk seçim ve odaya ilk katılım: yalnızca görülmediyse',
    () => {
      expect(tanitimGerekli(false, 'secim')).toBe(true);
      expect(tanitimGerekli(true, 'secim')).toBe(false);
      expect(tanitimGerekli(false, 'lobi')).toBe(true);
      expect(tanitimGerekli(true, 'lobi')).toBe(false);
    },
  );

  kabul(
    '"Devam et" hiçbir zaman tanıtım göstermez (görülmemiş olsa bile)',
    () => {
      expect(tanitimGerekli(false, 'devam')).toBe(false);
      expect(tanitimGerekli(true, 'devam')).toBe(false);
    },
  );
});

describe('KK-74: bilgi yalnızca telefonda (saflık)', () => {
  it('src/core/tanitim.ts ağ kullanmaz ve React/ekran içe aktarmaz', () => {
    const icerik = readFileSync(
      new URL('./tanitim.ts', import.meta.url),
      'utf8',
    );
    expect(icerik).not.toMatch(
      /Date\.now\(|Math\.random\(|WebSocket|\bfetch\(|XMLHttpRequest/,
    );
    expect(icerik).not.toMatch(
      /from ['"](react|react-native|expo|\.\.\/oda|\.\.\/baglanti)/,
    );
  });
});
