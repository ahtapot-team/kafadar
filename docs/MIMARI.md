# Kafadar — Mimari

Son güncelleme: 2026-10-31 — #254 (Quiz Night oda ekranları)

Kısa rehber için `CLAUDE.md`. Bu belge katmanları, veri akışını, oda protokolünü, testleri ve kuralları anlatır.

## Katmanlar

| Katman | Klasör | Görev |
| --- | --- | --- |
| core | `src/core/` | Saf ortak mantık: `deste`, `dogrula`, `kayit`, `oturum`, `oyuncular`, `puan-oduller`, `rng`, `saat` |
| games | `src/games/` | Oyun kuralları (saf durum makineleri) + `registry.ts` |
| oyun-ekranlari | `src/oyun-ekranlari/` | Tek telefon oyun ekranları; ortak parçalar `ortak/` |
| oda | `src/oda/` | Oda kuralları (`oda.ts`), protokol (`mesaj.ts`), istemci (`istemci.ts`), özetler (`ozet.ts`, `onon-ozet.ts`), `sahte.ts`, `tasima.ts` |
| oda-ui | `src/oda-ui/` | Oda modu ekran parçaları |
| baglanti | `src/baglanti/` | WebSocket (`ws.ts`), bağlam (`baglam.tsx`), QR |
| icerik | `src/icerik/` | `kayit.ts` (deste kaydı), `index.ts` (tek giriş), `dogrula.ts` |
| kök | `src/` | `tema.ts`, `ui.tsx`, `depo.ts`, `durum.tsx`, `desteler.ts`, `titresim.ts`, `kabul.ts`, `tanitim-kutusu.tsx` |
| app | `app/` | İnce expo-router sarmalayıcıları |
| sunucu | `sunucu/` | Cloudflare Worker + Durable Objects |

## Veri akışı

- **Tek telefon modu:** `app/` rotası → `src/oyun-ekranlari/<oyun>/` ekranı → `durum.tsx` bağlamı → `src/games/<oyun>` saf `isle(durum, olay)`. Durum `depo.ts` ile kalıcı saklanır; `core/oturum` ve `core/dogrula` yüklemede geçerliliği denetler.
- **Oda modu:** ekran (`oda-ui`) → `baglanti` (WebSocket) → `oda/istemci.ts` → sunucu (`worker` → `oda-do`) → `oda.ts` kuralları `isle(durum, olay, simdi)` → her bağlantıya `gorunum(durum, kimlik, simdi)` gider. Sunucu yalnızca kabuktur; kurallar `src/oda/oda.ts`'tedir.

## Açılış ekranı

Açılış ekranı `app/_layout.tsx`'te yazı tipi ve ayarlar okunurken görünür (`src/acilis/ekran.tsx`); gezgin (`Yigin`) yazı tipi hazır olunca (açılış sürerken) bağlanır — önce bağlanırsa ekranlar sistem fontunda kalır —, açılış ekranı üstüne bindirilir ve %100'de solarak kalkar (bitişi JS zamanlayıcısı bildirir; UI thread geri çağrısından JS çağrılmaz, native'de çöker); ana ekran onu bilmez, uygulama içinde dönünce yeniden çıkmaz. Yüzde = süre (en az 3 sn) ve hazırlığın küçüğü, yalnızca ileri gider; dokunmak süreyi atlar, hazırlık beklenir (`src/core/acilis.ts`). Açılıştaki Kafadar logosu, söz ve oyun adı yazı tipi hazır olunca mount edilir (opaklıkla gizleme yetmez: iOS, yazı tipi yokken mount edilen Text'e fontu sonradan uygulamaz); çözüm platformdan bağımsızdır. Söz her açılışta `src/core/soz.ts` ile seçilir; sözler `content/acilis/sozler.json` dosyasındadır (ürün: oyuna göre veya `genel`, ≥10 söz, ≤140 karakter) ve `npm run icerik` (`src/icerik/soz.ts`) denetler. Sistem açılış görseli `app.json` `splash` + `assets/splash.png`.

