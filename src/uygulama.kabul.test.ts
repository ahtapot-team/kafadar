import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { desteHatalari } from './core/deste';
import {
  kabul,
  kabulCila,
  kabulKk25,
  kabulKk26,
  kabulKk27,
  kabulOda,
  kabulOdaDeploy,
  kabulOdaGuvenlik,
  kabulCasusUi,
  kabulCasusUiSon,
  kabulCasusKayitUi,
  kabulOdaKimlik,
  kabulOdaCik,
  kabulOnonUi,
} from './kabul';
import { oyunlar } from './games/registry';

describe('KK-1: ana ekran oyun listesi', () => {
  kabul('OK mu NOK mu ve Casus kim aktif; 10/10 ama "Yakında"', () => {
    const aktiflik = Object.fromEntries(oyunlar.map((o) => [o.id, o.aktif]));
    expect(aktiflik).toEqual({
      'ok-mu-nok': true,
      '10-10-ama': false,
      'casus-kim': true, // KK-42: #81'de aktif
    });
  });
});

describe('KK-7 / KK-21: soru desteleri', () => {
  for (const ad of ['arkadas', 'cift', 'aile']) {
    it(`${ad}: en az 100 geçerli kart, sürümlü, kimlikli`, () => {
      const deste = JSON.parse(
        readFileSync(
          new URL(`../content/decks/${ad}.json`, import.meta.url),
          'utf8',
        ),
      );
      expect(deste.deck_id).toBe(ad);
      expect(deste.lang).toBe('tr');
      expect(Number.isInteger(deste.version)).toBe(true);
      expect(deste.cards.length).toBeGreaterThanOrEqual(100);
      expect(desteHatalari(deste)).toEqual([]);
    });
  }
});

// Koruma testleri: bugün geçer, ileride bozulursa kırmızıya döner.
const kaynaklar = (klasor: string) =>
  readdirSync(new URL(`../${klasor}`, import.meta.url), { recursive: true })
    .map(String)
    .filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.'))
    .map((f) => ({
      f: `${klasor}/${f}`,
      icerik: readFileSync(
        new URL(`../${klasor}/${f}`, import.meta.url),
        'utf8',
      ),
    }));

describe('KK-2: oyun eklenti olarak eklenir', () => {
  it('ana ekran ve çekirdek belirli bir oyunu doğrudan içe aktarmaz', () => {
    for (const { f, icerik } of [
      ...kaynaklar('app'),
      ...kaynaklar('src/core'),
    ]) {
      expect(icerik, f).not.toMatch(/ok-mu-nok/);
    }
  });
});

describe('KK-22: oyun mantığı arayüzden ayrı', () => {
  it('çekirdek ve oyun mantığı react / react-native / expo içe aktarmaz', () => {
    const dosyalar = [
      ...kaynaklar('src/core'),
      ...kaynaklar('src/games/ok-mu-nok'),
    ];
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(/from ['"](react|react-native|expo)/);
    }
  });
});

describe('KK-25: kart metni oy girişinde ve açıklamada görünür kalır', () => {
  // Arayüz test aracı yok (Semih 1C): ekranların kart metnini göstermesi kaynak düzeyinde
  // korunur; gerçek görünüm ve boyut (≥16pt) önizlemede ve cihaz listesinde doğrulanır.
  for (const dosya of ['oy', 'acik']) {
    kabulKk25(
      `${dosya}.tsx kart metnini testID="kart-metni" ile gösterir`,
      () => {
        const icerik = readFileSync(
          new URL(`./oyun-ekranlari/ok-mu-nok/${dosya}.tsx`, import.meta.url),
          'utf8',
        );
        expect(icerik).toMatch(/testID="kart-metni"/);
      },
    );
  }
});

const dosyaIcerik = (yol: string) =>
  readFileSync(new URL(`../${yol}`, import.meta.url), 'utf8');

describe('KK-26: oyun dışı ekranlarda Geri, oyun içinde geri yok', () => {
  // Arayüz test aracı yok (Semih 1C): düğmenin varlığı kaynak düzeyinde korunur;
  // "Geri'de bilgiler korunur" ve "Ayarlar'a dönüş" önizlemede tıklanarak doğrulanır.
  for (const ekran of ['oyuncular', 'paket']) {
    kabulKk26(
      `${ekran}.tsx görünür bir Geri düğmesi (testID="geri") içerir`,
      () => {
        expect(dosyaIcerik(`app/${ekran}.tsx`)).toMatch(/testID="geri"/);
      },
    );
  }

  it('ayarlar.tsx Geri düğmesi içerir (zaten var, korunur)', () => {
    expect(dosyaIcerik('app/ayarlar.tsx')).toMatch(/testID="geri"/);
  });

  it('oyun ekranları Geri düğmesi içermez (çıkış onayı vardır, KK-15)', () => {
    const dosyalar = [
      ...kaynaklar('app').filter(({ f }) => f.endsWith('/oyun.tsx')),
      ...kaynaklar('src/oyun-ekranlari'),
    ];
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(/testID="geri"/);
    }
    expect(dosyaIcerik('app/oyun.tsx')).toMatch(/cikis-onay-evet/);
  });
});

