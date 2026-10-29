// Oda finali (KK-36, KK-38): dağılım → en tartışmalı → ödüller → kim ne dedi → kişisel kart; paylaş, tekrar oyna.
import { useState } from 'react';
import { View } from 'react-native';
import {
  GizliPaylasim,
  PaylasDugmesi,
  usePaylas,
} from '../oyun-ekranlari/ortak/paylasim';
import type { IstemciDurumu } from '../oda/istemci';
import { SORU_SAYISI, type Final, type Oy } from '../oda/oda';
import { erkenBitti, kisisel, okYuzde, tartismali } from '../oda/ozet';
import { useDurum } from '../durum';
import { bosluk, cizgi, font, renkler, yaricap } from '../tema';
import { Dugme, Ekran, Yazi } from '../ui';
import { Dagilim } from './dagilim';
import { kartMetni } from './metin';
import { OdaUst } from './ust';
import { Text } from 'react-native';

function Kart({
  baslik,
  renkAdi,
  children,
}: {
  baslik: string;
  renkAdi: 'marka' | 'marka2' | 'yuzey';
  children: React.ReactNode;
}) {
  const { renk } = useDurum();
  const yazi = renkAdi === 'yuzey' ? renk.metin : renk.kontur;
  return (
    <View
      style={{
        backgroundColor: renk[renkAdi],
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        borderRadius: yaricap.kart,
        padding: bosluk.l,
        gap: bosluk.xs,
        boxShadow: `5px 5px 0 ${renk.golge}`,
      }}
    >
      <Yazi tur="etiket" style={{ color: yazi }}>
        {baslik}
      </Yazi>
      <View style={{ gap: bosluk.xs }}>
        {typeof children === 'string' ? (
          <Yazi tur="baslik" style={{ color: yazi, fontSize: 24 }}>
            {children}
          </Yazi>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

function Tartismali({ f }: { f: Final }) {
  const { renk } = useDurum();
  const liste = tartismali(f);
  return (
    <View style={{ gap: bosluk.l }}>
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: renk.marka,
          borderWidth: cizgi.kalin,
          borderColor: renk.kontur,
          borderRadius: yaricap.dugme,
          paddingHorizontal: bosluk.l,
          paddingVertical: bosluk.m,
          boxShadow: `5px 5px 0 ${renk.golge}`,
        }}
      >
        <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 28 }}>
          Odayı ikiye böldü!
        </Yazi>
      </View>
      {liste.map((t) => (
        <View key={t.kartId} style={{ gap: bosluk.m }}>
          <Kart baslik={`Soru ${t.no}`} renkAdi="yuzey">
            {kartMetni(t.kartId, t.no)}
          </Kart>
          <View style={{ flexDirection: 'row', gap: bosluk.l }}>
            {(
              [
                ['OK', t.ok, renk.okMetin],
                ['NOK', t.nok, renk.nokMetin],
              ] as const
            ).map(([ad, kisiler, c]) => (
              <View key={ad} style={{ flex: 1, gap: bosluk.xs }}>
                <Yazi tur="baslikXl" style={{ color: c }}>
                  {kisiler.length}
                </Yazi>
                <Yazi tur="etiket" style={{ color: c }}>
                  {ad === 'OK' ? '👍 OK' : '👎 NOK'}
                </Yazi>
                <Yazi soluk>{kisiler.join(', ')}</Yazi>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function Oduller({ f }: { f: Final }) {
  const o = f.oduller;
  const yok = !o.aykiriRuh.length && !o.ruhIkizleri.length;
  return (
    <View style={{ gap: bosluk.l }}>
      <Yazi tur="baslik">Ödüller</Yazi>
      {o.aykiriRuh.length > 0 && (
        <Kart baslik="Aykırı ruh" renkAdi="marka">
          {o.aykiriRuh.join(', ')}
        </Kart>
      )}
      {o.ruhIkizleri.length > 0 && (
        <Kart baslik="Ruh ikizleri" renkAdi="marka2">
          {o.ruhIkizleri.map(([a, b]) => `${a} & ${b}`).join(', ')}
        </Kart>
      )}
      {yok && <Yazi soluk>Bu oyunda ödül çıkmadı.</Yazi>}
    </View>
  );
}

function KimNeDedi({ f }: { f: Final }) {
  const { renk } = useDurum();
  const renkOf = (c: Oy | null) =>
    c === 'OK' ? renk.ok : c === 'NOK' ? renk.nok : renk.yuzey;
  return (
    <View testID="final-kim-ne-dedi" style={{ gap: bosluk.m }}>
      <Yazi tur="baslik">Kim ne dedi?</Yazi>
      {Object.entries(f.kimNeDedi).map(([ad, cevaplar]) => {
        const ok = cevaplar.filter((c) => c === 'OK').length;
        const nok = cevaplar.filter((c) => c === 'NOK').length;
        return (
          <View
            key={ad}
            accessible
            accessibilityLabel={`${ad}: ${ok} OK, ${nok} NOK, ${cevaplar.length - ok - nok} boş`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: bosluk.s,
            }}
          >
            <Yazi tur="etiket" numberOfLines={1} style={{ width: 80 }}>
              {ad}
            </Yazi>
            <View style={{ flex: 1, flexDirection: 'row', gap: 3 }}>
              {cevaplar.map((c, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 20,
                    borderRadius: yaricap.kucuk,
                    backgroundColor: renkOf(c),
                    borderWidth: 1,
                    borderColor: renk.kontur,
                  }}
                />
              ))}
            </View>
          </View>
        );
      })}
      <View style={{ flexDirection: 'row', gap: bosluk.l }}>
        {(
          [
            ['OK', renk.ok],
            ['NOK', renk.nok],
            ['boş', renk.yuzey],
          ] as const
        ).map(([ad, c]) => (
          <View
            key={ad}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: bosluk.xs,
            }}
          >
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: yaricap.kucuk,
                backgroundColor: c,
                borderWidth: 1,
                borderColor: renk.kontur,
              }}
            />
            <Yazi tur="etiket" soluk>
              {ad}
            </Yazi>
          </View>
        ))}
      </View>
    </View>
  );
}

function Kisisel({ f, ad }: { f: Final; ad: string }) {
  const { renk } = useDurum();
  const k = kisisel(f, ad);
  const cip = (t: string) => (
    <View
      key={t}
      style={{
        paddingHorizontal: bosluk.m,
        paddingVertical: bosluk.xs,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: renk.marka2,
      }}
    >
      <Yazi tur="etiket" style={{ color: renk.kontur }}>
        {t}
      </Yazi>
    </View>
  );
  return (
    <View
      testID="final-kisisel"
      style={{
        backgroundColor: renk.marka,
        borderWidth: cizgi.kalin,
        borderColor: renk.kontur,
        borderRadius: yaricap.kart,
        padding: bosluk.xl,
        gap: bosluk.m,
        boxShadow: `8px 8px 0 ${renk.golge}`,
      }}
    >
      <Yazi tur="etiket" style={{ color: renk.kontur }}>
        {ad}, bu odada sen
      </Yazi>
      <Yazi tur="baslikXl" style={{ color: renk.kontur }}>
        {k.ayni}/{k.toplam}
      </Yazi>
      <Yazi tur="baslik" style={{ color: renk.kontur, fontSize: 24 }}>
        çoğunlukla aynıydın
      </Yazi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.s }}>
        {[
          k.ikiz ? `Ruh ikizin: ${k.ikiz}` : null,
          `${k.ok} OK`,
          `${k.nok} NOK`,
          k.bos ? `${k.bos} boş` : null,
        ]
          .filter((t): t is string => !!t)
          .map(cip)}
      </View>
    </View>
  );
}

