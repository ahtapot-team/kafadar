// Casus kim (tek telefon, elden ele): saf, tohumlu, serileştirilebilir durum makinesi (KK-53).
// Saat olaylarla (`t`, ms) gelir; Date.now, Math.random, ağ ve React yok. Rol dağıtımında gizlilik önceliklidir:
// kart(d) yalnızca SIRADAKİ oyuncunun kartını, yalnızca "Ben X'im" sonrası ve "Gördüm"e kadar verir (KK-44, KK-46).
import { karistir, rngOlustur } from '../../core/rng';

export type CasusKart = { id: string; kelime: string; ipucu: string };
export type CasusDeste = {
  deck_id: string;
  version: number;
  lang: string;
  sorular: string[]; // tartışma örnek soruları
  cards: CasusKart[];
};

export type Asama =
  'rol' | 'tartisma' | 'oylama' | 'aciklama' | 'tahmin' | 'sonuc';

// JSON'a çevrilebilir. Tek telefonda rol bilgisi durumda durur; gizliliği kart() ve arayüz sağlar.
export type CasusDurum = {
  asama: Asama;
  oyuncular: string[];
  casuslar: string[]; // oyuncu sırasıyla
  kartlar: CasusKart; // bu oyunun kelime kartı (tek kart)
  siklar: string[]; // tahmin şıkları (doğru + 5), tohumlu sırada
  baslayan: string;
  sureMs: number | null;
  sira: number; // rol aşamasında kartı görecek oyuncunun sırası; öncekiler gördü
  acik: boolean; // sıradaki oyuncunun kartı şu an açık mı
  tartismaBas: number | null;
  tur: 1 | 2; // oylama turu (eşitlikte 2)
  adaylar: string[];
  oylar: Record<string, string>;
  secilen: string | null;
  kazanan: 'casus' | 'grup' | null;
};

export type Olay =
  | { tip: 'benim' } // devir perdesinde "Ben X'im": sıradaki oyuncunun kartı açılabilir
  | { tip: 'goruldu'; t: number } // "Gördüm": kart kapanır, sıradaki oyuncu; "Ben X'im" olmadan geçersiz
  | { tip: 'arkaPlan' } // uygulama arka plana alındı: açık kart kapanır, oyuncu hâlâ görmemiş sayılır
  | { tip: 'tartismayiBitir'; t: number } // moderatör süre dolmadan oylamaya geçer
  | { tip: 'zaman'; t: number } // süre dolduysa oylamaya geçer
  | { tip: 'oyla'; oyveren: string; secilen: string } // açık oy; kendine oy yok; son oy geçerli
  | { tip: 'oylamayiBitir' } // herkes oyladıysa sayar
  | { tip: 'devam' } // açıklamadan sonra: casussa tahmin, değilse sonuç
  | { tip: 'tahmin'; kelime: string } // 6 şıktan biri
  | { tip: 'oyunuBitir' }; // her aşamada: sonuç, kazanan ilan edilmez

export type Sonuc = {
  kazanan: 'casus' | 'grup' | null; // oyunuBitir ile bitince null
  casuslar: string[];
  kelime: string;
  kartId: string;
};

// 3–7 kişi: 1, 8–11: 2, 12: 3 (oyuncu sayısının dörtte biri, en az 1).
export function casusSiniri(oyuncuSayisi: number): number {
  return Math.max(1, Math.floor(oyuncuSayisi / 4));
}

// casusSayisi verilmezse 1; sınırın üstü sınıra, 1'in altı 1'e çekilir. `kullanilan`: bu oturumda gelmiş kart id'leri
// (tekrar yok; deste biterse baştan karıştırılır).
export function yeniOyun(s: {
  oyuncular: string[];
  deste: CasusDeste;
  casusSayisi?: number;
  sureDk: 3 | 5 | 8 | null;
  tohum: number;
  kullanilan?: string[];
}): CasusDurum {
  const rng = rngOlustur(s.tohum);
  const kullanilan = new Set(s.kullanilan ?? []);
  const taze = s.deste.cards.filter((c) => !kullanilan.has(c.id));
  const kart = karistir(taze.length > 0 ? taze : s.deste.cards, rng)[0];
  const sayi = Math.min(
    casusSiniri(s.oyuncular.length),
    Math.max(1, s.casusSayisi ?? 1),
  );
  const secilen = new Set(karistir(s.oyuncular, rng).slice(0, sayi));
  const baslayan = s.oyuncular[Math.floor(rng() * s.oyuncular.length)];
  const digerleri = s.deste.cards
    .filter((c) => c.kelime !== kart.kelime)
    .map((c) => c.kelime);
  const siklar = karistir(
    [kart.kelime, ...karistir(digerleri, rng).slice(0, 5)],
    rng,
  );
  return {
    asama: 'rol',
    oyuncular: [...s.oyuncular],
    casuslar: s.oyuncular.filter((p) => secilen.has(p)),
    kartlar: kart,
    siklar,
    baslayan,
    sureMs: s.sureDk === null ? null : s.sureDk * 60_000,
    sira: 0,
    acik: false,
    tartismaBas: null,
    tur: 1,
    adaylar: [],
    oylar: {},
    secilen: null,
    kazanan: null,
  };
}

function oylamayaGec(d: CasusDurum) {
  d.asama = 'oylama';
  d.tur = 1;
  d.adaylar = [...d.oyuncular];
  d.oylar = {};
}

