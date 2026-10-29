// Oyun ekranının ortak oturumu: durum makinesi olayı uygular, her olaydan sonra kaydeder (KK-14),
// açılışta yarım oyunu devam ettirir ya da yeni oyun başlatır, oyuncu listesi değişince oyuna uygular (KK-6).
// Oyun ekranı yalnızca aşamaya göre ekran seçer. (OK mu NOK mu, 10/10 ama ve Casus kim kullanır.)
import { useCallback, useEffect, useRef, useState } from 'react';
import { OYUN_ANAHTARI, oyunKaydet, oyunOku } from '../../core/kayit';
import { depo } from '../../depo';

type Ayar<D, O> = {
  isle: (d: D, olay: O) => D;
  gecerliMi: (d: unknown) => d is D; // kayıtlı yarım oyun bu oyuna ait geçerli durum mu
  baslangic: () => D | null; // kayıt yokken yeni oyun; null: başlatılamaz → onYok
  onYok?: () => void;
  yukle?: (kayit: D) => D; // kayıttan okunan durumu ekran için hazırlar (ör. açık kartı kapatır)
  onYuklendi?: (kayit: D) => void;
  onOlay?: (eski: D, yeni: D) => void; // her olaydan sonra yan etki (ör. çark)
  // Biten oyun "yarım oyun" olarak kalmasın: true ise 'bitti' aşamasında kayıt silinir (varsayılan).
  bittiSil?: boolean;
  oyuncular?: string[]; // verilirse liste değişimi oyuna oyuncuEkle/oyuncuCikar olarak uygulanır
};

export function useOyunOturumu<
  D extends { asama: string; oyuncular: string[] },
  O,
>(a: Ayar<D, O>) {
  const [durum, setDurum] = useState<D | null>(null);
  const ref = useRef<D | null>(null);
  const ayar = useRef(a);
  ayar.current = a;

  // Durumu koyar ve kaydeder (yeni oyun, tekrar oyna, kayıttan devam).
  const baslat = useCallback((d: D) => {
    ref.current = d;
    setDurum(d);
    oyunKaydet(depo, d).catch(() => {});
  }, []);

  const gonder = useCallback((olay: O) => {
    const eski = ref.current;
    if (!eski) return;
    const yeni = ayar.current.isle(eski, olay);
    ayar.current.onOlay?.(eski, yeni);
    ref.current = yeni;
    setDurum(yeni);
    (ayar.current.bittiSil !== false && yeni.asama === 'bitti'
      ? depo.removeItem(OYUN_ANAHTARI)
      : oyunKaydet(depo, yeni)
    ).catch(() => {});
  }, []);

  // Açılışta: kayıtlı yarım oyun varsa devam, yoksa yeni oyun.
  useEffect(() => {
    let iptal = false;
    oyunOku<D>(depo, a.gecerliMi).then((kayit) => {
      if (iptal) return;
      if (kayit) {
        const d = ayar.current.yukle?.(kayit) ?? kayit;
        ref.current = d;
        setDurum(d);
        ayar.current.onYuklendi?.(d);
        if (ayar.current.yukle) oyunKaydet(depo, d).catch(() => {});
        return;
      }
      const yeni = ayar.current.baslangic();
      if (yeni) baslat(yeni);
      else ayar.current.onYok?.();
    });
    return () => {
      iptal = true;
    };
    // yalnızca ilk açılışta çalışır
  }, []);

  // Oyun ortasında oyuncu düzenleme ekranından dönünce listeyi oyuna uygula (KK-6).
  const liste = a.oyuncular;
  useEffect(() => {
    const d = ref.current;
    if (!d || !liste) return;
    liste
      .filter((o) => !d.oyuncular.includes(o))
      .forEach((ad) => gonder({ tip: 'oyuncuEkle', ad } as O));
    d.oyuncular
      .filter((o) => !liste.includes(o))
      .forEach((ad) => gonder({ tip: 'oyuncuCikar', ad } as O));
  }, [liste, gonder]);

  return { durum, gonder, baslat };
}
