# Kafadar (çalışma adı) — Ürün gereksinimleri (PRD)

> Durum: v1 ONAYLANDI (27.10.2026, Semih). v2 oda modu ONAYLANDI (27.10.2026, Murat). v3 Casus kim ONAYLANDI (27.10.2026, Metehan). v4 10/10 ama ONAYLANDI (27.10.2026, Metehan).
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
- Her biri en az 100 kartlık 3 soru destesi (Murat, 27.10.2026). İçerik 12+ yaşa uygun.
- Genişletilebilir mimari: oyunlar eklenti olarak eklenir.

## Kapsam dışı (bilerek yapmıyoruz)
- Casus kim v3'te, 10/10 ama v4'te geliyor; aşağıdaki bölümlere bakın.
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
- [ ] KK-7: Arkadaş, Çift ve Aile paketlerinin her birinde en az 100 kart vardır. Tur uzunluğu 10 / 20 kart ya da sınırsız seçilebilir.
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
2. **Oda kur:** İsim ve paket seçilir. Dev, 6 haneli bir sayı kodu ve QR gösterilir.
3. **Odaya katıl:** 6 haneli kod (sayı tuş takımıyla) ve isim girilir.
4. **Lobi:** Katılanlar listeye düşer. Kuran kişi de oyuncudur ve "Başlat" yalnızca onda görünür.
5. **Soru:** Herkesin telefonunda aynı soru, 15 sn geri sayım ve dev OK/NOK düğmeleri.
6. **Bekleme:** "Cevabın alındı ✓ · 6/8 cevapladı" yazar. Herkes cevaplayınca ya da süre bitince sonraki soruya geçilir.
7. **Final (10 soru sonra):** Her sorunun OK/NOK yüzdesi, en tartışmalı soru, ödüller. Ardından "kim ne dedi" görünümü. Her telefonda ayrıca kişisel kart ("7/10 çoğunlukla aynıydın"). Paylaş ve "Tekrar oyna".

### Kabul kriterleri (oda modu)
- [ ] KK-28: OK mu NOK mu'da "Tek telefon / Oda kur / Odaya katıl" seçimi vardır. Tek telefon modu değişmeden ve çevrimdışı çalışır; KK-16'daki uçak modu şartı yalnızca tek telefon modu için geçerlidir.
- [ ] KK-29: Oda kurulunca yalnızca rakamlardan oluşan 6 haneli bir kod (ör. 482 913; okunurken 3+3 gruplanır) ve aynı kodu açan bir QR gösterilir. Kod girişinde sayı tuş takımı açılır. (Murat: "kod sadece sayı olsun", 27.10.2026; 6 hane pm önerisi, Metehan "herşeyi bitir" onayı) Kod yalnızca açık bir oda için geçerlidir. Oda kapanınca kod artık kullanılamaz.
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

## v3: Casus kim (Murat, 27.10.2026) — ONAYLANDI (Metehan, 27.10.2026)
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
- [ ] KK-51: Bir oturumda aynı kelime tekrar gelmez. Her paket en az 100 kelime içerir. Her kelimenin bir ipucu vardır; ipucu kelimenin kendisini içermez (Türkçe `tr` yerel ayarıyla otomatik içerik testi). Her paketin en az 10 örnek sorusu vardır. İçerik 12+ yaşa uygundur.
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
| Oyunun sonu | Uygulamada açık oylama + yakalanan casusa şıklı tahmin | En heyecanlı an, yazım hatası riski yok | pm önerisi, Metehan onayı (27.10.2026) |
| İpucu türü | Kelimeyle ilgili tek bir kelime ya da ifade (kategori değil) | Casusa yetecek kadar yardım, ele vermeden | pm önerisi, Metehan onayı (27.10.2026) |
| Deste şeması | `{deck_id, version, lang, sorular[], cards[{id, kelime, ipucu}]}`; OK mu NOK mu destesine dokunulmaz | Ayrı oyun, ayrı şema | backend önerisi |
| İçerik | 3 paket × 100 kelime + ipucu, 12 örnek soru; taslağı pm yazar, insanlar düzeltir | v1'deki desteler gibi | pm, Murat (100) |

### Fikir turu özeti (Casus kim)
- backend: Aynı saf durum makinesi kalıbı, ayrı deste şeması ve doğrulama. Backend S, toplam M.
- frontend: Çekirdeğin çoğu yeniden kullanılır. Basılı tut-gör, otomatik kapanma, arka planda gizleme. M-L, 3 PR'a bölünür.
- tasarim: 8–9 ekran, devir perdesi, iki aşamalı açıklama videosu, casus kartı ayırt edilemez, renk kuralı. M.
- qa: En büyük risk gizlilik ve kayıttan devamda rol sızıntısı. Eşit oy ve tahmin kuralları yazılı olmalı. M.
- İnsanlar: Murat istedi; süre modu ve casus sayısını belirledi (27.10.2026).

## v4: 10/10 ama (28.10.2026) — ONAYLANDI (Metehan)
Tek telefonda, açık oyla oynanır; OK mu NOK mu akışının neredeyse aynısıdır. Kartta kusursuz bir kişi ya da şey ve bir "ama" yazar: "10/10 ama sabah 5'te kalkıyor". Herkes aynı anda parmaklarıyla 0–10 arası yeni puanını gösterir. Sonuç dağılımı ve en uç puanlar dramatik biçimde açıklanır. Ana ekranda "Yakında"dan aktife geçer.

### Akış
1. **Oyuncular ve paket:** Mevcut ekranlar (2–12 kişi). Paketler: Sevgili adayı / Arkadaş / Gündelik hayat.
2. **Kart:** "10/10 ama …" dev yazıyla açılır, 3-2-1 geri sayım.
3. **Puan:** Herkes parmaklarıyla 0–10 gösterir (iki el = 10). Telefonu tutan kişi her isme puanı girer (0–10 düğmeleri).
4. **Açıklama:** Ortalama büyük sayıyla gelir. En düşük ve en yüksek puan verenler gösterilir ("Ayşe 0 verdi!"). Herkes aynı puanı verdiyse konfeti, uçlar arası fark 8 ve üstüyse "Tam bölündünüz".
5. **Sonraki kart / oturum sonu:** OK mu NOK mu ile aynı. Ödüller: En acımasız (ortalaması en düşük), Melek kalpli (en yüksek), Ruh ikizleri (puanları en yakın iki kişi).

### Kabul kriterleri (10/10 ama)
- [ ] KK-55: Ana ekranda 10/10 ama aktiftir. Oyun yalnızca yeni bir modül, bir deste ve kayıt listesinde bir satırla eklenir (KK-2). Oyuncu, paket, süre, kayıt ve ayarlar çekirdekten gelir.
- [ ] KK-56: Her oyuncu için 0–10 arası tam sayı puan girilir. Herkes girilince "Göster" açılır. Puan açıklamaya kadar değiştirilebilir.
- [ ] KK-57: Açıklamada ortalama (bir ondalık), en düşük ve en yüksek puan verenler, oybirliği konfetisi ve "Tam bölündünüz" (uçlar arası fark ≥ 8) gösterilir. "Hareketi azalt" açıksa animasyon yerine sade gösterim.
- [ ] KK-58: Oturum sonunda En acımasız, Melek kalpli ve Ruh ikizleri ödülleri gösterilir; 9:16 paylaşım görseli üretilir.
- [ ] KK-59: Kart sorusu (10/10 ama …) puan girişi ve açıklama boyunca görünür kalır (KK-25 gibi).
- [ ] KK-60: 3 paket, her birinde en az 100 kart; boş, yinelenen (tr) ya da 140 karakterden uzun kart yok; her kart "10/10 ama" ifadesini içerir (Sevgili adayı ve Arkadaş paketlerinde "10/10 ama …", Gündelik hayatta "Ev 10/10 ama …"); içerik 12+.
- [ ] KK-61: Oyun mantığı saf, tohumlu, serileştirilebilir bir durum makinesidir (KK-22); kabul testleri sahte tohumla çalışır.
- [ ] KK-62: Gerçek cihaz kapısı: `docs/GERCEK-CIHAZ-KONTROL.md`'ye 10/10 ama bölümü eklenir ve işaretlenmeden oyun "bitti" sayılmaz.

