import { it } from 'vitest';

// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// İlgili iş bitince geliştirici false yapar; bayrak açıkken "geçen" test CI'ı kırar
// (yani test gerçekten bir şey denemiyor demektir).
// cekirdek = #6 (oyuncular, kayıt, registry), oyun = #7 (OK mu NOK mu durum makinesi),
// kk25 = kart metni oy girişi ve açıklamada görünür kalır (#7 ekranları),
// kk26 = oyun dışı ekranlarda Geri düğmesi, kk27 = Ayarlar sağ üst ikon (#37),
// cila = v1 sonrası küçük açıklar (#36),
// oda = çok telefonlu oda modu: arayüz testID + wrangler deploy (#48, frontend),
// odaKimlik = belirteç adreste değil ilk WS mesajında (#48, sunucu + istemci),
// odaDeploy = sunucunun main'e merge'de wrangler ile dağıtımı (#48),
// odaGuvenlik = belirteç çakışma koruması + sunucu kabuğunun crypto belirteci (#48),
// casusKayit = Casus kim kayıt şema doğrulayıcısı durumGecerliMi (#93),
// casusKayitUi = Casus ekranı kayıttan okurken durumGecerliMi kullanır (frontend #81),
// casusMantik = Casus kim saf durum makinesi + JSON desteler (#78), casusUi = ekranlar ve kayıt listesi (#80…#82),
// odaMantik = oda mantığı (saf durum makinesi, KK-29…KK-40, #47).
export const BEKLEYEN = {
  cekirdek: false,
  oyun: false,
  kk25: false,
  kk26: false,
  kk27: false,
  cila: false,
  oda: false,
  odaMantik: false,
  odaGuvenlik: false,
  odaDeploy: false,
  odaKimlik: false,
  casusMantik: false,
  casusUi: false,
  casusUiSon: false, // #82: tüm Casus kim ekranlarının testID sözleşmesi
  casusKayit: false,
  casusKayitUi: false,
  odaCik: false, // #73: oyun içinde "Odadan çık?" (frontend #104 kapatır)
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
export const kabulOdaDeploy = BEKLEYEN.odaDeploy ? it.fails : it;
export const kabulOdaKimlik = BEKLEYEN.odaKimlik ? it.fails : it;
export const kabulCasusMantik = BEKLEYEN.casusMantik ? it.fails : it;
export const kabulCasusUi = BEKLEYEN.casusUi ? it.fails : it;
export const kabulCasusUiSon = BEKLEYEN.casusUiSon ? it.fails : it;
export const kabulCasusKayit = BEKLEYEN.casusKayit ? it.fails : it;
export const kabulOdaCik = BEKLEYEN.odaCik ? it.fails : it;
export const kabulCasusKayitUi = BEKLEYEN.casusKayitUi ? it.fails : it;
