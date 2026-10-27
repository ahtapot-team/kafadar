// OK mu NOK mu: saf, serileştirilebilir durum makinesi (durum + olay → yeni durum, KK-22).
// Zaman (`t`) ve tohum dışarıdan gelir; isle() girdiyi değiştirmez.
import type { Deste, Kart } from '../../core/deste';
import { karistir, rngOlustur } from '../../core/rng';

export type Oy = 'OK' | 'NOK';
type Oylar = Record<string, Oy>;

export const TEKRAR_MS = 300; // aynı oyuncuda bu süre içindeki tekrar dokunuş yok sayılır

// 'oy': oylanır, 'acik': sonuç görünür, 'desteBitti': "Karıştırıp baştan?", 'bitti': oturum sonu.
export type Durum = {
  asama: 'oy' | 'acik' | 'desteBitti' | 'bitti';
  deste: { deck_id: string; version: number }; // yarım oyun eski sürümle biter
  kartlar: Kart[]; // karışık
  sira: number; // geçerli kartın yeri
  tamamlanan: number; // bitirilen/atlanan kart sayısı (tur uzunluğu için)
  uzunluk: 10 | 20 | null;
  tohum: number;
  karisim: number; // kaç kez yeniden karıştırıldı
  oyuncular: string[];
  oylar: Oylar; // geçerli kartın oyları
  sonOy: Record<string, number>; // oyuncunun son kabul edilen oyunun zamanı
  gecmis: { kartId: string; oylar: Oylar }[]; // açıklanmış kartlar
};

export type Olay =
  | { tip: 'oyla'; oyuncu: string; oy: Oy; t: number }
  | { tip: 'goster' }
  | { tip: 'sonraki' }
  | { tip: 'atla' }
  | { tip: 'bitir' }
  | { tip: 'karistir' } // deste bitince baştan karıştırır
  | { tip: 'oyuncuEkle'; ad: string }
  | { tip: 'oyuncuCikar'; ad: string };

export type OyunSecenekleri = {
  oyuncular: string[];
  deste: Deste;
  uzunluk: 10 | 20 | null; // null = sınırsız
  tohum: number;
};

export type Sonuc = {
  tip: 'tekAzinlik' | 'oybirligi' | 'esit' | 'diger';
  metin: string;
};

export type Oduller = {
  aykiriRuh: string[]; // en çok azınlıkta kalan(lar); 2 kişilikte boş
  ruhIkizleri: [string, string][]; // en çok aynı oyu veren ikili(ler)
  olayKart: string[]; // oyları en dengeli bölünen kartın id'leri
};

export function yeniOyun(s: OyunSecenekleri): Durum {
  return {
    asama: 'oy',
    deste: { deck_id: s.deste.deck_id, version: s.deste.version },
    kartlar: karistir(s.deste.cards, rngOlustur(s.tohum)),
    sira: 0,
    tamamlanan: 0,
    uzunluk: s.uzunluk,
    tohum: s.tohum,
    karisim: 0,
    oyuncular: [...s.oyuncular],
    oylar: {},
    sonOy: {},
    gecmis: [],
  };
}

export const gecerliKart = (d: Durum): Kart => d.kartlar[d.sira];

// Herkes oy vermeden false.
export const gosterAktif = (d: Durum) =>
  d.asama === 'oy' && d.oyuncular.every((o) => d.oylar[o]);

const say = (oylar: Oylar, oyuncular: string[]) => {
  const verenler = oyuncular.filter((o) => oylar[o]);
  const ok = verenler.filter((o) => oylar[o] === 'OK').length;
  return { ok, nok: verenler.length - ok, verenler };
};

// Yalnızca 'acik' aşamasında anlamlı.
export function sonuc(d: Durum): Sonuc {
  const { ok, nok, verenler } = say(d.oylar, d.oyuncular);
  if (ok === 0 || nok === 0)
    return { tip: 'oybirligi', metin: 'Oybirliği! Hepiniz aynısınız.' };
  if (ok === nok) return { tip: 'esit', metin: 'Tam ikiye bölündünüz' };
  const azinlik = ok < nok ? 'OK' : 'NOK';
  if (Math.min(ok, nok) === 1) {
    const kisi = verenler.find((o) => d.oylar[o] === azinlik);
    return { tip: 'tekAzinlik', metin: `${kisi} tek başına ${azinlik}!` };
  }
  return {
    tip: 'diger',
    metin: `Çoğunluk ${ok > nok ? 'OK' : 'NOK'}: ${Math.max(ok, nok)}–${Math.min(ok, nok)}`,
  };
}

