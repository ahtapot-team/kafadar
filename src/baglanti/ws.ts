// Gerçek WebSocket taşıması (src/oda saf kalır: ağ yok, KK-40).
import type { TasimaUretici } from '../oda/tasima';

export function wsTasima(adres: string): TasimaUretici {
  return (d) => {
    const ws = new WebSocket(adres);
    let kapali = false;
    const bitir = () => {
      if (kapali) return;
      kapali = true;
      d.kapandi();
    };
    ws.onopen = () => d.acildi();
    ws.onmessage = (e) => {
      try {
        d.mesaj(JSON.parse(String(e.data)));
      } catch {
        // bozuk çerçeve yok sayılır
      }
    };
    ws.onclose = bitir;
    ws.onerror = bitir;
    return {
      gonder: (m) => ws.readyState === 1 && ws.send(JSON.stringify(m)),
      kapat: () => {
        kapali = true; // bilerek kapatma "koptu" sayılmaz
        ws.close();
      },
    };
  };
}
