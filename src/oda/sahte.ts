// Sahte sunucu: gerçek sunucu (#48) gelene kadar geliştirme ve testlerde oda.ts mantığını çalıştırır.
// Gerçek sunucuyla aynı mesaj biçimini (mesaj.ts) konuşur; ağ yoktur.
import type { Deste } from '../core/deste';
import type { Rng } from '../core/rng';
import type { Acilis, Istemci, OdaHata, OnPaket, Paket, Sunucu } from './mesaj';
import {
  type Kimlik,
  type OdaDurum,
  type OdaTuru,
  type Olay,
  final,
  gorunum,
  isle,
  kodUret,
  odaKur,
  onOnFinal,
  quizFinal,
} from './oda';
import type { TasimaDinleyici, TasimaUretici } from './tasima';

type KurKatilDon =
  | { t: 'kur'; ad: string; paket: string; oyun?: OdaTuru }
  | { t: 'katil'; kod: string; ad: string }
  | { t: 'don'; kod: string; kimlik: Kimlik };

type Baglanti = { d: TasimaDinleyici; kod?: string; kimlik?: Kimlik };

export class SahteSunucu {
  private odalar = new Map<string, OdaDurum>();
  private baglantilar = new Set<Baglanti>();

  get simdi() {
    return this.saat() + this.ofset;
  }

  private ofset = 0; // ilerle() ile eklenen süre

  constructor(
    private saat: () => number, // dışarıdan verilir (src/oda saf kalır)
    private rng: Rng,
    private desteler: Partial<Record<Paket | OnPaket, Deste>>,
  ) {}

  uret: TasimaUretici = (acilis, d, kimlik) => {
    const b: Baglanti = { d };
    this.baglantilar.add(b);
    void Promise.resolve().then(() => {
      if (!this.baglantilar.has(b)) return;
      d.acildi();
      this.ac(b, acilis, kimlik);
    });
    return {
      gonder: (m) => this.al(b, m),
      kapat: () => void this.baglantilar.delete(b),
    };
  };

  // Test: ağ koptu (bağlantı sunucudan düşer; oyuncu 'kop' işaretlenir).
  kopar(kimlik: Kimlik) {
    for (const b of this.baglantilar) {
      if (b.kimlik !== kimlik) continue;
      this.baglantilar.delete(b);
      this.olay(b.kod!, { tip: 'kop', kimlik });
      b.d.kapandi();
    }
  }

  // Test: süre ilerler; sunucu alarmı çalışır.
  ilerle(ms: number) {
    this.ofset += ms;
    for (const kod of this.odalar.keys()) this.olay(kod, { tip: 'zaman' });
  }

  private gonder(b: Baglanti, m: Sunucu) {
    b.d.mesaj(m);
  }

  private hata(b: Baglanti, hata: OdaHata) {
    this.gonder(b, { t: 'hata', hata });
  }

  private olay(kod: string, o: Parameters<typeof isle>[1], b?: Baglanti) {
    const d = this.odalar.get(kod);
    if (!d) return null;
    const s = isle(d, o, this.simdi);
    if (s.hata) {
      if (b) this.hata(b, s.hata);
      return s;
    }
    this.odalar.set(kod, s.durum);
    this.yay(kod);
    return s;
  }

  private yay(kod: string) {
    const d = this.odalar.get(kod)!;
    for (const b of this.baglantilar) {
      if (b.kod !== kod || !b.kimlik) continue;
      this.gonder(b, {
        t: 'gorunum',
        gorunum: gorunum(d, b.kimlik, this.simdi),
        simdi: this.simdi,
      });
      if (d.asama === 'bitti')
        this.gonder(b, {
          t: 'final',
          final:
            d.tur === 'on-on-ama'
              ? onOnFinal(d)
              : d.tur === 'quiz-night'
                ? quizFinal(d)
                : final(d),
        });
    }
  }

  private girdi(b: Baglanti, kod: string, kimlik: Kimlik, ad: string) {
    b.kod = kod;
    b.kimlik = kimlik;
    this.gonder(b, { t: 'tamam', kod, kimlik, ad });
    this.yay(kod);
  }

  // Bağlanma komutu (kur/katil/don); hata gelirse hata çerçevesi gider ve soket kapanır (gerçek sunucu gibi).
  private ac(b: Baglanti, a: Acilis, kimlik?: string) {
    this.al(
      b,
      a.islem === 'kur'
        ? { t: 'kur', ad: a.ad, paket: a.paket, oyun: a.oyun }
        : a.islem === 'katil'
          ? { t: 'katil', kod: a.kod, ad: a.ad }
          : { t: 'don', kod: a.kod, kimlik: kimlik ?? '' },
    );
    if (!b.kimlik) {
      this.baglantilar.delete(b);
      b.d.kapandi();
    }
  }

  private al(b: Baglanti, m: Istemci | KurKatilDon) {
    if (m.t === 'kur') {
      let kod = kodUret(this.rng);
      while (this.odalar.has(kod)) kod = kodUret(this.rng);
      const { durum, kimlik } = odaKur({
        kod,
        kurucuAd: m.ad,
        deste: this.desteler[m.paket as Paket | OnPaket]!, // sahte sunucu Quiz Night paketi taşımaz
        tohum: Math.floor(this.rng() * 1e9),
        simdi: this.simdi,
        tur: m.oyun,
      });
      this.odalar.set(kod, durum);
      this.girdi(b, kod, kimlik, durum.oyuncular[0].ad);
    } else if (m.t === 'katil') {
      if (!this.odalar.has(m.kod))
        return this.hata(b, {
          kod: 'kapali',
          mesaj: 'Bu kodla açık bir oda yok. Kodu arkadaşına tekrar sor.',
        });
      const s = this.olay(m.kod, { tip: 'katil', ad: m.ad }, b);
      if (s && !s.hata) this.girdi(b, m.kod, s.kimlik!, s.ad!);
    } else if (m.t === 'don') {
      if (!this.odalar.has(m.kod))
        return this.hata(b, { kod: 'kapali', mesaj: 'Bu oda kapandı.' });
      const s = this.olay(m.kod, { tip: 'don', kimlik: m.kimlik }, b);
      if (s && !s.hata) {
        const ad = this.odalar
          .get(m.kod)!
          .oyuncular.find((p) => p.kimlik === m.kimlik)!.ad;
        this.girdi(b, m.kod, m.kimlik, ad);
      }
    } else if (b.kod && b.kimlik) {
      const o =
        m.t === 'baslat'
          ? ({ tip: 'baslat', kimlik: b.kimlik } as const)
          : m.t === 'cevapla'
            ? ({
                tip: 'cevapla',
                kimlik: b.kimlik,
                ...('sik' in m ? { sik: m.sik } : { oy: m.oy }),
              } as Olay)
            : m.t === 'puanla'
              ? ({ tip: 'puanla', kimlik: b.kimlik, puan: m.puan } as const)
              : m.t === 'sonraki'
                ? ({ tip: 'sonraki', kimlik: b.kimlik } as const)
                : ({ tip: 'ayril', kimlik: b.kimlik } as const);
      this.olay(b.kod, o, b);
    }
  }
}