// Yalnızca oyuncunun oy verdiği kartlardan hesaplanır (KK-6, KK-12).
export function oduller(d: Durum): Oduller {
  const sayac: Record<string, number> = {};
  const ciftler: Record<string, number> = {};
  for (const { oylar } of d.gecmis) {
    // Ödüller yalnızca hâlâ oyunda olanlara verilir; çıkarılanlar sayaçlara hiç girmez.
    const { ok, nok, verenler } = say(oylar, d.oyuncular);
    if (ok !== nok && ok > 0 && nok > 0) {
      const az = ok < nok ? 'OK' : 'NOK';
      for (const o of verenler)
        if (oylar[o] === az) sayac[o] = (sayac[o] ?? 0) + 1;
    }
    for (const a of verenler)
      for (const b of verenler)
        if (a < b && oylar[a] === oylar[b]) {
          const anahtar = JSON.stringify([a, b]);
          ciftler[anahtar] = (ciftler[anahtar] ?? 0) + 1;
        }
  }
  const enCok = <T>(
    kayit: Record<string, number>,
    harita: (k: string) => T,
  ) => {
    const m = Math.max(0, ...Object.values(kayit));
    return m === 0
      ? []
      : Object.keys(kayit)
          .filter((k) => kayit[k] === m)
          .map(harita);
  };
  // Olay kart: oyları en dengeli bölünen kart (çıkarılanların oyları da o kartta verilmişti).
  const farklar = d.gecmis.map((g) => {
    const { ok, nok } = say(g.oylar, Object.keys(g.oylar));
    return Math.abs(ok - nok);
  });
  const enDengeli = Math.min(...farklar);
  return {
    aykiriRuh: d.oyuncular.length < 3 ? [] : enCok(sayac, (k) => k),
    ruhIkizleri: enCok(ciftler, (k) => JSON.parse(k) as [string, string]),
    olayKart: d.gecmis
      .filter((_, i) => farklar[i] === enDengeli)
      .map((g) => g.kartId),
  };
}

// Sonraki karta geçer: tur uzunluğu dolduysa oturum biter, deste tükendiyse karıştırma sorulur.
function ilerle(d: Durum): Durum {
  const tamamlanan = d.tamamlanan + 1;
  const temiz = { ...d, tamamlanan, oylar: {}, sonOy: {} };
  if (d.uzunluk !== null && tamamlanan >= d.uzunluk)
    return { ...temiz, asama: 'bitti' };
  if (d.sira + 1 >= d.kartlar.length) return { ...temiz, asama: 'desteBitti' };
  return { ...temiz, asama: 'oy', sira: d.sira + 1 };
}

export function isle(d: Durum, olay: Olay): Durum {
  switch (olay.tip) {
    case 'oyla': {
      if (d.asama !== 'oy' || !d.oyuncular.includes(olay.oyuncu)) return d;
      const once = d.sonOy[olay.oyuncu];
      if (once !== undefined && olay.t - once < TEKRAR_MS) return d;
      return {
        ...d,
        oylar: { ...d.oylar, [olay.oyuncu]: olay.oy },
        sonOy: { ...d.sonOy, [olay.oyuncu]: olay.t },
      };
    }
    case 'goster':
      if (!gosterAktif(d)) return d;
      return {
        ...d,
        asama: 'acik',
        gecmis: [...d.gecmis, { kartId: gecerliKart(d).id, oylar: d.oylar }],
      };
    case 'sonraki':
      return d.asama === 'acik' ? ilerle(d) : d;
    case 'atla':
      return d.asama === 'oy' || d.asama === 'acik' ? ilerle(d) : d;
    case 'bitir':
      return { ...d, asama: 'bitti' };
    case 'karistir':
      if (d.asama !== 'desteBitti') return d;
      return {
        ...d,
        asama: 'oy',
        sira: 0,
        karisim: d.karisim + 1,
        kartlar: karistir(d.kartlar, rngOlustur(d.tohum + d.karisim + 1)),
      };
    case 'oyuncuEkle': {
      const ad = olay.ad.trim();
      return !ad || d.oyuncular.includes(ad)
        ? d
        : { ...d, oyuncular: [...d.oyuncular, ad] };
    }
    case 'oyuncuCikar':
      return {
        ...d,
        oyuncular: d.oyuncular.filter((o) => o !== olay.ad),
        oylar: Object.fromEntries(
          Object.entries(d.oylar).filter(([o]) => o !== olay.ad),
        ),
      };
  }
}
