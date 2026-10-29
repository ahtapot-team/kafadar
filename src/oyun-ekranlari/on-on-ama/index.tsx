// 10/10 ama ekranı: saf durum makinesini (src/games/on-on-ama/onon.ts) ekranlara bağlar ve her olaydan sonra kaydeder (KK-14).
// Kart tanıtımı (çevirme + 3-2-1), çıkış onayı, oyuncu düzenleme OK mu NOK mu ile aynıdır (yeniden kullanılır).
import { useCallback, useEffect, useRef, useState } from 'react';
import { OYUN_ANAHTARI, oyunKaydet, oyunOku } from '../../core/kayit';
import { depo } from '../../depo';
import { useDurum } from '../../durum';
import {
  type Durum,
  type Olay,
  durumGecerliMi,
  gecerliKart,
  gosterAktif,
  isle,
  oduller,
  ozet,
  yeniOyun,
} from '../../games/on-on-ama/onon';
import type { OyunEkraniProps } from '../../games/oyun';
import { Diyalog, Dugme, Ekran } from '../../ui';
import { KartEkrani } from '../ortak/kart';
import { GizliPaylasim, usePaylas } from '../ortak/paylasim';
import { AcikEkrani } from './acik';
import { BitisEkrani } from './bitis';
import { ononPaketleri } from './desteler';
import { ikizFarki, ondalik, verilenOrtalama } from './ortak';
import { BASLIK, KartPaylasimi, OdulPaylasimi } from './paylasim';
import { PuanEkrani } from './puan';

