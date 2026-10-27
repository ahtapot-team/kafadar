// Uygulama durumu: ayarlar, oyuncular, kurulum. Kurallar src/core'da; burası yalnızca bağlar ve kaydeder.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  OYUN_ANAHTARI,
  oyunOku,
  sonEkipKaydet,
  sonEkipOku,
  type Depo,
} from './core/kayit';
import type { Paket } from './desteler';
import { renkler, type Renkler, type Tema } from './tema';

export type Ayar = { ses: boolean; titresim: boolean; tema: Tema };
export type Kurulum = { paket: Paket; tur: 10 | 20 | null };

const AYAR_ANAHTARI = 'kafadar:ayar';
const VARSAYILAN: Ayar = { ses: true, titresim: true, tema: 'koyu' };

type Durum = {
  hazir: boolean;
  renk: Renkler;
  ayar: Ayar;
  ayarla: (a: Partial<Ayar>) => void;
  oyuncular: string[];
  oyunculariAyarla: (liste: string[]) => void;
  gecenEkip: string[];
  kurulum: Kurulum;
  kurulumuAyarla: (k: Kurulum) => void;
  yarimOyunVar: boolean; // açılışta kayıtlı oyun bulundu
  oyunuBaslat: () => void; // ekibi saklar, eski kaydı geçersiz sayar
  oyunuBitir: () => void; // kaydı siler
};

const Baglam = createContext<Durum | null>(null);

export function useDurum(): Durum {
  const d = useContext(Baglam);
  if (!d) throw new Error('DurumSaglayici gerekli');
  return d;
}

export function DurumSaglayici({
  depo,
  children,
}: {
  depo: Depo;
  children: ReactNode;
}) {
  const [hazir, setHazir] = useState(false);
  const [ayar, setAyar] = useState<Ayar>(VARSAYILAN);
  const [oyuncular, oyunculariAyarla] = useState<string[]>([]);
  const [gecenEkip, setGecenEkip] = useState<string[]>([]);
  const [kurulum, kurulumuAyarla] = useState<Kurulum>({
    paket: 'arkadas',
    tur: 10,
  });
  const [yarimOyunVar, setYarimOyunVar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const ham = await depo.getItem(AYAR_ANAHTARI);
        if (ham) setAyar({ ...VARSAYILAN, ...JSON.parse(ham) });
      } catch {
        // bozuk ayar: varsayılanla devam
      }
      setGecenEkip(await sonEkipOku(depo));
      setYarimOyunVar((await oyunOku(depo)) !== null); // bozuk kayıt burada silinir
      setHazir(true);
    })();
  }, [depo]);

  const ayarla = useCallback(
    (a: Partial<Ayar>) =>
      setAyar((onceki) => {
        const yeni = { ...onceki, ...a };
        depo.setItem(AYAR_ANAHTARI, JSON.stringify(yeni)).catch(() => {});
        return yeni;
      }),
    [depo],
  );

  const oyunuBaslat = useCallback(() => {
    setYarimOyunVar(false);
    setGecenEkip(oyuncular);
    sonEkipKaydet(depo, oyuncular).catch(() => {});
  }, [depo, oyuncular]);

  const oyunuBitir = useCallback(() => {
    setYarimOyunVar(false);
    depo.removeItem(OYUN_ANAHTARI).catch(() => {});
  }, [depo]);

  const deger = useMemo(
    () => ({
      hazir,
      renk: renkler[ayar.tema],
      ayar,
      ayarla,
      oyuncular,
      oyunculariAyarla,
      gecenEkip,
      kurulum,
      kurulumuAyarla,
      yarimOyunVar,
      oyunuBaslat,
      oyunuBitir,
    }),
    [
      hazir,
      ayar,
      ayarla,
      oyuncular,
      gecenEkip,
      kurulum,
      yarimOyunVar,
      oyunuBaslat,
      oyunuBitir,
    ],
  );

  return <Baglam.Provider value={deger}>{children}</Baglam.Provider>;
}
