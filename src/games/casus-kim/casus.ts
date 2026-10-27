/* eslint-disable @typescript-eslint/no-unused-vars */
// QA iskeleti (#77): imzalar kabul testleri içindir; backend gerçekleştirir (#78).
// Casus kim (tek telefon, elden ele): saf, tohumlu, serileştirilebilir durum makinesi (KK-53).
// Saat olaylarla (`t`, ms) gelir; Date.now, Math.random, ağ ve React yok. Rol dağıtımında gizlilik önceliklidir:
// kart(d) yalnızca SIRADAKİ oyuncunun kartını, yalnızca "Ben X'im" sonrası ve "Gördüm"e kadar verir (KK-44, KK-46).
const YOK = 'henüz yazılmadı';

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
// Gerisini (oyuncular, roller, görenler, oylar, tur, süre…) gerçekleştirme ekler; JSON'a çevrilebilir olmalı.
export type CasusDurum = { asama: Asama };

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
  throw new Error(YOK);
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
  throw new Error(YOK);
}

export function isle(durum: CasusDurum, olay: Olay): CasusDurum {
  throw new Error(YOK);
}

// 'rol' aşamasında telefonu alacak oyuncu ("Telefonu X'e ver"); başka aşamada null.
export function siradaki(durum: CasusDurum): string | null {
  throw new Error(YOK);
}

// Yalnızca sıradaki oyuncu için, "Ben X'im"den sonra ve "Gördüm"e kadar; aksi halde null. Casus ve normal kart aynı şekildedir.
export function kart(
  durum: CasusDurum,
): { rol: 'casus' | 'normal'; metin: string } | null {
  throw new Error(YOK);
}

// Tartışmayı kimin başlatacağı (tohumlu); 'tartisma' aşamasından önce null.
export function baslayan(durum: CasusDurum): string | null {
  throw new Error(YOK);
}

// Süre açıksa toplam tartışma süresinden kalan ms (gerçek saate göre, arka plan fark etmez); kapalıysa null.
export function kalanMs(durum: CasusDurum, simdi: number): number | null {
  throw new Error(YOK);
}

// Kayıttan okunan durumu güvenli hale getirir: açık kart asla geri yüklenmez (KK-47); görenler korunur.
export function kayittanYukle(durum: CasusDurum): CasusDurum {
  throw new Error(YOK);
}

// 'oylama' aşamasında oy verilebilecek adaylar: ilk turda herkes, eşitlikte tekrar oylamada yalnızca eşit kalanlar.
export function oylamaAdaylari(durum: CasusDurum): string[] {
  throw new Error(YOK);
}

// 'aciklama' aşamasında en çok oy alan kişi.
export function oySonucu(durum: CasusDurum): { secilen: string } | null {
  throw new Error(YOK);
}

// 'tahmin' aşamasında 6 şık: doğru kelime + aynı paketten 5 farklı kelime (tohumlu sırayla).
export function tahminSecenekleri(durum: CasusDurum): string[] {
  throw new Error(YOK);
}

// Bu oyunun kelime kartının id'si (oturumda tekrarı önlemek için çağıran `kullanilan`'a ekler).
export function kelimeKartId(durum: CasusDurum): string {
  throw new Error(YOK);
}

// Yalnızca 'sonuc' aşamasında.
export function sonuc(durum: CasusDurum): Sonuc {
  throw new Error(YOK);
}
