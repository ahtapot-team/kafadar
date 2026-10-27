// Oda mantığı saf ve serileştirilebilir bir durum makinesidir (KK-40): saat (`simdi`, ms) ve rastgelelik
// dışarıdan verilir; Date.now, Math.random, ağ ve React kullanılmaz. Sunucu (Durable Object) bu
// mantığı çalıştıran ince bir kabuktur; her olayda kendi saatini `simdi` olarak verir.
import type { Deste, Kart } from '../core/deste';
import { karistir, rngOlustur } from '../core/rng';

export type Kimlik = string; // katılımda sunucunun verdiği, cihazda saklanan oyuncu belirteci
export type Oy = 'OK' | 'NOK';

export const SORU_MS = 15_000;
export const SORU_SAYISI = 10;
export const OYUNCU_MAKS = 12;
export const BOSTA_MS = 3_600_000;

type Oyuncu = { kimlik: Kimlik; ad: string; bagli: boolean; ayrildi: boolean };
type Gecmis = { kartId: string; oylar: Record<Kimlik, Oy | null> };

// 'lobi' → 'soru' → 'bitti'. JSON'a çevrilebilir. Oylar yalnızca sunucuda tutulur; istemciye gorunum() verilir.
export type OdaDurum = {
  asama: 'lobi' | 'soru' | 'bitti';
  kod: string;
  kurucu: Kimlik;
  oyuncular: Oyuncu[]; // ayrılanlar işaretli kalır (geçmiş cevapları için)
  sorular: Kart[];
  tohum: number; // kimlik üretimi ve soru sırası için
  sayac: number;
  no: number; // şu anki soru (0'dan)
  baslangic: number; // şu anki sorunun başlangıcı (sunucu saati, ms)
  oylar: Record<Kimlik, Oy>; // şu anki sorunun cevapları
  gecmis: Gecmis[]; // biten soruların cevapları (cevapsız = null)
  sonEtkinlik: number;
  bitis: number | null;
};

export type Olay =
  // `kimlik`: sunucunun crypto ile ürettiği tahmin edilemez belirteç. Verilmezse (yalnızca testler) tohumdan türetilir.
  | { tip: 'katil'; ad: string; kimlik?: Kimlik }
  | { tip: 'baslat'; kimlik: Kimlik } // yalnızca kuran
  | { tip: 'cevapla'; kimlik: Kimlik; oy: Oy } // süre içinde değiştirilebilir, son cevap geçerli
  | { tip: 'kop'; kimlik: Kimlik } // bağlantı koptu
  | { tip: 'don'; kimlik: Kimlik } // aynı kimlikle geri döndü
  | { tip: 'ayril'; kimlik: Kimlik }
  | { tip: 'zaman' }; // sunucu alarmı: süre dolduysa sonraki soruya (ya da finale) geçer

export type Hata = {
  kod:
    | 'kapali' // oda bitti/kapandı
    | 'dolu' // 12 oyuncu
    | 'basladi' // oyun başladı, katılım kapalı
    | 'yetkisiz' // kuran değil
    | 'yetersiz' // 2'den az oyuncu
    | 'sure-doldu' // süre bittikten sonra gelen cevap
    | 'tanimsiz'; // bilinmeyen kimlik
  mesaj: string; // Türkçe, net
};

// Hata varsa durum DEĞİŞMEZ. katil başarılıysa `kimlik` ve çakışma çözülmüş `ad` ("Ali 2") döner.
export type Sonuc = {
  durum: OdaDurum;
  hata?: Hata;
  kimlik?: Kimlik;
  ad?: string;
};

// Kişiye özel görünüm: başkalarının cevabı final'e kadar HİÇBİR alanda yer almaz (KK-34, KK-35).
export type Gorunum = {
  asama: 'lobi' | 'soru' | 'bitti';
  kod: string;
  oyuncular: { ad: string; bagli: boolean }[]; // kuran dahil
  baslatGorunur: boolean; // yalnızca kuranda true
  baslatAktif: boolean; // en az 2 oyuncuyla true
  soruNo?: number; // 1…10 ('soru' aşamasında)
  soru?: Kart;
  kalanMs?: number; // sunucu saatine göre
  cevapladi: string[]; // cevap vermiş oyuncuların adları (ne dediği değil)
  toplam: number; // oyuncu sayısı ("6/8")
  benimOyum?: Oy | null; // yalnızca kendi cevabı
};

