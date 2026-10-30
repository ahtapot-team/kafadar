# KK → test haritası (otomatik üretilir: `npm run kk-harita`; elle düzenleme)

PRD'deki her kabul kriteri için "KK-nn" ifadesi geçen test dosyaları ve gerçek-cihaz listesi. CI her KK'nin en az bir testi ya da cihaz maddesi olduğunu denetler.

| KK | Kriter (PRD, kısaltılmış) | Test dosyaları | Gerçek cihaz |
|---|---|---|---|
| KK-1 | Açılıştaki logo animasyonu ≤1 sn sürer. Ana ekranda OK mu NOK mu aktiftir. 10/10 ama ve Ca | `uygulama.kabul.test.ts` | cihaz |
| KK-2 | Oyunlar bir kayıt listesinden (registry) yüklenir. Sahte bir 4. oyun modülü eklendiğinde a | `games/casus-kim/ui.kabul.test.ts`, `games/on-on-ama/ui.kabul.test.ts`, `games/registry.test.ts`, `tanitim-ui.kabul.test.ts`, `uygulama.kabul.test.ts` | — |
| KK-3 | Oyuncu sayısı 2–12'dir. 2'nin altında "Başla" pasif kalır ve nedeni yazılır. 12 oyuncuda e | `core/oyuncular.kabul.test.ts` | — |
| KK-4 | İsim boşluklar kırpıldıktan sonra 1–16 karakterdir, boş isim kabul edilmez. Aynı isim giri | `core/oyuncular.kabul.test.ts` | — |
| KK-5 | Son oyuncu listesi saklanır ve "Geçen seferki ekip" ile tek dokunuşla gelir. | `core/kayit.kabul.test.ts` | — |
| KK-6 | Oyun ortasında oyuncu eklenip çıkarılabilir. Ödüller yalnızca oyuncunun katıldığı kartlard | `games/ok-mu-nok/oyun.kabul.test.ts` | — |
| KK-7 | Arkadaş, Çift ve Aile paketlerinin her birinde en az 100 kart vardır. Tur uzunluğu 10 / 20 | `games/casus-kim/icerik.kabul.test.ts`, `games/ok-mu-nok/oyun.kabul.test.ts`, `uygulama.kabul.test.ts` | — |
| KK-8 | Bir oturumda aynı kart tekrar gelmez. Deste bitince "Karıştırıp baştan?" sorulur. | `games/ok-mu-nok/oyun.kabul.test.ts` | — |
| KK-9 | Kart çevrilme animasyonuyla açılır, ardından 3-2-1 geri sayım başlar. Titreşim açıksa her  | — | cihaz |
| KK-10 | Her oyuncu için OK, NOK ya da boş işaretlenir. | `games/ok-mu-nok/oyun.kabul.test.ts` | — |
| KK-11 | Açıklamada çubuklar yaklaşık 2 sn'de dolar. | `games/ok-mu-nok/oyun.kabul.test.ts` | cihaz |
| KK-12 | Oturum sonunda Aykırı ruh (en çok azınlıkta kalan), Ruh ikizleri (en çok aynı oyu veren ik | `games/ok-mu-nok/oyun.kabul.test.ts` | — |
| KK-13 | "Paylaş" 1080×1920 boyutunda, logo ve oyun adı içeren bir sonuç görseli üretir ve sistem p | — | cihaz |
| KK-25 | Kart metni geri sayımdan sonra kaybolmaz. Kart küçülüp ekranın üstüne yapışır, oy girişi v | `games/ok-mu-nok/kart.test.ts`, `games/ok-mu-nok/oyun.kabul.test.ts`, `uygulama.kabul.test.ts` | — |
| KK-26 | Oyun dışı her ekranda (Oyuncular, Paket/Süre, Ayarlar) görünür bir "Geri" düğmesi vardır v | `geri-tusu.kabul.test.ts`, `uygulama.kabul.test.ts` | — |
| KK-27 | Ana ekranda büyük bir "Ayarlar" düğmesi yoktur. Ayarlar, ana ekranın sağ üstünde küçük ve  | `uygulama.kabul.test.ts` | — |
| KK-14 | Her oydan ve her karttan sonra oyun kaydedilir. Uygulama kapatılıp açılınca "Devam et / Ye | `core/kayit.kabul.test.ts`, `games/casus-kim/kayit.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts`, `games/on-on-ama/onon.kabul.test.ts`, `games/on-on-ama/ui.kabul.test.ts`, `uygulama.kabul.test.ts` | cihaz |
| KK-15 | Oyun içindeyken Android geri tuşu ve iOS kaydırarak geri hareketi "Oyundan çık?" onayı ist | `uygulama.kabul.test.ts` | cihaz |
| KK-16 | Oyun sürerken ekran kendiliğinden kapanmaz. Uçak modunda tüm akış çalışır. | — | cihaz |
| KK-17 | 375×667'den tablete kadar her ekranda taşma ya da yatay kaydırma olmaz. Ekran dikey kilitl | — | cihaz |
| KK-18 | Sistemde en büyük yazı boyutu açıkken taşma olmaz. Kart metni 16pt'nin altına inmez. | — | cihaz |
| KK-19 | OK ve NOK hem ikon hem kelimeyle gösterilir. Ekran okuyucu (VoiceOver / TalkBack) etiketle | — | cihaz |
| KK-20 | Koyu tema varsayılandır, açık tema da vardır. Ses ve titreşim ayarlardan ayrı ayrı kapatıl | — | cihaz |
| KK-21 | Otomatik içerik testi geçer: boş, yinelenen (Türkçe büyük/küçük harf duyarsız, `tr` yerel  | `games/casus-kim/icerik.kabul.test.ts`, `uygulama.kabul.test.ts` | — |
| KK-22 | Oyun mantığı arayüzden ayrı, saf ve serileştirilebilir bir durum makinesidir (durum + olay | `games/ok-mu-nok/oyun.kabul.test.ts`, `uygulama.kabul.test.ts` | — |
| KK-23 | Her PR'a telefondan QR ile açılan bir önizleme linki yorum olarak yazılır. CI (biçim, lint | `uygulama.kabul.test.ts` | — |
| KK-24 | Gerçek cihaz kapısı: 1 iOS ve 1 Android cihazda bir insan tam bir oturum oynar ve kontrol  | — | cihaz |
| KK-28 | OK mu NOK mu'da "Tek telefon / Oda kur / Odaya katıl" seçimi vardır. Tek telefon modu deği | `oda/ui.kabul.test.ts` | cihaz |
| KK-29 | Oda kurulunca yalnızca rakamlardan oluşan 6 haneli bir kod (ör. 482 913; okunurken 3+3 gru | `oda/kod.test.ts`, `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-30 | Katılan kişi kod ve isim girer. Kod yanlışsa, oda kapalıysa, oda doluysa ya da oyun başlad | `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-31 | Lobide katılanlar birkaç saniye içinde tüm telefonlarda görünür. Kuran kişi de oyuncudur.  | `oda/istemci.test.ts`, `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-32 | Her soru tüm telefonlarda aynı sırada ve aynı anda açılır; soru sırasını sunucu belirler.  | `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-33 | Oyuncu süre içinde cevabını değiştirebilir, son cevabı geçerlidir. Süre bittikten sonra ge | `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-34 | Odadaki herkes cevaplayınca süre beklenmeden sonraki soruya geçilir. Cevap veren kişi "Cev | `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-35 | Bir oyun 10 sorudur. 10. soru bitene kadar hiçbir oy başka bir telefona gönderilmez; ağ tr | `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | — |
| KK-36 | Final dağılımı tüm telefonlarda gösterilir: 10 sorunun OK/NOK yüzdeleri (boşlar ayrı), en  | `oda/oda.kabul.test.ts`, `oda/ozet.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-37 | Bağlantısı kopan oyuncu (arka plana alma, ağ değişimi, kısa uçak modu) aynı kimlikle geri  | `oda/istemci.test.ts`, `oda/oda.kabul.test.ts`, `oda/onon-istemci.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-38 | Kuran kişi çıkarsa ya da bağlantısı koparsa oyun kalanlarla devam eder. Odada tek oyuncu k | `oda/oda.kabul.test.ts`, `oda/ozet.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-39 | Oda ve oyuncu isimleri sunucuda yalnızca oyun süresince tutulur. Oyun bitince ya da oda 1  | `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-40 | Oda mantığı, KK-22 gibi saf ve serileştirilebilir bir durum makinesidir; saat ve rastgelel | `oda/oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | — |
| KK-41 | Gerçek cihaz kapısı: en az 3 telefonla (iOS ve Android, farklı ağlar) tam bir oyun oynanır | `oda/ui.kabul.test.ts` | cihaz |
| KK-42 | Ana ekranda Casus kim aktiftir ve OK mu NOK mu ile aynı çekirdeği (oyuncular, paket, ayarl | `games/casus-kim/ui.kabul.test.ts`, `uygulama.kabul.test.ts` | cihaz |
| KK-43 | En az 3, en çok 12 oyuncu. Casus sayısı varsayılan 1'dir. Oyuncu sayısına göre artırılabil | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-44 | Her oyuncuya kartından önce adının yazdığı tam ekran bir devir perdesi gösterilir. Kart iç | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-45 | Casus kartı ve normal kart aynı renk, düzen, yazı boyutu ve titreşimle gösterilir; yan bak | `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-46 | "Gördüm"e basan oyuncunun kartı bir daha açılamaz. Geri tuşu veya hareketi "Oyundan çık?"  | `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-47 | Kayıt ve devam (KK-14) kimin kartını gördüğünü saklar. Uygulama yeniden açılınca kartını g | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/kayit.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-48 | Herkes kartını görünce ilk soru soracak kişi rastgele seçilir. Tartışma ekranında paketin  | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-49 | Oylama açık oydur. En çok oyu alan kişinin kartı çevrilir. Eşitlik olursa yalnızca eşit ka | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-50 | Oylanan kişi casussa kelimeyi 6 şık arasından tahmin eder (doğru kelime + aynı paketten 5  | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-51 | Bir oturumda aynı kelime tekrar gelmez. Her paket en az 100 kelime içerir. Her kelimenin b | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/icerik.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | — |
| KK-52 | Renk kuralı: yeşil yalnızca "grup casusu yakaladı", kırmızı yalnızca "casus kazandı" anlam | `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-53 | Oyun mantığı saf, tohumlu ve serileştirilebilir bir durum makinesidir (KK-22). Kabul testl | `games/casus-kim/casus.kabul.test.ts`, `games/casus-kim/ui.kabul.test.ts` | — |
| KK-54 | Gerçek cihaz kapısı: `docs/GERCEK-CIHAZ-KONTROL.md`'ye Casus kim bölümü eklenir (basılı tu | `games/casus-kim/ui.kabul.test.ts` | cihaz |
| KK-55 | Ana ekranda 10/10 ama aktiftir. Oyun yalnızca yeni bir modül, bir deste ve kayıt listesind | `games/on-on-ama/ui.kabul.test.ts` | cihaz |
| KK-56 | Her oyuncu için 0–10 arası tam sayı puan girilir. Herkes girilince "Göster" açılır. Puan a | `games/on-on-ama/onon.kabul.test.ts`, `games/on-on-ama/ui.kabul.test.ts` | cihaz |
| KK-57 | Açıklamada ortalama (bir ondalık), en düşük ve en yüksek puan verenler, oybirliği konfetis | `games/on-on-ama/onon.kabul.test.ts`, `games/on-on-ama/ui.kabul.test.ts`, `oda/onon-oda.kabul.test.ts` | cihaz |
| KK-58 | Oturum sonunda En acımasız, Melek kalpli ve Ruh ikizleri ödülleri gösterilir; 9:16 paylaşı | `games/on-on-ama/onon.kabul.test.ts`, `games/on-on-ama/ui.kabul.test.ts` | cihaz |
| KK-59 | Kart sorusu (10/10 ama …) puan girişi ve açıklama boyunca görünür kalır (KK-25 gibi). | `games/on-on-ama/ui.kabul.test.ts` | cihaz |
| KK-60 | 3 paket, her birinde en az 100 kart; boş, yinelenen (tr) ya da 140 karakterden uzun kart y | `games/on-on-ama/deste.test.ts`, `games/on-on-ama/icerik.kabul.test.ts`, `games/on-on-ama/ui.kabul.test.ts` | cihaz |
| KK-61 | Oyun mantığı saf, tohumlu, serileştirilebilir bir durum makinesidir (KK-22); kabul testler | `games/on-on-ama/onon.kabul.test.ts`, `games/on-on-ama/ui.kabul.test.ts` | — |
| KK-62 | Gerçek cihaz kapısı: `docs/GERCEK-CIHAZ-KONTROL.md`'ye 10/10 ama bölümü eklenir ve işaretl | `games/on-on-ama/ui.kabul.test.ts` | cihaz |
| KK-63 | 10/10 ama'da "Tek telefon / Oda kur / Odaya katıl" seçimi vardır. Tek telefon modu (KK-55… | `oda/onon-istemci.kabul.test.ts`, `oda/onon-oda.kabul.test.ts`, `oda/ui.kabul.test.ts`, `sunucu/test/onon.ts` | cihaz |
| KK-64 | Oyun 10 karttır. Paketi kuran kişi seçer, kart sırasını sunucu belirler. Her kart tüm tele | `oda/onon-istemci.kabul.test.ts`, `oda/onon-oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-65 | Puan 0–10 arası tam sayıdır. Süre içinde değiştirilebilir, son puan geçerlidir. Süre bitti | `oda/onon-istemci.kabul.test.ts`, `oda/onon-oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-66 | Açıklamaya kadar hiçbir puan başka bir telefona gönderilmez; ağ trafiğinde de görünmez (KK | `oda/onon-oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-67 | Açıklama tüm telefonlarda aynı anda gösterilir: | `oda/onon-istemci.kabul.test.ts`, `oda/onon-oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-68 | Açıklamadan sonra "Sonraki kart" düğmesi yalnızca kuranda görünür; diğerleri "Kuran kişi b | `oda/onon-istemci.kabul.test.ts`, `oda/onon-oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-69 | 10. kartın açıklamasından sonra final tüm telefonlarda gösterilir: ödüller (KK-58 kurallar | `oda/onon-istemci.kabul.test.ts`, `oda/onon-oda.kabul.test.ts`, `oda/ui.kabul.test.ts` | cihaz |
| KK-70 | Yeniden bağlanma, oyuncu belirteci, veri silme ve hız sınırı OK mu NOK mu odasıyla aynıdır | `oda/onon-istemci.kabul.test.ts`, `oda/onon-oda.kabul.test.ts` | cihaz |
| KK-71 | Oda mantığı saf ve serileştirilebilir bir durum makinesidir (KK-40). OK mu NOK mu odası bo | `oda/onon-oda.kabul.test.ts` | — |
| KK-72 | Gerçek cihaz kapısı: en az 3 telefonla tam bir 10/10 ama odası oynanır. Kontrol listesi `d | — | cihaz |
| KK-77 | Ekran okuyucu kartın başlığını ve metnini okur. "Tamam" düğmesinin dokunma alanı en az 48p | `games/tanitim.kabul.test.ts`, `tanitim-ui.kabul.test.ts` | cihaz |
| KK-85 | Çiplerin dokunma alanı en az 48px'tir. Ekran okuyucu seçili çipi "seçili" diye okur. Çiple | `games/kategori.kabul.test.ts` | — |
| KK-87 | Ana ekranda oyun listesinin üstünde yatay ve tek seçimli bir çip satırı vardır. Sıra şudur | `games/kategori.kabul.test.ts` | — |
| KK-88 | Bir çipe dokunulunca listede yalnızca kişi aralığı çipin aralığıyla kesişen oyunlar kalır  | `games/kategori.kabul.test.ts` | — |
| KK-89 | Oyun kartında tür rozeti yoktur; yalnızca kişi sayısı görünür (ör. "2–12 kişi") ve tanıtım | `games/kategori.kabul.test.ts` | — |
| KK-90 | Oyun tanıtım kartı hiçbir zaman kendiliğinden açılmaz: oyunu ilk seçerken de, odaya kodla  | `nasil-oynanir.kabul.test.ts` | — |
| KK-91 | Oyun seçildikten sonraki her ekranın sağ üstünde küçük bir ⓘ düğmesi vardır: mod seçimi, o | `nasil-oynanir.kabul.test.ts` | — |
| KK-92 | ⓘ düğmesinin dokunma alanı en az 48px'tir. Ekran okuyucu düğmeyi "Nasıl oynanır" diye okur | `nasil-oynanir.kabul.test.ts` | — |
| KK-93 | Oyun akışları değişmez: mod seçimi, "Devam et" ve oda modu eskisi gibi çalışır. Mevcut kab | `games/kategori.kabul.test.ts`, `tanitim-ui.kabul.test.ts` | — |