export function isle(durum: CasusDurum, olay: Olay): CasusDurum {
  const d = structuredClone(durum);
  switch (olay.tip) {
    case 'benim':
      if (d.asama === 'rol') d.acik = true;
      break;
    case 'arkaPlan':
      d.acik = false;
      break;
    case 'goruldu':
      if (d.asama !== 'rol' || !d.acik) break;
      d.acik = false;
      d.sira++;
      if (d.sira >= d.oyuncular.length) {
        d.asama = 'tartisma';
        d.tartismaBas = olay.t;
      }
      break;
    case 'tartismayiBitir':
      if (d.asama === 'tartisma') oylamayaGec(d);
      break;
    case 'zaman':
      if (
        d.asama === 'tartisma' &&
        d.sureMs !== null &&
        d.tartismaBas !== null &&
        olay.t - d.tartismaBas >= d.sureMs
      )
        oylamayaGec(d);
      break;
    case 'oyla':
      if (
        d.asama === 'oylama' &&
        d.oyuncular.includes(olay.oyveren) &&
        d.adaylar.includes(olay.secilen) &&
        olay.secilen !== olay.oyveren
      )
        d.oylar[olay.oyveren] = olay.secilen;
      break;
    case 'oylamayiBitir': {
      if (d.asama !== 'oylama' || !d.oyuncular.every((p) => d.oylar[p])) break;
      const sayac: Record<string, number> = {};
      for (const s of Object.values(d.oylar)) sayac[s] = (sayac[s] ?? 0) + 1;
      const en = Math.max(...Object.values(sayac));
      const liderler = d.adaylar.filter((p) => sayac[p] === en);
      if (liderler.length === 1) {
        d.secilen = liderler[0];
        d.asama = 'aciklama';
      } else if (d.tur === 1) {
        d.tur = 2;
        d.adaylar = liderler;
        d.oylar = {};
      } else {
        d.asama = 'sonuc';
        d.kazanan = 'casus'; // ikinci turda da eşit: casuslar kazanır
      }
      break;
    }
    case 'devam':
      if (d.asama !== 'aciklama') break;
      if (d.secilen !== null && d.casuslar.includes(d.secilen))
        d.asama = 'tahmin';
      else {
        d.asama = 'sonuc';
        d.kazanan = 'casus';
      }
      break;
    case 'tahmin':
      if (d.asama !== 'tahmin' || !d.siklar.includes(olay.kelime)) break;
      d.asama = 'sonuc';
      d.kazanan = olay.kelime === d.kartlar.kelime ? 'casus' : 'grup';
      break;
    case 'oyunuBitir':
      if (d.asama === 'sonuc') break;
      d.acik = false;
      d.asama = 'sonuc';
      d.kazanan = null;
      break;
  }
  return d;
}

// 'rol' aşamasında telefonu alacak oyuncu ("Telefonu X'e ver"); başka aşamada null.
export function siradaki(durum: CasusDurum): string | null {
  return durum.asama === 'rol' ? durum.oyuncular[durum.sira] : null;
}

// Yalnızca sıradaki oyuncu için, "Ben X'im"den sonra ve "Gördüm"e kadar; aksi halde null. Casus ve normal kart aynı şekildedir.
export function kart(
  durum: CasusDurum,
): { rol: 'casus' | 'normal'; metin: string } | null {
  if (durum.asama !== 'rol' || !durum.acik) return null;
  const casus = durum.casuslar.includes(durum.oyuncular[durum.sira]);
  return casus
    ? { rol: 'casus', metin: durum.kartlar.ipucu }
    : { rol: 'normal', metin: durum.kartlar.kelime };
}

// Tartışmayı kimin başlatacağı (tohumlu); 'tartisma' aşamasından önce null.
export function baslayan(durum: CasusDurum): string | null {
  return durum.asama === 'rol' ? null : durum.baslayan;
}

// Süre açıksa toplam tartışma süresinden kalan ms (gerçek saate göre, arka plan fark etmez); kapalıysa null.
export function kalanMs(durum: CasusDurum, simdi: number): number | null {
  if (durum.sureMs === null || durum.tartismaBas === null) return null;
  return Math.max(0, durum.tartismaBas + durum.sureMs - simdi);
}

// Kayıttan okunan durumu güvenli hale getirir: açık kart asla geri yüklenmez (KK-47); görenler korunur.
export function kayittanYukle(durum: CasusDurum): CasusDurum {
  return { ...structuredClone(durum), acik: false };
}

// 'oylama' aşamasında oy verilebilecek adaylar: ilk turda herkes, eşitlikte tekrar oylamada yalnızca eşit kalanlar.
export function oylamaAdaylari(durum: CasusDurum): string[] {
  return durum.asama === 'oylama' ? [...durum.adaylar] : [];
}

// 'aciklama' aşamasında en çok oy alan kişi.
export function oySonucu(durum: CasusDurum): { secilen: string } | null {
  return durum.asama === 'aciklama' && durum.secilen !== null
    ? { secilen: durum.secilen }
    : null;
}

// 'tahmin' aşamasında 6 şık: doğru kelime + aynı paketten 5 farklı kelime (tohumlu sırayla).
export function tahminSecenekleri(durum: CasusDurum): string[] {
  return durum.asama === 'tahmin' ? [...durum.siklar] : [];
}

// Bu oyunun kelime kartının id'si (oturumda tekrarı önlemek için çağıran `kullanilan`'a ekler).
export function kelimeKartId(durum: CasusDurum): string {
  return durum.kartlar.id;
}

// Yalnızca 'sonuc' aşamasında.
export function sonuc(durum: CasusDurum): Sonuc {
  return {
    kazanan: durum.kazanan,
    casuslar: [...durum.casuslar],
    kelime: durum.kartlar.kelime,
    kartId: durum.kartlar.id,
  };
}
