// Kayıt (KK-5, KK-14): oyundan bağımsız, sürümlü. Okunamayan ya da eski kayıt güvenle silinir.

// AsyncStorage bu arayüze uyar; testte Map ile sahtelenir.
export type Depo = {
  getItem(anahtar: string): Promise<string | null>;
  setItem(anahtar: string, deger: string): Promise<void>;
  removeItem(anahtar: string): Promise<void>;
};

export const OYUN_ANAHTARI = 'kafadar:oyun';
export const EKIP_ANAHTARI = 'kafadar:son-ekip';
export const KAYIT_SURUMU = 1;

export const sonEkipKaydet = (depo: Depo, oyuncular: string[]) =>
  depo.setItem(EKIP_ANAHTARI, JSON.stringify(oyuncular));

// Kayıt yoksa ya da bozuksa boş liste.
export async function sonEkipOku(depo: Depo): Promise<string[]> {
  try {
    const l: unknown = JSON.parse((await depo.getItem(EKIP_ANAHTARI)) ?? '[]');
    return Array.isArray(l) && l.every((x) => typeof x === 'string') ? l : [];
  } catch {
    return [];
  }
}

export const oyunKaydet = <S>(depo: Depo, durum: S) =>
  depo.setItem(OYUN_ANAHTARI, JSON.stringify({ surum: KAYIT_SURUMU, durum }));

// Kayıt yoksa null. Okunamayan, eski sürümlü ya da içeriği bozuk kayıtta çökmez, kaydı siler ve null döner.
// `gecerli`: oyunun kendi durum şeması kontrolü (sürüm doğru ama alanlar eksik/hatalıysa kayıt reddedilir, #27).
export async function oyunOku<S>(
  depo: Depo,
  gecerli?: (durum: unknown) => durum is S,
): Promise<S | null> {
  try {
    const ham = await depo.getItem(OYUN_ANAHTARI);
    if (ham === null) return null;
    const k: { surum?: unknown; durum?: unknown } | null = JSON.parse(ham);
    if (
      k &&
      k.surum === KAYIT_SURUMU &&
      k.durum != null &&
      typeof k.durum === 'object' &&
      (!gecerli || gecerli(k.durum))
    )
      return k.durum as S;
  } catch {
    // okunamayan kayıt: aşağıda silinir
  }
  await depo.removeItem(OYUN_ANAHTARI).catch(() => {});
  return null;
}

// isle(durum, olay) çalıştırır, yeni durumu kaydeder ve döndürür ("her oydan ve karttan sonra").
export async function isleKaydet<S, O>(
  depo: Depo,
  isle: (durum: S, olay: O) => S,
  durum: S,
  olay: O,
): Promise<S> {
  const yeni = isle(durum, olay);
  await oyunKaydet(depo, yeni);
  return yeni;
}
