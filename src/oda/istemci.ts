// Oda istemcisi (saf, React'sız): taşıma üzerinden sunucuyla konuşur; kimliği cihazda saklar;
// bağlantı kopunca aynı kimlikle geri döner ve "Yeniden bağlanıyor…" durumunu tutar (KK-37).
import type { Depo } from '../core/kayit';
import type { Final, Gorunum, Kimlik } from './oda';
import type { Acilis, OdaHata, Paket, Sunucu } from './mesaj';
import type { Tasima, TasimaUretici } from './tasima';

export const ODA_ANAHTARI = 'kafadar:oda';
const GERI_DONUS_MS = [1000, 2000, 4000, 8000];

// 'yeniden': odadayken bağlantı koptu (ekranda "Yeniden bağlanıyor…").
export type IstemciDurumu = {
  baglanti: 'kapali' | 'baglaniyor' | 'acik' | 'yeniden';
  kod: string | null;
  kimlik: Kimlik | null;
  ad: string | null;
  gorunum: Gorunum | null;
  alindi: number; // gorunum'ün yerel saatle geldiği an (kalan süre hesabı için)
  final: Final | null;
  hata: OdaHata | null;
};

const BOS: IstemciDurumu = {
  baglanti: 'kapali',
  kod: null,
  kimlik: null,
  ad: null,
  gorunum: null,
  alindi: 0,
  final: null,
  hata: null,
};

export type IstemciAyari = {
  uret: TasimaUretici;
  depo: Depo;
  saat: () => number; // yerel saat (ms); dışarıdan verilir
  zamanla?: (ms: number, f: () => void) => () => void; // yeniden denemeyi erteler; iptal fonksiyonu döner
};

type Kayit = { kod: string; kimlik: Kimlik; ad: string };

export class OdaIstemci {
  private d: IstemciDurumu = BOS;
  private dinleyiciler = new Set<(d: IstemciDurumu) => void>();
  private tasima: Tasima | null = null;
  private ilk: Acilis | null = null; // bağlanırken gidecek komut (kur/katil)
  private iptal: (() => void) | null = null;
  private deneme = 0;
  private saat: () => number;
  private zamanla: NonNullable<IstemciAyari['zamanla']>;

  constructor(private a: IstemciAyari) {
    this.saat = a.saat;
    this.zamanla =
      a.zamanla ??
      ((ms, f) => {
        const t = setTimeout(f, ms);
        return () => clearTimeout(t);
      });
  }

  get durum() {
    return this.d;
  }

  abone(f: (d: IstemciDurumu) => void) {
    this.dinleyiciler.add(f);
    return () => void this.dinleyiciler.delete(f);
  }

  private ayarla(k: Partial<IstemciDurumu>) {
    this.d = { ...this.d, ...k };
    this.dinleyiciler.forEach((f) => f(this.d));
  }

  // Uygulama açılışında: cihazda saklı oda kimliği varsa aynı kimlikle odaya dönmeyi dener (KK-37).
  async devamEt(): Promise<boolean> {
    const k = await this.kayitOku();
    if (!k) return false;
    this.ayarla({ ...BOS, kod: k.kod, kimlik: k.kimlik, ad: k.ad });
    this.baglan();
    return true;
  }

  kur(ad: string, paket: Paket) {
    this.sifirla();
    this.ilk = { islem: 'kur', ad, paket };
    this.baglan();
  }

  katil(kod: string, ad: string) {
    this.sifirla();
    this.ilk = { islem: 'katil', kod: kod.trim().toUpperCase(), ad };
    this.baglan();
  }

  baslat() {
    this.tasima?.gonder({ t: 'baslat' });
  }

  cevapla(oy: 'OK' | 'NOK') {
    this.tasima?.gonder({ t: 'cevapla', oy });
  }

  ayril() {
    this.tasima?.gonder({ t: 'ayril' });
    this.sifirla();
  }

  // Uygulama ön plana dönünce: bağlantıyı her zaman tazele (kapat + 'don'); arka plandan dönünce soket ölü olabilir.
  // Final gösterilirken yeniden bağlanılmaz, final silinmez.
  onPlana() {
    if (!this.d.kimlik || this.bitti()) return;
    this.baglan();
  }

