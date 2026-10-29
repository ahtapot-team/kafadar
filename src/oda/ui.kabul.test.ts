import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dosyaIcerik, kaynaklar } from '../test/yardimci';

describe('oda modu: arayüz ve altyapı sözleşmesi (KK-28…KK-40)', () => {
  // Arayüz test aracı yok (Semih 1C): ekran sözleşmesi kaynak düzeyinde; davranış önizlemede ve
  // gerçek cihazda (docs/GERCEK-CIHAZ-KONTROL.md, KK-41) doğrulanır.
  const TESTIDLER = [
    'mod-tek-telefon', // KK-28
    'mod-oda-kur',
    'mod-odaya-katil',
    'oda-kodu', // KK-29
    'oda-qr',
    'katil-kod', // KK-30
    'katil-ad',
    'katil-gonder',
    'katil-hata',
    'lobi-oyuncu-', // KK-31 (sıra eki)
    'lobi-baslat',
    'oda-soru', // KK-32
    'oda-geri-sayim',
    'oda-oy-ok',
    'oda-oy-nok',
    'oda-bekle-sayac', // KK-34
    'yeniden-baglaniyor', // KK-37
    'final-yuzdeler', // KK-36
    'final-kim-ne-dedi',
    'final-kisisel',
    'final-paylas',
    'final-tekrar',
  ];

  it('oda ekranları sözleşmedeki testID adlarını kullanır', () => {
    const kaynak = [...kaynaklar('app'), ...kaynaklar('src')]
      .map(({ icerik }) => icerik)
      .join('\n');
    const eksik = TESTIDLER.filter((t) => !kaynak.includes(t));
    expect(eksik).toEqual([]);
  });

  it("sunucu main'e merge edilince otomatik dağıtılır (wrangler, push main)", () => {
    const klasor = new URL('../../.github/workflows/', import.meta.url);
    const akislar = readdirSync(klasor).map((f) =>
      readFileSync(new URL(f, klasor), 'utf8'),
    );
    const dagitim = akislar.filter(
      (a) => /wrangler/.test(a) && /deploy/.test(a),
    );
    expect(dagitim.length).toBeGreaterThan(0);
    expect(dagitim.some((a) => /branches:\s*\[\s*main\s*\]/.test(a))).toBe(
      true,
    );
  });

  it('oda mantığı saf: src/oda içinde Date.now, Math.random, ağ ve React yok (KK-40)', () => {
    const dosyalar = kaynaklar('src/oda');
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(
        /Date\.now\(|Math\.random\(|WebSocket|\bfetch\(/,
      );
      expect(icerik, f).not.toMatch(/from ['"](react|react-native|expo)/);
    }
  });

  it('tek telefon modu çevrimdışı kalır: çekirdek ve OK mu NOK mu mantığı ağ kullanmaz (KK-28)', () => {
    const dosyalar = [
      ...kaynaklar('src/core'),
      ...kaynaklar('src/games/ok-mu-nok'),
    ];
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(/WebSocket|\bfetch\(|from ['"].*\/oda\//);
    }
  });

  it('gerçek cihaz listesinde KK-41 bölümü var', () => {
    const liste = dosyaIcerik('docs/GERCEK-CIHAZ-KONTROL.md');
    expect(liste).toMatch(/KK-41/);
    expect(liste).toMatch(/arka plan/i);
    expect(liste).toMatch(/uçak modu/i);
  });
});

describe('oda sunucu kabuğu: belirteç sunucuda, kriptografik üretilir (#48)', () => {
  const tsDosyalari = (klasor: string): { f: string; icerik: string }[] =>
    readdirSync(new URL(`../../${klasor}`, import.meta.url), {
      recursive: true,
    })
      .map(String)
      .filter(
        (f) =>
          /\.ts$/.test(f) &&
          !f.includes('node_modules') &&
          !f.includes('.test.'),
      )
      .map((f) => ({
        f: `${klasor}/${f}`,
        icerik: readFileSync(
          new URL(`../../${klasor}/${f}`, import.meta.url),
          'utf8',
        ),
      }));

  it('katil olayını işleyen sunucu kodu crypto ile ürettiği kimlik verir', () => {
    const adaylar = ['.', 'sunucu', 'worker', 'src']
      .flatMap((k) => {
        try {
          return tsDosyalari(k);
        } catch {
          return [];
        }
      })
      .filter(
        ({ f }) =>
          !f.replace(/^\.\//, '').startsWith('src/oda/') &&
          !f.includes('node_modules'),
      )
      .filter(({ icerik }) => /tip:\s*['"]katil['"]/.test(icerik));
    expect(adaylar.length).toBeGreaterThan(0);
    for (const { f, icerik } of adaylar) {
      expect(icerik, f).toMatch(/crypto\.randomUUID\(|getRandomValues\(/);
      expect(icerik, f).toMatch(/tip:\s*['"]katil['"][^}]*kimlik/s);
    }
  });
});

describe('oyuncu belirteci adreste değil, ilk WebSocket mesajında (güvenlik)', () => {
  // URL'ler Cloudflare/proxy günlüklerinde saklanır; belirteç gizli kalmalı. Sunucu ve istemci birlikte değişir,
  // bu yüzden tek test ikisini birden ister (son merge edilen bayrağı kapatır).
  it('sunucu adresten kimlik okumaz, istemci adrese kimlik koymaz; ilk mesaj {t:"kimlik"}', () => {
    const sunucu = kaynaklar('sunucu/src')
      .map(({ icerik }) => icerik)
      .join('\n');
    expect(sunucu).not.toMatch(/searchParams\.get\(\s*['"]kimlik['"]\s*\)/);
    expect(sunucu).toMatch(/['"]kimlik['"]/);
    expect(sunucu).toMatch(/t\s*===?\s*['"]kimlik['"]|t:\s*['"]kimlik['"]/);
    const mesaj = dosyaIcerik('src/oda/mesaj.ts');
    expect(mesaj).not.toMatch(/islem:\s*['"]don['"][^}]*kimlik/);
    expect(mesaj).toMatch(/t:\s*['"]kimlik['"]/);
    const ws = dosyaIcerik('src/baglanti/ws.ts');
    expect(ws).toMatch(/t:\s*['"]kimlik['"]/);
  });
});

describe('oda modu: oyun içinde odadan çık (#73, KK-38)', () => {
  // Ekran sözleşmesi kaynak düzeyinde; asıl davranış önizlemede 3 sekmeyle denenir.
  const oda = () =>
    [...kaynaklar('app/oda'), ...kaynaklar('src/oda-ui')].map((k) => k.icerik);

  it('oda ekranları çıkış ikonu ve onay testID adlarını taşır', () => {
    const kaynak = oda().join('\n');
    for (const t of ['oda-cik', 'cikis-onay-evet', 'cikis-onay-hayir'])
      expect(kaynak, t).toContain(t);
    expect(kaynak).toContain('oda-ayrildi'); // diğer telefonlarda "X ayrıldı"
  });

  it('geri tuşu/hareketi ve ikon "Odadan çık?" onayını açar', () => {
    const kaynak = oda().join('\n');
    expect(kaynak).toContain('Odadan çık?');
    expect(kaynak).toMatch(/beforeRemove|BackHandler|popstate/);
  });

  it('çıkış onayı "Oyuna dön" seçeneğiyle oyuna geri dönüş sunar (onaysız çıkış yok)', () => {
    const kaynak = oda().join('\n');
    expect(kaynak).toContain('Oyuna dön');
    expect(kaynak).toMatch(/leave|ayril|ayrıl/i);
  });
});

describe('10/10 ama oda modu: istemci ekranları sözleşmesi (#125, KK-63…KK-69)', () => {
  // Arayüz test aracı yok (Semih 1C): sözleşme kaynak düzeyinde; davranış önizlemede 3 sekmeyle doğrulanır.
  const TESTIDLER = [
    'oda-onon-paket-', // KK-63: kurulumda paket seçimi (oda-onon-paket-arkadas / -gundelik / -sevgili)
    'oda-onon-kart-metni', // KK-64/KK-67: puan, bekleme ve açıklamada kart metni görünür
    'oda-onon-puan-', // KK-65: 0–10 tuşları (oda-onon-puan-0 … oda-onon-puan-10)
    'oda-onon-puanim', // KK-65: puan veren kendi puanını görür
    'oda-onon-ortalama', // KK-67
    'oda-onon-en-dusuk',
    'oda-onon-en-yuksek',
    'oda-onon-bolundu',
    'oda-onon-oybirligi',
    'oda-onon-konfeti',
    'oda-onon-satir-', // herkesin puanı (oda-onon-satir-<i>, puanSirasi sırasıyla)
    'oda-onon-sonraki', // KK-68: yalnızca yetkilide
    'oda-onon-kuran-bekleniyor',
    'oda-onon-odul-en-acimasiz', // KK-69
    'oda-onon-odul-melek-kalpli',
    'oda-onon-odul-ruh-ikizleri',
    'oda-onon-kisisel',
    'oda-onon-paylas',
    'oda-onon-tekrar',
  ];
  const oda = () => [...kaynaklar('app'), ...kaynaklar('src/oda-ui')];
  const birlesik = () =>
    oda()
      .map(({ icerik }) => icerik)
      .join('\n');

  it('oda ekranları sözleşmedeki testID adlarını kullanır', () => {
    const kaynak = birlesik();
    expect(TESTIDLER.filter((t) => !kaynak.includes(t))).toEqual([]);
  });

  it('10/10 ama kayıt listesinde mod seçimi açık (Tek telefon / Oda kur / Odaya katıl, KK-63)', () => {
    const kayit = dosyaIcerik('src/games/registry.ts');
    expect(kayit).toMatch(/id:\s*'10-10-ama'[^}]*modSecimi:\s*true/s);
  });

  it('ekran türü odanın türünden seçilir: odaTuru() oda ekranlarında kullanılır (KK-63)', () => {
    expect(birlesik()).toMatch(/odaTuru\(/);
  });

  it('kart metni puan ve açıklama ekranlarında görünür kalır (KK-64, KK-67)', () => {
    const dosyalar = oda();
    const puan = dosyalar.filter(({ icerik }) =>
      icerik.includes('oda-onon-puan-'),
    );
    const acik = dosyalar.filter(({ icerik }) =>
      icerik.includes('oda-onon-ortalama'),
    );
    expect(puan.length).toBeGreaterThan(0);
    expect(acik.length).toBeGreaterThan(0);
    for (const { f, icerik } of [...puan, ...acik])
      expect(icerik, f).toMatch(/testID="oda-onon-kart-metni"/);
  });

  it('"Kuran kişi bekleniyor…" metni ve sonrakiGorunur kullanılır; Sonraki kart yetkisiz görünmez (KK-68)', () => {
    const kaynak = birlesik();
    expect(kaynak).toContain('Kuran kişi bekleniyor');
    expect(kaynak).toMatch(/sonrakiGorunur/);
  });

  it('"Hareketi azalt" açıkken konfeti/açıklama sade (KK-67)', () => {
    const konfeti = oda().filter(({ icerik }) =>
      icerik.includes('oda-onon-konfeti'),
    );
    expect(konfeti.length).toBeGreaterThan(0);
    for (const { f, icerik } of konfeti)
      expect(icerik, f).toMatch(/azalt|hareketAzalt|reduceMotion/i);
  });

  it('puan tuşları 0–10 arası sayı üretir ve istemci.puanla çağrılır (KK-65)', () => {
    const kaynak = birlesik();
    expect(kaynak).toMatch(/\.puanla\(/);
    expect(kaynak).toMatch(/\.sonraki\(/);
  });

  it('OK mu NOK mu oda ekranları ve tek telefon 10/10 ama bozulmaz: eski testID adları yerinde', () => {
    const kaynak = birlesik();
    for (const t of [
      'oda-oy-ok',
      'oda-oy-nok',
      'oda-soru',
      'final-yuzdeler',
      'final-tekrar',
    ])
      expect(kaynak, t).toContain(t);
    expect(kaynaklar('src/oyun-ekranlari/on-on-ama').length).toBeGreaterThan(0);
  });
});