const r = renkler.koyu;
function PaylasimIcerik({
  f,
  kod,
  kisi,
}: {
  f: Final;
  kod: string;
  kisi: number;
}) {
  const t = tartismali(f)[0];
  return (
    <>
      <Text
        style={{ fontFamily: font.kalin, fontSize: 12, color: r.metinSoluk }}
      >
        ODA {kod} · {kisi} kişi · {f.yuzdeler.length} soruda
      </Text>
      <Text style={{ fontFamily: font.kalin, fontSize: 44, color: r.ok }}>
        %{okYuzde(f)} <Text style={{ color: r.metin }}>OK</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 4, height: 200 }}>
        {f.yuzdeler.map((y) => (
          <View
            key={y.kartId}
            style={{
              flex: 1,
              borderRadius: yaricap.kucuk,
              borderWidth: cizgi.ince,
              borderColor: r.kontur,
              overflow: 'hidden',
            }}
          >
            <View style={{ flex: y.bos || 0.0001, backgroundColor: r.yuzey }} />
            <View style={{ flex: y.nok || 0.0001, backgroundColor: r.nok }} />
            <View style={{ flex: y.ok || 0.0001, backgroundColor: r.ok }} />
          </View>
        ))}
      </View>
      {t && (
        <View
          style={{
            backgroundColor: r.marka,
            borderWidth: cizgi.ince,
            borderColor: r.kontur,
            borderRadius: yaricap.dugme,
            padding: 14,
            boxShadow: `4px 4px 0 ${r.golge}`,
          }}
        >
          <Text
            style={{ fontFamily: font.kalin, fontSize: 11, color: r.kontur }}
          >
            ODAYI İKİYE BÖLDÜ · SORU {t.no}
          </Text>
          <Text
            style={{ fontFamily: font.kalin, fontSize: 18, color: r.kontur }}
          >
            {kartMetni(t.kartId, t.no)}
          </Text>
          <Text
            style={{ fontFamily: font.kalin, fontSize: 14, color: r.kontur }}
          >
            {t.ok.length} OK · {t.nok.length} NOK
          </Text>
        </View>
      )}
    </>
  );
}