### Kapsam dışı (v4)
- Oda modunda 10/10 ama (v5'e alındı). Tek telefonda gizli puan. Ondalıklı puan.

### Kararlar (10/10 ama, pm önerisi — Metehan onayı, 27.10.2026 22:22)
| Karar | Seçim | Gerekçe |
|---|---|---|
| Oynanış | Tek telefon, açık puan (parmakla 0–10) | Videodaki oynanışın aynısı, OK mu NOK mu ile aynı çekirdek |
| Paketler | Sevgili adayı / Arkadaş / Gündelik hayat | Akımın en çok paylaşılan konuları |
| İçerik | 3 × 100 kart, taslağı pm yazar | Diğer oyunlarla aynı çıta |

## v5: 10/10 ama oda modu (Murat, 28.10.2026) — ONAYLANDI (Murat, 28.10.2026 05:52)
Issue'lar: #118 kabul testleri (qa), #119 sunucu ve durum makinesi (backend), #120 tasarım (tasarim), #121 istemci (frontend).
10/10 ama da OK mu NOK mu gibi birden fazla telefonla oynanır: biri oda kurar, diğerleri 6 haneli kodla katılır. Tek telefon modu değişmeden kalır. Oda altyapısı v2'den gelir: kod, QR, lobi, yeniden bağlanma ve sunucu. Yeni olan iki şey var: telefondan gizli 0–10 puan ve her karttan sonra tüm telefonlarda aynı anda açıklama.

### Akış
1. **Mod seçimi:** 10/10 ama'da "Tek telefon / Oda kur / Odaya katıl" seçimi vardır (OK mu NOK mu ile aynı ekran). Paketi kuran kişi seçer.
2. **Lobi:** v2 ile aynı: 6 haneli kod ve QR, 2–12 kişi, "Başlat" yalnızca kuranda.
3. **Kart:** Kart tüm telefonlarda aynı anda açılır. Herkes kendi telefonundan 0–10 arası gizli puan verir; süre 15 sn. Herkes puan verince süre beklenmez.
4. **Açıklama:** Tüm telefonlarda aynı anda ortalama, en düşük ve en yüksek puanı verenler, oybirliği konfetisi ya da "Tam bölündünüz" gösterilir. Ardından herkesin puanı görünür. Kuran kişi "Sonraki kart"a basar.
5. **Final:** 10 kartın sonunda ödüller (En acımasız, Melek kalpli, Ruh ikizleri), kişisel kart ve 9:16 paylaşım görseli gösterilir.

### Kabul kriterleri (10/10 ama oda modu)
- [ ] KK-63: 10/10 ama'da "Tek telefon / Oda kur / Odaya katıl" seçimi vardır. Tek telefon modu (KK-55…KK-62) değişmeden ve çevrimdışı çalışır. Kod, QR, katılım, lobi, oyuncu sınırı ve hata mesajları OK mu NOK mu odasıyla aynıdır (KK-29…KK-31). Her oda tek bir oyun türündedir. Kodla katılan kişi hangi oyunun ekranından gelirse gelsin odanın oyununa girer.
- [ ] KK-64: Oyun 10 karttır. Paketi kuran kişi seçer, kart sırasını sunucu belirler. Her kart tüm telefonlarda aynı anda açılır. Ekranda kart metni, 15 sn geri sayım ve 0–10 puan düğmeleri görünür. Süre sunucu saatine göre işler (KK-32).
- [ ] KK-65: Puan 0–10 arası tam sayıdır. Süre içinde değiştirilebilir, son puan geçerlidir. Süre bittikten sonra gelen puan reddedilir. Puan vermeyen oyuncu o kartta "boş" sayılır ve ortalamaya ya da uçlara girmez. Herkes puan verince süre beklenmeden açıklamaya geçilir. Puan veren kişi "Puanın alındı ✓ · 6/8" ekranını görür: kimin puan verdiği görünür, kaç verdiği görünmez.
- [ ] KK-66: Açıklamaya kadar hiçbir puan başka bir telefona gönderilmez; ağ trafiğinde de görünmez (KK-35 gibi).
- [ ] KK-67: Açıklama tüm telefonlarda aynı anda gösterilir:
  - ortalama (bir ondalık);
  - en düşük ve en yüksek puanı verenler;
  - oybirliği konfetisi ve "Tam bölündünüz" (KK-57 kuralları);
  - ardından herkesin puanı.

  "Hareketi azalt" açıksa sade gösterim kullanılır.
- [ ] KK-68: Açıklamadan sonra "Sonraki kart" düğmesi yalnızca kuranda görünür; diğerleri "Kuran kişi bekleniyor…" görür. Kuran kişi çıkarsa ya da bağlantısı koparsa düğme sıradaki bağlı oyuncuya geçer ve oyun takılmaz.
- [ ] KK-69: 10. kartın açıklamasından sonra final tüm telefonlarda gösterilir: ödüller (KK-58 kuralları, boşlar hariç), kişisel kart ve 9:16 paylaşım görseli. Oyundan çıkanlar ödüllere girmez.
- [ ] KK-70: Yeniden bağlanma, oyuncu belirteci, veri silme ve hız sınırı OK mu NOK mu odasıyla aynıdır (KK-37, KK-39, belirteç kararı). Kopukken süresi biten kartlar "boş" sayılır.
- [ ] KK-71: Oda mantığı saf ve serileştirilebilir bir durum makinesidir (KK-40). OK mu NOK mu odası bozulmaz; mevcut oda kabul testleri yeşil kalır. Kabul testleri sahte saat ve N sahte istemciyle ağsız çalışır.
- [ ] KK-72: Gerçek cihaz kapısı: en az 3 telefonla tam bir 10/10 ama odası oynanır. Kontrol listesi `docs/GERCEK-CIHAZ-KONTROL.md`'ye eklenir ve işaretlenmeden oda modu "bitti" sayılmaz.

### Kapsam dışı (v5)
- Casus kim oda modu. Oda modunda süre ya da kart sayısı ayarı. Seyirci modu.

### Kararlar (10/10 ama oda modu)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Kart akışı | Puanlar gizli; her karttan sonra tüm telefonlarda aynı anda açıklama | Oyunun asıl eğlencesi açıklama anı; gizli puan bu anı daha sert yapar | pm önerisi, Murat (28.10.2026, "1b") |
| Sonraki kart | Kuran kişi basar | "Neden 2 verdin?" tartışmasına zaman kalır | pm önerisi, Murat (28.10.2026, "2a") |
| Kod, kişi, süre, kart sayısı | OK mu NOK mu odasıyla aynı: 6 hane, 2–12 kişi, 15 sn, 10 kart | Tutarlılık; mevcut altyapı | pm varsayılanı |

### Riskler (v5)
- Sunucu bugün yalnızca OK/NOK cevabını biliyor. Oyun türü eklenirken OK mu NOK mu odası bozulabilir. Önlem: KK-71, mevcut oda testleri.
- Kuran kişi telefonu bırakırsa herkes bekler. Bu, Murat'ın seçtiği bilinen bir eksi.

## v6: Oyun tanıtım kartı (Murat, 29.10.2026) — ONAYLANDI (Metehan, 29.10.2026 06:57)
> v7.1 ile değişti: kart artık kendiliğinden açılmaz, yalnızca ⓘ ile açılır (Semih, 30.10.2026).

Issue'lar: #130 tasarım (tasarim), #131 kabul testleri (qa), #132 uygulama (frontend; #130 ve #131 bitince başlar).
Bir oyun o telefonda ilk kez açıldığında oyunu 3–4 satırda anlatan bir kart çıkar. Kart "Tamam" ile kapanır ve o oyun için bir daha kendiliğinden görünmez. Tekrar okumak isteyen için hazırlık ekranlarında ve oda lobisinde "Nasıl oynanır?" bağlantısı vardır.

### Akış
1. **İlk dokunuş:** Ana ekranda oyun seçilince, sonraki ekrana geçmeden önce o oyunun tanıtım kartı açılır. Kartta oyun adı, kişi sayısı, kısa metin ve "Tamam" bulunur.
2. **Tamam:** Kart kapanır ve akış normal devam eder. O oyunun kartı bu telefonda bir daha kendiliğinden açılmaz.
3. **Odaya katılım:** Odaya kodla ilk kez katılan kişi o oyunun kartını daha önce görmediyse kart lobide bir kez açılır.
4. **Nasıl oynanır?:** Hazırlık ekranlarında ve oda lobisinde bulunan küçük bağlantı aynı kartı açar.

### Kabul kriterleri (tanıtım kartı)
- ~~KK-73~~ (v7.1 ile değişti → KK-90): Bir oyun o telefonda ilk kez seçildiğinde, ana ekrandan sonraki ekrana geçmeden önce o oyunun tanıtım kartı açılır. Kartta oyun adı, kişi sayısı, aşağıdaki tablodaki metin ve "Tamam" düğmesi vardır. "Tamam"a basınca kart kapanır ve oyunun normal akışı devam eder.
- ~~KK-74~~ (v7.1 ile değişti → KK-90): "Tamam"a basıldıktan sonra o oyunun kartı o telefonda bir daha kendiliğinden açılmaz; uygulama kapatılıp açılsa da açılmaz. Her oyun ayrı tutulur. Bilgi yalnızca telefonda saklanır, sunucuya gitmez. Kart geri tuşuyla kapatılırsa ana ekrana dönülür ve kart görülmüş sayılmaz. Kartın dışına dokunmak kartı kapatmaz.
- ~~KK-75~~ (v7.1 ile değişti → KK-90): Odaya kodla katılan kişi o oyunun kartını daha önce görmediyse kart lobide bir kez açılır. Kart açıkken de lobi güncellenmeye devam eder ve oyun başlarsa kart kapanır. Odayı kuran kişi kartı oyunu seçerken görür.
- ~~KK-76~~ (v7.1 ile değişti → KK-91): Şu ekranlarda küçük bir "Nasıl oynanır?" bağlantısı vardır ve aynı kartı açar:
  - OK mu NOK mu paket ve süre ekranı;
  - Casus kim ayarları;
  - 10/10 ama hazırlığı;
  - oda lobisi.

  Bu bağlantıyla açılan kart da "Tamam" ile kapanır.
- [ ] KK-77: Ekran okuyucu kartın başlığını ve metnini okur. "Tamam" düğmesinin dokunma alanı en az 48px'tir. Kart koyu ve açık temada çalışır; "Hareketi azalt" açıksa animasyon kullanılmaz. Metin oyunun kayıt satırından (registry) gelir; yeni bir oyun tanıtımını kendi kayıt satırıyla ekler (KK-2).
- ~~KK-78~~ (v7.1 ile değişti → KK-90): Kart bir kez görüldükten sonra ana ekrandan oyuna giriş eskisi gibi tek dokunuştur. Yarım kalan oyunda "Devam et" tanıtım göstermez. Mevcut kabul testleri yeşil kalır.

### Tanıtım metinleri (taslak: pm)
| Oyun | Kişi | Metin |
|---|---|---|
| OK mu NOK mu | 2–12 kişi | Kartta bir durum çıkar: "İlk buluşmada hesabı bölmek". 3-2-1'de herkes başparmağıyla OK 👍 ya da NOK 👎 gösterir. Telefonu tutan kişi oyları girer, sonra kimin tek başına kaldığı ortaya çıkar. Oda modunda herkes kendi telefonundan oy verir. |
| Casus kim | 3–12 kişi | Telefon elden ele dolaşır. Herkes aynı kelimeyi görür, casus ise yalnızca bir ipucu. Sırayla birbirinize kelimeyle ilgili sorular sorun, ama kelimeyi söylemeyin. Sonunda casusu oylayın. Yakalanan casus kelimeyi bilirse yine kazanır. |
| 10/10 ama | 2–12 kişi | Kartta kusursuz biri ve bir "ama" var: "10/10 ama sabah 5'te kalkıyor". Herkes parmaklarıyla 0–10 arası yeni puanını gösterir, telefonu tutan kişi puanları girer. Ortalama ve en uç puanlar açıklanır. Oda modunda puanlar gizlidir ve her karttan sonra açılır. |
| Quiz Night | 1–12 kişi | Bir dizi seç, 10 soru gelsin: kolaydan zora, 4 şık. Bildiğin kadar puan, sonunda bir unvan. Tek başına kendi hızında oynarsın; tek telefonda grup modunda telefonu tutan okur, herkes sesli cevaplar, "Cevabı göster"den sonra bilenler işaretlenir. Oda modu yakında. |

### Kapsam dışı (v6)
- Adım adım etkileşimli eğitim. Video. Ayarlardan "tanıtımları sıfırla" seçeneği.

### Kararlar (tanıtım kartı)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Görünüm | Oyuna ilk dokunuşta açılan kısa kart (3–4 satır + "Tamam"), tam ekran tanıtım değil | Parti oyununda herkes hemen başlamak ister | pm önerisi, Murat (29.10.2026, "1A") |
| Tekrar okuma | Hazırlık ekranlarında ve oda lobisinde "Nasıl oynanır?" bağlantısı | Yeni gelen arkadaşa anlatmak için | pm önerisi, Murat (29.10.2026, "2a") |
| Saklama | Her oyun ayrı, telefon başına bir kez, yalnızca telefonda | Hesap yok (KK-39 ilkesi) | pm varsayılanı |

## v7: Oyun kategorileri (Semih, 30.10.2026) — ONAYLANDI (Semih, 30.10.2026 14:30)
> v7.1 ile değişti: çipler kişi sayısına göre (Tümü · 2 kişi · 3–5 kişi · 6+ kişi); tür ve ortam etiketleri kalktı.

Issue'lar: #171 tasarım (tasarim), #172 kabul testleri (qa), #173 uygulama (frontend; #171 ve #172 bitince başlar).
Yeni oyunlar geldikçe (çift oyunları, quiz gecesi, kalabalık oyunları…) kullanıcı "kiminle, kaç kişi oynuyoruz?" sorusuna göre oyun bulabilmeli. Bunun için her oyun kendi kayıt satırında etiketlenir ve ana ekranın üstüne tek seçimli filtre çipleri gelir. Bugün 3 oyun var; çipler yeni oyun eklendikçe kendiliğinden çoğalır.

Araştırma özeti (pm): Parti uygulamaları oyunları çoğunlukla "kiminle" sorusuna göre (Çift / Arkadaş / Aile) ve Quiz başlığı altında gruplar. Jackbox ise kategori kullanmaz, her oyunda kişi sayısını gösterir. BoardGameGeek oyunlara tek bir kategori yerine birden çok etiket verir. Aynı oyun birden çok ortama uyduğu için burada da etiket mantığı seçildi.

### Akış
1. Ana ekran açılır. Oyun listesinin üstünde yatay bir çip satırı vardır ve "Tümü" seçilidir.
2. Kullanıcı bir çipe dokunur (ör. "Çift"). Listede yalnızca o etiketi taşıyan oyunlar kalır. Seçili çipe ya da "Tümü"ne dokunmak filtreyi kaldırır.
3. Her oyun kartında tür rozeti ve kişi sayısı görünür.
4. Oyuna dokunduktan sonraki akış (tanıtım kartı, mod seçimi, oyuncular) değişmez.

### Etiketler (bugünkü oyunlar)
| Oyun | Tür | Ortam | Kişi |
|---|---|---|---|
| OK mu NOK mu | Oylama | Çift, Aile | 2–12 |
| 10/10 ama | Puanlama | Çift | 2–12 |
| Casus kim | Gizli rol | Aile | 3–12 |

Hiçbir etiketi olmayan oyunlar arkadaş grubu için sayılır, bu yüzden ayrı bir "Arkadaş" etiketi yoktur. "Aile" etiketi, içeriğin aileyle oynanmaya uygun olduğunu da söyler.

### Çip kuralları
| Çip | Eşleşen oyun |
|---|---|
| Tümü | hepsi |
| 2 kişi | `minOyuncu` ≤ 2 |
| Kalabalık | 6 ya da daha fazla kişiyle oynanabilen oyun (bugün üst sınır hepsinde 12) |
| Çift | ortamında Çift olan |
| Aile | ortamında Aile olan |
| Quiz | türü Quiz olan |

### Kabul kriterleri (oyun kategorileri)
- ~~KK-79~~ (v7.1 ile değişti → KK-89): Her aktif oyunun kayıt satırında bir `tur` alanı bulunur: oylama, puanlama, gizli-rol ya da quiz. İsteğe bağlı bir `ortam` listesi de bulunabilir: cift, aile. Kişi aralığı mevcut `minOyuncu` ve genel üst sınırdan (12) okunur; yeni bir kişi alanı eklenmez. `tur` alanı olmayan bir aktif oyun testi kırmızı yapar. Yeni oyun yine tek bir kayıt satırıyla eklenir (KK-2).
- ~~KK-80~~ (v7.1 ile değişti → KK-89): Bugünkü 3 oyunun etiketleri yukarıdaki tablodaki gibidir.
- ~~KK-81~~ (v7.1 ile değişti → KK-87): Ana ekranda oyun listesinin üstünde yatay ve tek seçimli bir çip satırı vardır. Çiplerin sırası: Tümü · 2 kişi · Kalabalık · Çift · Aile · Quiz. Uygulama açılınca "Tümü" seçilidir. Seçim uygulama kapanınca hatırlanmaz.
- ~~KK-82~~ (v7.1 ile değişti → KK-87): Bir çip ancak listeyi gerçekten daraltıyorsa görünür: en az bir oyun eşleşir ama oyunların tamamı eşleşmez. Bugünkü verilerle görünen çipler şunlardır: Tümü · 2 kişi · Çift · Aile. Kalabalık gizlidir çünkü bütün oyunlar eşleşir; Quiz gizlidir çünkü hiçbir oyun eşleşmez. Görünecek çip kalmazsa çip satırı hiç gösterilmez.
- ~~KK-83~~ (v7.1 ile değişti → KK-88): Bir çipe dokunulunca listede yalnızca eşleşen oyunlar kalır ve sıraları değişmez (eşleşme için "Çip kuralları" tablosuna bakın). Seçili çipe ya da "Tümü"ne dokunmak filtreyi kaldırır. "Yakında" durumundaki oyunlar da aynı kurala uyar. Eşleşme kuralı saf bir fonksiyondur ve ekransız test edilir.
- ~~KK-84~~ (v7.1 ile değişti → KK-89): Her oyun kartında tür rozeti (Oylama / Puanlama / Gizli rol / Quiz) ve kişi sayısı (ör. "2–12 kişi") görünür. Kişi sayısı tanıtım kartında yazanla aynıdır (KK-73).
- [ ] KK-85: Çiplerin dokunma alanı en az 48px'tir. Ekran okuyucu seçili çipi "seçili" diye okur. Çipler koyu ve açık temada çalışır. Stil değerleri `src/tema.ts` token'larından gelir.
- ~~KK-86~~ (v7.1 ile değişti → KK-93): Oyuna dokunduktan sonraki akış değişmez: tanıtım kartı (KK-73…KK-78), mod seçimi ve "Devam et" eskisi gibi çalışır. Mevcut kabul testleri yeşil kalır. `CLAUDE.md` ve `docs/MIMARI.md`'deki "yeni oyun ekleme" adımları `tur` ve `ortam` alanlarını anlatır.

### Kapsam dışı (v7)
- İçerik ya da yaş seviyesi alanı ve +18 içerik ("+18 yok, 12+" kararı geçerli).
- Çoklu çip seçimi, arama, kategori rafları (oyun sayısı artınca ayrıca karar verilir), seçimin hatırlanması.
- Yeni oyun eklemek (bu iş yalnızca altyapıyı kurar).

### Kararlar (oyun kategorileri)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Gruplama | Kayıt satırında etiketler ve ana ekranda filtre çipleri (karma) | Bir oyun birden çok ortama uyar. Oyun sayısı artınca veri değişmeden raflı görünüme geçilebilir. | pm önerisi, Semih (30.10.2026, "1C") |
| İçerik seviyesi | Ayrı bir alan eklenmez; aileye uygunluk "Aile" etiketiyle gösterilir | Store yaş sınırını uygulamanın tamamına verir, "+18 yok" kararı geçerli. (Semih önce "2A" ile içerik seviyesi istemişti; pm bu store bilgisini ekleyince seçim değişti.) | pm önerisi, Semih (30.10.2026, "1A") |
| Çip davranışı | Tek seçim + "Tümü" | En sade çözüm (Geliştirme ilkesi) | pm önerisi, Semih (30.10.2026, "2A") |
| Etkisiz çipler | Listeyi daraltmayan çip gizlenir | Boş ya da her şeyi gösteren filtre kafa karıştırır | pm varsayılanı |
| Seçimi hatırlama | Hatırlanmaz | Sade | pm varsayılanı |

## v7.1: Kişi filtresi ve ⓘ Nasıl oynanır (Semih, 30.10.2026) — ONAYLANDI (Semih, 30.10.2026)
Issue'lar: #183 tasarım (tasarim), #184 kabul testleri (qa), #185 uygulama (frontend; #183 ve #184 bitince başlar).
Kullanıcı gözüyle sadeleştirme. Kullanıcı için asıl soru "kaç kişiyiz?". "2 kişi" ile "Çift" birbirine karıştırılıyordu. "Oylama/Puanlama" gibi türler kullanıcıya bir şey söylemiyordu. Sevgili/arkadaş seçimi zaten oyunun içinde, pakette yapılıyor. Bu yüzden ana ekran yalnızca kişi sayısına göre süzer. Oyun kuralları da artık kendiliğinden açılmaz; isteyen sağ üstteki ⓘ'ye dokunup bakar.

### Akış
1. Ana ekran açılır. Oyun listesinin üstünde Tümü · 2 kişi · 3–5 kişi · 6+ kişi çipleri vardır ve "Tümü" seçilidir.
2. Kullanıcı kişi sayısına uyan çipe dokunur; listede o kişi sayısıyla oynanabilen oyunlar kalır. Her kartta kişi sayısı yazar ("2–12 kişi").
3. Oyuna dokunur ve doğrudan oyunun ilk ekranına geçer; kural kartı kendiliğinden açılmaz.
4. Oyunun içindeki her ekranda sağ üstte ⓘ vardır; dokununca o oyunun tanıtım kartı açılır, "Tamam" ile kapanır.

### Çip kuralları
| Çip | Kişi aralığı | Bugün listede kalan |
|---|---|---|
| Tümü | hepsi | 3 oyun |
| 2 kişi | 2 | OK mu NOK mu, 10/10 ama |
| 3–5 kişi | 3–5 | 3 oyun |
| 6+ kişi | 6 ve üstü | 3 oyun |

Oyunun kişi aralığı (`minOyuncu` … genel üst sınır 12) çipin aralığıyla kesişiyorsa oyun listede kalır. Bugün bütün oyunlar 12 kişiye kadar oynandığı için listeyi daraltan tek çip "2 kişi"dir; diğer çipler yeni oyunlarla anlam kazanır.

### Kabul kriterleri (kişi filtresi ve ⓘ)
- ~~KK-87~~ (v8.1 ile değişti → KK-103): Ana ekranda oyun listesinin üstünde yatay ve tek seçimli bir çip satırı vardır. Sıra şudur: Tümü · 2 kişi · 3–5 kişi · 6+ kişi. Dört çip de her zaman görünür. Uygulama açılınca "Tümü" seçilidir ve seçim uygulama kapanınca hatırlanmaz. Seçili çipe ya da "Tümü"ne dokunmak filtreyi kaldırır.
- ~~KK-88~~ (v8.1 ile değişti → KK-104): Bir çipe dokunulunca listede yalnızca kişi aralığı çipin aralığıyla kesişen oyunlar kalır ("Çip kuralları" tablosu) ve sıraları değişmez. "Yakında" durumundaki oyunlar da aynı kurala uyar. Eşleşme kuralı saf bir fonksiyondur ve ekransız test edilir. Hiçbir oyun eşleşmezse listede "Bu kişi sayısına uygun oyun henüz yok." yazar.
- [ ] KK-89: Oyun kartında tür rozeti yoktur; yalnızca kişi sayısı görünür (ör. "2–12 kişi") ve tanıtım kartında yazanla aynıdır. Kayıt satırında `tur` ve `ortam` alanları yoktur. Çift, Aile, Kalabalık ve Quiz çipleri kaldırılmıştır. Yeni oyun yine tek bir kayıt satırıyla eklenir (KK-2); kişi aralığı `minOyuncu`dan ve genel üst sınırdan okunur.
- [ ] KK-90: Oyun tanıtım kartı hiçbir zaman kendiliğinden açılmaz: oyunu ilk seçerken de, odaya kodla katılırken de açılmaz. Ana ekrandan oyuna giriş tek dokunuştur. "Kart görüldü" bilgisi artık tutulmaz.
- [ ] KK-91: Oyun seçildikten sonraki her ekranın sağ üstünde küçük bir ⓘ düğmesi vardır: mod seçimi, oyuncular, hazırlık ekranları, oda lobisi, oyun ekranları ve sonuç. Ana ekranda ⓘ yoktur. Düğmeye dokununca o oyunun tanıtım kartı açılır; "Tamam" ile kapanır ve kullanıcı aynı ekranda kalır. Kart açıkken oyun durmaz; oda modunda diğer oyuncular devam eder. Eski "Nasıl oynanır?" yazı bağlantıları kaldırılmıştır.
- [ ] KK-92: ⓘ düğmesinin dokunma alanı en az 48px'tir. Ekran okuyucu düğmeyi "Nasıl oynanır" diye okur. Düğme koyu ve açık temada çalışır, stil değerleri `src/tema.ts` token'larından gelir. Tüm ekranlarda aynı ortak bileşen kullanılır.
- [ ] KK-93: Oyun akışları değişmez: mod seçimi, "Devam et" ve oda modu eskisi gibi çalışır. Mevcut kabul testleri yeşil kalır; değişen kriterlerin testleri güncellenir. `CLAUDE.md` ve `docs/MIMARI.md`'deki "yeni oyun ekleme" adımlarında `tur`/`ortam` geçmez.

### Kapsam dışı (v7.1)
- Oyuna özel üst kişi sınırı alanı (bugün tüm oyunlarda 12; farklı sınırlı bir oyun gelince eklenir).
- "Kaç kişisiniz?" sayacı, seçimin hatırlanması, birden çok çip seçimi.
- İlk açılış karşılaması (v8 taslağı rafa kalktı, Semih 30.10.2026; Metehan itiraz ederse yeniden açılır).

### Kararlar (kişi filtresi ve ⓘ)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Filtre ekseni | Yalnızca kişi sayısı; Çift/Aile ve tür çipleri kalkar | Kullanıcı için önemli olan kaç kişiyle oynayacağı; sevgili/arkadaş seçimi pakette zaten var | Semih (30.10.2026, msg 714) |
| Filtre biçimi | Tümü · 2 kişi · 3–5 kişi · 6+ kişi çipleri, hep görünür | Tek dokunuş; sayaçtan hızlı | pm önerisi, Semih (30.10.2026, "A") |
| Nasıl oynanır | Kendiliğinden açılmaz; oyun içindeki her ekranda sağ üstte ⓘ | İsteyen bakar, kimse bekletilmez | Semih (30.10.2026, msg 703; yer: "evet") |
| Eşleşme | Kişi aralığı kesişirse listede kalır | Kart kişi sayısını zaten gösteriyor; kimse gereksiz yere elenmez | pm varsayılanı |
| Kullanılmayan veri | `tur`, `ortam` ve "görüldü" saklaması silinir | Geliştirme ilkesi: kullanılmayan kod kalmaz | pm varsayılanı |
| Belgeler | İş sonunda md dosyaları güncellenir: TASARIM-SISTEMI (tasarim), KK-HARITA (qa), CLAUDE.md ve MIMARI (frontend) | Belgeler kodla uyumlu kalır | Semih (30.10.2026, msg 718) |

## v8: Açılış ekranı ve eğlenceli sözler (Semih, 30.10.2026) — ONAYLANDI (Semih, 30.10.2026)
Issue'lar: #190 tasarım (tasarim), #191 kabul testleri (qa), #192 uygulama (frontend; #190 ve #191 bitince başlar).
Uygulama açılırken boş ekran yerine "Kafadar" adı, yüzdeli bir yükleme çubuğu ve her açılışta değişen eğlenceli bir söz görünür. Sözler oyunlarla ilgilidir: bilgi, atasözü, meme ve dizi/film replikleri. Örneğin Casus kim için: "Koyunlar ömrünü kurttan korkarak geçirir. Halbuki sonunda onu yiyen çobandır." Rafa kalkan 3 ekranlı karşılamanın yerine, Metehan'ın açılış sayfası isteği (Telegram 689) bu hafif biçimde karşılanır.

### Akış
1. Kullanıcı uygulamayı açar. Telefonun sistem açılış görselinden hemen sonra Kafadar açılış ekranı gelir.
2. Ekranın ortasında "Kafadar" yazar. Altında yükleme çubuğu ve yüzde ("%0" → "%100"), en altta rastgele bir söz vardır. Söz bir oyuna aitse altında oyunun adı yazar ("— Casus kim").
3. Hazırlık bitince ve en az 3 saniye dolunca uygulama kendiliğinden geçer: ana ekrana ya da açılan bağlantının ekranına (ör. oda daveti). Acelesi olan ekrana dokunup beklemeyi atlar.

### Kabul kriterleri (açılış ekranı)
- [ ] KK-94: Uygulama her açıldığında (web'de sayfa yenilendiğinde de) önce açılış ekranı görünür. Ekranda "Kafadar" adı, yükleme çubuğu, yüzde ("%42" biçiminde) ve bir söz bulunur. Uygulama içinde ana ekrana dönüldüğünde açılış ekranı yeniden görünmez.
- [ ] KK-95: Yüzde yalnızca ileri gider. Hazırlık (yazı tipleri ve kayıtlı ayarlar) bitmeden %100 olmaz. Hazırlık erken bitse de açılış ekranı en az 3 saniye görünür. %100 olunca uygulama kendiliğinden ana ekrana ya da açılan bağlantının ekranına (ör. oda daveti) geçer.
- [ ] KK-96: Ekrana dokunmak kalan bekleme süresini atlar. Hazırlık bittiyse hemen geçer, bitmediyse hazırlık biter bitmez geçer. Yazı tipi yüklenemezse sistem yazı tipiyle devam edilir; açılış ekranı hiçbir hatada takılı kalmaz.
- [ ] KK-97: Söz her açılışta bütün sözler arasından rastgele seçilir. Oyuna ait sözün altında oyunun adı yazar, genel sözlerde yazmaz. Seçim saf bir fonksiyondur, `src/core/rng` ile yapılır ve ekransız test edilir.
- [ ] KK-98: Sözler `content/` altında tek bir JSON dosyasındadır; yeni söz eklemek kod değişikliği gerektirmez. `npm run icerik` her sözü denetler: boş olmamalı, en fazla 140 karakter olmalı, tekrar etmemeli ve oyun kimliği kayıtta bulunmalı (ya da "genel" olmalı). İlk sürümde her aktif oyunun en az 10, genelin en az 10 sözü vardır; taslak `docs/desteler/acilis.md`.
- [ ] KK-99: Ekran okuyucu yüzdeyi ve sözü okur. Açılış ekranı koyu ve açık temada çalışır; stil değerleri `src/tema.ts` token'larından gelir. Yeni bağımlılık yoktur.
- [ ] KK-100: Mevcut akışlar değişmez: "Devam et", oda davet bağlantısıyla katılım ve ayarlar eskisi gibi çalışır, mevcut kabul testleri yeşil kalır. `CLAUDE.md` ve `docs/MIMARI.md` açılış ekranını ve söz dosyasını anlatır.

### Kapsam dışı (v8)
- Sözü paylaşma, beğenme ya da kişiye göre seçme.
- Aynı sözün art arda gelmesini engelleme (düz rastgele; 40 sözde tekrar şansı düşük).
- Sözleri internetten çekme. Sözler uygulamanın içindedir ve internetsiz çalışır.
- Animasyonlu maskot ya da ses.
- 3 ekranlı ilk açılış karşılaması (rafta, Semih 30.10.2026).

### Kararlar (açılış ekranı)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Süre | En az 3 sn; dokununca geçer | Söz okunur, acelesi olan bekletilmez | Semih (30.10.2026, msg 745: "A") |
| Sözler | pm internetten derler: her oyuna 10 + 10 genel; mizah, meme, replik; aile dostu, argo yok | Semih "bunları sana bırakıyorum" (msg 743) | pm |
| Yüzde | Hazırlık ve 3 sn'lik süreden yavaş olanı izler | %100 gerçekten hazır demektir | pm varsayılanı |
| Oyun adı | Oyuna ait sözün altında yazar | Söz oyunu da tanıtır | pm varsayılanı |
| Kayan ayarlar düğmesi | Kafadar'ın kodunda yok; büyük ihtimalle Expo Go'nun geliştirici düğmesi, ekran görüntüsü bekleniyor | Bizimse ayrı issue açılır | açık (Semih, msg 743) |

## v8.1: Açılış logosu, sade ana ekran ve kişi çipleri (Semih, 30.10.2026) — ONAYLANDI (Semih, 30.10.2026, msg 809)
Issue'lar: #205 kabul testleri (qa), #206 uygulama (frontend; #205 bitince başlar). Tasarım adımı yok: yeni ekran yok, yalnızca metin ve kural değişiyor.
Semih'in üç isteği (Telegram 805, 807):
1. Açılıştaki "Kafadar" yazısı ana ekrandakiyle aynı yazı tipinde olsun.
2. "Bir oyun seç, telefonu ele ver." yazısı kalksın.
3. Kişi çipleri anlamlı ve birbiriyle tutarlı olsun; bazısı rakamla, bazısı yazıyla olmasın.

1 kişilik oyunlar yakında eklenecek. "1 kişi" çipi bugün boş liste gösterir ve bu bilerek böyle bırakılır.

### Akış
1. Uygulama açılır. Açılış ekranındaki "Kafadar" yazısı, ana ekrandaki logoyla aynı yazı tipinde görünür.
2. Ana ekranda logonun altında alt yazı yoktur. Hemen Tümü · 1 kişi · 2 kişi · 3+ kişi çipleri gelir ve "Tümü" seçilidir.
3. Kullanıcı kişi sayısına uyan çipe dokunur ve listede o kişi sayısıyla oynanabilen oyunlar kalır. Eşleşen oyun yoksa "Bu kişi sayısına uygun oyun henüz yok." yazar.

### Çip kuralları
| Çip | Kişi aralığı | Bugün listede kalan |
|---|---|---|
| Tümü | hepsi | 3 oyun |
| 1 kişi | 1 | yok ("Bu kişi sayısına uygun oyun henüz yok.") |
| 2 kişi | 2 | OK mu NOK mu, 10/10 ama |
| 3+ kişi | 3–12 | 3 oyun |

Oyunun kişi aralığı `minOyuncu` (varsayılan 2) ile genel üst sınır 12 arasındadır. Bu aralık çipin aralığıyla kesişiyorsa oyun listede kalır. `minOyuncu` artık 2'ye yuvarlanmaz; 1 kişilik bir oyun eklenince kendiliğinden "1 kişi" çipinde görünür.

### Kabul kriterleri (v8.1)
- [ ] KK-101: Açılış ekranındaki "Kafadar" yazısı, ana ekrandaki "Kafadar" logosuyla aynı yazı tipinde ve aynı kalınlıkta görünür. Bu hem telefonda (Expo Go) hem web'de geçerlidir. Logo, yazı tipi hazır olmadan çizilmez. Yazı tipi yüklenemezse iki ekran da sistem yazı tipiyle açılır ve açılış ekranı takılı kalmaz (KK-96).
- [ ] KK-102: Ana ekranda "Bir oyun seç, telefonu ele ver." yazısı yoktur ve yerine başka bir yazı gelmez.
- [ ] KK-103: Ana ekranda oyun listesinin üstünde yatay, tek seçimli bir çip satırı vardır. Sıra şudur: Tümü · 1 kişi · 2 kişi · 3+ kişi. Kişi çiplerinin hepsi aynı biçimdedir: rakam, ardından "kişi". Dört çip de her zaman görünür; eşleşen oyun olmasa da görünür. Uygulama açılınca "Tümü" seçilidir ve seçim uygulama kapanınca hatırlanmaz. Seçili çipe ya da "Tümü"ne dokunmak filtreyi kaldırır.
- [ ] KK-104: Bir çipe dokunulunca listede yalnızca kişi aralığı çipin aralığıyla kesişen oyunlar kalır ("Çip kuralları" tablosu) ve sıraları değişmez.
  - "Yakında" durumundaki oyunlar da aynı kurala uyar.
  - `minOyuncu` 1 olan bir oyun "1 kişi" çipinde görünür ve kartında "1–12 kişi" yazar.
  - Bugünkü oyunlarla "1 kişi" seçilince listede "Bu kişi sayısına uygun oyun henüz yok." yazar.
  - Eşleşme kuralı saf bir fonksiyondur ve ekransız test edilir.
- [ ] KK-105: Diğer akışlar değişmez: açılış ekranı (KK-94…KK-100), oyun kartındaki kişi sayısı (KK-89) ve ⓘ (KK-91) eskisi gibi çalışır. Mevcut kabul testleri yeşil kalır; değişen kriterlerin testleri güncellenir. `CLAUDE.md` ve `docs/MIMARI.md` kişi çiplerini doğru anlatır.

### Kapsam dışı (v8.1)
- 1 kişilik oyunun kendisi ve oyuncular ekranının 1 kişiye inmesi. Bunlar ilk 1 kişilik oyunla birlikte ayrı bir işte yapılır.
- Ana ekrana yeni bir alt yazı ya da açıklama eklemek.

### Kararlar (v8.1)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Kişi çipleri | Tümü · 1 kişi · 2 kişi · 3+ kişi; "6+ kişi" ve "3–5 kişi" kalkar | Hepsi aynı biçimde (rakam + kişi). 1 kişilik oyunlar yakında gelecek, boş liste sorun değil. | Semih (30.10.2026, msg 805, 807) |
| Son çip | "2+" yerine "3+ kişi" | "2 kişi" çipi zaten var. "2+" iki kişilik oyunları iki çipte birden gösterirdi. | pm varsayılanı (Semih itiraz ederse "2+ kişi" olur) |
| Açılış logosu | Yazı tipi hazır olunca çizilir | Hata: logo yazı tipinden önce çiziliyordu ve telefonda sistem fontunda kalıyordu. | Semih (30.10.2026, msg 805) |
| Tasarım adımı | Yok | Yeni ekran yok; metin ve kural değişikliği | pm varsayılanı |

## v9: Quiz Night — dizi/film paketleri (Semih, 31.10.2026) — ONAYLANDI (Semih, 31.10.2026, msg 883)
Issue'lar (Faz 1): #221 tasarım (tasarim), #222 kabul testleri (qa), #223 saf modül ve içerik şeması (backend; #222 bitince), #224 ekranlar (frontend; #221, #222, #223 bitince), #225 ilk 3 paketin taslağı (pm), #226 paketleri JSON'a çevirme (backend; #223 ve #225 bitince). Güncelleme (Semih, msg 925): #243 beraberlik ve kazanan kabul testleri (qa), #244 beraberlikte zorluk katsayısı (backend; #243 bitince); #221 paylaşım kartı ve #224 sonuç ekranı buna göre.
Faz 2 (oda modu, KK-113): #252 kabul testleri (qa), #253 sunucu ve oda kuralları (backend; #252 bitince), #254 oda ekranları (frontend; #252 ve #253 bitince). Tasarım #221'de (C, "Oda (Faz 2)" bölümü).
Araştırma: `docs/quiz-night-arastirma.md` (#216), `docs/quiz-dizi-film-analiz.md` (#218).

Quiz Night, 4 şıklı ve yalnızca metinden oluşan bir bilgi yarışmasıdır. İlk kategori dizi ve film. Her paket tek bir diziye ya da filme aittir ("Ne kadar Aşk-ı Memnu fanısın?"). Sonunda doğru sayısına göre esprili bir unvan verilir. Spor ve diğer kategoriler sonra gelir.

Kafadar'ın tek başına oynanabilen ilk oyunudur: `minOyuncu` 1'dir ve "1 kişi" çipinde görünür (KK-104).

### Akış
1. **Ana ekran:** 🧠 Quiz Night kartına dokunulur. Kartta "1–12 kişi" yazar.
2. **Mod:** Tek başına · Tek telefonda grup · Oda kur · Odaya katıl. "Tek başına"da oyuncular ekranı atlanır. "Tek telefonda grup"ta 2–12 isim girilir (mevcut oyuncular ekranı).
3. **Paket:** Paket kartları düz metindir: "Ne kadar X fanısın?", bir emoji ve "Resmî değildir · Spoiler içerir" notu. Türk / Yabancı çipiyle süzülür.
4. **Tur:** 10 soru: 3 kolay, 4 orta, 3 zor, kolaydan zora sıralı.
   - **Tek başına:** Şıka dokunulur ve cevap kilitlenir. Doğru şık `ok`, yanlış seçilen şık `nok` rengini alır. Yaklaşık 1,5 sn sonra sıradaki soru gelir. Süre yok.
   - **Tek telefonda grup:** Telefonu tutan kişi soruyu ve şıkları sesli okur, herkes sesli cevap verir. "Cevabı göster"e basılınca doğru şık açılır. Telefonu tutan kişi bilenleri oyuncu çiplerinden işaretler ve "Sonraki"ye basar. Telefonu tutan kişi de oynar, çünkü cevabı o da göstere basınca görür. Süre yok.
   - **Oda (Faz 2):** Herkes kendi telefonundan şık seçer. Soru en çok 20 sn sürer; herkes cevaplayınca beklemeden açıklamaya geçilir. Açıklamadan sonra "Sonraki soru"ya kuran kişi basar.
5. **Sonuç:** Büyük "8/10" ve paketin unvanı. Grupta ve odada sıralama ile herkesin unvanı gösterilir. Birinci 🏆 ve esprili unvanıyla en üstte öne çıkar; eşit doğru sayısında zor sorular daha çok sayılır. "Tekrar" ve "Başka paket" düğmeleri ile 9:16 paylaşım kartı vardır.

### Kabul kriterleri (v9)
- [ ] KK-106: Ana ekranda 🧠 Quiz Night kartı vardır ve kartta "1–12 kişi" yazar. Kart "Tümü", "1 kişi", "2 kişi" ve "3+ kişi" çiplerinin hepsinde görünür. ⓘ "Nasıl oynanır" metni üç modu da kısaca anlatır (KK-91).
- [ ] KK-107: Quiz Night'ta "Tek başına · Tek telefonda grup · Oda kur · Odaya katıl" seçimi vardır.
  - "Tek başına" oyuncular ekranını atlar ve doğrudan paket seçimine gider.
  - "Tek telefonda grup" 2–12 oyuncuyla mevcut oyuncular ekranını kullanır.
  - Oda seçenekleri Faz 2'ye kadar görünmez.
- [ ] KK-108: Paket seçimindeki her kartta şunlar bulunur: düz metin başlık "Ne kadar <ad> fanısın?", bir emoji, Türk ya da Yabancı etiketi ve "Resmî değildir · Spoiler içerir" notu. Afiş, logo, dizinin yazı tipi ya da başka bir görsel kullanılmaz. Türk / Yabancı çipi listeyi süzer. Tümü varsayılandır.
- [ ] KK-109: Bir tur 10 sorudur ve sorular paketin havuzundan tekrarsız seçilir: 3 kolay, 4 orta, 3 zor, kolaydan zora. Her soruda şıkların sırası karışır. Aynı cihazda aynı paketin bir önceki turunda sorulan sorular sonraki turda gelmez. Seçim tohumlu ve saf bir fonksiyondur: aynı tohum aynı turu verir.
- [ ] KK-110: Soru ekranında şunlar bulunur: üstte "3/10", soru metni, zorluk (kolay / orta / zor, renkle değil yazıyla) ve 4 büyük şık. Tek başına modda:
  - Şıka dokunulunca cevap kilitlenir ve değiştirilemez.
  - Doğru şık `ok`, yanlış seçilen şık `nok` rengini alır ve telefon titrer.
  - Yaklaşık 1,5 sn sonra sıradaki soru gelir.
  - Süre yoktur.
- [ ] KK-111: Sonuç ekranında büyük puan ("8/10") ve unvan gösterilir. Unvan basamakları 0–3, 4–6, 7–9 ve 10 doğrudur; her paketin 4 unvanı vardır.
  - "Tekrar" düğmesi aynı pakette yeni bir tur açar (KK-109).
  - "Başka paket" düğmesi paket seçimine döner.
  - 9:16 paylaşım kartında paket adı, puan, unvan ve Kafadar logosu bulunur. Soru ve cevap yoktur.
  - Grupta (ve odada) paylaşım kartı birinciyi gösterir: 🏆, adı, puanı ve unvanı. Ortak birincilik varsa hepsinin adı yazar. Tek başına modda kart oyuncunun kendi sonucudur.
  - Web'de paylaşım menüsü yoksa mevcut oyunlardaki yedek davranış kullanılır.
- [ ] KK-112: Tek telefonda grup modu şöyle işler:
  - Doğru şık, "Cevabı göster"e basılana kadar ekranda hiçbir biçimde belli olmaz.
  - Göster'den sonra doğru şık açılır. Telefonu tutan kişi bilenleri oyuncu çiplerinden işaretler (hiç kimse ya da herkes olabilir) ve "Sonraki"ye basar.
  - Süre yoktur.
  - Sonuçta oyuncular KK-114'teki kurala göre sıralanır. Her oyuncunun unvanı görünür.
  - Birinci (ya da ortak birinciler) 🏆 ve esprili unvanıyla en üstte, büyük gösterilir.
- [ ] KK-113 (Faz 2, oda modu): Herkes aynı soruyu kendi telefonunda görür ve şık seçer.
  - Cevap kilitlenir.
  - Doğru şık, açıklama aşamasına kadar istemcilere gönderilmez; ağ trafiğinde de görünmez (KK-66 gibi).
  - Soru en çok 20 sn sürer ve süre sunucu saatine göre işler. Herkes cevaplayınca beklemeden açıklamaya geçilir. Açıklamada doğru şık ve kimin neyi seçtiği tüm telefonlarda aynı anda görünür.
  - Sayaç ince bir çubuktur. Son 5 sn'de telefon titrer; kırmızı kullanılmaz.
  - Cevap vermeyen oyuncu o soruda yanlış sayılır.
  - "Sonraki soru" düğmesi yalnızca kuranda görünür, kuran ayrılırsa bir sonraki bağlı oyuncuya geçer (KK-68).
  - Kod, lobi, yeniden bağlanma ve veri silme kuralları mevcut odalarla aynıdır (KK-70). Kopukken kaçırılan sorular yanlış sayılır.
  - OK mu NOK mu ve 10/10 ama odaları bozulmaz.
- [ ] KK-114: Puan, doğru cevap sayısıdır. Yanlış cevap puan düşürmez ve hız bonusu yoktur. Unvan bu puana göre verilir.
  - Sıralama önce doğru sayısına göredir. Eşitlikte zorluk katsayılı toplam belirler: kolay 1, orta 2, zor 3.
  - Katsayılı toplam da eşitse oyuncular aynı sıradadır; birden çok birinci olabilir.
  - Puan, unvan ve sıralama hesabı saf fonksiyondur. Oda modu (KK-113) aynı kuralı kullanır.
- [ ] KK-115: İçerik `content/quiz/<paket>.json` dosyalarındadır ve `npm run icerik` (CI'da da) şunları denetler. Kurala uymayan paket CI'ı kırmızı yapar.
  - **Paket alanları:** `id`, `ad`, `emoji`, `koken` (`tr` ya da `yabanci`) ve 4 unvan (0–3, 4–6, 7–9, 10; eksiksiz ve çakışmasız).
  - **Havuz:** 20–30 soru. Her zorluktan en az 6 soru. Olay örgüsü sorusu (`tur: "olay"`) havuzun yarısından azdır; tam yarı reddedilir.
  - **Her soru:**
    - benzersiz `id`;
    - en çok 140 karakterlik `metin`;
    - tam 4 şık; her şık boş değildir ve en çok 40 karakterdir;
    - şıklar birbirinin aynısı değildir (büyük/küçük harf ve boşluk farkı yok sayılır);
    - `dogru` 0–3 arasıdır;
    - `zorluk` kolay, orta ya da zordur;
    - `tur` olay ya da dünyadır;
    - en az 4 `kaynaklar` (ad ve url) ve `uyum` en az 0,75'tir.
  - **Paket içi:** Aynı metinli iki soru olamaz.
  - **Uygulama paketi:** `kaynaklar` ve `uyum` alanları uygulama paketine girmez. Kaynak adreslerinin çalışıp çalışmadığı CI'da denetlenmez.
- [ ] KK-116: İçerik kuralları (insan incelemesi, makineyle denetlenemez):
  - Sorular bizimdir; replikler birebir alıntılanmaz.
  - Olay örgüsü soruları paketin yarısından azdır. Gerisi gerçek dünya bilgisidir: oyuncu, yıl, kanal, çekim, kamera arkası ve niş bilgiler.
  - Büyük olaylarda bölüm numarası sorulabilir (ör. Çakır'ın öldüğü bölüm).
  - Her bilgi en az 4 bağımsız kaynakla doğrulanır. Birbirini kopyalayan haberler tek kaynak sayılır. Kaynakların en az %75'i aynı cevabı vermelidir; vermiyorsa soru atılır ya da yalnızca kaynakların anlaştığı kısım sorulur.
  - Kaynaklarda çelişen iki değer aynı soruda şık olarak yan yana gelmez.
  - Unvanlar karaktere gönderme yapar, oyuncuya yapmaz. Siyaset, din, terör ve şiddet ayrıntısına girilmez.
  - Taslaklar kaynaklarıyla birlikte `docs/quiz/<paket>.md` dosyasında tutulur ve bir insan onaylar.
- [ ] KK-117: Faz 1 en az 3 paketle çıkar, en az biri Türk ve en az biri yabancı yapım olur. Testlerdeki örnek paket uygulamada görünmez.
- [ ] KK-118: Uygulamanın adında, `app.json`'da ve mağaza metinlerinde paketlerin dizi ya da film adı geçmez. Bu bir testle denetlenir.
- [ ] KK-119: Diğer oyunlar ve akışlar değişmez. Mevcut kabul testleri yeşil kalır. KK-104'teki "1 kişi çipi boş" testi, artık Quiz Night'ı göstereceği için güncellenir. `CLAUDE.md` ve `docs/MIMARI.md` Quiz Night'ı anlatır.

### Kapsam dışı (v9)
- Spor ve diğer kategoriler (sonraki sürümlerde).
- Görsel, ses ya da müzik içeren sorular.
- Hız bonusu, süreli "hızlı tur", zorluk seçimi.
- Hesap, çevrimiçi skor tablosu, sunucudan paket indirme. Paketler uygulamaya gömülüdür; yeni paket EAS Update ile gelir.
- Lisans, mağaza yayını.

### Kararlar (v9)
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| İlk kategori | Dizi ve film, eski yapımlar; sonra spor | Semih'in isteği | Semih (31.10.2026, msg 866) |
| Biçim | Yalnızca metin, 4 şık; görsel yok | Telif riski düşük, üretimi hızlı | Semih (msg 866) |
| Paketler | Diziye/filme özel "Ne kadar X fanısın?" ve esprili unvan | Fan hissi ve paylaşım | Semih (msg 868) |
| Bölüm ve niş sorular | Büyük olaylarda bölüm numarası; kamera arkası ve niş bilgiler | Gerçek fanı zorlamak | Semih (msg 874) |
| Doğruluk | En az 4 bağımsız kaynak, en az %75 uyum | Yanlış cevap güveni bozar | Semih (msg 876) |
| Tek kişi | Tek başına oynanır, `minOyuncu` 1 | Bu kategori tek kişiyle de oynanabilir | Semih (msg 878) |
| Tek telefonda grup | Telefonu tutan okur ve bilenleri işaretler; telefon dolaştırılmaz | 10 soru yaklaşık 5 dk sürer; dolaştırmak 5 kişide 25 dakikayı geçer | tasarim önerisi, pm varsayılanı |
| Süre | Tek başına ve tek telefonda yok; odada 20 sn, herkes cevaplayınca geçer | Acele yok; oda modunda tempo için | tasarim önerisi, pm varsayılanı |
| Puan | Doğru sayısı; hız bonusu ve eksi puan yok | En sade kural (geliştirme ilkesi) | pm varsayılanı (backend hız bonusu önerdi; sonra eklenebilir) |
| Kazanan ve beraberlik | Birinci öne çıkar ve paylaşım kartında yer alır; eşit doğru sayısında zorluk katsayısı (kolay 1, orta 2, zor 3) belirler, o da eşitse ortak birincilik | Grupta kazanan önemli | Semih (msg 925); katsayılar ve ortak birincilik pm varsayılanı |
| Grup paylaşım kartı | Birincinin adı, puanı ve unvanı | Ortalama yerine kazanan | Semih (msg 925) |
| Faz sırası | Faz 1 tek başına ve tek telefon + içerik; Faz 2 oda | Oda modu en riskli ve en büyük iş | backend, frontend ve qa önerisi |
| İçerik akışı | pm kaynaklı taslak yazar (`docs/quiz/`), bir insan onaylar, backend JSON'a çevirir | Desteler de böyle yapıldı | pm varsayılanı |
| Mağaza | Uygulama adında ve mağaza metninde dizi/film adı yok | Apple 5.2.1, Google Play fikri mülkiyet politikası | analiz belgesi (#218) |

### Riskler (v9)
- **İçerik emeği:** Asıl yük budur. 3 paket yaklaşık 75 soru eder ve her soru için en az 4 kaynak gerekir. %75 uyumu makine kanıtlayamaz; insan incelemesi şarttır.
- **Telif ve marka:** Risk sıfır değildir. Kurallar KK-116 ve KK-118'de. Mağazaya çıkmadan önce bir fikri mülkiyet avukatına danışılması önerilir (#218).
- **Oda modu:** Zamanlama ve yeniden bağlanma en riskli kısımdır. Bu yüzden ayrı bir fazdır.
- **Paketler birbirine benzeyebilir:** Görsel olmadığı için her pakete emoji ve marka renkleri verilir (tasarım).

### Ekip görüşleri (v9 fikir turu)
- tasarim: 5 ekran. Tek telefonda "sunucu" modu. Sayaç yalnızca odada. Soru en çok 140, şık en çok 40 karakter. Büyüklük M.
- backend: Saf modül ve tohumlu tur. Kaynak ve uyum yalnızca doğrulamada kalır. Oda modunda doğru cevap sunucuda bekler. Çekirdek M, oda M.
- frontend: Mevcut registry, ekran ve paylaşım altyapısı yeterli; yeni bağımlılık yok. Tek kişi ve tek telefon M, oda L.
- qa: İçerik doğrulama sınır testleri. Oran ve uyum yalnızca alan olarak denetlenebilir. Kaynak adresleri CI'da denetlenmez. Oda en riskli kısım.

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
- **İçerik kalitesi:** Her oyunda 300 kart/kelime var (paket başına 100). Taslağı pm yazar, insanlar düzeltir.
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
