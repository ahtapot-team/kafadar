// Quiz Night oda sorusu ve açıklaması (KK-113; tasarım C "Oda (Faz 2)"): kilitli şık, sunucu saatiyle ince sayaç,
// son 5 sn titreşim (kırmızı yok), açıklamada kim neyi seçti, "Sonraki soru" yalnız kuranda.
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import {
  odaSayac,
  odaSikRengi,
  zorlukEtiketi,
} from '../games/quiz-night/arayuz';
import { quizGorunumMu, type QuizGorunum } from '../oda/oda';
import type { IstemciDurumu } from '../oda/istemci';
import { useDurum } from '../durum';
import { bosluk, cizgi, yaricap } from '../tema';
import { titret } from '../titresim';
import { Dugme, Ekran, Yazi } from '../ui';
import { useKalan } from './kalan';
import { OdaUst } from './ust';

const HARF = ['A', 'B', 'C', 'D'];

export function QuizOdaSoru({
  durum,
  onSec,
  onSonraki,
  onCik,
}: {
  durum: IstemciDurumu;
  onSec: (sik: number) => void;
  onSonraki: () => void;
  onCik: () => void;
}) {
  const { renk, ayar } = useDurum();
  const gv = durum.gorunum!;
  const g = (quizGorunumMu(gv) ? gv : null) as QuizGorunum;
  const sayac = odaSayac(useKalan(durum));
  const benim = g.benimSikkim ?? null;
  const ac = g.aciklama;
  const soru = g.soru!;
  const kilitli = benim !== null || !!ac;
  const ad = (a: string) => (a === durum.ad ? 'Sen' : a);
  useEffect(() => {
    if (!ac && sayac.titret) titret('uyari', ayar.titresim); // son 5 sn'de her saniye titrer
  }, [sayac.saniye, sayac.titret, ac, ayar.titresim]);
  const kimler = (i: number) =>
    ac ? Object.keys(ac.secimler).filter((a) => ac.secimler[a] === i) : [];
  const cevapsiz = ac
    ? Object.keys(ac.secimler).filter((a) => ac.secimler[a] === null)
    : [];
  const rozet = (m: string, k: string | number, tid?: string) => (
    <View
      key={k}
      testID={tid}
      style={{
        paddingHorizontal: bosluk.s,
        borderRadius: yaricap.cip,
        borderWidth: cizgi.ince,
        borderColor: renk.kontur,
        backgroundColor: renk.yuzey,
      }}
    >
      <Yazi tur="etiket">{m}</Yazi>
    </View>
  );
  return (
    <Ekran>
      <OdaUst kod={g.kod} orta={`Soru ${g.soruNo} / 10`} onCik={onCik} />
      {!ac && (
        <View style={{ gap: 4 }}>
          <View
            style={{ height: 6, borderRadius: 3, backgroundColor: renk.yuzey }}
          >
            <View
              testID="quiz-sayac"
              style={{
                height: 6,
                borderRadius: 3,
                width: `${sayac.oran * 100}%`,
                backgroundColor: renk.marka,
              }}
            />
          </View>
          <Yazi tur="etiket" style={{ alignSelf: 'flex-end' }}>
            {sayac.titret ? '📳 ' : ''}
            {sayac.saniye} sn
          </Yazi>
        </View>
      )}
      <Yazi tur="etiket" soluk>
        {zorlukEtiketi(soru.zorluk)}
      </Yazi>
      <Yazi tur="dugme" style={{ fontSize: 24, lineHeight: 30 }}>
        {soru.metin}
      </Yazi>
      <View style={{ gap: bosluk.m }}>
        {soru.secenekler.map((m, i) => {
          const r = odaSikRengi(i, ac ? ac.dogru : null, benim);
          const dolgu =
            r === 'ok'
              ? renk.ok
              : r === 'nok'
                ? renk.nok
                : r === 'kilitli'
                  ? renk.marka2
                  : renk.yuzey;
          const koyu = r === 'ok' || r === 'nok';
          return (
            <Pressable
              key={i}
              testID={`quiz-sik-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`${HARF[i]}: ${m}`}
              disabled={kilitli || sayac.saniye === 0}
              onPress={() => onSec(i)}
              style={{
                gap: 4,
                padding: bosluk.m,
                borderRadius: yaricap.dugme,
                borderWidth: cizgi.kalin,
                borderColor: renk.kontur,
                backgroundColor: dolgu,
                opacity: ac && r === 'notr' ? 0.8 : 1,
              }}
            >
              <Yazi
                tur="dugme"
                style={{ fontSize: 18, color: koyu ? renk.kontur : renk.metin }}
              >
                {HARF[i]} · {r === 'ok' ? '✓ ' : r === 'nok' ? '✕ ' : ''}
                {m}
                {r === 'kilitli' ? ' · SENİN' : ''}
              </Yazi>
              {ac && (
                <View
                  testID={`quiz-kimler-${i}`}
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}
                >
                  {kimler(i).length
                    ? kimler(i).map((a) => rozet(ad(a), a))
                    : rozet('kimse', 'k')}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      {!ac ? (
        <View testID="quiz-cevapladi" style={{ gap: bosluk.s }}>
          <Yazi tur="etiket" soluk>
            {g.cevapladi.length}/{g.toplam} cevapladı
          </Yazi>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {g.oyuncular.map((o) =>
              rozet(
                g.cevapladi.includes(o.ad) ? `✓ ${ad(o.ad)}` : `${ad(o.ad)}…`,
                o.ad,
              ),
            )}
          </View>
        </View>
      ) : (
        <>
          {cevapsiz.length > 0 && (
            <Yazi soluk>
              {cevapsiz.map(ad).join(', ')} cevap vermedi · yanlış sayıldı
            </Yazi>
          )}
          {g.sonrakiGorunur ? (
            <Dugme
              testID="quiz-oda-sonraki"
              etiket="Sonraki soru"
              onPress={onSonraki}
            />
          ) : (
            <Yazi
              testID="quiz-oda-bekle"
              tur="etiket"
              soluk
              style={{ textAlign: 'center' }}
            >
              Kuran kişi bekleniyor… {g.yetkiliAd}
            </Yazi>
          )}
        </>
      )}
    </Ekran>
  );
}