describe('KK-27: Ayarlar yalnızca ana ekranda, sağ üstte sabit küçük ikon', () => {
  it('ikon ve /ayarlar gezintisi yalnızca app/index.tsx içinde', () => {
    const dosyalar = [...kaynaklar('app'), ...kaynaklar('src/oyun-ekranlari')];
    for (const { f, icerik } of dosyalar) {
      if (f.endsWith('app/index.tsx') || f.endsWith('app/ayarlar.tsx'))
        continue;
      expect(icerik, f).not.toMatch(/testID="ayarlar(-ikon)?"/);
      expect(icerik, f).not.toMatch(/['"]\/ayarlar['"]/);
    }
  });

  kabulKk27(
    'ana ekranda "Ayarlar" metinli büyük düğme yok, adlı ayarlar ikonu var',
    () => {
      const ana = dosyaIcerik('app/index.tsx');
      expect(ana).toMatch(/testID="ayarlar(-ikon)?"/);
      expect(ana).not.toMatch(/etiket="Ayarlar"/);
      expect(ana).toMatch(/accessibilityLabel="Ayarlar"/); // ikon ekran okuyucuda adlı
    },
  );
});

describe('#36 cila: v1 sonrası küçük açıklar', () => {
  // Arayüz test aracı yok (Semih 1C): kaynak düzeyinde sözleşme; davranışı QA önizlemede doğrular.
  kabulCila(
    "bozuk kayıt okuma sırasında reddedilir: durum.tsx oyunOku'ya doğrulayıcı verir",
    () => {
      // "Devam et" sorusu yalnızca geçerli kayıtta çıkar (KK-14): oyunOku(depo, doğrulayıcı)
      expect(dosyaIcerik('src/durum.tsx')).toMatch(
        /oyunOku(<[^>]+>)?\(\s*depo\s*,/,
      );
    },
  );

  kabulCila('geçersiz adreste Türkçe sade sayfa: app/+not-found.tsx', () => {
    const icerik = dosyaIcerik('app/+not-found.tsx');
    expect(icerik).toMatch(/Sayfa bulunamadı/);
    expect(icerik).toMatch(/testID="ana-ekrana-don"/);
    expect(icerik).not.toMatch(/Unmatched/);
  });

  kabulCila(
    "Paylaş düğmesi web'de gizlenir: düğmenin dosyasında Platform.OS denetimi var",
    () => {
      const dosyalar = kaynaklar('src/oyun-ekranlari').filter(({ icerik }) =>
        /testID="paylas"/.test(icerik),
      );
      expect(dosyalar.length).toBeGreaterThan(0);
      for (const { f, icerik } of dosyalar) {
        expect(icerik, f).toMatch(/Platform\.OS/);
      }
    },
  );

  kabulCila(
    "keep-awake web'de çağrılmaz: app/oyun.tsx koşulsuz useKeepAwake() çağırmaz",
    () => {
      expect(dosyaIcerik('app/oyun.tsx')).not.toMatch(/useKeepAwake\(\s*\)/);
    },
  );
});

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

  kabulOda('oda ekranları sözleşmedeki testID adlarını kullanır', () => {
    const kaynak = [...kaynaklar('app'), ...kaynaklar('src')]
      .map(({ icerik }) => icerik)
      .join('\n');
    const eksik = TESTIDLER.filter((t) => !kaynak.includes(t));
    expect(eksik).toEqual([]);
  });

  kabulOdaDeploy(
    "sunucu main'e merge edilince otomatik dağıtılır (wrangler, push main)",
    () => {
      const klasor = new URL('../.github/workflows/', import.meta.url);
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
    },
  );

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
    readdirSync(new URL(`../${klasor}`, import.meta.url), { recursive: true })
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
          new URL(`../${klasor}/${f}`, import.meta.url),
          'utf8',
        ),
      }));

  kabulOdaGuvenlik(
    'katil olayını işleyen sunucu kodu crypto ile ürettiği kimlik verir',
    () => {
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
    },
  );
});

