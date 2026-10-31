// Quiz Night soru ekranları (KK-110, KK-112): tek başına (şık dokununca kilitlenir, ~1,5 sn sonra sıradaki)
// ve tek telefonda grup (sesli okunur, "Cevabı göster", bilenler işaretlenir).
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useDurum } from '../../durum';
import {
  SONRAKI_BEKLEME_MS,
  cevapKilitle,
  grupSikRengi,
  ilerlemeMetni,
  sikRengi,
  zorlukEtiketi,
  type SikRengi,
} from '../../games/quiz-night/arayuz';
import type { Durum } from '../../games/quiz-night/quiz';
import { useBilgiYuvasi } from '../../tanitim-kutusu';
import { bosluk, cizgi, yaricap } from '../../tema';
import { titret } from '../../titresim';
import { Dugme, Ekran, Yazi } from '../../ui';
import { IkonDugme } from '../ortak/ortak';
import { quizPaketi } from './paketler';
import type { Olay } from './index';

type Props = {
  durum: Durum;
  gonder: (o: Olay) => void;
  onCik: () => void;
};
const HARF = ['A', 'B', 'C', 'D'];
const ZORLUK_NOKTA = { kolay: '●○○', orta: '●●○', zor: '●●●' };

function Sik({
  i,
  metin,
  renk,
  onPress,
}: {
  i: number;
  metin: string;
  renk: SikRengi;
  onPress?: () => void;
}) {
  const { renk: t } = useDurum();
  const dolgu = renk === 'ok' ? t.ok : renk === 'nok' ? t.nok : t.yuzey;
  const yazi = renk === 'notr' ? t.metin : t.kontur;
  return (
    <Pressable
      testID={`quiz-sik-${i}`}
      accessibilityRole="button"
      accessibilityLabel={`${HARF[i]}: ${metin}`}
      disabled={!onPress}
      onPress={onPress}
      style={{
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: bosluk.m,
        paddingHorizontal: bosluk.m,
        paddingVertical: bosluk.s,
        borderRadius: yaricap.dugme,
        borderWidth: cizgi.kalin,
        borderColor: t.kontur,
        backgroundColor: dolgu,
        boxShadow: renk === 'notr' ? `3px 3px 0 ${t.golge}` : 'none',
      }}
    >
      <Yazi tur="etiket" style={{ color: yazi }}>
        {HARF[i]}
      </Yazi>
      <Yazi tur="dugme" style={{ color: yazi, flex: 1, fontSize: 18 }}>
        {renk === 'ok' ? `✓ ${metin}` : renk === 'nok' ? `✕ ${metin}` : metin}
      </Yazi>
    </Pressable>
  );
}

function Ust({ durum, onCik }: { durum: Durum; onCik: () => void }) {
  const { renk } = useDurum();
  const bilgi = useBilgiYuvasi();
  const s = durum.sorular[durum.soru];
  return (
    <>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: bosluk.m }}
      >
        <IkonDugme
          testID="cik"
          simge="✕"
          etiket="Oyundan çık"
          onPress={onCik}
        />
        <Yazi tur="etiket" soluk style={{ flex: 1, textAlign: 'center' }}>
          {quizPaketi(durum.paket).ad}
        </Yazi>
        <View
          style={{
            paddingHorizontal: bosluk.m,
            minHeight: 32,
            justifyContent: 'center',
            borderRadius: yaricap.cip,
            backgroundColor: renk.marka2,
          }}
        >
          <Yazi
            testID="quiz-ilerleme"
            tur="etiket"
            style={{ color: renk.kontur }}
          >
            {ilerlemeMetni(durum.soru, durum.sorular.length)}
          </Yazi>
        </View>
        {bilgi}
      </View>
      <Yazi testID="quiz-zorluk" tur="etiket" soluk>
        {ZORLUK_NOKTA[s.zorluk]} {zorlukEtiketi(s.zorluk)}
      </Yazi>
      <Yazi
        testID="quiz-soru"
        tur="dugme"
        style={{ fontSize: 24, lineHeight: 30 }}
      >
        {s.metin}
      </Yazi>
    </>
  );
}

