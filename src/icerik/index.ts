// İçerik kaydı + deste verisi (uygulama ve sunucu aynı kayıttan okur). Adlar/yollar: kayit.ts; JSON importları yalnızca burada.
import type { Deste } from '../core/deste';
import type { CasusDeste } from '../games/casus-kim/casus';
import aile from '../../content/decks/aile.json';
import arkadas from '../../content/decks/arkadas.json';
import casus_meslekler from '../../content/casus/casus-meslekler.json';
import casus_yerler from '../../content/casus/casus-yerler.json';
import casus_yiyecek from '../../content/casus/casus-yiyecek.json';
import cift from '../../content/decks/cift.json';
import onon_arkadas from '../../content/onon/onon-arkadas.json';
import onon_gundelik from '../../content/onon/onon-gundelik.json';
import onon_sevgili from '../../content/onon/onon-sevgili.json';
import { type Dosya, type Oyun, paketKaydi } from './kayit';

const JSONLAR = {
  'decks/arkadas.json': arkadas,
  'decks/cift.json': cift,
  'decks/aile.json': aile,
  'onon/onon-sevgili.json': onon_sevgili,
  'onon/onon-arkadas.json': onon_arkadas,
  'onon/onon-gundelik.json': onon_gundelik,
  'casus/casus-yerler.json': casus_yerler,
  'casus/casus-yiyecek.json': casus_yiyecek,
  'casus/casus-meslekler.json': casus_meslekler,
} satisfies Record<Dosya, Deste | CasusDeste>;

export const paketler = paketKaydi.map((k) => ({
  ...k,
  deste: JSONLAR[k.dosya],
}));

// Oda sunucusu ve tek telefon modu: iki kart oyununun destesi (bilinmeyen paket undefined).
export function desteBul(
  oyun: Extract<Oyun, 'ok-mu-nok' | 'on-on-ama'>,
  paketId: string,
): Deste | undefined {
  return paketler.find((p) => p.oyun === oyun && p.paketId === paketId)
    ?.deste as Deste | undefined;
}
