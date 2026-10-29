# Kabul testleri: KK → test eşlemesi (#5)

Çalıştırma: `npm run kabul` (CI'da ayrı adım). `npm test` yalnızca birim testleri koşar.
Bekleyen (henüz yazılmamış işe ait) testler `src/kabul.ts` içindeki `BEKLEYEN` bayraklarıyla `it.fails` olarak işaretlidir (kırmızı = beklenen, CI kırılmaz). **İşi bitiren geliştirici bayrağı `false` yapar; işi kapatan PR bayrağı ve sarmalayıcıyı siler, testler düz `it` olur (bayrak sonsuza kadar kalmaz).** Bayrak açıkken geçen test CI'ı kırar. Kabul testlerini silmek, atlamak ya da gevşetmek yasak.

## Arayüz sözleşmesi (imzalar iskelet dosyalarda)
- `src/core/oyuncular.ts`: isim ve oyuncu sayısı kuralları (KK-3, KK-4)
- `src/core/kayit.ts`: oyundan bağımsız kayıt; `Depo` AsyncStorage uyumlu (KK-5, KK-14)
- `src/games/ok-mu-nok/oyun.ts`: saf durum makinesi `yeniOyun` / `isle` / `sonuc` / `oduller` (KK-6…KK-12, KK-22)
- `src/games/oyun.ts`: `Oyun` tipine `aktif` eklendi (KK-1)

## Eşleme
KK → test eşlemesi **otomatik üretilir**: [`docs/KK-HARITA.md`](KK-HARITA.md) (`npm run kk-harita`). PRD'deki her KK için test adında ya da yorumda "KK-nn" geçen test dosyaları ve gerçek-cihaz listesi görünür. CI (`npm run kk-harita:kontrol`) her KK'nin en az bir testi ya da cihaz maddesi olduğunu denetler; yeni KK eklenince test adına "KK-nn" yazılır ya da `GERCEK-CIHAZ-KONTROL.md`'ye madde eklenir. Haritayı QA yeniler (bayatsa CI yalnızca uyarır).

## testID adları (frontend bunları kullanır)
Ana ekran: `ana-oyun-ok-mu-nok`, `ana-oyun-yakinda-<id>`, `ayarlar`, `devam-et`, `yeni-oyun`
Oyuncular: `oyuncu-ad-girdisi`, `oyuncu-ekle`, `oyuncu-satir-<i>`, `oyuncu-sil-<i>`, `gecen-ekip`, `basla`, `basla-neden`
Paket ve süre: `paket-arkadas`, `paket-cift`, `paket-aile`, `tur-10`, `tur-20`, `tur-sinirsiz`
Kart ve oy: `kart-metni`, `geri-sayim`, `oy-<i>-ok`, `oy-<i>-nok`, `goster`
Açıklama: `cubuk-ok`, `cubuk-nok`, `sonuc-metni`, `konfeti`, `sonraki`, `atla`, `bitir`
Deste bitti: `karistir-evet`, `karistir-hayir`
Oturum sonu: `odul-aykiri-ruh`, `odul-ruh-ikizleri`, `odul-olay-kart`, `paylas`, `tekrar-oyna`, `ana-menu`
Her an: `cikis-onay-evet`, `cikis-onay-hayir`; ayarlar: `ayar-ses`, `ayar-titresim`, `ayar-tema`
(`<i>` oyuncunun sıra numarası, 0'dan; isim yerine sıra kullanılır çünkü isimde emoji/boşluk olabilir.)

## Oda modu arayüz sözleşmesi (`src/oda/oda.ts`, #47)
`kodUret`, `odaKur`, `isle(durum, olay, simdi)`, `gorunum(durum, kimlik, simdi)`, `final`, `silinmeli`, `denemeSiniri`. Olaylar: `katil`, `baslat`, `cevapla`, `kop`, `don`, `ayril`, `zaman`. Hata varsa durum değişmez. Belirtilmeyen, bilerek test edilmeyen davranışlar: kopuk oyuncunun erken geçişi bekletip bekletmediği, lobide kuranın ayrılması, süre sınırında tam milisaniye, oyun biter bitmez silme gecikmesi, 3–2 gibi çoklu azınlık metni.

## Casus kim arayüz sözleşmesi (`src/games/casus-kim/casus.ts`, #78)
`casusSiniri`, `yeniOyun`, `isle`, `siradaki`, `kart`, `baslayan`, `kalanMs`, `kayittanYukle`, `oylamaAdaylari`, `oySonucu`, `tahminSecenekleri`, `kelimeKartId`, `sonuc`. Olaylar (hepsi saat olarak `t` taşır): `benim`, `goruldu`, `arkaPlan`, `tartismayiBitir`, `zaman`, `oyla`, `oylamayiBitir`, `devam`, `tahmin`, `oyunuBitir`. Bilerek test edilmeyen: arka planda "görmüş sayma" (şu an: görmemiş), kelime listesinde eşanlam sorunu, casus tahmininde birden fazla casus kaldığında grup kazanımı (PRD: tek casus yakalanıp bilemezse grup kazanır), ekran görüntüsü engeli.

## 10/10 ama arayüz sözleşmesi (`src/games/on-on-ama/onon.ts`, #105 → backend #106, frontend #108)
`yeniOyun`, `gecerliKart`, `gosterAktif`, `isle`, `ozet`, `oduller`, `durumGecerliMi`. Olaylar: `puan`, `goster`, `sonraki`, `atla`, `bitir`, `karistir`, `oyuncuEkle`, `oyuncuCikar` (OK mu NOK mu ile aynı kalıp; `oyla` yerine `puan`, saat yok). Kurallar: puan 0–10 tam sayı, açıklamaya kadar değiştirilebilir (son girilen geçerli); Göster herkes girince; ortalama bir ondalık; `bolundu` = en yüksek − en düşük ≥ 8; `oybirligi` = herkes aynı; ödüller açıklanmış kartlardan ve hâlâ oyunda olanlardan: en acımasız = verdiği puanların ortalaması en düşük, melek kalpli = en yüksek (herkes eşitse boş; eşitlikte hepsi), ruh ikizleri = ortak kartlarda |fark| ortalaması en küçük ikili(ler).
JSON desteler: `content/onon/<deck_id>.json` (`onon-arkadas`, `onon-gundelik`, `onon-sevgili`; md ile aynı metin ve sıra; `content/decks` değil: OK mu NOK mu paketlerine karışmasın).
testID: `onon-kart-metni`, `onon-puan-<oyuncu sırası>-<0..10>`, `onon-goster`, `onon-ortalama`, `onon-en-dusuk`, `onon-en-yuksek`, `onon-bolundu`, `onon-konfeti`, `onon-sonraki`, `onon-atla`, `onon-bitir`, `onon-odul-en-acimasiz`, `onon-odul-melek-kalpli`, `onon-odul-ruh-ikizleri`, `onon-paylas`, `onon-tekrar-oyna`, `onon-ana-menu`, `onon-karistir-evet`, `onon-karistir-hayir`.
Bayraklar (`src/kabul.ts`): `ononMantik` (backend #106 kapatır), `ononUi` (frontend #108 kapatır; ayrıca KK-1 testindeki `'10-10-ama': false` beklentisini `true` yapar).

## 10/10 ama oda modu sözleşmesi (`src/oda/oda.ts`, #118 → backend #119, frontend #121)
Oda durum makinesine tür eklenir; imzalar iskelette (`src/oda/oda.ts`), testler `src/oda/onon-oda.kabul.test.ts`. `odaKur({…, tur?: 'ok-mu-nok' | 'on-on-ama'})` (varsayılan OK mu NOK mu); `OdaDurum` yeni alanlar `tur`, `acik`, `puanlar`, `puanGecmis`; yeni olaylar `puanla {kimlik, puan}` ve `sonraki {kimlik}`; yeni hata kodu `gecersiz`. `gorunum(durum, kimlik, simdi)`: `tur` (her odada), 10/10 ama'da `benimPuanim`, `aciklama` (`ortalama`, `enDusuk`, `enYuksek`, `oybirligi`, `bolundu`, `puanlar` ad→puan|null), `sonrakiGorunur`; `cevapladi`/`toplam` aynı anlamda. `onOnFinal(durum)`: `kartlar`, `oduller` (`enAcimasiz`, `melekKalpli`, `ruhIkizleri`), `kisisel`. Kurallar:
- Her oda tek türde: 10/10 ama odasında `cevapla`, OK mu NOK mu odasında `puanla`/`sonraki` hata verir.
- Puan 0–10 tam sayı (geçersiz → `gecersiz`, durum değişmez); süre içinde değiştirilebilir; süre bitince `sure-doldu`; açıklama aşamasında yeni puan reddedilir.
- Herkes (bağlı) puan verince ya da süre dolup `zaman` gelince **açıklama** (`acik`); açıklama süresiz bekler. Boş kişi ortalamaya/uçlara girmez; hiç puan yoksa ortalama ve uçlar `null`. `oybirligi` en az 2 puan verenin hepsi aynı; `bolundu` fark ≥ 8.
- Açıklamaya kadar başkasının puanı hiçbir görünümde yer almaz (testte: yalnızca başkasının puanı farklı iki durumun görünümleri eşit).
- `sonraki`: yalnızca açıklama aşamasında; yalnızca yetkili (kuran bağlı ve oyundaysa kuran, değilse sıradaki bağlı oyuncu); 10. kartın açıklamasındaki `sonraki` finale (`asama: 'bitti'`) götürür.
- Ödüller (KK-58 kuralları): verdiği puanların ortalaması en düşük/en yüksek (herkes eşitse boş, eşitlikte hepsi), ruh ikizleri = ortak kartlarda mutlak fark ortalaması en küçük ikili(ler); boşlar hariç; ayrılanlar ödüle girmez, kişisel kartta kalır (çıkış anındaki kart sayılmaz).
Bayrak `ononOda` (`src/kabul.ts`, backend #119 kapatır). Frontend (#121) testID sözleşmesini tasarım #120 bitince ayrıca yazarım.

## 10/10 ama oda modu istemci sözleşmesi (#125 → frontend #121; tasarım `design/120-onon-oda`; sunucu #126 ile uyumlu)
**Mesajlar** (`src/oda/mesaj.ts`): `OnPaket = 'arkadas' | 'gundelik' | 'sevgili'`; `Acilis` kur `{ad, paket: Paket | OnPaket, oyun?: OdaTuru}` (oyun yoksa OK mu NOK mu; sunucu `?oyun=on-on-ama&paket=…`); istemci → `{t:'puanla', puan}`, `{t:'sonraki'}`; sunucu → `tamam.tur`, final için aynı `{t:'final'}` (10/10 ama odasında `OnOnFinal`; görünümün `tur`'una bakılır). **İstemci** (`src/oda/istemci.ts`): `kur(ad, paket, oyun?)`, `puanla(n)`, `sonraki()`, 10/10 ama final'i `durum.onFinal`'a düşer (`durum.final` null), OK mu NOK final'i `durum.final`'da kalır; `odaTuru(durum)` (görünümün `tur`'u; türsüz = OK mu NOK mu; odada değilse `null`); final gelince yeniden bağlanma yok. **Türetmeler** (`src/oda/onon-ozet.ts`): `onOnKisisel(final, ad)` (ortalama, `odaFarki` = ortalama − odadaki tüm verilen puanların ortalaması, `ikiz`, `enYuksek`, `enDusuk`, `bos`; ham `verilen` puanlardan, bir ondalık), `puanSirasi(aciklama)` (puan azalan, eşitlikte oyuncu sırası, boş sonda).
**testID** (yalnızca yeni olanlar; eskiler `oda-soru`, `oda-geri-sayim`, `oda-bekle-sayac` "Puanın alındı ✓ · n/N", `oda-ayrildi`, `yeniden-baglaniyor` aynen kullanılır): `oda-onon-paket-<arkadas|gundelik|sevgili>`, `oda-onon-kart-metni` (puan, bekleme ve açıklamada), `oda-onon-puan-<0..10>`, `oda-onon-puanim`, `oda-onon-ortalama`, `oda-onon-en-dusuk`, `oda-onon-en-yuksek`, `oda-onon-bolundu`, `oda-onon-oybirligi`, `oda-onon-konfeti` ("Hareketi azalt"ta sade), `oda-onon-satir-<i>`, `oda-onon-sonraki` (yalnızca `sonrakiGorunur`), `oda-onon-kuran-bekleniyor` ("Kuran kişi bekleniyor…"), `oda-onon-odul-en-acimasiz`, `oda-onon-odul-melek-kalpli`, `oda-onon-odul-ruh-ikizleri`, `oda-onon-kisisel`, `oda-onon-paylas`, `oda-onon-tekrar`.
Ayrıca: 10/10 ama kayıt girdisinde `modSecimi: true`; oda ekranları `odaTuru()` ile oyuna göre seçilir. Bayraklar (`src/kabul.ts`): `ononOdaIstemci` ve `ononOdaUi` (frontend #121 kapatır). Eski OK mu NOK mu oda testID'leri ve testleri yeşil kalır.

## Tanıtım kartı sözleşmesi (#131 → frontend #132; PRD v6 KK-73…KK-78)
**Mantık** (`src/core/tanitim.ts`): `TANITIM_ANAHTARI = 'kafadar:tanitim'`; `tanitimGorulduMu(depo, oyunId)` (kayıt yok/bozuk/depo hatası → false, fırlatmaz), `tanitimiIsaretle(depo, oyunId)` (yalnızca o oyunu işaretler, bozuk kaydı düzeltir, yazma hatasında fırlatmaz; yarım oyun ve son ekip kayıtlarına dokunmaz), `tanitimGerekli(goruldu, nerede)` (`'secim'` ve `'lobi'` yalnızca görülmediyse; `'devam'` hiçbir zaman). **Registry** (`src/games/oyun.ts`): `Oyun.tanitim = { kisi, metin }`, aktif her oyunda var ve PRD v6 "Tanıtım metinleri" tablosundaki satırla aynı (Casus kim kişi sayısı `minOyuncu`–12).
**testID:** `tanitim-kart`, `tanitim-baslik`, `tanitim-kisi`, `tanitim-metin`, `tanitim-tamam` (≥48px, `dokunmaAlani`; erişilebilirlik özellikleri; hareketi azalt), `tanitim-nasil` ("Nasıl oynanır?"; `app/paket.tsx`, `app/casus/hazirlik.tsx`, `app/onon/hazirlik.tsx`, `app/oda/lobi.tsx`). Kart bileşeni oyuna özgü metin içermez; `tanitimiIsaretle` yalnızca kart bileşeninde, "Tamam" işleyicisinde, tek yerde çağrılır (geri tuşu görüldü saymaz). Ana ekran seçimi `tanitimGerekli(…, 'secim')`, oda lobisi `tanitimGerekli(…, 'lobi')` kullanır.
**Bayraklar** (`src/kabul.ts`): `tanitimMantik` (mantık + registry), `tanitimUi` (ekran sözleşmesi); frontend #132 kapatır. Önizlemede/cihazda doğrulananlar: geri tuşu, dışarı dokunma, lobinin kart açıkken güncellenmesi, ekran okuyucu (`docs/GERCEK-CIHAZ-KONTROL.md` "Tanıtım kartı").

