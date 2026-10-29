/* eslint-disable @typescript-eslint/no-unused-vars -- iskelet: gövdeler #132'de yazılır */
// Tanıtım kartı görüldü bilgisi (PRD v6, KK-74): telefonda, oyun başına, yeniden başlatmada kalır; sunucuya gitmez.
// İSKELET (#131 → frontend #132): gövdeler henüz yok. Depo hataları ve bozuk kayıt akışı bozmaz.
import type { Depo } from './kayit';

export const TANITIM_ANAHTARI = 'kafadar:tanitim';

// 'secim': ana ekrandan oyuna ilk dokunuş (odayı kuran dahil); 'lobi': odaya kodla katılım;
// 'devam': yarım kalan oyunda "Devam et" (hiçbir zaman tanıtım göstermez, KK-78).
export type TanitimNerede = 'secim' | 'lobi' | 'devam';

// Kayıt yoksa, bozuksa ya da depo hata verirse false (kart gösterilir); asla fırlatmaz.
export async function tanitimGorulduMu(
  depo: Depo,
  oyunId: string,
): Promise<boolean> {
  throw new Error('Tanıtım kartı henüz yazılmadı (#132)');
}

// "Tamam"a basılınca çağrılır; diğer oyunların işaretini silmez; bozuk kaydı düzeltir; depo hatasında fırlatmaz.
export async function tanitimiIsaretle(
  depo: Depo,
  oyunId: string,
): Promise<void> {
  throw new Error('Tanıtım kartı henüz yazılmadı (#132)');
}

// Kart gösterilsin mi? 'secim' ve 'lobi': yalnızca görülmediyse; 'devam': hiçbir zaman.
export function tanitimGerekli(
  goruldu: boolean,
  nerede: TanitimNerede,
): boolean {
  throw new Error('Tanıtım kartı henüz yazılmadı (#132)');
}
