// OK mu NOK mu ekranı: saf durum makinesini (src/games/ok-mu-nok/oyun.ts) ekranlara bağlar ve her olaydan sonra kaydeder (KK-14).
import { useCallback, useEffect, useRef, useState } from 'react';
import { OYUN_ANAHTARI, oyunKaydet, oyunOku } from '../../core/kayit';
import { depo } from '../../depo';
import { paketler } from '../../desteler';
import { useDurum } from '../../durum';
import {
  type Durum,
  type Olay,
  gecerliKart,
  gosterAktif,
  isle,
  oduller,
  sonuc,
  yeniOyun,
} from '../../games/ok-mu-nok/oyun';
import type { OyunEkraniProps } from '../../games/oyun';
import { Diyalog, Dugme, Ekran } from '../../ui';
import { AcikEkrani } from './acik';
import { BitisEkrani } from './bitis';
import { KartEkrani } from './kart';
import { OyEkrani } from './oy';
import {
  GizliPaylasim,
  KartPaylasimi,
  OdulPaylasimi,
  usePaylas,
} from './paylasim';

export default function OkMuNokEkrani({
  deste,
  uzunluk,
  onCik,
  onOyuncular,
  onAnaMenu,
}: OyunEkraniProps) {
  const { oyuncular: ekip, oyunculariAyarla, kurulum } = useDurum();
  const [durum, setDurum] = useState<Durum | null>(null);
  const ref = useRef<Durum | null>(null);
  const paylasim = usePaylas();
  const [tanitilan, setTanitilan] = useState<number | null>(null); // kart tanıtımı (çevirme + geri sayım) biten kart

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
      const d = yeniOyun({ oyuncular, deste, uzunluk, tohum: Date.now() });
      ref.current = d;
      setTanitilan(null);
      setDurum(d);
      oyunKaydet(depo, d).catch(() => {});
    },
    [deste, uzunluk],
  );

  // Açılışta: kayıtlı yarım oyun varsa devam, yoksa yeni oyun.
  useEffect(() => {
    let iptal = false;
    oyunOku<Durum>(depo).then((kayit) => {
      if (iptal) return;
      if (kayit) {
        ref.current = kayit;
        setDurum(kayit);
        setTanitilan(kayit.tamamlanan);
        oyunculariAyarla(kayit.oyuncular);
      } else baslat(ekip);
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

  const paket = paketler.find((p) => p.id === kurulum.paket)?.ad ?? '';
  const toplam = durum.uzunluk ? String(durum.uzunluk) : '∞';
  const kartMetni = (id: string) =>
    durum.kartlar.find((k) => k.id === id)?.text ?? '';

  if (durum.asama === 'oy' && tanitilan !== durum.tamamlanan)
    return (
      <KartEkrani
        key={`${durum.tamamlanan}-${durum.karisim}`}
        metin={gecerliKart(durum).text}
        sira={durum.tamamlanan + 1}
        toplam={toplam}
        paket={paket}
        onBitti={() => setTanitilan(durum.tamamlanan)}
        onCik={onCik}
      />
    );

  if (durum.asama === 'oy')
    return (
      <OyEkrani
        kart={gecerliKart(durum).text}
        oyuncular={durum.oyuncular}
        oylar={durum.oylar}
        gosterAktif={gosterAktif(durum)}
        onOyla={(oyuncu, oy) =>
          gonder({ tip: 'oyla', oyuncu, oy, t: Date.now() })
        }
        onGoster={() => gonder({ tip: 'goster' })}
        onAtla={() => gonder({ tip: 'atla' })}
        onOyuncular={onOyuncular}
        onCik={onCik}
      />
    );

  if (durum.asama === 'acik')
    return (
      <>
        <AcikEkrani
          kart={gecerliKart(durum).text}
          key={durum.tamamlanan}
          oyuncular={durum.oyuncular}
          oylar={durum.oylar}
          sonuc={sonuc(durum)}
          onSonraki={() => gonder({ tip: 'sonraki' })}
          onBitir={() => gonder({ tip: 'bitir' })}
          onPaylas={paylasim.paylas}
        />
        <GizliPaylasim gorunum={paylasim.ref}>
          <KartPaylasimi
            kart={gecerliKart(durum).text}
            sonuc={sonuc(durum).metin}
            oylar={durum.oylar}
            oyuncular={durum.oyuncular}
            paket={paket}
          />
        </GizliPaylasim>
      </>
    );

  if (durum.asama === 'desteBitti')
    return (
      <Ekran>
        <Diyalog gorunur baslik="Deste bitti. Karıştırıp baştan?">
          <Dugme
            testID="karistir-evet"
            etiket="Karıştır"
            onPress={() => gonder({ tip: 'karistir' })}
          />
          <Dugme
            testID="karistir-hayir"
            tur="ikincil"
            etiket="Bitir"
            onPress={() => gonder({ tip: 'bitir' })}
          />
        </Diyalog>
      </Ekran>
    );

  return (
    <>
      <BitisEkrani
        kartSayisi={durum.gecmis.length}
        oduller={oduller(durum)}
        kartMetni={kartMetni}
        onTekrar={() => baslat(durum.oyuncular)}
        onAnaMenu={onAnaMenu}
        onPaylas={paylasim.paylas}
      />
      <GizliPaylasim gorunum={paylasim.ref}>
        <OdulPaylasimi
          oduller={oduller(durum)}
          kartMetni={kartMetni}
          kartSayisi={durum.gecmis.length}
        />
      </GizliPaylasim>
    </>
  );
}
