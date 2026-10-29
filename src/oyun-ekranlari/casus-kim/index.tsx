// Casus kim ekranı (#81): devir perdesi → basılı tut-gör kart (testID casus-kart, kart.tsx) → "Gördüm" (KK-44…KK-47). Tartışma ve sonrası #82.
// Kayıt: oyunOku(depo, durumGecerliMi) ile okunur; bozuk kayıt reddedilir, açık kart geri yüklenmez.
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import {
  type CasusDurum,
  type Olay,
  durumGecerliMi,
  isle,
  kart,
  kayittanYukle,
  kalanMs,
  kelimeKartId,
  oySonucu,
  oylamaAdaylari,
  siradaki,
  sonuc,
  tahminSecenekleri,
  yeniOyun,
} from '../../games/casus-kim/casus';
import type { OyunEkraniProps } from '../../games/oyun';
import { bosluk, cizgi, dokunmaAlani, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import { usePaylas, GizliPaylasim } from '../ortak/paylasim';
import { useOyunOturumu } from '../ortak/useOyunOturumu';
import { Aciklama } from './aciklama';
import { Cark } from './cark';
import { Oylama } from './oylama';
import { PaylasimIcerik } from './paylasim';
import { SonucEkrani } from './sonuc';
import { Tahmin } from './tahmin';
import { Tartisma } from './tartisma';
import { casusPaketleri } from './desteler';
import { GizliKart, useGizli } from './kart';

export default function CasusEkrani({ onCik, onAnaMenu }: OyunEkraniProps) {
  const { renk, oyuncular, oyunAyari, oyunAyariniAyarla } = useDurum();
  const [gordu, setGordu] = useState(false); // sıradaki oyuncu kartı en az bir kez açtı mı (Gördüm için)

  const [carkGoster, setCarkGoster] = useState(false); // son kart görülünce çark (yenilemede tekrar gösterilmez)
  const [simdi, setSimdi] = useState(Date.now());
  const paylas = usePaylas();

  // Oturum (olay → kayıt → durum, açılışta devam ya da yeni oyun) ortak hook'ta; Casus kim biten oyunu da kayıtta tutar
  // (bittiSil: false) ve açık kartı kayıttan geri yüklemez (kayittanYukle, KK-46/KK-47).
  const yeniCasus = () => {
    const paket =
      casusPaketleri.find((p) => p.id === oyunAyari.paket) ?? casusPaketleri[0];
    const kullanilan = (oyunAyari.kullanilan as string[] | undefined) ?? [];
    const d = yeniOyun({
      oyuncular,
      deste: paket.deste,
      casusSayisi: oyunAyari.casusSayisi as number | undefined,
      sureDk: (oyunAyari.sureDk as 3 | 5 | 8 | null | undefined) ?? null,
      tohum: Date.now(),
      kullanilan,
    });
    oyunAyariniAyarla({
      ...oyunAyari,
      kullanilan: [...kullanilan, kelimeKartId(d)],
    }); // oturumda kelime tekrarı yok (KK-51)
    return d;
  };
  const { durum, gonder, baslat } = useOyunOturumu<CasusDurum, Olay>({
    isle,
    gecerliMi: durumGecerliMi,
    baslangic: yeniCasus,
    yukle: kayittanYukle,
    bittiSil: false,
    onOlay: (eski, yeni) => {
      if (eski.asama === 'rol' && yeni.asama === 'tartisma')
        setCarkGoster(true);
    },
  });

  // Arka plana alınınca açık kart kapanır ve ekran gizlenir (KK-46).
  const gizli = useGizli(() => gonder({ tip: 'arkaPlan' }));

  // Tartışma süresi açıksa gerçek saate göre ilerler (arka plan fark etmez); dolunca titreşim + oylamaya geçiş (KK-48).
  const asama = durum?.asama;
  const sureMs = durum?.sureMs ?? null;
  useEffect(() => {
    if (asama !== 'tartisma' && asama !== 'oylama') return;
    const id = setInterval(() => {
      setSimdi(Date.now());
      if (asama === 'tartisma' && sureMs !== null)
        gonder({ tip: 'zaman', t: Date.now() });
    }, 500);
    return () => clearInterval(id);
  }, [asama, sureMs, gonder]);
  const oncekiAsama = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (
      oncekiAsama.current === 'tartisma' &&
      asama === 'oylama' &&
      durum &&
      kalanMs(durum, Date.now()) === 0
    )
      titret('uyari', true);
    oncekiAsama.current = asama;
  }, [asama, durum]);

  if (!durum) return <Ekran>{null}</Ekran>;

  // Ekran gizli (uygulama değiştirici / arka plan): içerik yok, yalnızca marka.
  if (gizli)
    return (
      <Ekran>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Yazi tur="baslikXl">Kafadar!</Yazi>
        </View>
      </Ekran>
    );

  if (durum.asama === 'rol') {
    const ad = siradaki(durum) ?? '';
    const ust = (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Yazi tur="etiket" soluk>
          {durum.sira} / {durum.oyuncular.length} gördü
        </Yazi>
        <Pressable
          testID="cik"
          accessibilityRole="button"
          accessibilityLabel="Oyundan çık"
          onPress={onCik}
          style={{
            width: dokunmaAlani,
            height: dokunmaAlani,
            borderRadius: yaricap.cip,
            borderWidth: cizgi.ince,
            borderColor: renk.kontur,
            backgroundColor: renk.yuzey,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Yazi>✕</Yazi>
        </Pressable>
      </View>
    );

    // Devir perdesi: kartından önce adı yazan tam ekran; kart henüz erişilemez (KK-44).
    if (!durum.acik)
      return (
        <Ekran key={`perde-${durum.sira}`}>
          {ust}
          <View
            testID="casus-perde"
            style={{ flex: 1, justifyContent: 'center', gap: bosluk.l }}
          >
            <Yazi tur="etiket" soluk>
              Telefonu ver
            </Yazi>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: renk.marka,
                borderWidth: cizgi.kalin,
                borderColor: renk.kontur,
                borderRadius: yaricap.dugme,
                paddingHorizontal: bosluk.xl,
                paddingVertical: bosluk.m,
                boxShadow: `5px 5px 0 ${renk.golge}`,
              }}
            >
              <Yazi tur="baslikXl" style={{ color: renk.kontur }}>
                {ad}
              </Yazi>
            </View>
            <Yazi soluk>Diğerleri ekrana bakmasın.</Yazi>
          </View>
          <Dugme
            testID="casus-ben"
            etiket={`Ben ${ad}'im`}
            onPress={() => {
              setGordu(false);
              gonder({ tip: 'benim' });
            }}
          />
        </Ekran>
      );

    // Kart ekranı: içerik yalnızca basılıyken; "Gördüm" kartı gördükten sonra açılır.
    return (
      <Ekran key={`kart-${durum.sira}`}>
        {ust}
        <GizliKart rol={kart(durum)} onAcildi={() => setGordu(true)} />
        <Dugme
          testID="casus-goruldu"
          etiket="Gördüm"
          pasif={!gordu}
          onPress={() => {
            setGordu(false);
            gonder({ tip: 'goruldu', t: Date.now() });
          }}
        />
      </Ekran>
    );
  }

  // Rol dağıtımından sonrası (#82): çark → tartışma → oylama → açıklama → tahmin → sonuç.
  const paket =
    casusPaketleri.find((p) =>
      p.deste.cards.some((c) => c.id === durum.kartlar.id),
    ) ?? casusPaketleri[0];
  const bitir = () => gonder({ tip: 'oyunuBitir' });

  if (durum.asama === 'tartisma' && carkGoster)
    return (
      <Cark
        oyuncular={durum.oyuncular}
        baslayan={durum.baslayan}
        gorenSayisi={durum.oyuncular.length}
        onBasla={() => setCarkGoster(false)}
        onCik={onCik}
      />
    );

  if (durum.asama === 'tartisma')
    return (
      <Tartisma
        sorular={paket.deste.sorular}
        baslangic={
          Math.abs(
            durum.kartlar.id
              .split('')
              .reduce((t, c) => t * 31 + c.charCodeAt(0), 7),
          ) + durum.oyuncular.indexOf(durum.baslayan)
        }
        toplamMs={durum.sureMs}
        kalanMs={kalanMs(durum, simdi)}
        onOylamaya={() => gonder({ tip: 'tartismayiBitir', t: Date.now() })}
        onBitir={bitir}
        onCik={onCik}
      />
    );

  if (durum.asama === 'oylama')
    return (
      <Oylama
        oyuncular={durum.oyuncular}
        adaylar={oylamaAdaylari(durum)}
        oylar={durum.oylar}
        tur={durum.tur}
        onOyla={(oyveren, secilen) => gonder({ tip: 'oyla', oyveren, secilen })}
        onBitirOylama={() => gonder({ tip: 'oylamayiBitir' })}
        onBitir={bitir}
        onCik={onCik}
      />
    );

  if (durum.asama === 'aciklama') {
    const secilen = oySonucu(durum)?.secilen ?? '';
    return (
      <Aciklama
        secilen={secilen}
        oySayisi={
          Object.values(durum.oylar).filter((x) => x === secilen).length
        }
        casusMu={durum.casuslar.includes(secilen)}
        onDevam={() => gonder({ tip: 'devam' })}
        onBitir={bitir}
        onCik={onCik}
      />
    );
  }

  if (durum.asama === 'tahmin')
    return (
      <Tahmin
        kim={
          oySonucu({ ...durum, asama: 'aciklama' })?.secilen ??
          durum.secilen ??
          ''
        }
        ipucu={durum.kartlar.ipucu}
        siklar={tahminSecenekleri(durum)}
        onTahmin={(kelime) => gonder({ tip: 'tahmin', kelime })}
        onBitir={bitir}
        onCik={onCik}
      />
    );

  // Sonuç
  const s = sonuc(durum);
  const neden =
    s.kazanan === 'grup'
      ? `${durum.secilen} casus çıktı ama kelimeyi bilemedi. Kelime:`
      : durum.secilen === null
        ? 'Oylama iki turda da eşit kaldı; kural gereği casuslar kazandı. Kelime:'
        : durum.casuslar.includes(durum.secilen)
          ? `${durum.secilen} kelimeyi bildi:`
          : `Grup yanlış kişiyi (${durum.secilen}) seçti. Kelime:`;
  const tekrar = () => {
    const kullanilan = (
      (oyunAyari.kullanilan as string[] | undefined) ?? []
    ).concat(kelimeKartId(durum));
    const d = yeniOyun({
      oyuncular: durum.oyuncular,
      deste: paket.deste,
      casusSayisi: durum.casuslar.length,
      sureDk:
        durum.sureMs === null ? null : ((durum.sureMs / 60_000) as 3 | 5 | 8),
      tohum: Date.now(),
      kullanilan,
    });
    oyunAyariniAyarla({
      ...oyunAyari,
      kullanilan: [...kullanilan, kelimeKartId(d)],
    });
    setGordu(false);
    setCarkGoster(false);
    baslat(d);
  };
  return (
    <>
      <SonucEkrani
        sonuc={s}
        ipucu={durum.kartlar.ipucu}
        neden={neden}
        onTekrar={tekrar}
        onPaylas={paylas.paylas}
        onAnaMenu={onAnaMenu}
      />
      <GizliPaylasim gorunum={paylas.ref}>
        <PaylasimIcerik sonuc={s} ipucu={durum.kartlar.ipucu} />
      </GizliPaylasim>
    </>
  );
}