## Yeni oyun nasıl eklenir

1. `src/games/<oyun>/` altında saf modülü yaz (`oyun.ts` arayüzü: `durumGecerliMi` dahil).
2. `src/games/registry.ts` içindeki `oyunlar` dizisine bir kayıt ekle (`id`, `ad`, `emoji` (açılış ekranı rozeti), `aktif`, `tanitim: {kisi, metin}`, gerekirse `kurulum`, `modSecimi`, `minOyuncu`, `ekran`).
3. Ekranları `src/oyun-ekranlari/<oyun>/` altına, kurulum rotasını `app/<oyun>/` altına koy (ince sarmalayıcı).
4. Desteler: `content/` JSON + `src/icerik/kayit.ts` kaydı, ardından `npm run icerik`.
5. Oda modu gerekiyorsa `src/oda/oda.ts` oda türüne ekle (`mesaj.ts` protokolünü bozmadan).
6. Kabul testlerini (`*.kabul.test.ts`) ve KK eşlemesini ekle; `npm run kk-harita`.
7. Ana ekran kişi çipleri (Tümü · 1 kişi · 2 kişi · 3+ kişi; aralıklar 1 · 2 · 3–12) oyunun kişi aralığından (`minOyuncu` ?? 2 … genel üst sınır 12) türer; yeni alan gerekmez. Kural `src/games/kategori.ts`'te.
8. Oyun listesi değiştiği için `CLAUDE.md` / bu belge aynı PR'da güncellenir.

## Oda sunucusu (`sunucu/`)

- Dosyalar: `worker` (giriş, yönlendirme), `oda-do` (oda Durable Object), `sinir-do` (hız sınırı), `ortak`. `sunucu/src/index.ts` yeniden dışa aktarım ve Cloudflare giriş noktasıdır.
- Durable Object'ler SQLite, hibernation WebSocket ve alarm kullanır. Oda türleri: `ok-mu-nok`, `on-on-ama`. Wrangler sürümü `sunucu/package.json`'da sabit ve izoledir.
- Oda kodu 6 haneli; kimlik sunucuda `crypto.randomUUID` ile üretilir; iç `x-ic-kimlik` başlığı dışarıya sızmaz. `Sinir` DO: `kur:<ip>` dakikada 5, yalnızca başarısız denemeler sayılır.
- Canlı: `wss://kafadar-oda.kafadar.workers.dev/ws`. Yerelde: `cd sunucu && npx wrangler dev --port 8787`, sonra `npm run sunucu:test -- http://127.0.0.1:8787 12`.

### Mesaj protokolü (tek kaynak: `src/oda/mesaj.ts`)

- Tek bağlantı, JSON metin çerçeveleri, her mesajda `t`. Sunucu bu dosyanın ayrıştırıcılarını (`acilisOku`, `mesajiOlayaCevir`, `kimlikMesaji`) kullanır.
- Bağlantı sorgusu: `?islem=kur&ad=Ali&paket=arkadas|cift|aile` (OK mu NOK mu); `?islem=kur&ad=Ali&oyun=on-on-ama&paket=arkadas|gundelik|sevgili`; `?islem=katil&kod=123456&ad=Ali`; `?islem=don&kod=123456`.
- `don`'da ilk istemci mesajı `{t:'kimlik', kimlik}`'tir; token URL'de taşınmaz (günlüğe sızmasın), 10 sn içinde gelmezse soket kapanır.
- Sunucu → istemci: `tamam | hata | gorunum | final`. Bağlantı hatasında `hata` çerçevesi gelip soket kapanır; oyun içi hatada açık kalır. Soket olmayan istek 426, bilinmeyen `islem` 400.
- İstemci → sunucu: `baslat | ayril | cevapla` (OK mu NOK mu); `puanla | sonraki` (10/10 ama; `sonraki` yalnızca yetkili oyuncu).
- Kurallar (`oda.ts`): `kodUret`, `odaKur({tur?})`, `isle`, `gorunum`, `final`, `silinmeli`, `denemeSiniri`. Olaylar: `katil`, `baslat`, `cevapla`, `kop`, `don`, `ayril`, `zaman`. 10/10 ama'da puanlar açıklanana (`acik`) kadar gizlidir; hata kodu `gecersiz`; ödüller KK-58 kurallarına uyar.

