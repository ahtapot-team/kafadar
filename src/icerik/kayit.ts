// İçerik kaydı: oyun × paket, adlar ve dosya yolları TEK yerde (#143). Bu dosya JSON ve içe aktarma içermez:
// Node betikleri (scripts/icerik-dogrula.ts) de okuyabilir. JSON importları yalnızca index.ts'tedir.
export const paketKaydi = [
  {
    oyun: 'ok-mu-nok',
    paketId: 'arkadas',
    ad: 'Arkadaş',
    dosya: 'decks/arkadas.json',
  },
  { oyun: 'ok-mu-nok', paketId: 'cift', ad: 'Çift', dosya: 'decks/cift.json' },
  { oyun: 'ok-mu-nok', paketId: 'aile', ad: 'Aile', dosya: 'decks/aile.json' },
  {
    oyun: 'on-on-ama',
    paketId: 'sevgili',
    ad: 'Sevgili adayı',
    dosya: 'onon/onon-sevgili.json',
  },
  {
    oyun: 'on-on-ama',
    paketId: 'arkadas',
    ad: 'Arkadaş',
    dosya: 'onon/onon-arkadas.json',
  },
  {
    oyun: 'on-on-ama',
    paketId: 'gundelik',
    ad: 'Gündelik hayat',
    dosya: 'onon/onon-gundelik.json',
  },
  {
    oyun: 'casus-kim',
    paketId: 'yerler',
    ad: 'Yerler',
    dosya: 'casus/casus-yerler.json',
  },
  {
    oyun: 'casus-kim',
    paketId: 'yiyecek',
    ad: 'Yiyecek-İçecek',
    dosya: 'casus/casus-yiyecek.json',
  },
  {
    oyun: 'casus-kim',
    paketId: 'meslekler',
    ad: 'Meslekler',
    dosya: 'casus/casus-meslekler.json',
  },
] as const;

export type KayitPaket = (typeof paketKaydi)[number];
export type Oyun = KayitPaket['oyun'];
export type Dosya = KayitPaket['dosya'];
export type PaketId<O extends Oyun> = Extract<
  KayitPaket,
  { oyun: O }
>['paketId'];
