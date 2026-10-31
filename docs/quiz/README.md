# Quiz Night paket taslakları

Her dosya bir paketin insan onayına sunulan taslağıdır (PRD v9, KK-115…KK-117). Onaylanan taslak `content/quiz/<id>.json`'a çevrilir; `kaynaklar` ve `uyum` uygulama paketine girmez.

## Biçim

- Başlık `# Ne kadar <Ad> fanısın?`, ardından `id`, `ad`, `emoji`, `koken` (`tr` | `yabanci`).
- `## Unvanlar`: 0–3, 4–6, 7–9, 10 doğru için birer unvan.
- `## Sorular`: her soru `### <id> · <kolay|orta|zor> · <olay|dunya>`, `Soru:` (≤140), 4 şık (≤40, birbirinden farklı), `Doğru:`, `Uyum:` ve en az 4 kaynak.

## Kurallar (KK-116)

- Sorular bizim; replik birebir alıntılanmaz. `olay` soruları havuzun yarısından az.
- Her doğru cevap ≥4 bağımsız kaynakla doğrulanır; uyum ≥%75. Birbirini kopyalayan haberler tek kaynak sayılır.
- Kaynaklarda çelişen değerler aynı soruda şık olarak yan yana konmaz.
- Unvanlar karaktere gönderme yapar, oyuncuya değil. Oyuncuların özel hayatı, siyaset, din, terör ve şiddet ayrıntısı yok.
- Paket başına en az 6 kolay, 6 orta, 6 zor soru.
