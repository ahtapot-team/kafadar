// Test yardımcıları (tek yer): sahte depo, olay döngüsü, kaynak dosyalarını okuma.
import { readdirSync, readFileSync } from 'node:fs';
import type { Depo } from '../core/kayit';

// AsyncStorage uyumlu sahte depo; `veri` ile içeriği doğrudan okunur/yazılır.
export const depoYap = (): Depo & { veri: Map<string, string> } => {
  const veri = new Map<string, string>();
  return {
    veri,
    getItem: async (k) => veri.get(k) ?? null,
    setItem: async (k, v) => void veri.set(k, v),
    removeItem: async (k) => void veri.delete(k),
  };
};

// Bekleyen sözleri (promise) işletir.
export const akis = () => new Promise((r) => setTimeout(r, 0));

// Depo kökünden bir klasörün .ts/.tsx kaynakları (test dosyaları hariç).
export const kaynaklar = (klasor: string) =>
  readdirSync(new URL(`../../${klasor}`, import.meta.url), { recursive: true })
    .map(String)
    .filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.'))
    .map((f) => ({
      f: `${klasor}/${f}`,
      icerik: readFileSync(
        new URL(`../../${klasor}/${f}`, import.meta.url),
        'utf8',
      ),
    }));

// Depo kökünden bir dosyanın içeriği.
export const dosyaIcerik = (yol: string) =>
  readFileSync(new URL(`../../${yol}`, import.meta.url), 'utf8');
