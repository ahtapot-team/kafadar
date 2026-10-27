import { useEffect, useState } from 'react';

// 0'dan hedefe yumuşakça sayar (çubuklarla birlikte artan sayılar, KK-11). Hareketi azalt: anında.
export function useSayi(hedef: number, sureMs: number, azalt: boolean) {
  const [deger, setDeger] = useState(azalt ? hedef : 0);
  useEffect(() => {
    if (azalt) {
      setDeger(hedef);
      return;
    }
    const baslangic = Date.now();
    const id = setInterval(() => {
      const k = Math.min(1, (Date.now() - baslangic) / sureMs);
      setDeger(Math.round(hedef * (1 - (1 - k) ** 3)));
      if (k >= 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [hedef, sureMs, azalt]);
  return deger;
}
