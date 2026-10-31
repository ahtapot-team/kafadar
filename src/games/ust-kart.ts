// Ana ekran üst kartı seçimi (KK-129): saf; ağ yok, "son oynanan" yalnız telefonda durur, sunucuya gitmez.
import type { Oyun } from './oyun';

export type SonOynanan = { oyunId: string; kisi: number; paketAd?: string };

export type UstKart = {
  tur: 'son-oynanan' | 'one-cikan';
  etiket: 'Son oynanan' | 'Öne çıkan';
  oyun: Oyun;
  altSatir?: string;
};

// Oynanmış ve hâlâ kayıtlı + aktif oyun varsa "Son oynanan", yoksa "Öne çıkan".
export function ustKartSec(
  son: SonOynanan | null | undefined,
  oyunlar: readonly Oyun[],
): UstKart {
  const oynanan = son && oyunlar.find((o) => o.id === son.oyunId && o.aktif);
  if (son && oynanan) {
    const kisi = `${son.kisi} kişi`;
    return {
      tur: 'son-oynanan',
      etiket: 'Son oynanan',
      oyun: oynanan,
      altSatir: son.paketAd ? `${kisi} · ${son.paketAd}` : kisi,
    };
  }
  const oyun = oyunlar.find((o) => o.onecikan && o.aktif) ?? oyunlar[0];
  return { tur: 'one-cikan', etiket: 'Öne çıkan', oyun };
}