export type Final = {
  yuzdeler: { kartId: string; ok: number; nok: number; bos: number }[]; // tamamlanan sorular; sayılar (yüzde arayüzde)
  enTartismali: string[]; // oyları en dengeli bölünen kart(lar)
  oduller: { aykiriRuh: string[]; ruhIkizleri: [string, string][] }; // KK-12 kuralları
  kimNeDedi: Record<string, (Oy | null)[]>; // oyuncu adı → soru sırasıyla cevaplar (null = boş)
  ayniOlan: Record<string, number>; // oyuncu adı → çoğunlukla aynı olduğu soru sayısı ("7/10")
};

const HARFLER = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // O, I, 0, 1 yok
const DENEME_MAKS = 5; // KK-30: istemci başına dakikada 5 kod denemesi
const DENEME_PENCERE_MS = 60_000;

// 4 harfli kod; O, 0, I, 1 kullanılmaz (KK-29).
export function kodUret(rng: () => number): string {
  return Array.from(
    { length: 4 },
    () => HARFLER[Math.floor(rng() * HARFLER.length)],
  ).join('');
}

// Yalnızca testler için yedek: tohumdan türetilir, TAHMİN EDİLEBİLİR. Sunucu her zaman kendi (crypto) kimliğini verir.
function kimlikUret(d: Pick<OdaDurum, 'kod' | 'tohum' | 'sayac'>): Kimlik {
  const rng = rngOlustur(d.tohum + d.sayac * 7919);
  const parca = () => Math.floor(rng() * 36 ** 6).toString(36);
  return `${d.kod}-${d.sayac}-${parca()}${parca()}`;
}

// Kuran kişi de oyuncudur. Sorular `tohum` ile sunucuda seçilip sıralanır (KK-32).
export function odaKur(s: {
  kod: string;
  kurucuAd: string;
  kurucuKimlik?: Kimlik; // sunucunun crypto ile ürettiği belirteç
  deste: Deste;
  tohum: number;
  simdi: number;
}): { durum: OdaDurum; kimlik: Kimlik } {
  const d: OdaDurum = {
    asama: 'lobi',
    kod: s.kod,
    kurucu: '',
    oyuncular: [],
    sorular: karistir(s.deste.cards, rngOlustur(s.tohum)).slice(0, SORU_SAYISI),
    tohum: s.tohum,
    sayac: 0,
    no: 0,
    baslangic: 0,
    oylar: {},
    gecmis: [],
    sonEtkinlik: s.simdi,
    bitis: null,
  };
  const kimlik = ekle(d, s.kurucuAd, s.kurucuKimlik);
  d.kurucu = kimlik.kimlik;
  return { durum: d, kimlik: kimlik.kimlik };
}

// Aynı isim "Ali 2", "Ali 3" olur (büyük/küçük harf duyarsız, tr).
function ekle(
  d: OdaDurum,
  istenen: string,
  verilen?: Kimlik,
): { kimlik: Kimlik; ad: string } {
  const anahtar = (x: string) => x.toLocaleLowerCase('tr');
  const taban = istenen.trim().slice(0, 16) || 'Oyuncu';
  const varMi = (x: string) =>
    d.oyuncular.some((p) => anahtar(p.ad) === anahtar(x));
  let ad = taban;
  for (let n = 2; varMi(ad); n++) ad = `${taban} ${n}`;
  const kimlik = verilen ?? kimlikUret(d);
  d.sayac++;
  d.oyuncular.push({ kimlik, ad, bagli: true, ayrildi: false });
  return { kimlik, ad };
}

const aktifler = (d: OdaDurum) => d.oyuncular.filter((p) => !p.ayrildi);
const hata = (durum: OdaDurum, kod: Hata['kod'], mesaj: string): Sonuc => ({
  durum,
  hata: { kod, mesaj },
});

function bitir(d: OdaDurum, simdi: number) {
  d.asama = 'bitti';
  d.bitis = simdi;
  d.sonEtkinlik = simdi;
}

// Şu anki soruyu kaydedip sonrakine (ya da finale) geçer.
function ilerle(d: OdaDurum, simdi: number) {
  const oylar: Record<Kimlik, Oy | null> = {};
  for (const p of aktifler(d)) oylar[p.kimlik] = d.oylar[p.kimlik] ?? null;
  d.gecmis.push({ kartId: d.sorular[d.no].id, oylar });
  d.sonEtkinlik = simdi;
  if (d.gecmis.length >= d.sorular.length) return bitir(d, simdi);
  d.no++;
  d.baslangic = simdi;
  d.oylar = {};
}

