export type Kart = { id: string; text: string };
export type Deste = {
  deck_id: string;
  version: number;
  lang: string;
  cards: Kart[];
};

const MAKS_UZUNLUK = 140;
const anahtar = (metin: string) => metin.trim().toLocaleLowerCase('tr');

// Destedeki hataları Türkçe mesajlarla döndürür; boş dizi = geçerli.
export function desteHatalari(deste: Deste): string[] {
  const hatalar: string[] = [];
  const idler = new Set<string>();
  const metinler = new Set<string>();
  deste.cards.forEach((kart, sira) => {
    const yer = `kart ${sira + 1}`;
    if (!kart.id) hatalar.push(`${yer}: id eksik`);
    else if (idler.has(kart.id))
      hatalar.push(`${yer}: yinelenen id (${kart.id})`);
    idler.add(kart.id);
    if (!kart.text?.trim()) {
      hatalar.push(`${yer}: boş kart`);
      return;
    }
    if (kart.text.length > MAKS_UZUNLUK)
      hatalar.push(`${yer}: ${MAKS_UZUNLUK} karakterden uzun`);
    const k = anahtar(kart.text);
    if (metinler.has(k)) hatalar.push(`${yer}: yinelenen kart (${kart.text})`);
    metinler.add(k);
  });
  return hatalar;
}
