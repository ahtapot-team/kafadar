# Kafadar (çalışma adı) — Ürün gereksinimleri (PRD)

> Durum: TASLAK (onay bekliyor)
> Bu dosya projenin tek doğruluk kaynağıdır. Ajanlar sohbet geçmişine değil buraya bakar.
> Kapsam değişirse önce bu dosya güncellenir ve yeniden onaylanır.

## Amaç
Arkadaş grupları ve çiftler için, tek telefonda oynanan ve içine yeni oyunlar eklenebilen bir parti oyunları uygulaması yapmak. Bu oyunlar sosyal medyada video çekilerek oynanıyor. İlk sürümde tek oyun var: **OK mu NOK mu**. Bir durum kartı okunur, herkes OK ya da NOK der, sonuç dramatik bir açıklama anıyla gösterilir. Kalite çıtası baştan yüksek: oyun hissi, animasyon, titreşim ve paylaşılabilir anlar kabul kriteridir.

## Hedef kullanıcı ve platform
- Kullanıcı: 2–12 kişilik arkadaş grupları, çiftler ve aileler. Türkiye, Türkçe.
- Platform: iOS + Android yerel uygulama (App Store + Google Play). Tamamen çevrimdışı, sunucu yok.

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
- Diğer oyunlar: 10/10 ama, Casus kim (sonraki sürümler).
- Oda koduyla çok telefonlu oyun, sunucu, hesap ya da giriş. Mimari bunlara hazır olacak.
- Gizli oy modu (telefon elden ele).
- +18 içerik, reklam, uygulama içi satın alma, analitik ya da veri toplama.
- İngilizce ve diğer diller (v1 yalnızca Türkçe; metinler ayrı dosyada tutulur).
- Store yayını. Hesap ve uygulama adı kararı sonra verilecek. v1 kurulabilir derleme ve önizleme üretir.

## Kullanıcı akışları
1. **Açılış:** Logo animasyonu (≤1 sn), sonra ana ekran. Yarım kalmış oyun varsa "Devam et / Yeni oyun" sorulur.
2. **Ana ekran:** Oyun kartları ve ayarlar. OK mu NOK mu'ya dokunulur.
3. **Oyuncular:** 2–12 isim girilir. "Geçen seferki ekip" tek dokunuşla gelir.
4. **Paket ve süre:** Arkadaş / Çift / Aile paketi ve 10 / 20 kart ya da sınırsız tur uzunluğu seçilir.
5. **Kart:** Kart çevrilerek açılır, dev yazıyla gösterilir. 3-2-1 geri sayım (titreşimli) sonunda herkes başparmağını gösterir.
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
