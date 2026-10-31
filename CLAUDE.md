# Kafadar

Son güncelleme: 2026-10-31 — #254 (Quiz Night oda ekranları)

Kafadar, arkadaş/çift/aile için mobil parti oyunları uygulamasıdır (OK mu NOK mu, 10/10 ama, Casus kim). Tek telefonda ya da oda koduyla çok telefonda oynanır. Ayrıntı: `docs/MIMARI.md`.

## Teknoloji

Expo SDK 58, expo-router, TypeScript, Vitest, Cloudflare Workers + Durable Objects (oda sunucusu), EAS Update (Expo Go), GitHub Pages (web önizleme).

## Komutlar

| Komut                                             | Ne yapar                                                             |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `npm start`                                       | `expo start`                                                         |
| `npm run lint`                                    | `eslint .`                                                           |
| `npm run format` / `npm run format:check`         | prettier yaz / kontrol                                               |
| `npm run typecheck`                               | `tsc --noEmit && tsc --noEmit -p sunucu`                             |
| `npm test`                                        | birim testler (`*.kabul.test.ts` hariç)                              |
| `npm run kabul`                                   | kabul testleri (`vitest run kabul`)                                  |
| `npm run icerik`                                  | `node scripts/icerik-dogrula.ts`                                     |
| `npm run build` / `npm run build:web`             | `expo export --platform android` / `web`                             |
| `npm run kk-harita` / `npm run kk-harita:kontrol` | KK haritasını üret / doğrula                                         |
| `npm run belge:kontrol`                           | belgeler kodla uyumlu mu (≤120 satır)                                |
| `npm run sunucu:test`                             | `node sunucu/test/oyun.ts` (oda smoke; Quiz Night: `quiz.ts`, CI'da) |

## Klasörler

- `app/` — yalnızca ince expo-router sarmalayıcıları (`index`, `oyun`, `oyuncular`, `paket`, `mod`, `ayarlar`, `casus/`, `onon/`, `quiz/`, `oda/`).
- `src/core/` — saf ortak mantık (deste, doğrula, oturum, oyuncular, rng, saat…).
- `src/games/` — oyun kuralları (`ok-mu-nok`, `on-on-ama` (oyun id'si `10-10-ama`), `casus-kim`, `quiz-night`: Quiz Night, ayrıntı MIMARI) + `registry.ts`. Yeni oyun: modül + registry satırı (kişi çipleri `minOyuncu`'dan türer; ayrıntı: MIMARI "Yeni oyun nasıl eklenir").
- `src/oyun-ekranlari/` — oyun ekranları (Quiz Night: `quiz/`); ortak parçalar `ortak/`.
- `src/oda/` — oda kuralları ve protokol (`oda.ts`, `mesaj.ts`, `istemci.ts`).
- `src/oda-ui/` — oda modu ekran parçaları. `src/baglanti/` — WebSocket bağlamı ve QR.
- `src/acilis/ekran.tsx` — açılış ekranı (`app/_layout.tsx` gezgin (`Yigin`) yazı tipi hazır olunca bağlanır, açılış ekranı üstüne biner; en az 3 sn, dokununca geçer; kurallar `src/core/acilis.ts`, `soz.ts`). Sözler: `content/acilis/sozler.json` (`npm run icerik` denetler).
- `src/icerik/` — içerik kaydı ve doğrulama. `src/test/yardimci.ts` — test yardımcıları.
- `src/tema.ts`, `ui.tsx`, `depo.ts`, `durum.tsx`, `desteler.ts`, `titresim.ts`, `uygulama-geri.ts` — kök yardımcılar. `src/games/kategori.ts`: ana ekran kişi sayısı çipleri (kural saf fonksiyon). `tanitim-kutusu.tsx`: tanıtım kartı ve ⓘ `BilgiDugmesi`.
- `content/decks`, `content/casus`, `content/onon` — deste JSON'ları; `content/quiz` — Quiz Night paketleri (`kategori` alanı zorunlu; `ask-i-memnu`, `hababam-sinifi`, `prison-break`; taslaklar `docs/quiz/`; `src/icerik/quiz.ts` denetler). `docs/desteler/` — taslak md'ler.
- `sunucu/` — Cloudflare Worker (`sunucu/src/{worker,oda-do,sinir-do,ortak,quiz-paketler}.ts`, `test/`).
- `scripts/` — `icerik-dogrula.ts`, `kk-harita.ts`, `belge-kontrol.ts`. `design/` — tasarımlar. `docs/` — PRD, MIMARI, KK haritası.
- `web/` — `404.html`, `geri-yukle.html`. `public/` — `index.html`. `.github/workflows/` — CI, önizleme, sunucu.

## Yayın

- Expo Go kalıcı link: `exp://u.expo.dev/4172ae7b-3cdd-4faf-b89b-c8c1266ebe56?channel-name=main&runtime-version=exposdk%3A58.0.0` (`main`'e push'ta `onizleme.yml` günceller; PR başına ayrı kanal).
- Web önizleme: https://ahtapot-team.github.io/kafadar/ (`web-onizleme.yml`).
- Oda sunucusu: `wss://kafadar-oda.kafadar.workers.dev/ws` (`sunucu.yml`, `main`'e push). Uygulama adresi `EXPO_PUBLIC_ODA_SUNUCU` ile verilir.
- Web çıktısı: `expo export --platform web --clear`. Worktree'lerde Metro önbelleği bayatlayabilir; `--clear` kullan.

## Bağlantılar

`docs/MIMARI.md` · `docs/PRD.md` · `docs/KK-HARITA.md` · `design/TASARIM-SISTEMI.md` · `docs/GERCEK-CIHAZ-KONTROL.md`

## Güncelleme kuralı

Yapıyı, teknolojiyi, komutları, klasörleri, oyun listesini, oda protokolünü veya yayın akışını değiştiren her PR, aynı PR'da `CLAUDE.md` ve/veya `docs/MIMARI.md`'yi günceller (ve "Son güncelleme" satırını yeniler). QA incelemede bunu kontrol eder. Çabuk eskiyen bilgi (kart/test sayısı) yazılmaz.

## Kurallar özeti

- Backend: `src/oda` ve `src/core` saftır; ayrıntı `docs/MIMARI.md` "Değişmez kurallar".
- Frontend: stil değerleri `src/tema.ts` token'larından gelir; `yazi.kart` ve `yazi.sayi` token'ları bilerek durur (#163), silme.

## Sık hatalar / tuzaklar

- `gh` ve `git push/pull/fetch` komutlarını zincirleme (`&&`, `;`, `|`).
- İçerik (`content/**`) değişince `npm run icerik` çalıştır.
- Kabul testleri kaynak dosyaları yol/regex ile okur; dosya taşımadan önce `*.kabul.test.ts` kontrol et. testID yeniden adlandırmak kabul testini kırar.
- Biten işte BEKLEYEN (`it.fails`) bayrağı silinmezse CI kırılır.
- Web'de geri tuşu `beforeRemove` tetiklemez; popstate koruması kullanılır (#45).
- Playwright `innerText` CSS büyük harfini uygular; `toLocaleLowerCase('tr')` ile karşılaştır.