describe('oyuncu belirteci adreste değil, ilk WebSocket mesajında (güvenlik)', () => {
  // URL'ler Cloudflare/proxy günlüklerinde saklanır; belirteç gizli kalmalı. Sunucu ve istemci birlikte değişir,
  // bu yüzden tek test ikisini birden ister (son merge edilen bayrağı kapatır).
  kabulOdaKimlik(
    'sunucu adresten kimlik okumaz, istemci adrese kimlik koymaz; ilk mesaj {t:"kimlik"}',
    () => {
      const sunucu = dosyaIcerik('sunucu/src/index.ts');
      expect(sunucu).not.toMatch(/searchParams\.get\(\s*['"]kimlik['"]\s*\)/);
      expect(sunucu).toMatch(/['"]kimlik['"]/);
      expect(sunucu).toMatch(/t\s*===?\s*['"]kimlik['"]|t:\s*['"]kimlik['"]/);
      const mesaj = dosyaIcerik('src/oda/mesaj.ts');
      expect(mesaj).not.toMatch(/islem:\s*['"]don['"][^}]*kimlik/);
      expect(mesaj).toMatch(/t:\s*['"]kimlik['"]/);
      const ws = dosyaIcerik('src/baglanti/ws.ts');
      expect(ws).toMatch(/t:\s*['"]kimlik['"]/);
    },
  );
});

describe('Casus kim: kayıt listesi, arayüz ve altyapı sözleşmesi (KK-42…KK-54)', () => {
  const TESTIDLER = [
    'casus-paket-yerler', // KK-43 ayarlar
    'casus-sayi',
    'casus-sure',
    'casus-basla',
    'casus-perde', // KK-44 devir perdesi
    'casus-ben',
    'casus-kart',
    'casus-goruldu',
    'casus-baslayan', // KK-48
    'casus-soru',
    'casus-oylamaya-gec',
    'casus-bitir',
    'casus-oylama', // KK-49
    'casus-oyla-',
    'casus-oy-bitir',
    'casus-aciklama',
    'casus-tahmin-', // KK-50 (6 şık)
    'casus-sonuc',
    'casus-tekrar',
    'casus-paylas',
  ];

  kabulCasusUi('casus-kim kayıt listesinde aktif, ekranı var (KK-42)', () => {
    const kayit = dosyaIcerik('src/games/registry.ts');
    expect(kayit).not.toMatch(/id:\s*'casus-kim'[^}]*aktif:\s*false/);
    expect(kayit).toMatch(/casus-kim/);
    expect(kayit).toMatch(/ekran/);
  });

  kabulCasusKayitUi(
    'Casus ekranı kayıttan okurken durumGecerliMi kullanır (KK-14)',
    () => {
      const dosyalar = [...kaynaklar('app'), ...kaynaklar('src')].filter(
        ({ icerik }) => icerik.includes('casus-kart'),
      );
      expect(dosyalar.length).toBeGreaterThan(0);
      expect(
        dosyalar.some(({ icerik }) =>
          /oyunOku[^;]*durumGecerliMi/s.test(icerik),
        ),
      ).toBe(true);
    },
  );

  kabulCasusUiSon('ekranlar sözleşmedeki testID adlarını kullanır', () => {
    const kaynak = [...kaynaklar('app'), ...kaynaklar('src')]
      .map(({ icerik }) => icerik)
      .join('\n');
    expect(TESTIDLER.filter((t) => !kaynak.includes(t))).toEqual([]);
  });

  kabulCasusUi(
    'rol kartı arka plana alınınca kapanır (AppState ya da visibilitychange)',
    () => {
      const kartDosyalari = [...kaynaklar('app'), ...kaynaklar('src')].filter(
        ({ icerik }) => icerik.includes('casus-kart'),
      );
      expect(kartDosyalari.length).toBeGreaterThan(0);
      expect(
        kartDosyalari.some(({ icerik }) =>
          /AppState|visibilitychange/.test(icerik),
        ),
      ).toBe(true);
    },
  );

  it('Casus kim mantığı saf: src/games/casus-kim içinde Date.now, Math.random, ağ ve React yok (KK-53)', () => {
    const dosyalar = kaynaklar('src/games/casus-kim');
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(
        /Date\.now\(|Math\.random\(|WebSocket|\bfetch\(/,
      );
      expect(icerik, f).not.toMatch(/from ['"](react|react-native|expo)/);
    }
  });

  it("OK mu NOK mu çekirdeği Casus kim'e bağlanmaz (KK-2/KK-42)", () => {
    for (const { f, icerik } of [...kaynaklar('app'), ...kaynaklar('src/core')])
      expect(icerik, f).not.toMatch(/games\/casus-kim/);
  });

  it('gerçek cihaz listesinde Casus kim bölümü var (KK-54)', () => {
    const liste = dosyaIcerik('docs/GERCEK-CIHAZ-KONTROL.md');
    expect(liste).toMatch(/Casus kim \(KK-54\)/);
    expect(liste).toMatch(/basılı tut/i);
    expect(liste).toMatch(/uygulama değiştirici/i);
  });
});

describe('oda modu: oyun içinde odadan çık (#73, KK-38)', () => {
  // Ekran sözleşmesi kaynak düzeyinde; asıl davranış önizlemede 3 sekmeyle denenir.
  const oda = () =>
    [...kaynaklar('app/oda'), ...kaynaklar('src/oda-ui')].map((k) => k.icerik);

  kabulOdaCik('oda ekranları çıkış ikonu ve onay testID adlarını taşır', () => {
    const kaynak = oda().join('\n');
    for (const t of ['oda-cik', 'cikis-onay-evet', 'cikis-onay-hayir'])
      expect(kaynak, t).toContain(t);
    expect(kaynak).toContain('oda-ayrildi'); // diğer telefonlarda "X ayrıldı"
  });

  kabulOdaCik('geri tuşu/hareketi ve ikon "Odadan çık?" onayını açar', () => {
    const kaynak = oda().join('\n');
    expect(kaynak).toContain('Odadan çık?');
    expect(kaynak).toMatch(/beforeRemove|BackHandler|popstate/);
  });

  kabulOdaCik(
    'çıkış onayı "Oyuna dön" seçeneğiyle oyuna geri dönüş sunar (onaysız çıkış yok)',
    () => {
      const kaynak = oda().join('\n');
      expect(kaynak).toContain('Oyuna dön');
      expect(kaynak).toMatch(/leave|ayril|ayrıl/i);
    },
  );
});

describe('10/10 ama: kayıt listesi, arayüz ve altyapı sözleşmesi (KK-55…KK-62)', () => {
  const TESTIDLER = [
    'onon-kart-metni', // KK-59: puan girişi ve açıklamada görünür
    'onon-puan-', // KK-56: onon-puan-<oyuncu sırası>-<0..10>
    'onon-goster',
    'onon-ortalama', // KK-57
    'onon-en-dusuk',
    'onon-en-yuksek',
    'onon-bolundu',
    'onon-konfeti',
    'onon-sonraki',
    'onon-atla',
    'onon-bitir',
    'onon-odul-en-acimasiz', // KK-58
    'onon-odul-melek-kalpli',
    'onon-odul-ruh-ikizleri',
    'onon-paylas',
    'onon-tekrar-oyna',
    'onon-ana-menu',
    'onon-karistir-evet',
    'onon-karistir-hayir',
  ];
  const ekranlar = () => kaynaklar('src/oyun-ekranlari/on-on-ama');

  kabulOnonUi('10/10 ama kayıt listesinde aktif ve ekranı var (KK-55)', () => {
    const kayit = dosyaIcerik('src/games/registry.ts');
    expect(kayit).toMatch(/id:\s*'10-10-ama'/);
    expect(kayit).not.toMatch(/id:\s*'10-10-ama'[^}]*aktif:\s*false/);
    expect(kayit).toMatch(/oyun-ekranlari\/on-on-ama/);
  });

  kabulOnonUi('ekranlar sözleşmedeki testID adlarını kullanır', () => {
    const kaynak = ekranlar()
      .map(({ icerik }) => icerik)
      .join('\n');
    expect(kaynak.length).toBeGreaterThan(0);
    expect(TESTIDLER.filter((t) => !kaynak.includes(t))).toEqual([]);
  });

  kabulOnonUi(
    'kart metni puan girişinde ve açıklamada görünür kalır (KK-59)',
    () => {
      const dosyalar = ekranlar();
      const puan = dosyalar.filter(({ icerik }) =>
        icerik.includes('onon-puan-'),
      );
      const acik = dosyalar.filter(({ icerik }) =>
        icerik.includes('onon-ortalama'),
      );
      expect(puan.length).toBeGreaterThan(0);
      expect(acik.length).toBeGreaterThan(0);
      for (const { f, icerik } of [...puan, ...acik])
        expect(icerik, f).toMatch(/testID="onon-kart-metni"/);
    },
  );

  kabulOnonUi(
    '"Hareketi azalt" açıkken konfeti/açıklama animasyonu sade (KK-57)',
    () => {
      const kaynak = ekranlar()
        .map(({ icerik }) => icerik)
        .join('\n');
      expect(kaynak).toMatch(/azalt|hareketAzalt|reduceMotion/i);
    },
  );

  kabulOnonUi('ekran kayıttan okurken durumGecerliMi kullanır (KK-14)', () => {
    const kayit = dosyaIcerik('src/games/registry.ts');
    expect(kayit).toMatch(/on-on-ama\/onon['"]/);
    expect(kayit).toMatch(
      /gecerliMi:\s*\w*[Oo]non\w*|gecerliMi:\s*ononGecerliMi/,
    );
  });

  it('10/10 ama mantığı saf: src/games/on-on-ama içinde Date.now, Math.random, ağ ve React yok (KK-61)', () => {
    const dosyalar = kaynaklar('src/games/on-on-ama');
    expect(dosyalar.length).toBeGreaterThan(0);
    for (const { f, icerik } of dosyalar) {
      expect(icerik, f).not.toMatch(
        /Date\.now\(|Math\.random\(|WebSocket|\bfetch\(/,
      );
      expect(icerik, f).not.toMatch(/from ['"](react|react-native|expo)/);
    }
  });

  it("çekirdek ve uygulama kabuğu 10/10 ama'ya bağlanmaz (KK-2/KK-55)", () => {
    for (const { f, icerik } of [
      ...kaynaklar('src/core'),
      ...kaynaklar('src/oda'),
    ])
      expect(icerik, f).not.toMatch(/games\/on-on-ama/);
  });

  it('gerçek cihaz listesinde 10/10 ama bölümü var (KK-62)', () => {
    const liste = dosyaIcerik('docs/GERCEK-CIHAZ-KONTROL.md');
    expect(liste).toMatch(/10\/10 ama \(KK-62\)/);
    expect(liste).toMatch(/parmak/i);
    expect(liste).toMatch(/hareketi azalt/i);
  });
});
