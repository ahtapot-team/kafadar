// İstemci ↔ sunucu protokolü: TEK KAYNAK (#48, #137). Tek bağlantı, JSON metin çerçeveleri, her mesajda `t`.
// Tipler oda.ts'ten gelir; sunucu yalnızca kabuktur, kurallar oda.ts'tedir (KK-40). Sunucu bu dosyadaki
// ayrıştırıcıları kullanır (acilisOku, mesajiOlayaCevir, kimlikMesaji): elle if-else ayrıştırma yok.
//
// Bağlanma (adres sorgusu): ?islem=kur&ad=Ali&paket=arkadas|cift|aile                      (OK mu NOK mu)
//                           ?islem=kur&ad=Ali&oyun=on-on-ama&paket=arkadas|gundelik|sevgili (10/10 ama)
//                           ?islem=kur&ad=Ali&oyun=quiz-night&paket=<content/quiz paket id'si> (Quiz Night)
//                           ?islem=katil&kod=123456&ad=Ali
//                           ?islem=don&kod=123456  → İLK istemci mesajı {t:'kimlik', kimlik}; belirteç adreste/günlükte
//                             görünmesin diye adreste yok, 10 sn içinde gelmezse soket kapanır.
// Sunucu → istemci: tamam | hata | gorunum | final (aşağıdaki `Sunucu`). Bağlanma hatasında hata çerçevesi gelir ve
// soket kapanır; oyun içi hatada soket açık kalır. Soket olmayan istek 426, bilinmeyen işlem 400 döner.
// İstemci → sunucu: baslat | ayril | cevapla (OK mu NOK mu: `oy`; Quiz Night: `sik` 0–3, kilitli) | puanla, sonraki (10/10 ama ve Quiz Night; sonraki yalnızca yetkili).
import type { PaketId } from '../icerik/kayit';
import type {
  Final,
  Gorunum,
  Hata,
  Kimlik,
  OdaTuru,
  Olay,
  OnOnFinal,
  Oy,
  QuizFinal,
} from './oda';

export type Paket = PaketId<'ok-mu-nok'>;
// 10/10 ama oda paketleri (content/onon/onon-<paket>.json). Oda türü `oyun` ile gelir; yoksa OK mu NOK mu (sunucu: ?oyun=on-on-ama&paket=…).
export type OnPaket = PaketId<'on-on-ama'>;

// Bağlanırken adres sorgusuyla gönderilir (?islem=kur&ad=…&paket=…); tarayıcı soketi tek bağlantıda odaya yönlenir.
export type Acilis =
  | {
      islem: 'kur';
      ad: string;
      paket: Paket | OnPaket | string;
      oyun?: OdaTuru;
    }
  | { islem: 'katil'; kod: string; ad: string }
  | { islem: 'don'; kod: string }; // yeniden bağlanma (KK-37); belirteç adreste değil, ilk mesajda gider

// Bağlantı kurulduktan sonra istemciden giden mesajlar.
export type Istemci =
  | { t: 'kimlik'; kimlik: Kimlik } // 'don' bağlantısının İLK mesajı: belirteç adrese konmaz (günlüklere sızmasın)
  | { t: 'baslat' }
  | { t: 'cevapla'; oy: Oy }
  | { t: 'cevapla'; sik: number } // yalnızca Quiz Night (0–3 tam sayı)
  | { t: 'puanla'; puan: number } // yalnızca 10/10 ama odası (0–10 tam sayı)
  | { t: 'sonraki' } // yalnızca 10/10 ama odası, açıklamadan sonra, yalnızca yetkili
  | { t: 'ayril' };

// 'cok-deneme': kod denemesi hız sınırı (KK-30). 'baglanti': istemci tarafı (sunucuya ulaşılamadı).
export type OdaHata = {
  kod: Hata['kod'] | 'cok-deneme' | 'baglanti';
  mesaj: string;
};

export type Sunucu =
  | { t: 'tamam'; kod: string; kimlik: Kimlik; ad: string; tur?: OdaTuru } // kur / katil / don başarısı (tur: odanın oyunu)
  | { t: 'hata'; hata: OdaHata }
  | { t: 'gorunum'; gorunum: Gorunum; simdi: number } // simdi = sunucu saati (ms)
  | { t: 'final'; final: Final | OnOnFinal | QuizFinal }; // 10/10 ama odasında OnOnFinal, Quiz Night odasında QuizFinal (görünümün `tur`'una bakılır)

const oyunOku = (x: string | null): OdaTuru =>
  x === 'on-on-ama' || x === 'quiz-night' ? x : 'ok-mu-nok';

// Bağlanma adresini (sorgu) okur; bilinmeyen işlem null (sunucu 400 döner). `paket` burada yalnızca okunur,
// geçerli olup olmadığına sunucu içerik kaydından bakar.
export function acilisOku(q: URLSearchParams): Acilis | null {
  const islem = q.get('islem');
  const ad = q.get('ad') ?? '';
  const kod = (q.get('kod') ?? '').toUpperCase();
  if (islem === 'kur')
    return {
      islem,
      ad,
      paket: (q.get('paket') ?? 'arkadas') as Paket | OnPaket,
      oyun: oyunOku(q.get('oyun')),
    };
  if (islem === 'katil') return { islem, kod, ad };
  if (islem === 'don') return { islem, kod };
  return null;
}

// Doğrulanmış oyuncunun istemci mesajını oda olayına çevirir; tanınmayan ya da bozuk mesaj null.
export function mesajiOlayaCevir(m: unknown, kimlik: Kimlik): Olay | null {
  const x = (m ?? {}) as {
    t?: unknown;
    oy?: unknown;
    sik?: unknown;
    puan?: unknown;
  };
  switch (x.t) {
    case 'baslat':
    case 'ayril':
    case 'sonraki':
      return { tip: x.t, kimlik };
    case 'cevapla':
      if (x.oy === 'OK' || x.oy === 'NOK')
        return { tip: 'cevapla', kimlik, oy: x.oy };
      return typeof x.sik === 'number' &&
        Number.isInteger(x.sik) &&
        x.sik >= 0 &&
        x.sik <= 3
        ? { tip: 'cevapla', kimlik, sik: x.sik }
        : null;
    case 'puanla':
      return typeof x.puan === 'number'
        ? { tip: 'puanla', kimlik, puan: x.puan }
        : null;
    default:
      return null;
  }
}

// 'don' bağlantısının ilk mesajı: {t:'kimlik', kimlik}; başka her şey null.
export function kimlikMesaji(m: unknown): Kimlik | null {
  const x = (m ?? {}) as { t?: unknown; kimlik?: unknown };
  return x.t === 'kimlik' && typeof x.kimlik === 'string' ? x.kimlik : null;
}
