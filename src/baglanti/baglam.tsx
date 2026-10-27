// Oda bağlantısı bağlamı: tek OdaIstemci, ekranlara durum verir; ön plana dönünce yeniden bağlanır (KK-37).
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import type { Depo } from '../core/kayit';
import { rngOlustur } from '../core/rng';
import { desteler } from '../desteler';
import { type IstemciDurumu, OdaIstemci } from '../oda/istemci';
import { SahteSunucu } from '../oda/sahte';
import type { TasimaUretici } from '../oda/tasima';
import { wsTasima } from './ws';

// EXPO_PUBLIC_ODA_SUNUCU (wss://…) tanımlıysa gerçek sunucu; yoksa aynı cihazda çalışan sahte sunucu (geliştirme).
function tasimaSec(): TasimaUretici {
  const adres = process.env.EXPO_PUBLIC_ODA_SUNUCU;
  if (adres) return wsTasima(adres);
  return new SahteSunucu(Date.now, rngOlustur(Date.now()), desteler).uret;
}

type Baglam = { istemci: OdaIstemci; durum: IstemciDurumu };
const OdaBaglami = createContext<Baglam | null>(null);

export function useOda(): Baglam {
  const b = useContext(OdaBaglami);
  if (!b) throw new Error('OdaSaglayici gerekli');
  return b;
}

export function OdaSaglayici({
  depo,
  children,
}: {
  depo: Depo;
  children: ReactNode;
}) {
  const istemci = useMemo(
    () => new OdaIstemci({ uret: tasimaSec(), depo, saat: Date.now }),
    [depo],
  );
  const durum = useSyncExternalStore(
    (f) => istemci.abone(f),
    () => istemci.durum,
  );
  useEffect(() => {
    void istemci.devamEt();
    const s = AppState.addEventListener(
      'change',
      (k) => k === 'active' && istemci.onPlana(),
    );
    return () => s.remove();
  }, [istemci]);
  const deger = useMemo(() => ({ istemci, durum }), [istemci, durum]);
  return <OdaBaglami.Provider value={deger}>{children}</OdaBaglami.Provider>;
}
