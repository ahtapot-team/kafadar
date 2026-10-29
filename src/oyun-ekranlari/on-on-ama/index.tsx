// 10/10 ama ekranı: saf durum makinesini (src/games/on-on-ama/onon.ts) ekranlara bağlar ve her olaydan sonra kaydeder (KK-14).
// Kart tanıtımı (çevirme + 3-2-1), çıkış onayı, oyuncu düzenleme OK mu NOK mu ile aynıdır (yeniden kullanılır).
import { useState } from 'react';
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
import { useOyunOturumu } from '../ortak/useOyunOturumu';
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
  const paylasim = usePaylas();
  const [tanitilan, setTanitilan] = useState<number | null>(null); // kart tanıtımı biten kart

  const paket =
    ononPaketleri.find((p) => p.id === oyunAyari.paket) ?? ononPaketleri[0];
  const uzunluk = (oyunAyari.uzunluk ?? null) as 10 | 20 | null;

  const yeni = (oyuncular: string[]) =>
    yeniOyun({ oyuncular, deste: paket.deste, uzunluk, tohum: Date.now() });
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
        onTekrar={() => tekrar(durum.oyuncular)}
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
