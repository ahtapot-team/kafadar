# Refactoring planı (Semih isteği, 29.10.2026)

Karar: **A**, yüksek ve orta öncelikli 11 başlığın hepsi yapılır (Metehan, 29.10.2026 06:53). Frontend önce tanıtım kartını (#132) bitirir.

Analizi backend, frontend, qa ve tasarim yaptı; yalnızca okuma ile, kodda değişiklik yapmadan. pm 23 öneriyi 12 başlıkta birleştirdi.

## Kurallar
- **Kullanıcının gördüğü davranış değişmez.** Ekran, metin, akış ve sunucu protokolü aynı kalır.
- Kabul ölçütü:
  - mevcut kabul testleri ve CI yeşil kalır;
  - arayüze dokunan PR'larda önce/sonra ekran görüntüsü eklenir;
  - sunucuya dokunan PR'larda canlıda e2e betikleri geçer.
- Her PR 800 satırın altında kalır. Aynı dosyaya dokunan işler sırayla yapılır (aşağıdaki hatlar).
- Taşıma yaparken yeni soyutlama eklenmez. Yalnızca bugün tekrar eden kod birleştirilir ("overengineering yok", Semih).

## Başlıklar

| # | Öncelik | Başlık | Sorun | Öneri | Büyüklük / risk | Kaynak |
|---|---|---|---|---|---|---|
| 1 | Yüksek | Ortak ekran parçaları | 10/10 ama, Casus kim ve oda arayüzü `ok-mu-nok/` içinden import ediyor. Ödül kartı, konfeti, üst çubuk ve geri sayım 3–4 kopya. Kopya yüzünden #117'de yanlış geri sayım metni hatası çıktı. | `src/oyun-ekranlari/ortak/`: Sticker, OdulKarti, UstCubuk, KartSeridi, PuanCubugu, Konfeti, useSayi. Metin dışarıdan verilir. | M / düşük | frontend, tasarim, qa |
| 2 | Yüksek | Sunucu tek dosyada | `sunucu/src/index.ts` 381 satır. Mesaj ayrıştırma elle yazılmış if-else; protokol hem `src/oda/mesaj.ts`'te hem sunucuda ayrı ayrı yazılı. #69 ve #75 bu bölgeden çıktı. | Dosyayı worker, oda-do, sinir-do ve mesaj olarak böl. `src/oda/` içinde saf `mesajiOlayaCevir`; protokolün tek kaynağı `mesaj.ts`. | M / düşük-orta | backend |
| 3 | Yüksek | Sunucu testleri CI'da yok | `sunucu/test/*.ts` yalnızca elle koşuyor. | `sunucu/**` ya da `src/oda/**` değişince `wrangler dev` ile çalışan bir smoke işi. | M / düşük | qa |
| 4 | Yüksek | design/ ve tasarım sistemi eski | TASARIM-SISTEMI v1'de kaldı. `49-oda-modu` ekranları kodu hâlâ 4 harf gösteriyor. Elenen seçenekler geçerlilerle aynı yerde. | design/README.md, `design/arsiv/`, "Oyuna göre kurallar" bölümü, 6 haneli kod notu. | S / yok | tasarim |
| 5 | Orta | Oyun akışı kopyası | Mantıkta `ok-mu-nok/oyun.ts` ile `on-on-ama/onon.ts` neredeyse aynı. Ekranda üç oyunun `index.tsx` dosyası aynı kalıp, her biri yaklaşık 200 satır. | Mantık: `src/core/oturum.ts` ve `src/core/dogrula.ts`; Casus kim yalnızca `dogrula.ts`'i kullanır. Ekran: `useOyunOturumu`. | M / orta | backend, frontend |
| 6 | Orta | Biten test bayrakları | `src/kabul.ts`'te 23 bayrak var, hepsi kapalı; yaklaşık 45 sarmalayıcı kullanım. | Bayraklar düz `it` olur. Kural: bayrak işi kapatan PR'da silinir. | M (mekanik) / düşük | qa, backend |
| 7 | Orta | Paylaşım altyapısı kopyası | Paylaşım çerçevesi 4–6 kopya; `Platform.OS !== 'web'` kontrolü 12 yerde. | `ortak/paylasim.tsx` (usePaylas, GizliPaylasim, PaylasimCercevesi, PaylasDugmesi). | S–M / orta | frontend, tasarim |
| 8 | Orta | Desteler ve paketler dağınık | 3 yükleyici, 3 doğrulayıcı; paket adları mesaj.ts, sunucu ve arayüzde ayrı ayrı. | `src/icerik/index.ts` tek kayıt. Sunucu, uygulama ve içerik script'i bu kayıttan okur. | M / düşük | backend, frontend |
| 9 | Orta | Tema tanımları eksik | 79 elle yazılmış çizgi kalınlığı, 21 elle yazılmış köşe yarıçapı; yazı ölçeğinde `kart` ve `sayi` rolleri yok; perde rengi elle yazılmış. | `cizgi`, `yaricap.kucuk`, `perde`, `yazi.kart`, `yazi.sayi` tanımlanır; ekranlar bunlara eşlenir. | S / düşük | tasarim |
| 10 | Orta | Test dosyası ve KK haritası | `uygulama.kabul.test.ts` 675 satır; `depoYap` 4 kopya; KABUL-TESTLERI tablosu KK-24'te kalmış. | `src/test/yardimci.ts`, testleri özelliğe göre böl, `scripts/kk-harita.ts` ve CI kontrolü. | M / düşük | qa |
| 11 | Orta | CI boşa çalışıyor | Önizlemeler doküman ve tasarım PR'larında da koşuyor (1,5–2 dk); gitleaks tüm geçmişi tarıyor. | `paths-ignore`; gitleaks yalnızca PR aralığını tarar. | S / düşük | qa |
| 12 | Ertele | Oda türlerini ayırma | `OdaDurum` iki türün alanlarını birlikte taşıyor; `final` cast'i var; `Paket` iki yerde tanımlı. | Türe göre ayrılan birleşim tip ve oda kuralları arayüzü. Casus kim odaya gelince yapılır. | L / yüksek (Durable Object'te saklı durumun göçü) | backend, qa, frontend |

Ertelenen diğer öneri: sunucudaki oda mantığını saf bir `OdaOturumu` sınıfına çıkarıp sahte taşımada da kullanmak (backend, L).

## Hatlar ve sıra (issue'lar)
- **backend:** #137 (2, sunucu) → #139 (3+11, CI) → #140 (5a, oyun mantığı) → #143 (8, desteler)
- **qa:** #134 (6, bayraklar) → #136 (10, test dosyası ve KK haritası); bir yandan her PR'ı inceler
- **tasarim:** #130 (tanıtım kartı) → #135 (4+9, design/ düzeni ve tema tanımları)
- **frontend:** #132 (tanıtım kartı) → #138 (1, ortak parçalar) → #141 (5b, ekran oturumu; #140'ı bekler) → #142 (7, paylaşım) → #144 (9, tema; #135'i bekler)
