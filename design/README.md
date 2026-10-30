# design/ — tasarım dizini

Kurallar ve token'lar: [`TASARIM-SISTEMI.md`](TASARIM-SISTEMI.md). Her klasör bir issue'ya bağlıdır. HTML dosyaları bağımsızdır ve tarayıcıda açılır; çoğu `?tema=koyu|acik&boy=<genişlik>x<yükseklik>` parametresi alır. PNG'ler `scripts/ekran-goruntusu.sh` ile üretilmiştir.

| Klasör | Issue | Konu | Durum | Not |
|---|---|---|---|---|
| `2-gorsel-yon/` | #2 | Görsel yön | ✅ Geçerli (B) | Seçilen yön: B · Çıkartma (Semih). A ve C `arsiv/`'de. |
| `2-ekranlar/` | #2 | OK mu NOK mu v1 ekranları, hareket prototipi, paylaşım | ✅ Geçerli | Tek telefon temel ekranları; diğer oyunlar bunları yeniden kullanır. |
| `49-oda-modu/` | #49 | Oda modu (OK mu NOK mu) | ⚠️ Kısmen eski | Oda kodu artık 6 hane (PRD v5); "ZEPA" görünümü eski. `final-secenekler`: B seçildi, A yalnızca "hareketi azalt" listesi, C kullanılmıyor. |
| `80-casus-kim/` | #80 | Casus kim | ✅ Geçerli | Murat onayı. |
| `107-on-on-ama/` | #107 | 10/10 ama (tek telefon) | ✅ Geçerli | Yalnızca OK mu NOK mu'dan farklı ekranlar. |
| `120-onon-oda/` | #120 | 10/10 ama oda modu | ✅ Geçerli | Yalnızca farklar; kod 6 hane. |
| `130-tanitim-karti/` | #130 | Tanıtım kartı, "Nasıl oynanır?" | ✅ Geçerli (A) | Bağlantı üst sağda (A, Metehan). 9 numaralı ekran (B) yalnızca karşılaştırma içindir. |
| `171-kategoriler/` | #171 | Ana ekran kategori çipleri, oyun kartı rozeti (v7) | ⏳ Seçim bekliyor | A "Sade liste", B "Sticker raf". Seçilmeyen seçim sonrası `arsiv/`'e taşınır. |
| `arsiv/` | — | Elenen seçenekler | 🗄 Arşiv | Referans alınmaz. `arsiv/2-gorsel-yon/`: A · Neon Gece, C · Gece Dergisi. |

**Yeni tasarım eklerken:**
- Klasör adı `<issue-no>-<kisa-ad>/` olur.
- Bu tabloya bir satır eklenir.
- Elenen seçenekler seçimden sonra `arsiv/<klasör>/` altına taşınır.