export default function OnOnAmaEkrani({
  onCik,
  onOyuncular,
  onAnaMenu,
}: OyunEkraniProps) {
  const { oyuncular: ekip, oyunculariAyarla, oyunAyari } = useDurum();
  const [durum, setDurum] = useState<Durum | null>(null);
  const ref = useRef<Durum | null>(null);
  const paylasim = usePaylas();
  const [tanitilan, setTanitilan] = useState<number | null>(null); // kart tanıtımı biten kart

  const paket =
    ononPaketleri.find((p) => p.id === oyunAyari.paket) ?? ononPaketleri[0];
  const uzunluk = (oyunAyari.uzunluk ?? null) as 10 | 20 | null;

  const gonder = useCallback((olay: Olay) => {
    if (!ref.current) return;
    const yeni = isle(ref.current, olay);
    ref.current = yeni;
    setDurum(yeni);
    // Biten oyun "yarım oyun" olarak kalmasın (KK-14).
    (yeni.asama === 'bitti'
      ? depo.removeItem(OYUN_ANAHTARI)
      : oyunKaydet(depo, yeni)
    ).catch(() => {});
  }, []);

  const baslat = useCallback(
    (oyuncular: string[]) => {
      const d = yeniOyun({
        oyuncular,
        deste: paket.deste,
        uzunluk,
        tohum: Date.now(),
      });
      ref.current = d;
      setTanitilan(null);
      setDurum(d);
      oyunKaydet(depo, d).catch(() => {});
    },
    [paket, uzunluk],
  );

  // Açılışta: kayıtlı yarım oyun varsa devam, yoksa yeni oyun.
  useEffect(() => {
    let iptal = false;
    oyunOku<Durum>(depo, durumGecerliMi).then((kayit) => {
      if (iptal) return;
      if (kayit) {
        ref.current = kayit;
        setDurum(kayit);
        setTanitilan(kayit.tamamlanan);
        oyunculariAyarla(kayit.oyuncular);
      } else if (ekip.length >= 2) baslat(ekip);
      else onAnaMenu(); // bozuk kayıt silindi, oyuncu listesi yok: ana ekrana dön (#27)
    });
    return () => {
      iptal = true;
    };
    // yalnızca ilk açılışta çalışır
  }, []);

  // Oyun ortasında oyuncu düzenleme ekranından dönünce listeyi oyuna uygula (KK-6).
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    ekip
      .filter((o) => !d.oyuncular.includes(o))
      .forEach((ad) => gonder({ tip: 'oyuncuEkle', ad }));
    d.oyuncular
      .filter((o) => !ekip.includes(o))
      .forEach((ad) => gonder({ tip: 'oyuncuCikar', ad }));
  }, [ekip, gonder]);

  if (!durum) return <Ekran>{null}</Ekran>;

  const toplam = durum.uzunluk ? String(durum.uzunluk) : '∞';

  if (durum.asama === 'puan' && tanitilan !== durum.tamamlanan)
    return (
      <KartEkrani
        key={`${durum.tamamlanan}-${durum.karisim}`}
        metin={gecerliKart(durum).text}
        sira={durum.tamamlanan + 1}
        toplam={toplam}
        paket={paket.ad}
        etiket="10/10"
        soru="Yeni puanın kaç?"
        altMetin="Parmaklar hazır: 0'dan 10'a!"
        onBitti={() => setTanitilan(durum.tamamlanan)}
        onCik={onCik}
      />
    );

  if (durum.asama === 'puan')
    return (
      <PuanEkrani
        kart={gecerliKart(durum).text}
        oyuncular={durum.oyuncular}
        puanlar={durum.puanlar}
        gosterAktif={gosterAktif(durum)}
        onPuan={(oyuncu, puan) => gonder({ tip: 'puan', oyuncu, puan })}
        onGoster={() => gonder({ tip: 'goster' })}
        onAtla={() => gonder({ tip: 'atla' })}
        onOyuncular={onOyuncular}
        onCik={onCik}
      />
    );

  if (durum.asama === 'acik') {
    const o = ozet(durum);
    return (
      <>
        <AcikEkrani
          key={durum.tamamlanan}
          kart={gecerliKart(durum).text}
          oyuncular={durum.oyuncular}
          puanlar={durum.puanlar}
          ozet={o}
          onSonraki={() => gonder({ tip: 'sonraki' })}
          onBitir={() => gonder({ tip: 'bitir' })}
          onPaylas={paylasim.paylas}
        />
        <GizliPaylasim gorunum={paylasim.ref} baslik={BASLIK}>
          <KartPaylasimi
            kart={gecerliKart(durum).text}
            ozet={o}
            puanlar={durum.puanlar}
            oyuncular={durum.oyuncular}
            paket={paket.ad}
          />
        </GizliPaylasim>
      </>
    );
  }

  if (durum.asama === 'desteBitti')
    return (
      <Ekran>
        <Diyalog gorunur baslik="Deste bitti. Karıştırıp baştan?">
          <Dugme
            testID="onon-karistir-evet"
            etiket="Karıştır"
            onPress={() => gonder({ tip: 'karistir' })}
          />
          <Dugme
            testID="onon-karistir-hayir"
            tur="ikincil"
            etiket="Bitir"
            onPress={() => gonder({ tip: 'bitir' })}
          />
        </Diyalog>
      </Ekran>
    );

  const od = oduller(durum);
  const altSatir = {
    acimasiz: (ad: string) =>
      `Ortalama puanı ${ondalik(verilenOrtalama(durum.gecmis, ad))}`,
    melek: (ad: string) =>
      `Ortalama puanı ${ondalik(verilenOrtalama(durum.gecmis, ad))}`,
    ikiz: (a: string, b: string) =>
      `Puanları ortalama ${ondalik(ikizFarki(durum.gecmis, a, b))} farklı`,
  };
  return (
    <>
      <BitisEkrani
        kartSayisi={durum.gecmis.length}
        oduller={od}
        altSatir={altSatir}
        onTekrar={() => baslat(durum.oyuncular)}
        onAnaMenu={onAnaMenu}
        onPaylas={paylasim.paylas}
      />
      <GizliPaylasim gorunum={paylasim.ref} baslik={BASLIK}>
        <OdulPaylasimi
          oduller={od}
          altSatir={altSatir}
          kartSayisi={durum.gecmis.length}
        />
      </GizliPaylasim>
    </>
  );
}
