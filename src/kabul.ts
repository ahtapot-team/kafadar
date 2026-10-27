import { it } from 'vitest';

// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// İlgili iş bitince geliştirici false yapar; bayrak açıkken "geçen" test CI'ı kırar
// (yani test gerçekten bir şey denemiyor demektir).
// cekirdek = #6 (oyuncular, kayıt, registry), oyun = #7 (OK mu NOK mu durum makinesi),
// kk25 = kart metni oy girişi ve açıklamada görünür kalır (#7 ekranları),
// kk26 = oyun dışı ekranlarda Geri düğmesi, kk27 = Ayarlar sağ üst ikon (#37),
// cila = v1 sonrası küçük açıklar (#36),
// oda = çok telefonlu oda modu: arayüz testID + wrangler deploy (#48, frontend),
// odaGuvenlik = belirteç çakışma koruması + sunucu kabuğunun crypto belirteci (#48),
// odaMantik = oda mantığı (saf durum makinesi, KK-29…KK-40, #47).
export const BEKLEYEN = {
  cekirdek: false,
  oyun: false,
  kk25: false,
  kk26: false,
  kk27: false,
  cila: false,
  oda: true,
  odaMantik: false,
  odaGuvenlik: true,
};

export const kabul = BEKLEYEN.cekirdek ? it.fails : it;
export const kabulOyun = BEKLEYEN.oyun ? it.fails : it;
export const kabulKk25 = BEKLEYEN.kk25 ? it.fails : it;
export const kabulKk26 = BEKLEYEN.kk26 ? it.fails : it;
export const kabulKk27 = BEKLEYEN.kk27 ? it.fails : it;
export const kabulCila = BEKLEYEN.cila ? it.fails : it;
export const kabulOda = BEKLEYEN.oda ? it.fails : it;
export const kabulOdaMantik = BEKLEYEN.odaMantik ? it.fails : it;
export const kabulOdaGuvenlik = BEKLEYEN.odaGuvenlik ? it.fails : it;
