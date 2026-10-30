// Açılış sözü dosyası denetimi (KK-98). Node doğrudan çalıştırdığı için React yok; uygulama bu dosyayı içe aktarmaz.
export const SOZ_EN_FAZLA = 140;
export const OYUN_EN_AZ = 10;
const normal = (t: string) =>
  t.trim().replace(/\s+/g, ' ').toLocaleUpperCase('tr');
export function sozHatalari(
  dosya: unknown,
  aktifOyunlar: readonly string[],
): string[] {
  const sozler = (dosya as { sozler?: unknown } | null)?.sozler;
  if (!Array.isArray(sozler)) return ['sozler dizisi yok'];
  const hata: string[] = [];
  const idler = new Set<string>();
  const metinler = new Set<string>();
  const sayac = new Map<string, number>();
  const bilinen = new Set([...aktifOyunlar, 'genel']);
  sozler.forEach((s: unknown, i) => {
    const { id, text, oyun } = (s ?? {}) as Record<string, unknown>;
    const yer = `söz #${i + 1}`;
    if (typeof id !== 'string' || !id.trim()) hata.push(`${yer}: id yok`);
    else if (idler.has(id)) hata.push(`${yer}: tekrar eden id "${id}"`);
    else idler.add(id);
    if (typeof text !== 'string' || !text.trim())
      hata.push(`${yer}: boş metin`);
    else {
      if (text.length > SOZ_EN_FAZLA)
        hata.push(`${yer}: ${text.length} karakter (en fazla ${SOZ_EN_FAZLA})`);
      const n = normal(text);
      if (metinler.has(n)) hata.push(`${yer}: tekrar eden metin`);
      metinler.add(n);
    }
    if (typeof oyun !== 'string' || !bilinen.has(oyun))
      hata.push(`${yer}: bilinmeyen oyun "${String(oyun)}"`);
    else sayac.set(oyun, (sayac.get(oyun) ?? 0) + 1);
  });
  for (const o of bilinen)
    if ((sayac.get(o) ?? 0) < OYUN_EN_AZ)
      hata.push(`"${o}" için en az ${OYUN_EN_AZ} söz gerekir`);
  return hata;
}
