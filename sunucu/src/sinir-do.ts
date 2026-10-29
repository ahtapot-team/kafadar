// Kod denemesi ve oda kurma sayacı: IP başına bir nesne (KK-30).
import { DurableObject } from 'cloudflare:workers';
import { denemeSiniri } from '../../src/oda/oda';
import type { Env } from './ortak';

export class Sinir extends DurableObject<Env> {
  // Denemeyi sayar; sınır aşıldıysa false.
  async dene(ip: string): Promise<boolean> {
    const s = denemeSiniri(await this.ctx.storage.get('k'), ip, Date.now());
    await this.ctx.storage.put('k', s.kayit);
    await this.ctx.storage.setAlarm(Date.now() + 120_000);
    return s.izin;
  }
  // Var olan odaya katılım ıskalama değildir: son denemeyi geri alır.
  async iade(ip: string) {
    const kayit = ((await this.ctx.storage.get('k')) ?? {}) as Record<
      string,
      number[]
    >;
    kayit[ip]?.pop();
    await this.ctx.storage.put('k', kayit);
  }
  async alarm() {
    await this.ctx.storage.deleteAll();
  }
}
