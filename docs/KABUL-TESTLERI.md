# Kabul testleri: KK → test eşlemesi (#5)

Çalıştırma: `npm run kabul` (CI'da ayrı adım). `npm test` yalnızca birim testleri koşar.
Bekleyen testler `src/kabul.ts` içindeki `BEKLEYEN` bayraklarıyla (`cekirdek` = #6, `oyun` = #7) `it.fails` olarak işaretlidir (kırmızı = beklenen, CI kırılmaz).
**Geliştirici testleri yeşile çevirince `BEKLEYEN = false` yapar.** Bayrak açıkken geçen test CI'ı kırar. Kabul testlerini silmek, atlamak ya da gevşetmek yasaktır.

## Arayüz sözleşmesi (imzalar iskelet dosyalarda)
- `src/core/oyuncular.ts`: isim ve oyuncu sayısı kuralları (KK-3, KK-4)
- `src/core/kayit.ts`: oyundan bağımsız kayıt; `Depo` AsyncStorage uyumlu (KK-5, KK-14)
- `src/games/ok-mu-nok/oyun.ts`: saf durum makinesi `yeniOyun` / `isle` / `sonuc` / `oduller` (KK-6…KK-12, KK-22)
- `src/games/oyun.ts`: `Oyun` tipine `aktif` eklendi (KK-1)

## Eşleme
| KK | Test | Durum |
|---|---|---|
| KK-1 | `uygulama.kabul.test.ts` (registry: aktif / yakında) | bekleyen |
| KK-1 logo ≤1 sn | gerçek cihaz kontrol listesi | cihaz |
| KK-2 | `registry.test.ts` + `uygulama.kabul.test.ts` (app/core belirli oyunu içe aktarmaz) | yeşil |
| KK-3, KK-4 | `core/oyuncular.kabul.test.ts` | bekleyen |
| KK-5 | `core/kayit.kabul.test.ts` | bekleyen |
| KK-6 | `oyun.kabul.test.ts` (oyuncu ekle/çıkar) | bekleyen |
| KK-7 | `uygulama.kabul.test.ts` (3 deste ≥50 kart), `oyun.kabul.test.ts` (tur uzunluğu) | deste yeşil, tur bekleyen |
| KK-8 | `oyun.kabul.test.ts` (tekrar yok, deste bitince karıştır) | bekleyen |
| KK-9 | geri sayım + titreşim: gerçek cihaz | cihaz |
| KK-10 | `oyun.kabul.test.ts` (Göster pasif, değiştirme, 300 ms, çift basış) | bekleyen |
| KK-11 | `oyun.kabul.test.ts` (metinler); 2 sn çubuk ve konfeti: cihaz | bekleyen + cihaz |
| KK-12 | `oyun.kabul.test.ts` (ödüller, eşitlik, 2 kişi) | bekleyen |
| KK-13 | 1080×1920 görsel + paylaşım menüsü: cihaz | cihaz |
| KK-14 | `core/kayit.kabul.test.ts` (kayıt, devam, bozuk/eski sürüm) | bekleyen |
| KK-15…KK-20 | gerçek cihaz kontrol listesi | cihaz |
| KK-21 | `deste.test.ts` + `uygulama.kabul.test.ts` | yeşil |
| KK-22 | `oyun.kabul.test.ts` (tohum, saflık, JSON) + `uygulama.kabul.test.ts` (UI içe aktarmaz) | bekleyen + yeşil |
| KK-23 | CI + önizleme workflow'u (EXPO_TOKEN bekliyor) | CI |
| KK-25 | `oyun.kabul.test.ts` (kart oy/açıklamada aynı), `uygulama.kabul.test.ts` (oy.tsx ve acik.tsx `kart-metni` gösterir); boyut ≥16pt ve görünüm: önizleme + cihaz | mantık yeşil, ekran bekleyen (`BEKLEYEN.kk25`) |
| KK-26 | `uygulama.kabul.test.ts` (oyuncular/paket/ayarlar `geri` düğmesi, oyun ekranlarında geri yok); "Geri'de liste korunur" önizlemede | ekran bekleyen (`BEKLEYEN.kk26`), oyun-içi yeşil |
| KK-27 | `uygulama.kabul.test.ts` (ikon yalnızca app/index.tsx'te; ana ekranda metinli "Ayarlar" düğmesi yok, `ayarlar` testID'li ikon `accessibilityLabel` ile var); sağ üstte sabit durması önizlemede | ekran bekleyen (`BEKLEYEN.kk27`), koruma yeşil |
| #36 cila | `uygulama.kabul.test.ts` (durum.tsx doğrulayıcı verir, `+not-found.tsx` Türkçe, Paylaş web'de gizli, keep-awake web'de yok); davranış önizlemede | bekleyen (`BEKLEYEN.cila`) |
| KK-28…KK-41 (oda modu) | `src/oda/oda.kabul.test.ts` (saf durum makinesi, sahte saat + N sahte istemci, ağsız: KK-29…KK-40), `uygulama.kabul.test.ts` (testID sözleşmesi, wrangler dağıtımı, saflık/çevrimdışı korumaları, KK-41 liste varlığı); QR, paylaşım görseli, gerçek ağ ve süre: önizleme + `GERCEK-CIHAZ-KONTROL.md` (KK-41, insan) | bekleyen (`BEKLEYEN.oda`), korumalar yeşil |
| KK-42…KK-54 (Casus kim) | `src/games/casus-kim/casus.kabul.test.ts` (saf durum makinesi, sahte tohum + saat, gizlilik/kayıt-devam öncelikli: KK-43…KK-50, KK-53), `icerik.kabul.test.ts` (md desteleri KK-51 + JSON şeması), `uygulama.kabul.test.ts` (kayıt listesi, testID sözleşmesi, arka planda kapanma, saflık, KK-54 liste varlığı); basılı tutma, uygulama değiştirici, gerçek cihaz: `GERCEK-CIHAZ-KONTROL.md` "Casus kim" | bekleyen (`casusMantik`, `casusUi`), içerik ve korumalar yeşil |
| KK-24 | `GERCEK-CIHAZ-KONTROL.md` (ayrı PR), insan işaretler | cihaz |

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

