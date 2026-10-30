// Web: uygulamanın kendi router.back() çağrısı (ör. oyun içi Oyuncular → Tamam) tarayıcı geri tuşu
// gibi popstate üretir; oyun ekranı bunu "Oyundan çık?" için sanmasın diye işaretlenir (#45).
// `aktif` okunduğunda işaret tüketilir; 1 sn içinde tüketilmezse geçersizdir.
let bitis = 0;

export const uygulamaGeri = {
  isaretle() {
    bitis = Date.now() + 1000;
  },
  get aktif() {
    const gecerli = Date.now() < bitis;
    bitis = 0;
    return gecerli;
  },
};
