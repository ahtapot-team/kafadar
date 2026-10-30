# Kafadar — Mimari

Son güncelleme: 2026-10-30 — #185

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

## Yeni oyun nasıl eklenir

1. `src/games/<oyun>/` altında saf modülü yaz (`oyun.ts` arayüzü: `durumGecerliMi` dahil).
2. `src/games/registry.ts` içindeki `oyunlar` dizisine bir kayıt ekle (`id`, `ad`, `aktif`, `tanitim: {kisi, metin}`, gerekirse `kurulum`, `modSecimi`, `minOyuncu`, `ekran`).
3. Ekranları `src/oyun-ekranlari/<oyun>/` altına, kurulum rotasını `app/<oyun>/` altına koy (ince sarmalayıcı).
4. Desteler: `content/` JSON + `src/icerik/kayit.ts` kaydı, ardından `npm run icerik`.
5. Oda modu gerekiyorsa `src/oda/oda.ts` oda türüne ekle (`mesaj.ts` protokolünü bozmadan).
6. Kabul testlerini (`*.kabul.test.ts`) ve KK eşlemesini ekle; `npm run kk-harita`.
7. Ana ekran kişi çipleri (Tümü · 2 kişi · 3–5 kişi · 6+ kişi) oyunun kişi aralığından (`minOyuncu` ?? 2 … genel üst sınır 12) türer; yeni alan gerekmez. Kural `src/games/kategori.ts`'te.
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