// Bağlı herkes cevapladıysa beklemeden geçilir (KK-34).
function belkiIlerle(d: OdaDurum, simdi: number) {
  const bagli = aktifler(d).filter((p) => p.bagli);
  if (
    d.asama === 'soru' &&
    bagli.length > 0 &&
    bagli.every((p) => d.oylar[p.kimlik])
  )
    ilerle(d, simdi);
}

export function isle(durum: OdaDurum, olay: Olay, simdi: number): Sonuc {
  const d = structuredClone(durum);
  const kimlikli = olay.tip !== 'katil' && olay.tip !== 'zaman';
  const o = kimlikli
    ? aktifler(d).find((p) => p.kimlik === olay.kimlik)
    : undefined;
  if (kimlikli && !o) return hata(durum, 'tanimsiz', 'Bu oyuncu odada yok.');

  switch (olay.tip) {
    case 'katil': {
      if (d.asama === 'bitti') return hata(durum, 'kapali', 'Bu oda kapandı.');
      if (d.asama === 'soru')
        return hata(durum, 'basladi', 'Oyun başladı, katılım kapalı.');
      if (d.oyuncular.length >= OYUNCU_MAKS)
        return hata(durum, 'dolu', 'Oda dolu (en çok 12 kişi).');
      // Savunma derinliği: var olan bir belirteç yeniden verilemez (başkasının yerine geçme yok).
      if (olay.kimlik && d.oyuncular.some((p) => p.kimlik === olay.kimlik))
        return hata(durum, 'tanimsiz', 'Bu belirteç zaten kullanılıyor.');
      const { kimlik, ad } = ekle(d, olay.ad, olay.kimlik);
      d.sonEtkinlik = simdi;
      return { durum: d, kimlik, ad };
    }
    case 'baslat':
      if (d.asama === 'bitti') return hata(durum, 'kapali', 'Bu oda kapandı.');
      if (d.asama === 'soru')
        return hata(durum, 'basladi', 'Oyun zaten başladı.');
      if (o!.kimlik !== d.kurucu)
        return hata(durum, 'yetkisiz', 'Yalnızca odayı kuran başlatabilir.');
      if (d.oyuncular.length < 2)
        return hata(durum, 'yetersiz', 'Başlamak için en az 2 oyuncu gerekir.');
      d.asama = 'soru';
      d.no = 0;
      d.baslangic = simdi;
      d.sonEtkinlik = simdi;
      return { durum: d };
    case 'cevapla':
      if (d.asama === 'bitti') return hata(durum, 'kapali', 'Oyun bitti.');
      if (d.asama === 'lobi')
        return hata(durum, 'yetkisiz', 'Oyun henüz başlamadı.');
      if (simdi - d.baslangic >= SORU_MS)
        return hata(durum, 'sure-doldu', 'Süre doldu, cevap sayılmadı.');
      d.oylar[o!.kimlik] = olay.oy;
      d.sonEtkinlik = simdi;
      belkiIlerle(d, simdi);
      return { durum: d };
    case 'kop':
      o!.bagli = false;
      d.sonEtkinlik = simdi;
      belkiIlerle(d, simdi);
      return { durum: d };
    case 'don':
      o!.bagli = true;
      d.sonEtkinlik = simdi;
      return { durum: d };
    case 'ayril':
      if (d.asama === 'bitti') return { durum };
      d.sonEtkinlik = simdi;
      if (d.asama === 'lobi') {
        d.oyuncular = d.oyuncular.filter((p) => p.kimlik !== o!.kimlik);
        if (d.oyuncular.length === 0) bitir(d, simdi);
        else if (d.kurucu === o!.kimlik) d.kurucu = d.oyuncular[0].kimlik;
        return { durum: d };
      }
      o!.ayrildi = true;
      o!.bagli = false;
      delete d.oylar[o!.kimlik];
      if (aktifler(d).length <= 1) bitir(d, simdi);
      else belkiIlerle(d, simdi);
      return { durum: d };
    case 'zaman':
      if (d.asama === 'soru' && simdi - d.baslangic >= SORU_MS)
        ilerle(d, simdi);
      return { durum: d };
  }
}

