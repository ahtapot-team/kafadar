import { useEffect, useState } from 'react';
import { type IstemciDurumu, kalanMs } from '../oda/istemci';

// Sunucu saatine göre kalan süre (ms); 200 ms'de bir yenilenir (KK-32).
export function useKalan(durum: IstemciDurumu): number {
  const [simdi, setSimdi] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setSimdi(Date.now()), 200);
    return () => clearInterval(id);
  }, []);
  return kalanMs(durum, simdi);
}
