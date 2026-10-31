# Quiz Night paket taslakları

Her dosya bir paketin insan onayına sunulan taslağıdır (PRD v9 ve v10, KK-115…KK-117, KK-123). Onaylanan taslak `content/quiz/<id>.json`'a çevrilir; `kaynaklar` ve `uyum` uygulama paketine girmez.

## Biçim

- Başlık `# Ne kadar <Ad> fanısın?` (ya da `baslik`), ardından `id`, `ad`, isteğe bağlı `baslik` (≤40), `emoji`, `kategori` (`dizi-film` | `muzik` | `spor`) ve yalnızca Dizi & Film'de `koken` (`tr` | `yabanci`). Kategori satırı olmayan eski taslaklar `dizi-film`dir (PRD v10, KK-120).
- `## Unvanlar`: 0–3, 4–6, 7–9, 10 doğru için birer unvan.
- `## Sorular`: her soru `### <id> · <kolay|orta|zor> · <olay|dunya>`, `Soru:` (≤140), 4 şık (≤40, birbirinden farklı), `Doğru:`, `Uyum:` ve en az 4 kaynak.

## Kurallar (KK-116)

- Sorular bizim; replik birebir alıntılanmaz. `olay` soruları havuzun yarısından az.
- Her doğru cevap ≥4 bağımsız kaynakla doğrulanır; uyum ≥%75. Birbirini kopyalayan haberler tek kaynak sayılır.
- Kaynaklarda çelişen değerler aynı soruda şık olarak yan yana konmaz.
- Unvanlar karaktere gönderme yapar, oyuncuya değil. Oyuncuların özel hayatı, siyaset, din, terör ve şiddet ayrıntısı yok.
- Paket başına en az 6 kolay, 6 orta, 6 zor soru.
- Müzik ve Spor için ek kurallar PRD v10 KK-123'tedir: yalnızca eskimeyen bilgiler, şarkı/marş sözü yok, özel hayat ve tartışmalı konular yok, bütün sorular `dunya`.