  private bitti() {
    return this.d.final !== null || this.d.gorunum?.asama === 'bitti';
  }

  private sifirla() {
    this.iptal?.();
    this.iptal = null;
    this.tasima?.kapat();
    this.tasima = null;
    this.ilk = null;
    this.deneme = 0;
    void this.a.depo.removeItem(ODA_ANAHTARI).catch(() => {});
    this.ayarla({ ...BOS });
  }

  private baglan() {
    this.iptal?.();
    this.iptal = null;
    this.tasima?.kapat();
    const odada = this.d.kimlik !== null;
    this.ayarla({ baglanti: odada ? 'yeniden' : 'baglaniyor', hata: null });
    const { kod, kimlik } = this.d;
    const acilis: Acilis | null =
      kimlik && kod ? { islem: 'don', kod, kimlik } : this.ilk;
    if (!acilis) return;
    this.tasima = this.a.uret(acilis, {
      acildi: () => {}, // sunucu önce 'tamam' ya da 'hata' gönderir
      mesaj: (m) => this.geldi(m),
      kapandi: () => this.koptu(),
    });
  }

  private geldi(m: Sunucu) {
    if (m.t === 'tamam') {
      this.deneme = 0;
      this.ilk = null;
      this.ayarla({
        baglanti: 'acik',
        kod: m.kod,
        kimlik: m.kimlik,
        ad: m.ad,
        hata: null,
      });
      void this.kayitYaz({ kod: m.kod, kimlik: m.kimlik, ad: m.ad });
    } else if (m.t === 'gorunum') {
      this.ayarla({ gorunum: m.gorunum, alindi: this.saat() });
    } else if (m.t === 'final') {
      this.ayarla({ final: m.final });
    } else if (m.t === 'hata') {
      // Odaya dönülemiyorsa (kapandı/tanımsız) kayıt geçersizdir: temiz başlangıç + hata.
      // Geçici hatada (cok-deneme vb.) kimlik silinmez, "yeniden" durumunda kalınır.
      const olu = m.hata.kod === 'kapali' || m.hata.kod === 'tanimsiz';
      if (olu && this.d.kimlik && !this.ilk && this.d.baglanti !== 'acik') {
        this.sifirla();
      }
      this.ayarla({ hata: m.hata });
    }
  }

  private koptu() {
    this.tasima = null;
    if (this.d.kimlik && this.bitti()) {
      this.ayarla({ baglanti: 'kapali' }); // oyun bitti: yeniden bağlanma yok, final kalır
    } else if (this.d.kimlik) {
      // Odadayken kopma: aynı kimlikle geri dön (KK-37), aralıklı yeniden dene.
      this.ayarla({ baglanti: 'yeniden' });
      const bekle =
        GERI_DONUS_MS[Math.min(this.deneme++, GERI_DONUS_MS.length - 1)];
      this.iptal = this.zamanla(bekle, () => this.baglan());
    } else {
      this.ayarla({
        baglanti: 'kapali',
        hata: this.d.hata ?? {
          kod: 'baglanti',
          mesaj:
            'Sunucuya bağlanılamadı. İnternetini kontrol edip tekrar dene.',
        },
      });
    }
  }

  private async kayitOku(): Promise<Kayit | null> {
    try {
      const k: unknown = JSON.parse(
        (await this.a.depo.getItem(ODA_ANAHTARI)) ?? 'null',
      );
      const o = k as Partial<Kayit> | null;
      return o &&
        typeof o.kod === 'string' &&
        typeof o.kimlik === 'string' &&
        typeof o.ad === 'string'
        ? (o as Kayit)
        : null;
    } catch {
      return null;
    }
  }

  private kayitYaz(k: Kayit) {
    return this.a.depo.setItem(ODA_ANAHTARI, JSON.stringify(k)).catch(() => {});
  }
}

// Sunucu saatine göre kalan süre (ms): sunucudan gelen kalanMs eksi geçen yerel süre.
export function kalanMs(d: IstemciDurumu, simdi: number): number {
  const k = d.gorunum?.kalanMs;
  return k === undefined ? 0 : Math.max(0, k - (simdi - d.alindi));
}
