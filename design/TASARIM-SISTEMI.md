# Kafadar — Tasarım sistemi

Yön: **B · Çıkartma** (Semih, 27.10.2026, #2). Referans: `design/2-gorsel-yon/b.html` / `b.png`.
İlke: az token, az bileşen, yalnızca v1. Yeni bir şey gerekirse önce buraya eklenir.

## Renk — anlamı olan renkler
Kural: **yeşil = OK (onay), kırmızı = NOK (ret)**. Bu iki renk yalnızca oy ve oy sonucu için kullanılır. Oy olmayan her şey (düğme, geri sayım, ilerleme, kart) marka renkleriyle yapılır.

| Token | Koyu (varsayılan) | Açık | Kullanım |
|---|---|---|---|
| `zemin` | `#16123F` | `#FFF8E7` | Ekran arka planı |
| `yuzey` | `#2B2570` | `#FFFFFF` | Boş çubuk, ikincil düğme, çip |
| `metin` | `#FFF8E7` | `#16123F` | Ana metin |
| `metin-soluk` | `#B9B3E8` | `#5B5585` | Etiket, ipucu |
| `kontur` | `#0B0920` | `#0B0920` | Tüm sticker konturları |
| `golge` | `#7C6CFF` | `#7C6CFF` | Ofset gölge (5px 5px 0) |
| `marka` | `#FFD23F` | `#FFD23F` | Kart, birincil düğme, logo, geri sayım |
| `marka-2` | `#5B8CFF` | `#5B8CFF` | Arka kart, logo yüzü (süs) |
| `ok` | `#3DDC84` | `#3DDC84` | OK dolgusu (çubuk, düğme, isim çipi) |
| `nok` | `#FF5A4E` | `#FF5A4E` | NOK dolgusu |
| `ok-metin` | `#3DDC84` | `#0F8A4B` | OK yazı/ikon rengi |
| `nok-metin` | `#FF5A4E` | `#D63A2F` | NOK yazı/ikon rengi |

- Dolgulu yüzeylerin (`marka`, `ok`, `nok`) üstündeki metin her zaman `kontur` (#0B0920).
- OK/NOK hiçbir yerde yalnızca renkle ayrılmaz: her zaman 👍/👎 ikonu + "OK"/"NOK" kelimesi (KK-19).
- Eşitlik ve nötr durumlar `marka` ile gösterilir, yeşil/kırmızı kullanılmaz.

## Yazı
Tek aile: **Bricolage Grotesque** (uygulamaya paketlenir).

| Rol | Boyut / ağırlık |
|---|---|
| `baslik-xl` (açıklama anı, logo) | 48 / 800, `letter-spacing -0.03em` |
| `baslik` | 36 / 800 |
| `kart` | 36 → 24 / 800 (metin uzunluğuna göre küçülür, alt sınır 24; sistem yazı büyütmesinde de ≥16pt, KK-18) |
| `sayi` (geri sayım, oy sayısı) | 68 / 800, `tabular-nums` |
| `dugme` | 21 / 800 |
| `govde` | 17 / 500, satır yüksekliği 1.45 |
| `etiket` | 14 / 800, büyük harf, `letter-spacing 0.08em` |

## Ölçü
- Boşluk: 4 · 8 · 12 · 16 · 24 · 32.
- Yarıçap: çip 12 · düğme 20 · kart 30 · yuvarlak 999.
- Kontur: 4px (kart, düğme), 3px (çip).
- Ofset gölge: `5px 5px 0 golge` (kart 8px).
- Eğim: başlık sticker'ları −4°, kart −3°, arka kart +5°. Okunacak gövde metni eğilmez.
- Dokunma alanı ≥ 48px; birincil düğme yüksekliği 62px.
- Kenar boşluğu: yatay 22px, güvenli alanlar (çentik / dinamik ada) eklenir.

## Bileşenler (v1'de yalnızca bunlar)
1. **Düğme**: birincil (`marka` dolgu), ikincil (`yuzey`), ikon düğme (48–62px kare). Basınca gölge 5→1px ve 3px aşağı-sağa kayar ("sticker'a basma").
2. **Kart**: `marka` dolgu, 4px kontur, 8px gölge, −3°; arkasında `marka-2` arka kart.
3. **Çip / sticker**: isim, paket, "DURUM" etiketi.
4. **Oy satırı**: isim + OK / NOK düğmesi (seçilince dolgu `ok`/`nok`, seçilmemişken `yuzey`).
5. **Sonuç çubuğu**: `yuzey` zemin, `ok`/`nok` dolgu, sayı + ikon + kelime.
6. **Geri sayım**: 3 halka, aktif olan büyük ve `metin` dolgulu.
7. **Diyalog**: "Oyundan çık?", "Devam et / Yeni oyun" (kart görünümünde).

## Hareket
| Animasyon | Süre | Easing | Not / titreşim |
|---|---|---|---|
| Logo açılışı | 700ms | `cubic-bezier(.34,1.56,.64,1)` | Toplam ≤1 sn (KK-1) |
| Ekran geçişi | 280ms | `cubic-bezier(.2,.8,.2,1)` | Kaydır + solma |
| Kart çevirme | 450ms | `cubic-bezier(.2,.8,.2,1)` | rotateY 180°; ortada hafif titreşim (impact light) |
| 3-2-1 sayı | her adım 1000ms; sayı girişi 250ms | `cubic-bezier(.34,1.56,.64,1)` | Ölçek 1.4→1; her saniye orta titreşim (KK-9) |
| Düğme basma | 90ms bas / 150ms bırak | `ease-out` / yay | Hafif titreşim (impact light) |
| Oy seçimi | 160ms | `cubic-bezier(.34,1.56,.64,1)` | Dolgu + ölçek 0.92→1; seçim titreşimi |
| Çubuk dolması | 2000ms | `cubic-bezier(.16,1,.3,1)` | Sayılar birlikte artar (KK-11) |
| Sticker girişi (sonuç başlığı) | 300ms | `cubic-bezier(.34,1.56,.64,1)` | Ölçek 0.6→1, −10°→−4°; çubuk bitince |
| Azınlık sarsıntısı | 400ms | `linear` | ±8px × 4; uyarı titreşimi |
| Konfeti (oybirliği) | 1500ms | `ease-out` (yerçekimi) | ~60 parça; oy rengi + `marka`; başarı titreşimi |
| Eşitlik | 300ms | `cubic-bezier(.2,.8,.2,1)` | İki çubuk ortada çarpışır; titreşim yok |

**Hareketi azalt** açıkken: çevirme → 150ms solma; sarsıntı ve konfeti yok; çubuklar 300ms solmayla dolu gelir; sayılar ölçeklenmez (KK-19).

## Titreşim ve ses
- Titreşim (expo-haptics): seçim → `selection`; düğme → `impactLight`; geri sayım → `impactMedium`; azınlık → `notificationWarning`; oybirliği → `notificationSuccess`.
- Ses (3 adet, kısa): kart çevirme "fışş", geri sayım "tık", açıklama "ta-da". Sessiz modda çalmaz. Ses ve titreşim ayarlardan ayrı ayrı kapatılır (KK-20).

## Erişilebilirlik özeti
Kontrast: koyu temada metin/zemin ≈ 15:1; dolgu üstü koyu metin ≥ 7:1. Ekran okuyucu etiketleri: oy düğmeleri "Ayşe için OK", "Ayşe için NOK"; geri sayım "3 saniye".
