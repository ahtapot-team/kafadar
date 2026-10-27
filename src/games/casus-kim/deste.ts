import type { CasusDeste } from './casus';

const tr = (s: string) => s.toLocaleLowerCase('tr');
const KELIME_MAKS = 30;
const IPUCU_MAKS = 40;
const SORU_MAKS = 80;
const KART_MIN = 6; // tahmin şıkları: doğru + 5 farklı kelime

// Destedeki hataları Türkçe mesajlarla döndürür; boş dizi = geçerli.
export function casusDesteHatalari(d: CasusDeste): string[] {
  const hatalar: string[] = [];
  if (d.cards.length < KART_MIN) hatalar.push(`en az ${KART_MIN} kart gerekir`);
  const idler = new Set<string>();
  const kelimeler = new Set<string>();
  d.cards.forEach((k, i) => {
    const yer = `kart ${i + 1}`;
    if (!k.id) hatalar.push(`${yer}: id eksik`);
    else if (idler.has(k.id)) hatalar.push(`${yer}: yinelenen id (${k.id})`);
    idler.add(k.id);
    if (!k.kelime?.trim() || !k.ipucu?.trim())
      return void hatalar.push(`${yer}: boş kelime ya da ipucu`);
    if (k.kelime.length > KELIME_MAKS)
      hatalar.push(`${yer}: kelime ${KELIME_MAKS} karakterden uzun`);
    if (k.ipucu.length > IPUCU_MAKS)
      hatalar.push(`${yer}: ipucu ${IPUCU_MAKS} karakterden uzun`);
    if (
      tr(k.ipucu).includes(tr(k.kelime)) ||
      tr(k.kelime).includes(tr(k.ipucu))
    )
      hatalar.push(`${yer}: ipucu kelimeyi içeriyor (${k.kelime})`);
    const a = tr(k.kelime.trim());
    if (kelimeler.has(a))
      hatalar.push(`${yer}: yinelenen kelime (${k.kelime})`);
    kelimeler.add(a);
  });
  const sorular = new Set<string>();
  for (const s of d.sorular) {
    if (!s.trim()) hatalar.push('boş soru');
    else if (s.length > SORU_MAKS)
      hatalar.push(`soru ${SORU_MAKS} karakterden uzun (${s})`);
    if (sorular.has(tr(s))) hatalar.push(`yinelenen soru (${s})`);
    sorular.add(tr(s));
  }
  return hatalar;
}
