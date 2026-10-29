// Tanıtım kartı görüldü bilgisi (PRD v6, KK-74): telefonda, oyun başına, yeniden başlatmada kalır; sunucuya gitmez.
// Depo hataları ve bozuk kayıt akışı bozmaz: okuma hatasında "görülmedi" (kart gösterilir), yazma hatasında sessiz.
import type { Depo } from './kayit';

export const TANITIM_ANAHTARI = 'kafadar:tanitim';

// 'secim': ana ekrandan oyuna ilk dokunuş (odayı kuran dahil); 'lobi': odaya kodla katılım;
// 'devam': yarım kalan oyunda "Devam et" (hiçbir zaman tanıtım göstermez, KK-78).
export type TanitimNerede = 'secim' | 'lobi' | 'devam';

// Kayıt: { "<oyunId>": true }. Bozuk ya da beklenmeyen biçim boş sayılır.
async function oku(depo: Depo): Promise<Record<string, true>> {
  try {
    const k: unknown = JSON.parse(
      (await depo.getItem(TANITIM_ANAHTARI)) ?? '{}',
    );
    if (k === null || typeof k !== 'object' || Array.isArray(k)) return {};
    return Object.fromEntries(
      Object.entries(k).filter(([, v]) => v === true),
    ) as Record<string, true>;
  } catch {
    return {};
  }
}

// Kayıt yoksa, bozuksa ya da depo hata verirse false (kart gösterilir); asla fırlatmaz.
export async function tanitimGorulduMu(
  depo: Depo,
  oyunId: string,
): Promise<boolean> {
  return (await oku(depo))[oyunId] === true;
}

// "Tamam"a basılınca çağrılır; diğer oyunların işaretini silmez; bozuk kaydı düzeltir; depo hatasında fırlatmaz.
export async function tanitimiIsaretle(
  depo: Depo,
  oyunId: string,
): Promise<void> {
  try {
    const k = await oku(depo);
    k[oyunId] = true;
    await depo.setItem(TANITIM_ANAHTARI, JSON.stringify(k));
  } catch {
    // yazılamadıysa kart bir dahaki seferde yine açılır; akış bozulmaz
  }
}

// Kart gösterilsin mi? 'secim' ve 'lobi': yalnızca görülmediyse; 'devam': hiçbir zaman.
export function tanitimGerekli(
  goruldu: boolean,
  nerede: TanitimNerede,
): boolean {
  return nerede !== 'devam' && !goruldu;
}
