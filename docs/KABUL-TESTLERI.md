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
