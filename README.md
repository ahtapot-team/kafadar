# Kafadar

Tek telefonda oynanan parti oyunları uygulaması (Expo, TypeScript). Ayrıntı: [docs/PRD.md](docs/PRD.md).

## Kurulum ve komutlar

```
npm ci
npm start          # Expo geliştirme sunucusu; telefonda Expo Go ile QR'ı okut
npm run lint
npm run typecheck
npm test           # Vitest (yalnızca saf mantık, hızlı)
npm run icerik     # content/decks/*.json doğrulaması
npm run build      # expo export (CI doğrulaması)
npm run format     # Prettier
```

## Yapı

- `app/` ekranlar (Expo Router)
- `src/core/` ortak mantık: `rng.ts` (tohumlu), `saat.ts` (enjekte edilebilir), `deste.ts` (şema + doğrulama)
- `src/games/registry.ts` oyun listesi; yeni oyun = `src/games/<oyun>/` + bu dosyaya bir satır
- `content/decks/*.json` sürümlü desteler (`deck_id`, `version`, `lang`, `cards[{id, text}]`)

## PR önizlemesi (EAS Update)

Bir kerelik kurulum: Expo hesabı aç, `EXPO_TOKEN` oluştur (expo.dev → Access tokens), repo secret'ı olarak ekle, `eas init` ve `eas update:configure` ile `app.json`'a projectId ve `updates.url` yaz. Sonra her PR'a QR ve link yorumu düşer.

## Son main'i telefonda aç (kalıcı Expo Go linki)

Main'e her push'ta `eas update --channel main` çalışır. Expo Go'da şu link her zaman son main'i açar:

```
exp://u.expo.dev/4172ae7b-3cdd-4faf-b89b-c8c1266ebe56?channel-name=main&runtime-version=exposdk%3A58.0.0
```

Web önizleme: https://ahtapot-team.github.io/kafadar/

## Oda sunucusu (Cloudflare Worker + Durable Objects)

`sunucu/` içinde; kurallar `src/oda/oda.ts`'te (saf), sunucu yalnızca ince kabuk. main'e her merge'de `.github/workflows/sunucu.yml` dağıtır (secret'lar: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). Protokol: `sunucu/src/index.ts` başındaki açıklama.

Yerelde deneme (ağ üzerinden N istemci, 2–12):

```
cd sunucu && npx wrangler dev --port 8787      # bir terminalde
npm run sunucu:test -- http://127.0.0.1:8787 12  # diğerinde
```