function Secenekler({
  s,
  renk,
  sec,
}: {
  s: Durum['sorular'][number];
  renk: (i: number) => SikRengi;
  sec?: (i: number) => void;
}) {
  return (
    <View style={{ gap: bosluk.m }}>
      {s.secenekler.map((m, i) => (
        <Sik
          key={i}
          i={i}
          metin={m}
          renk={renk(i)}
          onPress={sec && (() => sec(i))}
        />
      ))}
    </View>
  );
}

function Tek({ durum, gonder, onCik }: Props) {
  const { ayar } = useDurum();
  const s = durum.sorular[durum.soru];
  const cevap = durum.cevaplar[0][durum.soru];
  useEffect(() => {
    if (cevap === null) return;
    const id = setTimeout(() => gonder({ tip: 'ilerle' }), SONRAKI_BEKLEME_MS);
    return () => clearTimeout(id);
  }, [cevap, durum.soru, gonder]);
  const sec = (sik: number) => {
    const k = cevapKilitle(cevap, sik);
    if (cevap !== null) return;
    gonder({ tip: 'cevap', oyuncu: 0, sik: k });
    if (k !== s.dogru) titret('uyari', ayar.titresim); // yalnız tek başına yanlış cevapta
  };
  return (
    <Ekran>
      <Ust durum={durum} onCik={onCik} />
      <Secenekler s={s} renk={(i) => sikRengi(i, s.dogru, cevap)} sec={sec} />
      {cevap !== null && (
        <Yazi tur="etiket" soluk style={{ textAlign: 'center' }}>
          Cevap kilitli · sıradaki soru geliyor
        </Yazi>
      )}
    </Ekran>
  );
}

function Grup({ durum, gonder, onCik }: Props) {
  const { renk } = useDurum();
  const s = durum.sorular[durum.soru];
  const [gosterildi, setGosterildi] = useState(false);
  const [bilenler, setBilenler] = useState<number[]>([]);
  const degistir = (i: number) =>
    setBilenler((b) => (b.includes(i) ? b.filter((x) => x !== i) : [...b, i]));
  return (
    <Ekran>
      <Ust durum={durum} onCik={onCik} />
      {!gosterildi ? (
        <>
          <Yazi tur="etiket" soluk>
            📢 Sesli oku · herkes cevabını söylesin
          </Yazi>
          <Secenekler s={s} renk={(i) => grupSikRengi(i, s.dogru, false)} />
          <Dugme
            testID="quiz-goster"
            etiket="Cevabı göster"
            onPress={() => setGosterildi(true)}
          />
        </>
      ) : (
        <>
          <Yazi tur="etiket" soluk>
            Doğru cevap
          </Yazi>
          <Sik
            i={s.dogru}
            metin={s.secenekler[s.dogru]}
            renk={grupSikRengi(s.dogru, s.dogru, true)}
          />
          <Yazi tur="etiket" soluk>
            Kim bildi?
          </Yazi>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: bosluk.m }}
          >
            {durum.oyuncular.map((ad, i) => {
              const bildi = bilenler.includes(i);
              return (
                <Pressable
                  key={i}
                  testID={`quiz-kim-${i}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: bildi }}
                  onPress={() => degistir(i)}
                  style={{
                    minHeight: 48,
                    minWidth: '30%',
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: bosluk.m,
                    borderRadius: yaricap.dugme,
                    borderWidth: cizgi.ince,
                    borderColor: renk.kontur,
                    backgroundColor: bildi ? renk.ok : renk.yuzey,
                  }}
                >
                  <Yazi
                    tur="dugme"
                    style={{
                      fontSize: 17,
                      color: bildi ? renk.kontur : renk.metin,
                    }}
                  >
                    {bildi ? `✓ ${ad}` : ad}
                  </Yazi>
                </Pressable>
              );
            })}
          </View>
          <Yazi soluk>Hiç kimse ya da herkes olabilir.</Yazi>
          <Dugme
            testID="quiz-sonraki"
            etiket="Sonraki"
            onPress={() => gonder({ tip: 'grup', bilenler })}
          />
        </>
      )}
    </Ekran>
  );
}

export function QuizSoru(p: Props) {
  return p.durum.oyuncular.length > 1 ? (
    <Grup key={p.durum.soru} {...p} />
  ) : (
    <Tek {...p} />
  );
}
