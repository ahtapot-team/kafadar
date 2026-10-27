# Kafadar (çalışma adı) — Ürün gereksinimleri (PRD)

> Durum: v1 ONAYLANDI (27.10.2026, Semih). v2 oda modu ONAYLANDI (27.10.2026, Murat).
> Bu dosya projenin tek doğruluk kaynağıdır. Ajanlar sohbet geçmişine değil buraya bakar.
> Kapsam değişirse önce bu dosya güncellenir ve yeniden onaylanır.

## Amaç
Arkadaş grupları ve çiftler için, tek telefonda oynanan ve içine yeni oyunlar eklenebilen bir parti oyunları uygulaması yapmak. Bu oyunlar sosyal medyada video çekilerek oynanıyor. İlk sürümde tek oyun var: **OK mu NOK mu**. Bir durum kartı okunur, herkes OK ya da NOK der, sonuç dramatik bir açıklama anıyla gösterilir. Kalite çıtası baştan yüksek: oyun hissi, animasyon, titreşim ve paylaşılabilir anlar kabul kriteridir.

## Hedef kullanıcı ve platform
- Kullanıcı: 2–12 kişilik arkadaş grupları, çiftler ve aileler. Türkiye, Türkçe.
- Platform: iOS + Android yerel uygulama (App Store + Google Play). Tek telefon modu tamamen çevrimdışıdır, sunucu kullanmaz. Oda modu (v2) internet ve sunucu ister.

## Kapsam (v1)
- Ana ekranda oyun listesi: OK mu NOK mu aktif, 10/10 ama ve Casus kim "Yakında".
- Ortak çekirdek:
  - oyuncular (2–12)
  - paket seçimi (Arkadaş / Çift / Aile)
  - tur uzunluğu
  - oturum kaydı ve devam etme
  - ayarlar (ses, titreşim, tema)
- OK mu NOK mu: kart, 3-2-1 geri sayım, açık oy girişi, açıklama anı, oturum sonu ödülleri, paylaşılabilir sonuç görseli.
- Her biri en az 50 kartlık 3 soru destesi. İçerik 12+ yaşa uygun.
- Genişletilebilir mimari: oyunlar eklenti olarak eklenir.

