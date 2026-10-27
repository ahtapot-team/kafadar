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
