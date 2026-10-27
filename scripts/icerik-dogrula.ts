// content/decks/*.json dosyalarını doğrular; hata varsa 1 ile çıkar.
import { readdirSync, readFileSync } from 'node:fs';
import { desteHatalari } from '../src/core/deste.ts';

const klasor = new URL('../content/decks/', import.meta.url);
let hataVar = false;
for (const dosya of readdirSync(klasor).filter((d) => d.endsWith('.json'))) {
  const deste = JSON.parse(readFileSync(new URL(dosya, klasor), 'utf8'));
  for (const hata of desteHatalari(deste)) {
    console.error(`${dosya}: ${hata}`);
    hataVar = true;
  }
}
process.exit(hataVar ? 1 : 0);
