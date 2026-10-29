// Kayıttaki (src/icerik/kayit.ts) her deste dosyasını doğrular; kayıtsız deste dosyası da hatadır. Hata varsa 1 ile çıkar.
import { readdirSync, readFileSync } from 'node:fs';
import { icerikHatalari } from '../src/icerik/dogrula.ts';
import { paketKaydi } from '../src/icerik/kayit.ts';

const kok = new URL('../content/', import.meta.url);
let hataVar = false;
const hata = (yer: string, mesaj: string) => {
  console.error(`${yer}: ${mesaj}`);
  hataVar = true;
};

for (const p of paketKaydi) {
  try {
    const deste = JSON.parse(readFileSync(new URL(p.dosya, kok), 'utf8'));
    for (const m of icerikHatalari(p.oyun, deste)) hata(p.dosya, m);
  } catch (e) {
    hata(p.dosya, `okunamadı: ${(e as Error).message}`);
  }
}

const kayitli = new Set<string>(paketKaydi.map((p) => p.dosya));
for (const klasor of readdirSync(kok))
  for (const f of readdirSync(new URL(`${klasor}/`, kok)).filter((d) =>
    d.endsWith('.json'),
  ))
    if (!kayitli.has(`${klasor}/${f}`))
      hata(`${klasor}/${f}`, 'src/icerik/kayit.ts içinde kayıtlı değil');

process.exit(hataVar ? 1 : 0);
