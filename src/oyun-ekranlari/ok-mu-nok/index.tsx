// OK mu NOK mu ekranı: saf durum makinesini (src/games/ok-mu-nok/oyun.ts) ekranlara bağlar ve her olaydan sonra kaydeder (KK-14).
import { useState } from 'react';
import { paketler } from '../../desteler';
import { useDurum } from '../../durum';
import {
  type Durum,
  type Olay,
  durumGecerliMi,
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
import { KartEkrani } from '../ortak/kart';
import { useOyunOturumu } from '../ortak/useOyunOturumu';
import { OyEkrani } from './oy';
import { GizliPaylasim, usePaylas } from '../ortak/paylasim';
import { KartPaylasimi, OdulPaylasimi } from './paylasim';

export default function OkMuNokEkrani({
  deste,
  uzunluk,
  onCik,
  onOyuncular,
  onAnaMenu,
}: OyunEkraniProps) {
  const { oyuncular: ekip, oyunculariAyarla, kurulum } = useDurum();
  const paylasim = usePaylas();
  const [tanitilan, setTanitilan] = useState<number | null>(null); // kart tanıtımı (çevirme + geri sayım) biten kart

  const yeni = (oyuncular: string[]) =>
    yeniOyun({ oyuncular, deste, uzunluk, tohum: Date.now() });
  const { durum, gonder, baslat } = useOyunOturumu<Durum, Olay>({
    isle,
    gecerliMi: durumGecerliMi,
    baslangic: () => (ekip.length >= 2 ? yeni(ekip) : null),
    onYok: onAnaMenu, // bozuk kayıt silindi, oyuncu listesi yok: ana ekrana dön (#27)
    onYuklendi: (kayit) => {
      setTanitilan(kayit.tamamlanan);
      oyunculariAyarla(kayit.oyuncular);
    },
    oyuncular: ekip,
  });
  const tekrar = (oyuncular: string[]) => {
    setTanitilan(null);
    baslat(yeni(oyuncular));
  };

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
        onTekrar={() => tekrar(durum.oyuncular)}
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