## Kapsam dışı (bilerek yapmıyoruz)
- Diğer oyunlar: 10/10 ama (sonraki sürümler). Casus kim v3'te geliyor, aşağıdaki bölüme bakın.
- Hesap ya da giriş. (Oda koduyla çok telefonlu oyun v2'de geliyor, aşağıdaki bölüme bakın.)
- Gizli oy modu (telefon elden ele).
- +18 içerik, reklam, uygulama içi satın alma, analitik ya da veri toplama. (Oda modunda isimler yalnızca oyun süresince sunucuda tutulur, KK-39.)
- İngilizce ve diğer diller (v1 yalnızca Türkçe; metinler ayrı dosyada tutulur).
- Store yayını. Hesap ve uygulama adı kararı sonra verilecek. v1 kurulabilir derleme ve önizleme üretir.

## Kullanıcı akışları
1. **Açılış:** Logo animasyonu (≤1 sn), sonra ana ekran. Yarım kalmış oyun varsa "Devam et / Yeni oyun" sorulur.
2. **Ana ekran:** Oyun kartları ve ayarlar. OK mu NOK mu'ya dokunulur.
3. **Oyuncular:** 2–12 isim girilir. "Geçen seferki ekip" tek dokunuşla gelir.
4. **Paket ve süre:** Arkadaş / Çift / Aile paketi ve 10 / 20 kart ya da sınırsız tur uzunluğu seçilir.
5. **Kart:** Kart çevrilerek açılır, dev yazıyla gösterilir. 3-2-1 geri sayım (titreşimli) sonunda herkes başparmağını gösterir. Sonra kart küçülüp ekranın üstüne yapışır; soru oy girişi ve açıklama anı boyunca görünür kalır.
6. **Oy girişi:** Telefonu tutan kişi her isme OK 👍 ya da NOK 👎 işaretler. Herkes işaretlenince "Göster" açılır.
7. **Açıklama anı:** Çubuklar dolar. Tek azınlıkta "Ayşe tek başına NOK!", oybirliğinde konfeti, eşitlikte "Tam ikiye bölündünüz" gösterilir.
8. **Sonraki kart:** "Sonraki" ya da "Atla" ile 5. adıma dönülür. Kart limiti dolunca veya "Bitir"e basılınca 9. adıma geçilir.
9. **Oturum sonu:** Aykırı ruh, Ruh ikizleri ve Olay kart ödülleri gösterilir.
10. **Paylaş:** 9:16 sonuç görseli üretilir, sistem paylaşım menüsü açılır.
11. **Tekrar:** "Tekrar oyna" (aynı ekip, yeni kartlar) ya da ana menü.
- **Her an:** Geri tuşunda "Oyundan çık?" onayı istenir. Oyuncu eklenip çıkarılabilir. Uygulama arka plana alınınca oyun kaydedilir.

## Kabul kriterleri
Her madde test edilebilir olmalı; QA bunlardan otomatik kabul testleri yazar.

### Çekirdek
- [ ] KK-1: Açılıştaki logo animasyonu ≤1 sn sürer. Ana ekranda OK mu NOK mu aktiftir. 10/10 ama ve Casus kim "Yakında" olarak görünür ve açılmaz.
- [ ] KK-2: Oyunlar bir kayıt listesinden (registry) yüklenir. Sahte bir 4. oyun modülü eklendiğinde ana ekranda görünür. Çekirdek ve mevcut oyunların dosyalarında değişiklik gerekmez.
- [ ] KK-3: Oyuncu sayısı 2–12'dir. 2'nin altında "Başla" pasif kalır ve nedeni yazılır. 12 oyuncuda ekleme alanı gizlenir.
- [ ] KK-4: İsim boşluklar kırpıldıktan sonra 1–16 karakterdir, boş isim kabul edilmez. Aynı isim girilirse "Ali 2" önerilir. Emoji ve Türkçe karakter desteklenir.
- [ ] KK-5: Son oyuncu listesi saklanır ve "Geçen seferki ekip" ile tek dokunuşla gelir.
- [ ] KK-6: Oyun ortasında oyuncu eklenip çıkarılabilir. Ödüller yalnızca oyuncunun katıldığı kartlardan hesaplanır.
- [ ] KK-7: Arkadaş, Çift ve Aile paketlerinin her birinde en az 50 kart vardır. Tur uzunluğu 10 / 20 kart ya da sınırsız seçilebilir.
- [ ] KK-8: Bir oturumda aynı kart tekrar gelmez. Deste bitince "Karıştırıp baştan?" sorulur.

### OK mu NOK mu
- [ ] KK-9: Kart çevrilme animasyonuyla açılır, ardından 3-2-1 geri sayım başlar. Titreşim açıksa her saniye titrer.
- [ ] KK-10: Her oyuncu için OK, NOK ya da boş işaretlenir.
  - Herkes işaretlenmeden "Göster" pasiftir.
  - Oy, sonuç açıklanmadan önce değiştirilebilir.
  - 300 ms içindeki tekrar dokunuşlar tek işlem sayılır.
  - "Göster"e iki kez basmak sonucu iki kez açmaz.
- [ ] KK-11: Açıklamada çubuklar yaklaşık 2 sn'de dolar.
  - Tek kişi azınlıktaysa "<isim> tek başına <OK/NOK>!" yazar.
  - Oybirliğinde konfeti çıkar.
  - Eşitlikte "Tam ikiye bölündünüz" yazar.
- [ ] KK-12: Oturum sonunda Aykırı ruh (en çok azınlıkta kalan), Ruh ikizleri (en çok aynı oyu veren ikili) ve Olay kart (oyları en dengeli bölünen kart) ödülleri verilir. Eşitlikte tüm kazananlar gösterilir. 2 kişilik oyunda Aykırı ruh verilmez.
- [ ] KK-13: "Paylaş" 1080×1920 boyutunda, logo ve oyun adı içeren bir sonuç görseli üretir ve sistem paylaşım menüsünü açar.
- [ ] KK-25: Kart metni geri sayımdan sonra kaybolmaz. Kart küçülüp ekranın üstüne yapışır, oy girişi ve açıklama anı ekranlarında hep görünür. Uzun metinde taşma olmaz, metin 16pt'nin altına inmez. (Semih, 27.10.2026: "kullanıcı soruyu unutabilir ya da tekrar okumak isteyebilir")
- [ ] KK-26: Oyun dışı her ekranda (Oyuncular, Paket/Süre, Ayarlar) görünür bir "Geri" düğmesi vardır ve bir önceki ekrana döner. Girilen bilgiler (oyuncular, seçimler) kaybolmaz. Oyun başladıktan sonra geri dönüş yoktur: oyun ekranlarındaki geri/kapat düğmesi ve sistem geri hareketi "Oyundan çık?" onayını açar (KK-15). (Semih, 27.10.2026, seçenek B)
- [ ] KK-27: Ana ekranda büyük bir "Ayarlar" düğmesi yoktur. Ayarlar, ana ekranın sağ üstünde küçük ve sabit bir ⚙️ ikonuyla açılır: ikon yer değiştirmez, ekran kaysa da yerinde durur, dokunma alanı en az 48px, erişilebilirlik etiketi "Ayarlar". Diğer ekranlarda ayarlar girişi yoktur. (Semih, 27.10.2026 13:33 düzeltmesi)

### Uygulama durumu
- [ ] KK-14: Her oydan ve her karttan sonra oyun kaydedilir. Uygulama kapatılıp açılınca "Devam et / Yeni oyun" sorulur. Kayıt sürümlüdür. Okunamayan ya da eski kayıtta uygulama çökmez, kayıt güvenle sıfırlanır.
- [ ] KK-15: Oyun içindeyken Android geri tuşu ve iOS kaydırarak geri hareketi "Oyundan çık?" onayı ister.
- [ ] KK-16: Oyun sürerken ekran kendiliğinden kapanmaz. Uçak modunda tüm akış çalışır.

### Ekran ve erişilebilirlik
- [ ] KK-17: 375×667'den tablete kadar her ekranda taşma ya da yatay kaydırma olmaz. Ekran dikey kilitlidir, güvenli alanlar (çentik, dinamik ada) gözetilir.
- [ ] KK-18: Sistemde en büyük yazı boyutu açıkken taşma olmaz. Kart metni 16pt'nin altına inmez.
- [ ] KK-19: OK ve NOK hem ikon hem kelimeyle gösterilir. Ekran okuyucu (VoiceOver / TalkBack) etiketleri vardır. Dokunma alanı en az 48px'tir. "Hareketi azalt" açıksa konfeti ve sarsıntı olmaz.
- [ ] KK-20: Koyu tema varsayılandır, açık tema da vardır. Ses ve titreşim ayarlardan ayrı ayrı kapatılabilir. Sessiz modda ses çalmaz.

### İçerik, mimari ve kalite
- [ ] KK-21: Otomatik içerik testi geçer: boş, yinelenen (Türkçe büyük/küçük harf duyarsız, `tr` yerel ayarıyla) ya da 140 karakterden uzun kart yoktur. Her kartın kalıcı bir `id`'si vardır. Desteler sürümlüdür (`deck_id`, `version`, `lang`).
- [ ] KK-22: Oyun mantığı arayüzden ayrı, saf ve serileştirilebilir bir durum makinesidir (durum + olay → yeni durum). Rastgelelik tohumludur: aynı tohum aynı kart sırasını verir.
- [ ] KK-23: Her PR'a telefondan QR ile açılan bir önizleme linki yorum olarak yazılır. CI (biçim, lint, tip, gizli anahtar, test) yeşildir.
- [ ] KK-24: Gerçek cihaz kapısı: 1 iOS ve 1 Android cihazda bir insan tam bir oturum oynar ve kontrol listesini işaretler. Animasyonlar takılmaz. Bu işaret olmadan sürüm "bitti" sayılmaz.

## v2: Oda modu (Metehan, 27.10.2026) — ONAYLANDI (Murat)
Birden fazla telefonla oynanır. Bir telefon oda kurar, diğerleri kodla kendi telefonundan katılır. Herkes her soruyu süre içinde kendi telefonundan cevaplar. 10 soru peş peşe gelir. Sonuç her sorudan sonra değil, 10 soru bitince toplu dağılım olarak gösterilir. Tek telefon modu aynen kalır.

### Akış
1. **Mod seçimi:** OK mu NOK mu'ya dokununca "Tek telefon / Oda kur / Odaya katıl" seçilir.
2. **Oda kur:** İsim ve paket seçilir. Dev bir oda kodu ve QR gösterilir.
3. **Odaya katıl:** Kod ve isim girilir.
4. **Lobi:** Katılanlar listeye düşer. Kuran kişi de oyuncudur ve "Başlat" yalnızca onda görünür.
5. **Soru:** Herkesin telefonunda aynı soru, 15 sn geri sayım ve dev OK/NOK düğmeleri.
6. **Bekleme:** "Cevabın alındı ✓ · 6/8 cevapladı" yazar. Herkes cevaplayınca ya da süre bitince sonraki soruya geçilir.
7. **Final (10 soru sonra):** Her sorunun OK/NOK yüzdesi, en tartışmalı soru, ödüller. Ardından "kim ne dedi" görünümü. Her telefonda ayrıca kişisel kart ("7/10 çoğunlukla aynıydın"). Paylaş ve "Tekrar oyna".

### Kabul kriterleri (oda modu)
- [ ] KK-28: OK mu NOK mu'da "Tek telefon / Oda kur / Odaya katıl" seçimi vardır. Tek telefon modu değişmeden ve çevrimdışı çalışır; KK-16'daki uçak modu şartı yalnızca tek telefon modu için geçerlidir.
- [ ] KK-29: Oda kurulunca 4 harfli bir kod (O, 0, I, 1 karakterleri kullanılmaz) ve aynı kodu açan bir QR gösterilir. Kod yalnızca açık bir oda için geçerlidir. Oda kapanınca kod artık kullanılamaz.
- [ ] KK-30: Katılan kişi kod ve isim girer. Kod yanlışsa, oda kapalıysa, oda doluysa ya da oyun başladıysa Türkçe ve net bir hata gösterilir. Aynı isim gelirse "Ali 2" kuralı (KK-4) uygulanır. Kod denemelerine hız sınırı vardır.
- [ ] KK-31: Lobide katılanlar birkaç saniye içinde tüm telefonlarda görünür. Kuran kişi de oyuncudur. "Başlat" yalnızca kuranda görünür ve en az 2 oyuncuyla açılır. Odada en çok 12 oyuncu olur. Oyun başlayınca yeni katılım kapanır.
- [ ] KK-32: Her soru tüm telefonlarda aynı sırada ve aynı anda açılır; soru sırasını sunucu belirler. Her telefonda soru metni, 15 sn geri sayım ve OK/NOK düğmeleri vardır. Süre sunucu saatine göre işler; telefon saatleri farklı olsa da süre her yerde aynı anda biter.
- [ ] KK-33: Oyuncu süre içinde cevabını değiştirebilir, son cevabı geçerlidir. Süre bittikten sonra gelen cevap reddedilir. Cevap vermeyen oyuncu o soruda "boş" sayılır ve sonuçta ayrı gösterilir.
- [ ] KK-34: Odadaki herkes cevaplayınca süre beklenmeden sonraki soruya geçilir. Cevap veren kişi "Cevabın alındı ✓ · 6/8 cevapladı" ekranını görür. Kimin cevapladığı görünür, ne dediği görünmez.
- [ ] KK-35: Bir oyun 10 sorudur. 10. soru bitene kadar hiçbir oy başka bir telefona gönderilmez; ağ trafiğinde de görünmez.
- [ ] KK-36: Final dağılımı tüm telefonlarda gösterilir: 10 sorunun OK/NOK yüzdeleri (boşlar ayrı), en tartışmalı soru, ödüller (Aykırı ruh, Ruh ikizleri), ardından "kim ne dedi" görünümü. Her telefonda ayrıca kişisel kart vardır. Final 9:16 görsel olarak paylaşılabilir. "Hareketi azalt" açıksa animasyon yerine liste gösterilir.
- [ ] KK-37: Bağlantısı kopan oyuncu (arka plana alma, ağ değişimi, kısa uçak modu) aynı kimlikle geri döner ve o an açık olan soruya katılır. Kopukken süresi biten sorular "boş" sayılır. Kopukken ekranda "Yeniden bağlanıyor…" görünür.
- [ ] KK-38: Kuran kişi çıkarsa ya da bağlantısı koparsa oyun kalanlarla devam eder. Odada tek oyuncu kalırsa oyun biter ve o ana kadarki sonuçlar gösterilir.
- [ ] KK-39: Oda ve oyuncu isimleri sunucuda yalnızca oyun süresince tutulur. Oyun bitince ya da oda 1 saat boşta kalınca silinir. Hesap, giriş ve analitik yoktur.
- [ ] KK-40: Oda mantığı, KK-22 gibi saf ve serileştirilebilir bir durum makinesidir; saat ve rastgelelik dışarıdan verilir. Sunucu bu mantığı çalıştıran ince bir kabuktur. Kabul testleri sahte saat ve N sahte istemciyle ağsız çalışır. Sunucu main'e merge edilince otomatik dağıtılır.
- [ ] KK-41: Gerçek cihaz kapısı: en az 3 telefonla (iOS ve Android, farklı ağlar) tam bir oyun oynanır. Bir telefon arka plana alınıp geri getirilir. Kontrol listesi `docs/GERCEK-CIHAZ-KONTROL.md`'ye eklenir ve işaretlenmeden oda modu "bitti" sayılmaz.

### Kapsam dışı (v2)
- Hesap ya da giriş. Oda içi sohbet. Sesli ya da görüntülü bağlantı.
- Soru sayısı ve süre seçimi (sabit: 10 soru, 15 sn).
- Diğer oyunların oda modu. Web hedef değildir; yalnızca test için kullanılır.

### Kararlar (oda modu)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Sunucu | Cloudflare Workers + Durable Objects (her oda bir nesne, WebSocket) | Şimdilik ücretsiz başlanır. Süre ve oy otoritesi sunucudadır. Kuran telefon düşse de oda sürer. | Metehan (27.10.2026) |
| Sonuç görünürlüğü | Önce yüzdeler, sonra "kim ne dedi" | Videoda en çok ses getiren an | pm önerisi, Murat onayı (27.10.2026) |
| Kuran kişi | Kuran telefon da oynar | En basit, kimse dışarıda kalmaz | pm önerisi, Murat onayı (27.10.2026) |
| Süre ve sayı | 15 sn, 10 soru, 2–12 oyuncu | Metehan'ın isteği + mevcut oyuncu sınırı | pm önerisi, Murat onayı (27.10.2026) |
| Kopuk oyuncu | Kopuk oyuncu, "herkes cevapladı" beklemesini uzatmaz; süre bitince boş sayılır | Oyun takılmaz | backend önerisi, qa kabulü (27.10.2026) |
| Lobide kuran çıkarsa | Sıradaki oyuncu kurucu olur, oda kapanmaz | Oda boşa gitmez | backend önerisi, qa kabulü (27.10.2026) |
| Süre sınırı | 15. saniyede ve sonrasında gelen cevap reddedilir | Herkese eşit süre | backend önerisi, qa kabulü (27.10.2026) |
| Oyundan çıkanlar | Ödüllere girmez; o ana kadarki cevapları finalde görünür | Sonuç bozulmaz | backend önerisi, qa kabulü (27.10.2026) |
| Oyuncu belirteci | Kriptografik rastgele üretilir, tahmin edilemez. Bağlantı adresinde değil, bağlantıdan sonraki ilk mesajda gönderilir. | Başkası adına cevap verilemez, belirteç log'lara düşmez (güvenlik) | qa şartı (27.10.2026), #69 |

### Riskler (oda modu)
- **Cloudflare hesabı:** Bir insan ücretsiz bir Cloudflare hesabı açar ve API token'ını repo secret'ı olarak ekler (Expo'daki gibi). Token gruba yapıştırılmaz. Backend başlamadan ücretsiz katmanın yettiğini doğrular.
- **Gizlilik:** İsimler sunucudan geçer. Store gizlilik etiketi ve gizlilik metni yayından önce güncellenir.
- **Tempo:** Sonuç sona kaldığı için ortada gerilim düşebilir. Her sorudan sonra "herkes cevapladı" anı ses ve titreşimle verilir.
- **Test:** Çok istemcili davranış önce sahte saat ve sahte istemcilerle, sonra önizlemede birkaç tarayıcıyla, en son gerçek telefonlarla doğrulanır.

### Fikir turu özeti (oda modu)
- backend: Cloudflare Durable Objects (oda = tek otorite) önerdi. Önce 1 oda, 2 telefon ve tek soruyla kısa bir deneme. Büyüklük L.
- frontend: Mevcut durum makinesi yaşar, yeni bir taşıma katmanı eklenir. Önce saf mantık ve sahte taşıma. Büyüklük L.
- tasarim: 6–7 yeni ekran, final bir "sahne" gibi akar, kişisel kart. Tasarım M, uçtan uca L.
- qa: Kopma, geç katılan, süre senkronu ve kuran çıkışı sunucuda çözülür. Testler sahte saat ve N sahte istemciyle yapılır. Büyüklük L.
- İnsanlar: Metehan istedi ve sunucu olarak Cloudflare'i seçti (27.10.2026).

## v3: Casus kim (Murat, 27.10.2026) — ONAY BEKLİYOR
Tek telefonda, elden ele oynanır. Herkes aynı kelimeyi görür, casus göremez; casusa yalnızca bir ipucu verilir. Oyuncular birbirine soru sorar, sonunda casusu oylar. OK mu NOK mu'dan sonraki ikinci oyundur ve ana ekranda "Yakında"dan aktife geçer.

### Akış
1. **Oyuncular:** Mevcut oyuncu ekranı, en az 3 kişi.
2. **Ayarlar:** Paket (Yerler / Yiyecek ve içecek / Meslekler), casus sayısı (varsayılan 1), tartışma süresi (Kapalı / 3 / 5 / 8 dk, varsayılan Kapalı).
3. **Devir perdesi:** Tam ekran "Telefonu Ayşe'ye ver". Ayşe "Ben Ayşe'yim"e dokunur.
4. **Kart:** Basılı tutunca kelime görünür ("Plaj"). Casus "Sen casussun 🕵️" ve bir ipucu görür ("Güneş kremi"). Bırakınca kart kapanır. "Gördüm" → sıradaki oyuncunun perdesi.
5. **Herkes gördü:** Kimin soru sormaya başlayacağı kısa bir çark animasyonuyla rastgele seçilir.
6. **Tartışma:** Ekranda örnek sorular döner ("Oraya kiminle gidersin?"). Süre açıksa toplam süre için bir geri sayım halkası görünür (oyuncu başına süre yok); süre bitince titreşim ve oylamaya geçiş. Telefonu tutan kişi (moderatör) süre dolmadan da istediği an "Oylamaya geç" diyebilir.
7. **Oylama:** Açık oy. Herkes casus sandığı kişiyi parmağıyla gösterir; telefonu tutan kişi her oyuncunun seçtiği ismi girer.
8. **Açıklama:** En çok oy alanın kartı çevrilir: "Mert casus DEĞİL!" ya da "Casus: Ayşe 🕵️".
9. **Casusun tahmini:** Yakalanan casus kelimeyi 6 şık arasından seçer. 3-2-1 sonra doğru kelime açılır.
10. **Sonuç:** Kim kazandı, tüm casuslar ve kelime gösterilir. Paylaş (9:16), "Tekrar oyna" (aynı ekip, yeni kelime).

### Kabul kriterleri (Casus kim)
- [ ] KK-42: Ana ekranda Casus kim aktiftir ve OK mu NOK mu ile aynı çekirdeği (oyuncular, paket, ayarlar, kayıt) kullanır. Yeni oyun yalnızca bir modül, bir deste ve kayıt listesinde bir satırla eklenir (KK-2).
- [ ] KK-43: En az 3, en çok 12 oyuncu. Casus sayısı varsayılan 1'dir. Oyuncu sayısına göre artırılabilir: en fazla oyuncu sayısının dörtte biri (3–7 kişi: 1, 8–11 kişi: 2'ye kadar, 12 kişi: 3'e kadar). Casuslar rastgele seçilir, aynı tohum aynı casusları verir. Casuslar birbirini bilmez.
- [ ] KK-44: Her oyuncuya kartından önce adının yazdığı tam ekran bir devir perdesi gösterilir. Kart içeriği yalnızca basılı tutulurken görünür ve ekranda yalnızca o sırada bulunur. Bırakınca 150 ms içinde kapanır.
- [ ] KK-45: Casus kartı ve normal kart aynı renk, düzen, yazı boyutu ve titreşimle gösterilir; yan bakışta ayırt edilemez. Kelime orta boyda yazılır, dev yazıyla gösterilmez.
- [ ] KK-46: "Gördüm"e basan oyuncunun kartı bir daha açılamaz. Geri tuşu veya hareketi "Oyundan çık?" sorar (KK-15). Uygulama arka plana alınınca açık kart hemen kapanır ve ekran gizlenir.
- [ ] KK-47: Kayıt ve devam (KK-14) kimin kartını gördüğünü saklar. Uygulama yeniden açılınca kartını görmüş oyuncular tekrar rol ekranına dönmez, kalanlar devir perdesinden devam eder. Açık kart asla geri yüklenmez.
- [ ] KK-48: Herkes kartını görünce ilk soru soracak kişi rastgele seçilir. Tartışma ekranında paketin örnek soruları döner. Süre isteğe bağlıdır ve tüm tartışma için tek bir toplam süredir. Süre açıksa geri sayım gerçek saate göre işler (arka plana alınsa da doğru biter); bitince titreşim ve oylamaya geçiş olur. Moderatör süre dolmadan istediği an oylamaya geçebilir. Moderatör oyunun her aşamasında "Oyunu bitir" ile oyunu sonlandırabilir; bu durumda casuslar ve kelime gösterilir, kazanan ilan edilmez.
- [ ] KK-49: Oylama açık oydur. En çok oyu alan kişinin kartı çevrilir. Eşitlik olursa yalnızca eşit kalanlar arasında bir kez daha oylanır; yine eşitse casuslar kazanır.
- [ ] KK-50: Oylanan kişi casussa kelimeyi 6 şık arasından tahmin eder (doğru kelime + aynı paketten 5 kelime). Bilirse casuslar kazanır, bilemezse grup kazanır. Oylanan kişi casus değilse casuslar kazanır. Sonuçta tüm casuslar ve kelime gösterilir.
- [ ] KK-51: Bir oturumda aynı kelime tekrar gelmez. Her paket en az 50 kelime içerir. Her kelimenin bir ipucu vardır; ipucu kelimenin kendisini içermez (Türkçe `tr` yerel ayarıyla otomatik içerik testi). Her paketin en az 10 örnek sorusu vardır. İçerik 12+ yaşa uygundur.
- [ ] KK-52: Renk kuralı: yeşil yalnızca "grup casusu yakaladı", kırmızı yalnızca "casus kazandı" anlamında kullanılır. Oyunun kendi rengi nötrdür; casus için ayrı bir "tehlike" rengi yoktur.
- [ ] KK-53: Oyun mantığı saf, tohumlu ve serileştirilebilir bir durum makinesidir (KK-22). Kabul testleri sahte tohum ve saatle çalışır: her oyuncu kartını tam bir kez görür, "Gördüm" sonrası görünüm rolü tekrar vermez, kayıttan devamda rol sızmaz.
- [ ] KK-54: Gerçek cihaz kapısı: `docs/GERCEK-CIHAZ-KONTROL.md`'ye Casus kim bölümü eklenir (basılı tut, arka plana alma, uygulama değiştiricide gizlilik, tam bir oyun) ve işaretlenmeden oyun "bitti" sayılmaz.

### Kapsam dışı (v3)
- Oda modunda Casus kim (çok telefon). Mantık ileride taşınabilecek şekilde yazılır.
- Puanlama, çok turlu seri, liderlik tablosu.
- Ekran görüntüsü engeli (yeni bağımlılık ister). Basılı tutma ve otomatik kapanma ile risk azaltılır.
- Yazarak kelime tahmini (yalnızca şıklı).

### Kararlar (Casus kim)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Süre modu | İsteğe bağlı, tüm tartışma için toplam süre (oyuncu başına değil): Kapalı / 3 / 5 / 8 dk. Moderatör süre dolmadan oylamaya geçebilir ya da oyunu bitirebilir. | Videoda gerilim, istemeyen kapatır | Murat (27.10.2026) |
| Casus sayısı | Varsayılan 1, oyuncu sayısına göre artırılabilir | Büyük gruplarda oyun dengelenir | Murat (27.10.2026) |
| Oyunun sonu | Uygulamada açık oylama + yakalanan casusa şıklı tahmin | En heyecanlı an, yazım hatası riski yok | pm önerisi, onayla kesinleşir |
| İpucu türü | Kelimeyle ilgili tek bir kelime ya da ifade (kategori değil) | Casusa yetecek kadar yardım, ele vermeden | pm önerisi, onayla kesinleşir |
| Deste şeması | `{deck_id, version, lang, sorular[], cards[{id, kelime, ipucu}]}`; OK mu NOK mu destesine dokunulmaz | Ayrı oyun, ayrı şema | backend önerisi |
| İçerik | 3 paket × 50+ kelime, taslağı pm yazar, insanlar düzeltir | v1'deki desteler gibi | pm |

### Fikir turu özeti (Casus kim)
- backend: Aynı saf durum makinesi kalıbı, ayrı deste şeması ve doğrulama. Backend S, toplam M.
- frontend: Çekirdeğin çoğu yeniden kullanılır. Basılı tut-gör, otomatik kapanma, arka planda gizleme. M-L, 3 PR'a bölünür.
- tasarim: 8–9 ekran, devir perdesi, iki aşamalı açıklama videosu, casus kartı ayırt edilemez, renk kuralı. M.
- qa: En büyük risk gizlilik ve kayıttan devamda rol sızıntısı. Eşit oy ve tahmin kuralları yazılı olmalı. M.
- İnsanlar: Murat istedi; süre modu ve casus sayısını belirledi (27.10.2026).

## Geliştirme ilkesi (Semih, 27.10.2026)
**Overengineering yok.** En az kodla, en basit çözüm, yalnızca bugünkü ihtiyaç kadar. Yapı genişlemeye açık olacak ama ileriye dönük soyutlama, genel çerçeve ya da "belki lazım olur" kodu yazılmayacak. Yeni bağımlılık yalnızca gerçekten gerekiyorsa eklenir ve PR'da gerekçesi yazılır. Aşağıdaki mimari şartlar bu ilkeye göre en sade haliyle uygulanır. Örneğin oyun kayıt listesi basit bir dizidir, eklenti çatısı değildir.

## Mimari şartlar
- **Oyun = eklenti.** Ana ekran oyunları bir kayıt listesinden okur. Yeni oyun eklemek için yeni bir modül, bir deste ve kayıt listesine bir satır yeterlidir. Çekirdek ve mevcut oyunlar değişmez (KK-2).
- **Kurallar ekrandan ve taşımadan ayrı.** Oyun mantığı bugün telefonda yerel olarak çalışır. İleride oda kodlu modda aynı mantık sunucuda çalışır. Yerel ve uzak oyuncu ayrımı en baştan soyutlanır.
- **Deste sürümü.** Oyun başlarken destenin sürümü ve kart kimlikleri kayda kopyalanır. Yarım kalmış oyun eski sürümle biter.
- **Store'da bulunabilirlik (yayın aşaması).** Store başlığı "<Marka>: OK mu NOK mu" olur. Diğer oyunlar alt başlıkta ve anahtar kelimelerde yer alır. Her oyuna özel bir store sayfası açılır.

## Teknik kararlar
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Dil / framework | Expo (React Native, TypeScript) + Reanimated | Ekibin TS ve CI birikimi korunur, akıcı animasyon sağlanır, bulutta derleme yapılır | 4 ajanın önerisi, Semih onayı |
| Derleme | EAS Build (bulut) | 8 GB Mac'te Xcode ağır kalır | backend ve frontend önerisi |
| Önizleme | EAS Update + QR (Expo Go / geliştirme derlemesi) | Telefondan hemen denenir | ekip kuralı |
| Veri | Uygulama içinde gömülü, sürümlü JSON desteler. Oturum cihazda saklanır. | Sunucu yok, çevrimdışı çalışır, store incelemesi kolaylaşır | backend önerisi |
| Oynanış | Tek telefon, açık oy | En hızlı yol, videodaki oynanışın aynısı | Semih |
| İlk oyun | OK mu NOK mu | En kolay, en hızlı, en güncel | Semih |
| Ton | +18 yok, 12+ | Store riski düşük, geniş kitle | Semih |
| Store hesabı / ad | Sonra karar verilecek (kişisel hesapla başlanıp şirkete devredilecek) | Önce ürüne odaklanılıyor | Semih |

## Riskler ve açık sorular
- **"Dandik" riski:** Animasyon ve oyun hissi kabul kriteridir. Tasarım hareket kitini önce video olarak gösterir. Gerçek cihaz kapısı (KK-24) olmadan sürüm bitmiş sayılmaz.
- **İçerik kalitesi:** 150'den fazla kart gerekiyor. Taslağı pm yazar, insanlar düzeltir.
- **Expo hesabı:** EAS Build ve Update için ücretsiz bir Expo hesabı ve `EXPO_TOKEN` gerekir. Hesabı bir insan açar, token'ı backend repo secret'ı olarak ekler.
- **EAS ücretsiz katmanı:** Derleme kotası sınırlıdır. Derlemeler yalnızca main'e merge edilince ve sürüm çıkarken yapılır.
- **Store takvimi:** Google, yeni kişisel hesaplarda yayın öncesi 12 test kullanıcısıyla 14 gün kapalı test istiyor. Apple hesabı yıllık 99$.
- **Ad:** "Kafadar" çalışma adıdır. Gerçek ad seçilince store ve marka çakışması kontrol edilir.

## Ekip görüşleri (fikir turu özeti)
- tasarim: Önce marka ve hareket kiti. Dikey video kadrajı, dev yazı, köşede logo. Paylaşılacak anlara özel animasyon. Statik görsel yerine animasyonlu prototip. İlk sürüm tek oyun.
- backend: Gömülü, sürümlü JSON desteler ve EAS. Oyun mantığı saf durum makinesi, böylece ileride sunucuya taşınır. Google'ın 14 günlük kapalı test şartına dikkat.
- frontend: Expo + Reanimated. Çekirdek önce en küçük oyunla sınanır. Durum her an kaydedilir. Düşük seviye Android'de gerçek cihaz testi.
- qa: Gerçek cihaz testi yayın kapısı. İçerik ve yaş testi, Türkçe İ/ı tuzakları, uygulama durumu senaryoları. CI yeşil olması çalıştığı anlamına gelmez.
- İnsanlar: Semih kararları verdi (27.10.2026):
  - Expo
  - tek telefon, açık oy
  - ilk oyun OK mu NOK mu
  - genişletilebilirlik zorunlu
  - store hesabı ve ad sonra