const ADIMLAR = [
  'Dağılım',
  'En tartışmalı soru',
  'Ödüller',
  'Kim ne dedi',
  'Senin kartın',
];

export function FinalEkrani({
  durum,
  onTekrar,
  onAnaMenu,
}: {
  durum: IstemciDurumu;
  onTekrar: () => void;
  onAnaMenu: () => void;
}) {
  const f = durum.final;
  const kod = durum.kod ?? durum.gorunum?.kod ?? '';
  const [adim, setAdim] = useState(0);
  const [secili, setSecili] = useState(0);
  const [kapandiGecildi, setKapandiGecildi] = useState(false);
  const paylas = usePaylas();
  const yuk = (
    <Ekran>
      <Yazi tur="baslik">Sonuçlar hazırlanıyor…</Yazi>
    </Ekran>
  );
  if (!f) return yuk;

  // KK-38: kuran çıktı / tek oyuncu kaldı → oda kapandı ekranı, sonra o ana kadarki sonuçlar.
  if (erkenBitti(f, SORU_SAYISI) && !kapandiGecildi)
    return (
      <Ekran>
        <View style={{ flex: 1, justifyContent: 'center', gap: bosluk.l }}>
          <Yazi testID="oda-kapandi" tur="baslikXl">
            Oda kapandı
          </Yazi>
          <Yazi soluk>
            Odada senden başka kimse kalmadı.
            {f.yuzdeler.length > 0
              ? ` ${f.yuzdeler.length} sorunun sonucu hazır.`
              : ''}
          </Yazi>
        </View>
        {f.yuzdeler.length > 0 && (
          <Dugme
            testID="oda-sonuclari-gor"
            etiket="Sonuçları gör"
            onPress={() => setKapandiGecildi(true)}
          />
        )}
        <Dugme
          testID="oda-ana-menu"
          tur="ikincil"
          etiket="Ana menü"
          onPress={onAnaMenu}
        />
      </Ekran>
    );

  const son = adim === ADIMLAR.length - 1;
  const ad = durum.ad ?? '';
  const sonrakiEtiket = son ? null : `${ADIMLAR[adim + 1]} →`;
  return (
    <>
      <Ekran>
        <OdaUst kod={kod} orta={`Final · ${adim + 1}/${ADIMLAR.length}`} />
        {adim === 0 && <Dagilim f={f} secili={secili} onSec={setSecili} />}
        {adim === 1 && <Tartismali f={f} />}
        {adim === 2 && <Oduller f={f} />}
        {adim === 3 && <KimNeDedi f={f} />}
        {adim === 4 && <Kisisel f={f} ad={ad} />}
        <View style={{ flex: 1 }} />
        {sonrakiEtiket && (
          <Dugme
            testID="final-sonraki"
            etiket={sonrakiEtiket}
            onPress={() => setAdim(adim + 1)}
          />
        )}
        {son && (
          <View style={{ flexDirection: 'row', gap: bosluk.m }}>
            <PaylasDugmesi
              testID="final-paylas"
              bicim="birincil"
              onPress={paylas.paylas}
            />
            <View style={{ flex: 1 }}>
              <Dugme
                testID="final-tekrar"
                tur="ikincil"
                etiket="Tekrar oyna"
                onPress={onTekrar}
              />
            </View>
          </View>
        )}
      </Ekran>
      <GizliPaylasim gorunum={paylas.ref}>
        <PaylasimIcerik
          f={f}
          kod={kod}
          kisi={Object.keys(f.kimNeDedi).length}
        />
      </GizliPaylasim>
    </>
  );
}