export function gorunum(
  durum: OdaDurum,
  kimlik: Kimlik,
  simdi: number,
): Gorunum {
  const d = durum;
  const soru = d.asama === 'soru';
  return {
    asama: d.asama,
    kod: d.kod,
    oyuncular: aktifler(d).map((p) => ({ ad: p.ad, bagli: p.bagli })),
    baslatGorunur: d.asama === 'lobi' && kimlik === d.kurucu,
    baslatAktif: d.asama === 'lobi' && d.oyuncular.length >= 2,
    soruNo: soru ? d.no + 1 : undefined,
    soru: soru ? d.sorular[d.no] : undefined,
    kalanMs: soru ? Math.max(0, SORU_MS - (simdi - d.baslangic)) : undefined,
    cevapladi: soru
      ? aktifler(d)
          .filter((p) => d.oylar[p.kimlik])
          .map((p) => p.ad)
      : [],
    toplam: aktifler(d).length,
    benimOyum: soru ? (d.oylar[kimlik] ?? null) : undefined,
  };
}

const say = (oylar: Record<Kimlik, Oy | null>, kimlikler: Kimlik[]) => {
  const ok = kimlikler.filter((k) => oylar[k] === 'OK').length;
  const nok = kimlikler.filter((k) => oylar[k] === 'NOK').length;
  return { ok, nok, bos: kimlikler.length - ok - nok };
};

// Yalnızca 'bitti' aşamasında anlamlı.
export function final(durum: OdaDurum): Final {
  const d = durum;
  const sayilar = d.gecmis.map((g) => say(g.oylar, Object.keys(g.oylar)));
  const enCok = <T>(sayac: Map<T, number>): T[] => {
    const m = Math.max(0, ...sayac.values());
    return m === 0 ? [] : [...sayac].filter(([, n]) => n === m).map(([k]) => k);
  };
  const artir = <T>(m: Map<T, number>, k: T) => m.set(k, (m.get(k) ?? 0) + 1);

  const farklar = sayilar.map((s) => Math.abs(s.ok - s.nok));
  const enDengeli = Math.min(...farklar);

  const azinlik = new Map<string, number>();
  const ciftler = new Map<string, number>();
  const ayni: Record<string, number> = {};
  const kimNeDedi: Record<string, (Oy | null)[]> = {};
  for (const p of d.oyuncular) {
    kimNeDedi[p.ad] = d.gecmis.map((g) => g.oylar[p.kimlik] ?? null);
    ayni[p.ad] = 0;
  }
  const kalan = aktifler(d);
  d.gecmis.forEach((g, i) => {
    const { ok, nok } = sayilar[i];
    for (const p of d.oyuncular) {
      const oy = g.oylar[p.kimlik];
      if (oy && ok !== nok && oy === (ok > nok ? 'OK' : 'NOK')) ayni[p.ad]++;
    }
    if (ok !== nok && ok > 0 && nok > 0) {
      const az = ok < nok ? 'OK' : 'NOK';
      for (const p of kalan) if (g.oylar[p.kimlik] === az) artir(azinlik, p.ad);
    }
    for (const a of kalan)
      for (const b of kalan)
        if (
          a.ad < b.ad &&
          g.oylar[a.kimlik] &&
          g.oylar[a.kimlik] === g.oylar[b.kimlik]
        )
          artir(ciftler, JSON.stringify([a.ad, b.ad]));
  });

  return {
    yuzdeler: d.gecmis.map((g, i) => ({ kartId: g.kartId, ...sayilar[i] })),
    enTartismali: d.gecmis
      .filter((_, i) => farklar[i] === enDengeli)
      .map((g) => g.kartId),
    oduller: {
      aykiriRuh: d.oyuncular.length < 3 ? [] : enCok(azinlik),
      ruhIkizleri: enCok(ciftler).map((k) => JSON.parse(k) as [string, string]),
    },
    kimNeDedi,
    ayniOlan: ayni,
  };
}

// Oda ve isimler silinmeli mi (KK-39): son etkinlikten BOSTA_MS geçtiyse ya da oyun bitmesinden BOSTA_MS sonra.
export function silinmeli(durum: OdaDurum, simdi: number): boolean {
  const referans = durum.asama === 'bitti' ? durum.bitis! : durum.sonEtkinlik;
  return simdi - referans >= BOSTA_MS;
}

// Kod denemesi hız sınırı (KK-30): istemci başına pencere içinde en çok DENEME_MAKS. Reddedilen deneme sayılmaz.
export function denemeSiniri(
  kayit: unknown,
  istemci: string,
  simdi: number,
): { izin: boolean; kayit: unknown } {
  const eski = (kayit ?? {}) as Record<string, number[]>;
  const son = (eski[istemci] ?? []).filter(
    (t) => simdi - t < DENEME_PENCERE_MS,
  );
  const izin = son.length < DENEME_MAKS;
  return { izin, kayit: { ...eski, [istemci]: izin ? [...son, simdi] : son } };
}
