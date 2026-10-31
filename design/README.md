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
| `171-kategoriler/` | #171 | Ana ekran kategori çipleri, oyun kartı rozeti (v7) | ⚠️ Kısmen eski | Çip biçimi geçerli (A · Sade liste, Metehan). Kategori çipleri ve tür rozeti v7.1'de kalktı → `183-kisi-filtresi/`. B · Sticker raf `arsiv/`'de. |
| `183-kisi-filtresi/` | #183 | Kişi çipleri, rozetsiz oyun kartı, boş liste (`ana.html`); ⓘ Nasıl oynanır (`b.html`) (v7.1) | ✅ Geçerli (B) | Ana ekranda varyant yok. ⓘ: B · Yazılı (Semih): oyun öncesi "ⓘ Nasıl oynanır" hapı, oyun içinde kısa ⓘ. A · Yalın `arsiv/`'de. |
| `190-acilis/` | #190 | Açılış ekranı: logo, yükleme yüzdesi, söz (v8) | ✅ Geçerli (B) | B · Renkli çıkartma (Semih). `0` numaralı ekran sistem açılış görseli önerisidir. A · Sade ortalı `arsiv/`'de. |
| `221-quiz-night/` | #221 | Quiz Night: tek başına, tek telefonda grup, oda farkları (Faz 2), paylaşım kartları (v9) | ✅ Geçerli (C) | C · Karma (Semih): oyun ekranları A · Sade liste, sonuç ve paylaşım B · Yarışma kartı. Grup/oda sonucu ve paylaşım kartı birinciyi 🏆 ile gösterir, ortak birincilikte bütün adlar (Semih, Telegram 925). A/B PNG'leri `arsiv/`'de; iki seçenekli şablon commit `842f826`. Paket ekranı kategori çipleri (v10, #261): `kategori.html`, A · Sade çip satırı + emoji seti 1 (Semih, Telegram 985). |
| `290-gorsel-yenileme/` | #290, #292 | Görsel yenileme: ana ekran A + paket ekranı b, `konsept.html` (`?ekran=ana\|one-cikan\|bos\|tanitim\|paket`, `&tema=acik`; `?sayfa=durumlar\|bilesen`); ikon = token renk + desen + kendi 3D nesnemiz. Uygulamaya hazır set `assets/gorsel/` (13 nesne + 7 desen, WebP; kaynak `gorsel/sahne.html`, `gorsel/desen.html`, `gorsel/LISANS.md`) | ✅ Geçerli | Ana ekran A (Semih, msg 1051), görsel kaynağı C (msg 1053), emoji yok. Yöntem B · Three.js (msg 1069): örnekler `ornek/quiz-a.png`, `ornek/quiz-b.png` (kodu 5509e03'te), set `gorsel/set.png`. Kaplama C ve paket ekranı b (msg 1082): `ornek/kaplama.png`; paket a ızgarası 0c403d1'de. #292: açık tema (`acik-*.png`), eksik durumlar (`durumlar.png`), bileşenler (`bilesen.png`); bileşenler TASARIM-SISTEMI 14–17. |
| `arsiv/` | — | Elenen seçenekler | 🗄 Arşiv | Referans alınmaz. `arsiv/2-gorsel-yon/`: A · Neon Gece, C · Gece Dergisi. `arsiv/171-kategoriler/`: B · Sticker raf. `arsiv/183-kisi-filtresi/`: A · Yalın ⓘ. `arsiv/190-acilis/`: A · Sade ortalı. `arsiv/221-quiz-night/`: A · Sade liste ve B · Yarışma kartı PNG'leri (seçilen C ikisinin karması); #261 B · Kategori başlıkları ve C · Emojili kayan çipler (`kategori-b-koyu.png`, `kategori-c-koyu.png`; üç seçenekli şablon commit `f42cc4a`). |

**Yeni tasarım eklerken:**
- Klasör adı `<issue-no>-<kisa-ad>/` olur.
- Bu tabloya bir satır eklenir.
- Elenen seçenekler seçimden sonra `arsiv/<klasör>/` altına taşınır.
