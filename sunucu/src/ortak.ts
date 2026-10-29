// Sunucu kabuğunun ortak parçaları (worker, oda-do, sinir-do). Protokol: src/oda/mesaj.ts.
import type { Oda } from './oda-do';
import type { Sinir } from './sinir-do';

export type Env = {
  ODA: DurableObjectNamespace<Oda>;
  SINIR: DurableObjectNamespace<Sinir>;
};

// Soket eki (hibernation'da korunur): kimlik doğrulandıysa kimlik, bekliyorsa bağlanma zamanı.
export type Ek = { kimlik?: string; bas?: number };
export const KIMLIK_MS = 10_000;

export const gonder = (ws: WebSocket, govde: object) =>
  ws.send(JSON.stringify(govde));

// Tarayıcılar yükseltme öncesi HTTP hata gövdesini okuyamaz; hata bir WS çerçevesi olarak gider, sonra soket kapanır.
export function hataSoketi(kod: string, mesaj: string): Response {
  const { 0: istemci, 1: sunucu } = new WebSocketPair();
  sunucu.accept();
  gonder(sunucu, { t: 'hata', hata: { kod, mesaj } });
  sunucu.close(1000, 'hata');
  return new Response(null, { status: 101, webSocket: istemci });
}

// Kriptografik rastgelelik (oda kodu, tohum, oyuncu belirteci): yalnızca burada üretilir.
export const rastgele = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
