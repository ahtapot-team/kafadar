// content/decks/*.json ve content/casus/*.json dosyalarını doğrular; hata varsa 1 ile çıkar.
import { readdirSync, readFileSync } from 'node:fs';
import { casusDesteHatalari } from '../src/games/casus-kim/deste.ts';
import { desteHatalari } from '../src/core/deste.ts';

let hataVar = false;
const kontrol = <T>(klasorAdi: string, dogrula: (d: T) => string[]) => {
  const klasor = new URL(`../content/${klasorAdi}/`, import.meta.url);
  for (const dosya of readdirSync(klasor).filter((d) => d.endsWith('.json'))) {
    const deste = JSON.parse(readFileSync(new URL(dosya, klasor), 'utf8')) as T;
    for (const hata of dogrula(deste)) {
      console.error(`${klasorAdi}/${dosya}: ${hata}`);
      hataVar = true;
    }
  }
};
kontrol('decks', desteHatalari);
kontrol('casus', casusDesteHatalari);
process.exit(hataVar ? 1 : 0);