## İçerik

`content/decks/*.json` (ve oyuna özel `content/casus`, `content/onon`) yalnızca `src/icerik/index.ts` üzerinden içe aktarılır. Değişince `npm run icerik` ile doğrulanır. `docs/desteler/*.md` taslak/kaynak metinlerdir; `on-on-ama` içerik kabul testi bunları `content/onon/*.json` ile karşılaştırır, o yüzden değiştirilmez.

### Quiz Night (`src/games/quiz-night/quiz.ts`, `src/icerik/quiz.ts`)

Saf kurallar: `turSec(havuz, tohum, onceki?)` (3 kolay + 4 orta + 3 zor, kolaydan zora, şık sırası tohumlu karışır; `onceki` tur soruları mümkünse dışlanır), `puan` (doğru sayısı, hız bonusu yok), `unvanSec` (0–3, 4–6, 7–9, 10), `siralama` (önce doğru sayısı, eşitse `zorlukKatsayisi` kolay 1/orta 2/zor 3 ile `katsayiliToplam`; ikisi de eşitse ortak sıra), `turSonucu` her oyuncu için `katsayi` taşır; tek başına/tek telefon durum makinesi `baslat`, `cevapla` (cevap kilitli), `ilerle`, `turSonucu`, `durumGecerliMi`. Paketler `content/quiz/<paket>.json` (`docs/quiz/*.md` onaylı taslaklardan çevrilir; üç Faz 1 paketi); `quizHatalari` (`npm run icerik`, ağ yok) 20–30 soru, her zorluktan ≥6, olay sorusu yarıdan az, ≥4 kaynak, uyum ≥0,75 denetler. `uygulamaPaketi` `kaynaklar` ve `uyum` alanlarını uygulamaya sokmaz. Ekran kuralları `arayuz.ts` (`gorunenModlar`, `paketSuz`, `sikRengi`/`grupSikRengi`, `cevapKilitle`, `sonucSatirlari`, `paylasimKarti`), önceki tur kimlikleri `onceki.ts` (`oncekiKaydet`/`oncekiOku`, pakete özel). Ekranlar `src/oyun-ekranlari/quiz/` (mod, paket, soru, sonuç) ve `app/quiz/`; registry satırı `modSayfasi: '/quiz/mod'`: tek başına oyuncular ekranını atlar, grupta telefonu tutan "Cevabı göster" sonrası bilenleri işaretler. **Oda modu (#253):** oda türü `quiz-night` (`oyun=quiz-night&paket=<id>`; paketi `sunucu/src/quiz-paketler.ts` `content/quiz`'den yükler, `kaynaklar`/`uyum` atılır, bilinmeyen paket `tanimsiz`). Soruları `turSec` seçer; `{t:'cevapla', sik:0–3}` kilitlidir (ikinci cevap `gecersiz`, süre bitince `sure-doldu`). Süre 20 sn (`QUIZ_SORU_MS`), sunucu saatiyle; herkes (bağlı oyuncular) cevaplayınca ya da süre dolunca açıklama erken/zamanında gelir. Cevapsız ya da kopan yanlıştır. Doğru şık açıklamaya dek görünüme girmez. "Sonraki"yi yalnızca yetkili (kurucu; devir KK-68) basar. Final `quizFinal` (`siralama` #244 işleviyle, `sorular`). Kod, lobi, yeniden bağlanma ve veri silme mevcut odalarla aynıdır (KK-70). Oda ekranları (#254): `src/oda-ui/quiz-soru.tsx` (kilitli şık, `odaSayac` sunucu saatiyle ince sayaç, son 5 sn titreşim, açıklamada kim neyi seçti, "Sonraki soru" yalnız `sonrakiGorunur`), `quiz-final.tsx` (grup sonucuyla aynı `QuizSonucGorunum`); `gorunenModlar()` dört modu verir, Oda kur/katıl mevcut `app/oda/` akışına gider; istemci `cevaplaSik`.

## Testler

- **Birim vs kabul:** `npm test` birim testleri koşar; `*.kabul.test.ts` dosyaları `npm run kabul` ile ayrı CI adımında çalışır.
- **BEKLEYEN şablonu:** `src/kabul.ts` içinde `BEKLEYEN.ozellik` bayrağı testi `it.fails` yapar (`kabulOzellik = BEKLEYEN.ozellik ? it.fails : it`). İşi kapatan PR bayrağı ve sarmalayıcıyı siler, testi düz `it`e çevirir. Bayrak açıkken test geçerse CI kırılır. Kabul testleri silinmez, atlanmaz, gevşetilmez.
- **Kaynak sözleşme testleri:** `src/test/yardimci.ts` — `kaynaklar(klasor)`, `dosyaIcerik(yol)`, `depoYap` (sahte depo), `akis` (promise boşaltır). UI test aracı kullanılmaz (Semih'in 1C kararı); ekranlar testID ve kaynak içeriğiyle doğrulanır.
- **testID kuralı:** testID'ler sözleşmedir, yeniden adlandırma kabul testini kırar. Tek telefon: `ana-oyun-*`, `ayarlar`, `devam-et`, `yeni-oyun`, `oyuncu-*`, `basla`, `paket-*`, `tur-*`, `kart-metni`, `geri-sayim`, `oy-<i>-ok|nok` (`<i>` 0 tabanlı oyuncu sırası), `goster`, `cubuk-*`, `sonuc-metni`, `sonraki`, `atla`, `bitir`, `karistir-*`, `odul-*`, `paylas`, `tekrar-oyna`, `ana-menu`, `cikis-onay-*`, `ayar-*`; 10/10 ama `onon-*`; oda `oda-onon-*`; tanıtım `tanitim-*`; ⓘ düğmesi `nasil-oynanir`; boş liste `kategori-bos`.
- **Oyun sözleşmeleri:** Casus kim (`src/games/casus-kim/casus.ts`) olayları `benim`, `goruldu`, `arkaPlan`, `tartismayiBitir`, `zaman`, `oyla`, `oylamayiBitir`, `devam`, `tahmin`, `oyunuBitir`. 10/10 ama (`onon.ts`) olayları `puan`, `goster`, `sonraki`, `atla`, `bitir`, `karistir`, `oyuncuEkle`, `oyuncuCikar`; puan 0–10 tam sayı, `bolundu` = max−min ≥ 8, `oybirligi` = hepsi aynı. Oda istemcisi: `istemci.kur(ad, paket, oyun?)`, `puanla`, `sonraki`, `durum.onFinal`, `odaTuru(durum)`; türetmeler `onOnKisisel`, `puanSirasi`. Tanıtım kartı kendiliğinden açılmaz: oyun seçildikten sonraki her ekranda ortak `BilgiDugmesi` (`tanitim-kutusu.tsx`, ⓘ) açar; hazırlık ekranlarında yazılı hap, oyun/sonuçta kısa ⓘ (üst çubuklara `BilgiYuvasi` bağlamıyla gelir); "görüldü" bilgisi tutulmaz.
- **KK haritası:** `npm run kk-harita` `docs/KK-HARITA.md`'yi üretir, CI `kk-harita:kontrol` çalıştırır. Yeni KK için test adında "KK-nn" geçer ya da madde `docs/GERCEK-CIHAZ-KONTROL.md`'ye girer.
- **Sunucu smoke:** `sunucu-smoke.yml` — `node sunucu/test/oyun.ts <url> 4` ve `onon.ts`.
- **Gerçek cihaz:** `docs/GERCEK-CIHAZ-KONTROL.md`. **Önizleme tıklama kuralı:** önizlemede ilgili akış elle bir kez denenir.

## CI / önizleme / sunucu iş akışları

- `ci.yml` (PR + `main`): biçim → lint → tip → gitleaks → test → kabul → kk-harita:kontrol → belge → build → diff ≤800 satır.
- `onizleme.yml`: PR başına EAS Update kanalı, `main`'de `main` kanalı (`docs/**`, `design/**`, `content/**/*.md` yok sayılır).
- `web-onizleme.yml`: gh-pages'e web önizleme (PR açılış/güncelleme/kapanış).
- `sunucu.yml`: `main`'e push'ta (`sunucu/**`, `src/oda/**`, `src/core/**`) wrangler deploy; secret'lar `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- `sunucu-smoke.yml`: PR'da wrangler dev + smoke betikleri.
- EAS tek seferlik kurulum: `EXPO_TOKEN` repo secret'ı, `eas init` ve `eas update:configure` (`app.json`).

## Değişmez kurallar

Backend:

- `src/oda` ve `src/core` saftır: `Date.now`, `Math.random`, `WebSocket`, `fetch` kullanılmaz (koruma testleri bu kelimeleri tarar: `casus-kim/ui.kabul.test.ts`, `on-on-ama/ui.kabul.test.ts`, `oda/ui.kabul.test.ts`).
- `src/oda` ve `src/core`, `games/on-on-ama`'yı içe aktarmaz.
- `content/**` JSON yalnızca `src/icerik/index.ts` üzerinden içe aktarılır; yeni deste `src/icerik/kayit.ts` kaydı + `npm run icerik` ister.
- `src/oda/mesaj.ts` tek protokol kaynağıdır. Token URL'de taşınmaz; kimliği sunucu üretir.
- Sunucu yapısı `worker`, `oda-do`, `sinir-do`, `ortak`; kimlik ve hız sınırı oradadır. Deploy `sunucu.yml` ile; smoke: `node sunucu/test/oyun.ts <url> 4`, `onon.ts`.

Frontend:

- `app/` yalnızca ince expo-router sarmalayıcısıdır.
- Ekranlar `src/oyun-ekranlari/<oyun>/` ve `src/oda-ui/` altındadır; ortak parçalar `src/oyun-ekranlari/ortak/`.
- Stil değerleri `src/tema.ts` token'larından gelir. `yazi.kart` ve `yazi.sayi` bilerek korunur (#163), silinmez.

## Değişiklik kuralları

1. Kullanıcıya görünen davranış ve protokol değişmez.
2. Mevcut kabul testleri ve CI yeşil kalır.
3. UI PR'ında önce/sonra ekran görüntüsü; sunucu PR'ında e2e betikleri geçer.
4. PR 800 satırın altında kalır.
5. Taşımalarda yeni soyutlama yok ("overengineering yok").

### Ertelenen: oda türlerini ayırma

`OdaDurum` iki türün alanlarını birlikte taşır, `final` için cast vardır ve `Paket` iki yerde tanımlıdır. Öneri: tür başına ayrık birleşim (discriminated union) + oda kuralları arayüzü; Casus kim odalara gelince yapılır. Büyüklük L, risk yüksek (Durable Object'te saklı durum geçişi). Ayrıca ertelendi: sunucunun oda mantığını saf bir `OdaOturumu` sınıfına çıkarmak (L).

## Sözlük

- **KK:** kabul kriteri (`KK-nn`); `docs/KK-HARITA.md` testlerle eşler.
- **BEKLEYEN:** henüz uygulanmamış özellik için `it.fails` bayrakları (`src/kabul.ts`).
- **Tek telefon modu / oda modu:** tek cihazda oynama / oda koduyla çok cihazda oynama.
- **Deste:** bir oyunun kart kümesi (`content/**` JSON).
- **Registry:** `src/games/registry.ts`; oyunların tek kayıt noktası.
