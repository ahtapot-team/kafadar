// 10/10 ama oda finali (KK-69): ödüller (En acımasız · Melek kalpli · Ruh ikizleri), sonra kişisel kart; paylaş, tekrar oyna.
// Boşlar ve odadan çıkanlar ödüllere girmez (sunucu hesaplar); kişisel kartta kalırlar.
import { Platform, View } from 'react-native';
import type { IstemciDurumu } from '../oda/istemci';
import type { OnOnFinal } from '../oda/oda';
import { onOnKisisel } from '../oda/onon-ozet';
import { GizliPaylasim, usePaylas } from '../oyun-ekranlari/ortak/paylasim';
import { OdulKarti } from '../oyun-ekranlari/ortak/odul';
import { ondalik } from '../oyun-ekranlari/on-on-ama/ortak';
import { BASLIK, OdulPaylasimi } from '../oyun-ekranlari/on-on-ama/paylasim';
import { useDurum } from '../durum';
import { bosluk, yaricap } from '../tema';
import { Dugme, Ekran, Yazi } from '../ui';
import { OdaUst } from './ust';

const ort = (l: number[]) =>
  l.length ? l.reduce((a, b) => a + b, 0) / l.length : null;

// İki oyuncunun ortak kartlarda puan farkının ortalaması.
function ikizFarki(f: OnOnFinal, a: string, b: string) {
  const x = f.kisisel[a]?.verilen ?? [];
  const y = f.kisisel[b]?.verilen ?? [];
  const fark: number[] = [];
  x.forEach((p, i) => {
    const q = y[i];
    if (p !== null && q !== null && q !== undefined) fark.push(Math.abs(p - q));
  });
  return ort(fark);
}

function Cip({ metin, dolgu }: { metin: string; dolgu: string }) {
  const { renk } = useDurum();
  return (
    <View
      style={{
        paddingHorizontal: bosluk.m,
        paddingVertical: bosluk.xs,
        borderRadius: yaricap.cip,
        borderWidth: 3,
        borderColor: renk.kontur,
        backgroundColor: dolgu,
      }}
    >
      <Yazi tur="etiket" style={{ color: renk.kontur }}>
        {metin}
      </Yazi>
    </View>
  );
}

function KisiselKart({ f, ad }: { f: OnOnFinal; ad: string }) {
  const { renk } = useDurum();
  const k = onOnKisisel(f, ad);
  const fark =
    k.odaFarki === null
      ? null
      : `odanın ortalamasından ${ondalik(Math.abs(k.odaFarki))} ${k.odaFarki >= 0 ? 'cömert' : 'acımasız'}`;
  return (
    <View
      testID="oda-onon-kisisel"
      style={{
        backgroundColor: renk.marka,
        borderWidth: 4,
        borderColor: renk.kontur,
        borderRadius: yaricap.kart,
        padding: bosluk.l,
        gap: bosluk.xs,
        boxShadow: `8px 8px 0 ${renk.golge}`,
      }}
    >
      <Yazi tur="etiket" style={{ color: renk.kontur }}>
        {ad}, bu odada ortalaman
      </Yazi>
      <Yazi tur="baslikXl" style={{ color: renk.kontur }}>
        {k.ortalama === null ? '—' : ondalik(k.ortalama)}
      </Yazi>
      {k.ortalama === null ? (
        <Yazi style={{ color: renk.kontur }}>Hiç puan vermedin.</Yazi>
      ) : (
        fark && (
          <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 18 }}>
            {fark}
          </Yazi>
        )
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
        {k.ikiz && <Cip metin={`Ruh ikizin: ${k.ikiz}`} dolgu={renk.marka2} />}
        {k.enYuksek !== null && (
          <Cip metin={`En yüksek: ${k.enYuksek}`} dolgu={renk.ok} />
        )}
        {k.enDusuk !== null && (
          <Cip metin={`En düşük: ${k.enDusuk}`} dolgu={renk.nok} />
        )}
        {k.bos > 0 && <Cip metin={`${k.bos} boş`} dolgu={renk.zemin} />}
      </View>
    </View>
  );
}

export function OnFinalEkrani({
  durum,
  onTekrar,
  onAnaMenu,
}: {
  durum: IstemciDurumu;
  onTekrar: () => void;
  onAnaMenu: () => void;
}) {
  const f = durum.onFinal;
  const kod = durum.kod ?? durum.gorunum?.kod ?? '';
  const paylas = usePaylas();
  if (!f)
    return (
      <Ekran>
        <Yazi tur="baslik">Sonuçlar hazırlanıyor…</Yazi>
      </Ekran>
    );
  const ad = durum.ad ?? '';
  const od = f.oduller;
  const ortalamaNotu = (x: string) => {
    const o = ort(
      (f.kisisel[x]?.verilen ?? []).filter((p): p is number => p !== null),
    );
    return `Ortalama puanı ${o === null ? '—' : ondalik(o)}`;
  };
  const altSatir = {
    acimasiz: ortalamaNotu,
    melek: ortalamaNotu,
    ikiz: (a: string, b: string) => {
      const x = ikizFarki(f, a, b);
      return `Puanları ortalama ${x === null ? '—' : ondalik(x)} farklı`;
    },
  };
  return (
    <>
      <Ekran>
        <OdaUst kod={kod} orta={`Final · ${f.kartlar.length} kart`} />
        <Yazi tur="baslik">Gecenin ödülleri</Yazi>
        {od.enAcimasiz.length > 0 && (
          <OdulKarti
            testID="oda-onon-odul-en-acimasiz"
            baslik="En acımasız"
            renkAdi="nok"
            satirlar={od.enAcimasiz}
            notlar={od.enAcimasiz.map(altSatir.acimasiz)}
          />
        )}
        {od.melekKalpli.length > 0 && (
          <OdulKarti
            testID="oda-onon-odul-melek-kalpli"
            baslik="Melek kalpli"
            renkAdi="ok"
            satirlar={od.melekKalpli}
            notlar={od.melekKalpli.map(altSatir.melek)}
          />
        )}
        {od.ruhIkizleri.length > 0 && (
          <OdulKarti
            testID="oda-onon-odul-ruh-ikizleri"
            baslik="Ruh ikizleri"
            renkAdi="marka2"
            satirlar={od.ruhIkizleri.map(([a, b]) => `${a} & ${b}`)}
            notlar={od.ruhIkizleri.map(([a, b]) => altSatir.ikiz(a, b))}
          />
        )}
        <KisiselKart f={f} ad={ad} />
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', gap: bosluk.m }}>
          {Platform.OS !== 'web' && (
            <View style={{ flex: 1 }}>
              <Dugme
                testID="oda-onon-paylas"
                etiket="Paylaş"
                onPress={paylas.paylas}
              />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Dugme
              testID="oda-onon-tekrar"
              tur="ikincil"
              etiket="Tekrar oyna"
              onPress={onTekrar}
            />
          </View>
        </View>
        <Dugme
          testID="oda-onon-ana-menu"
          tur="ikincil"
          etiket="Ana menü"
          onPress={onAnaMenu}
        />
      </Ekran>
      {Platform.OS !== 'web' && (
        <GizliPaylasim gorunum={paylas.ref} baslik={BASLIK}>
          <OdulPaylasimi
            oduller={od}
            altSatir={altSatir}
            kartSayisi={f.kartlar.length}
          />
        </GizliPaylasim>
      )}
    </>
  );
}
