# Kafadar — Tasarım sistemi

Yön: **B · Çıkartma** (Semih, 27.10.2026, #2). Referans: `design/2-gorsel-yon/b.html` / `b.png`.
İlke: az token, az bileşen. Yeni bir şey gerekirse önce buraya eklenir. Klasör dizini: `design/README.md`.
Son güncelleme: v7 (#292, 31.10.2026): ikon, dock, üst kart ve büyük paket kartı (Bileşenler 14–17), `gece` token'ı, açık tema, basılı ikon ve uzun basma.
Görsel set (nesne + desen, WebP): `design/290-gorsel-yenileme/assets/gorsel/`, kaynak ve lisans `gorsel/LISANS.md`.

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
| `gece` ★ (#292) | `#2B2570` | `#2B2570` | Quiz Night ikon zemini. Açık temada da koyu kalır (açık `yuzey` beyaz olduğu için ayrı token) |
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

## Tema tanımları (`src/tema.ts`)
Ekranlarda sayı elle yazılmaz; aşağıdaki adlar kullanılır. ★ = yeni (Refactor 9, uygulaması #144). Diğerleri `tema.ts`'te zaten var.

| Ad | Değer | Kullanım | Elle yazılmış değerlerin eşlenmesi |
|---|---|---|---|
| `cizgi.ince` ★ | 3 | Çip, oy satırı, tuş, küçük kutu konturu | 2 → 3 (konfeti ve tik dahil) |
| `cizgi.kalin` ★ | 4 | Kart, düğme, diyalog, sticker konturu | 4 |
| `yaricap.kucuk` ★ | 10 | Puan rozeti, küçük çubuk, minik kutu | 3, 4, 8, 9, 10, 14 → 10 |
| `yaricap.cip` | 12 | Çip, sticker | 12 |
| `yaricap.dugme` | 20 | Düğme, satır, seçim kutusu | 18, 20, 22 → 20 |
| `yaricap.kart` | 30 | Kart, diyalog | 30 |
| `yaricap.yuvarlak` | 999 | Hap, halka, daire | 99 → 999 |
| `perde` ★ | `rgba(11,9,32,0.7)` (iki temada aynı) | Diyalog ve "Oyundan çık?" arka perdesi | `ui.tsx`'teki elle yazılmış değer |
| `yazi.kart` ★ | 36 → 24 / 800, `letterSpacing -0.9`; sistem büyütmesinde ≥16pt | Kart metni (OK mu NOK mu, 10/10 ama, Casus kim) | Ekranlardaki kart fontSize'ları |
| `yazi.sayi` ★ | 68 / 800, `tabular-nums` | Geri sayım, ortalama, oy sayısı | Ekranlardaki büyük sayı fontSize'ları |
| `yazi.cip` ★ (#171) | 16 / 800 | Ana ekran kişi çipi, ⓘ düğmesindeki "i" ve "Nasıl oynanır" yazısı (#183) | — (uygulaması #173) |

**Paylaşım görseli (1080×1920) ölçeği:** ekran değeri × **2,77** (1080 / 390), en yakın çift sayıya yuvarlanır. Görsel her zaman koyu temadır (bilerek).

| Ad ★ | Değer | Kullanım |
|---|---|---|
| `paylasim.cizgi` | 10 | Kart, sticker, çubuk konturu |
| `paylasim.golge` | 14 (kart 20) | Ofset gölge |
| `paylasim.logo` | 96 | "Kafadar!" sticker'ı |
| `paylasim.kart` | 84 → 64 | Kart metni (uzunluğa göre) |
| `paylasim.sayi` | 200 | Ortalama, büyük skor |
| `paylasim.etiket` | 44, `letterSpacing 0.08em` | "10 KARTTA BU ODA" gibi üst etiketler |
| `paylasim.alt` | 40 / 700, `metin-soluk` | "Kafadar ile oynandı · …" alt satırı |

## Bileşenler (v1'de yalnızca bunlar)
1. **Düğme**: birincil (`marka` dolgu), ikincil (`yuzey`), ikon düğme (48–62px kare). Basınca gölge 5→1px ve 3px aşağı-sağa kayar ("sticker'a basma").
2. **Kart**: `marka` dolgu, 4px kontur, 8px gölge, −3°; arkasında `marka-2` arka kart.
3. **Çip / sticker**: isim, paket, "DURUM" etiketi.
4. **Oy satırı**: isim + OK / NOK düğmesi (seçilince dolgu `ok`/`nok`, seçilmemişken `yuzey`).
5. **Sonuç çubuğu**: `yuzey` zemin, `ok`/`nok` dolgu, sayı + ikon + kelime.
6. **Geri sayım**: 3 halka, aktif olan büyük ve `metin` dolgulu.
7. **Diyalog**: "Oyundan çık?", "Devam et / Yeni oyun" (kart görünümünde). Tanıtım kartı da bu bileşendir (#130).
8. **Kişi çipi** (#171 A biçimi, #183 içeriği; v11'de dock'a taşındı, Bileşen 15): ana ekranın altındaki dock'ta tek satır: Tümü · 1 kişi · 2 kişi · 3+ kişi, dördü hep görünür. Çipler satırı doldurur (`flexGrow: 1`), 375 genişlikte tek satıra sığar; 360'tan dar ekranda satır yatay kayar. Yükseklik `dokunmaAlani` 48, `cizgi.ince`, `yaricap.cip`, iç boşluk `bosluk.s`, aralık `bosluk.s`, yazı `yazi.cip`. Seçili değil: `yuzey` dolgu, `metin` yazı. Seçili: `marka-2` dolgu, `kontur` yazı, "✓ " ön eki, 5px `golge`. Basınca düğme gibi gölge 5→1px. Ekran okuyucu: "2 kişi, seçili, düğme". Boş liste: Bileşen 14. Görünüm: `design/290-gorsel-yenileme/konsept.html` (eski: `183-kisi-filtresi/ana.html`).
9. **Oyun düğmesi (ana ekran)**: v11'de kalktı, yerini İkon'a bıraktı (Bileşen 14, #290/#292). Eski görünüm `design/183-kisi-filtresi/ana.html`.
10. **ⓘ Nasıl oynanır** (#183, B · Yazılı, Semih): tek ortak bileşen, iki biçim. **Yazılı biçim** oyun öncesi ekranlarda (mod, oyuncular, paket/hazırlık, oda lobisi): yükseklik 48 (`dokunmaAlani`), genişlik içeriğe göre; 24'lük `marka` daire + "Nasıl oynanır" (`yazi.cip`, `metin`), aralık `bosluk.s`, iç boşluk sol 9 / sağ 14. **Kısa biçim** oyun içi ve sonuç ekranlarında: 48×48, yalnız daire (üst çubukta yazıya yer yok). İkisinde de `yaricap.cip`, `cizgi.ince` `kontur`, `yuzey` dolgu; dairede `yazi.cip` `kontur` "i". Basılı: opaklık 0.6. Ekran okuyucu: "Nasıl oynanır, düğme". Oyun seçildikten sonraki her ekranın üst satırının sağında durur: sağda ✕ varsa hemen solunda (aralık `bosluk.s`), yoksa köşede. Ana ekranda yoktur. Yer açmak için tek telefon kart ekranında paket adı kartın üst satırına, oda soru ekranında kalan süre ilerleme çubuğunun sağına iner (testID `oda-geri-sayim` aynı). Görünüm: `design/183-kisi-filtresi/b.html`.
11. **Açılış ekranı** (#190, B · Renkli çıkartma, Semih): uygulama her açıldığında bir kez görünür. Logo ana ekrandaki çıkartmanın aynısıdır; arkasında `marka2` çıkartma (+4°) durur. İlk karede logo ekranın tam ortasında, sistem açılış görseliyle aynı yerdedir; sonra söze yer açmak için 230 hizasına süzülür, arka çıkartma ve oyun emojileri (48'lik `yuzey` daire, `cizgi.ince`, 3px `golge`) sırayla girer. Altında tam genişlikte kalın yükleme çubuğu (yükseklik `bosluk.xl`, `cizgi.kalin`, 5px `golge`, dolu `marka`) vardır. Yüzde "%42" biçiminde, dolgunun ucundaki balonda yazar (`kontur` zemin, `marka` `yazi.cip`); rakamlar eşit genişliklidir. Söz çıkartma kartta durur (`yuzey`, `cizgi.kalin`, `yaricap.dugme`, 5px `golge`, −1.5°, sol üstte `marka` tırnak; metin `yazi.govde`). Söz oyuna aitse kartın altında oyun rozeti yazar ("🕵️ Casus kim", `kontur` zemin, `marka` yazı); genel sözde rozet yoktur. En altta "Geçmek için dokun" ipucu (`yazi.etiket` `metinSoluk`) durur; bütün ekran dokunulabilir. Söz 140 karaktere kadar 375 genişlikte sığar; büyük yazıda yukarı doğru uzar, logo ve çubuk ancak yer kalmazsa yukarı kayar. Oyun emojisi (👍 OK mu NOK mu, 🔟 10/10 ama, 🕵️ Casus kim) oyun kaydında yeni `emoji` alanıdır. Ekran okuyucu "Yükleniyor, yüzde 60" ve ardından sözü (oyun adıyla) okur. Ana ekrana `hareket.ekranGecisi` solmayla geçilir. **Sistem açılış görseli** (`app.json` `splash`): zemin `#16123F` (koyu `zemin`) ve ortada logo. Yazı tipi ve ayarlar okunana kadar sistem görseli kalır, sonra 280 ms solarak açılış ekranına geçer; açık temada da sistem görseli koyudur. Görünüm: `design/190-acilis/b.html`. A · Sade ortalı `arsiv/`'de.
12. **Quiz Night** (#221, C · Karma, Semih: oyun ekranları A · Sade liste, sonuç ve paylaşım B · Yarışma kartı). **Şık:** 4 şık, tam genişlik satır, harf dairesi (A–D), en az 56 yükseklik, `cizgi.kalin`, `yaricap.dugme`, `yuzey`, 5px `golge`. Durumlar: doğru `ok` + ✓, yanlış seçilen `nok` + ✕, diğerleri opaklık 0.45; grupta "Cevabı göster"den önce düz (gölgesiz, dokunulmaz); odada kilitli seçim `marka-2` + "SENİN" rozeti. **Soru yazısı:** yeni `yazi.soru` 22/28 800; 90 karakterden uzunda 19/25. Soru 140, şık 40 karaktere kadar 360 genişlikte sığar; sistem büyütmesinde ekran kayar, metin kesilmez. **Zorluk:** yazılı rozet "●○○ Kolay / ●●○ Orta / ●●● Zor", `yuzey` dolgu; renk zorluğa göre değişmez. **Sayaç (oda):** `marka` çubuk, kalan süre sağda ("12 sn"), son 5 sn "📳 4 sn"; kırmızıya dönmez. **Sonuç:** puan (104, `tabular-nums`, `kontur`) ve unvan aynı `marka` kartta (−3°, 9px `golge`); altında soru soru kutuları (10 sütun, yükseklik 28, `cizgi.ince`, `yaricap.kucuk`, `ok` + ✓ / `nok` + ✕). **Grup/oda sonucu** (Semih, Telegram 925; KK-112, KK-114): en üstte **birinci kartı**: `marka`, −2°, 8px `golge`, köşede 🏆; "Birinci" ya da "Ortak birinci", ad (34; odada ve 3+ ortak birincide 26, satır kayar), puan (30, `tabular-nums`), unvan. Ortak birincilikte bütün adlar yazar ("Ayşe & Can", "Ayşe, Can & Deniz"). Altında kalanların sırası: önce doğru sayısı, eşitse zorluk katsayılı toplam (kolay 1, orta 2, zor 3), o da eşitse aynı sıra (1, 1, 3). Sıra unvan bandına göre gruplu, bant başlığı `marka` çıkartma, kendi satırın `marka-2`. Katsayıyla ayrışan eşitlikte altta tek satır not. **Paylaşım kartı:** her zaman koyu; soru ve cevap yok. Tek başına: paket sorusu, puan, unvan, ✓/✕ kutuları, logo (değişmez). Grup ve oda (KK-111): birinci kartının büyük boyu (🏆 66, ad 48, puan 96, unvan 22); ortak birincilikte bütün adlar; diğer oyuncular yazmaz. Görünüm: `design/221-quiz-night/ekranlar.html`; elenen A/B `arsiv/`'de.
13. **Quiz Night kategori çipleri ve paket kartı** (#261, A · Sade çip satırı + emoji seti 1, Semih). **Çip satırı:** paket ekranında başlığın altında tek satır: Tümü · Dizi & Film · Müzik · Spor. Görünüm Bileşen 8'deki kişi çipiyle aynı (48 yükseklik, satırı doldurur, seçili `marka2` + ✓); tek seçim, çipte emoji yok. Tümü varsayılan, seçim hatırlanmaz. Paketi olmayan kategorinin çipi yok; tek kategori varsa satır hiç yok. Radyo grubu; seçili çip "seçili" okunur. **Paket kartı:** emoji dairesi kategoriye göre `marka` (Dizi & Film), `marka2` (Müzik), `golge` (Spor, üç kulüpte aynı). Başlık `baslik` varsa o, yoksa "Ne kadar <ad> fanısın?". Altında not: Dizi & Film "Resmî değildir · Spoiler içerir" (önünde TÜRK/YABANCI rozeti, yalnızca bu kategoride), Müzik "Resmî değildir · Sanatçıyla bağlantısı yoktur", Spor "Resmî değildir · Kulüple bağlantısı yoktur"; not parçaları kendi içinde bölünmez. **Emoji:** Galatasaray, Fenerbahçe, Beşiktaş ⚽; Manifest 💃, Emir Can İğrek 🎸, BLOK3 🎤, Mabel Matiz 🎶. Kulüp rengi, arma, logo, lakap/maskot emojisi (🦁 🐤 🦅), sanatçı fotoğrafı ve albüm kapağı yok (KK-122). Tasarım: `design/221-quiz-night/kategori.html`. **v11 (#292):** paket kartı ve emoji seti Büyük paket kartına (Bileşen 16) geçti; çip satırı, başlık ve not metinleri aynen geçerli.

14. **İkon (ana ekran)** (#290 A, kaplama C; #292). Ana ekranda oyunlar 2 sütunlu ızgarada durur (aralık yatay 16, dikey 22). İkon 138 kare (dar ekranda sütuna göre küçülür), yarıçap 38, `cizgi.kalin` `kontur`, 6px `golge`. Üç katman, alttan üste:
    1. Zemin: token rengi. OK mu NOK mu `marka`, 10/10 ama `marka2`, Casus kim `golge`, Quiz Night `gece`.
    2. Desen: `assets/gorsel/desen/<oyun>.webp` (cover).
    3. Nesne: `assets/gorsel/<oyun>.webp`, iç alanın 1,28 katı (138 → 166), ortalı. Taşan kısım kırpılır; görselin kenarı saydamdır.

    Altında oyun adı (17/800, `metin`, üstten 12) ve kişi sayısı (13/700, `metinSoluk`). İki temada ikon aynıdır, yalnızca yazı renkleri değişir.
    - Dokununca oyun açılır. ~0,5 sn basılı tutunca tanıtım kartı açılır (Oyuna göre kurallar).
    - **Basılı:** ölçek 0,94, gölge 6→2. **Hareketi azalt:** ölçek yok, opaklık 0,7.
    - **Ekran okuyucu:** "<oyun adı>, <kişi sayısı>, düğme".
    - **İpucu:** ızgaranın altında "Kuralları görmek için oyuna basılı tut" (13/700 `metinSoluk`, ortalı).
    - **Boş liste:** ızgaranın yerine iki sütunu kaplayan kesik çizgili kutu gelir (yükseklik 185, 3px kesik `metinSoluk`, `yaricap.dugme`). İçinde `yazi.govde` `metinSoluk`: "Bu kişi sayısına uygun oyun henüz yok." İpucu satırı gizlenir.
15. **Dock** (#290 A; #292). Ekranın altında sabit durur, ana ekran kaydırılınca yerinde kalır.
    - Konum ve çerçeve: kenarlardan 12, alttan 18 (+ güvenli alan), yarıçap 32, `cizgi.ince` `kontur`, iç boşluk 10/12/12.
    - Zemin: koyu temada `yuzey` %90 opak; açık temada beyaz %92 opak.
    - İçerik: üstte "KAÇ KİŞİSİNİZ?" (12/800, büyük harf, `metinSoluk`), altında kişi çipleri (Bileşen 8).
    - Izgaranın alt boşluğu, dock yüksekliği artı 18'dir; böylece son satır dock'un altında kalmaz.
16. **Büyük paket kartı** (#290 b; #292). Tam genişlik, en az 135 yükseklik, yarıçap 24, `cizgi.kalin`, 6px `golge`, kartlar arası 22.
    - **Zemin:** kategori token rengi (Dizi & Film `marka`, Müzik `marka2`, Spor `golge`) ve üstünde desen `assets/gorsel/desen/<kategori>.webp` (`resizeMode="cover"`, iç yarıçap 20). Desen 1024×340'tır. En geniş ekranda (430) kartın iç alanı 382×127'dir, yani kart bu orandan geniş olmaz; cover yalnızca yanlardan kırpar ve film şeridi bantları korunur.
    - **Nesne:** paketin `gorsel` alanından (zorunlu) `assets/gorsel/<gorsel>.webp`, 112 boyutunda, sağdan 4, üstten −24 taşar.
    - **Metin:** sol tarafta, iç boşluk 22/116/16/16. Başlık 18/800, not 12/700 (Bileşen 13'teki metin, parçalar bölünmez); Dizi & Film'de TÜRK/YABANCI rozeti (yükseklik 22, `zemin` dolgu, `metin`). Metin her temada `kontur` (dolgu üstü).
17. **Üst kart: Son oynanan / Öne çıkan** (#290 A; #292). `yuzey`, `cizgi.kalin`, yarıçap 26, 6px `golge`, iç boşluk 12.
    - **Sol:** 62'lik ikon (yarıçap 18, `cizgi.ince`, gölge yok).
    - **Orta:** etiket "SON OYNANAN" ya da "ÖNE ÇIKAN" (12/800 `metinSoluk`), oyun adı 17/800, alt satır 13/700 `metinSoluk`. Alt satır tek satırdır, sığmazsa "…" ile kısalır ("4 kişi · Aile paketi").
    - **Sağ:** birincil "▶ Oyna" düğmesi (48). Dokunuş ikona dokunmakla aynı yere gider.
    - **Öne çıkan:** hiç oyun başlatılmamışsa ya da son oyun kayıttan kalkmışsa Quiz Night "1–12 kişi" görünür. Kişi çipleri bu kartı süzmez.

    Görünüm (Bileşenler 14–17): `design/290-gorsel-yenileme/konsept.html` (`?ekran=ana|one-cikan|bos|tanitim|paket`, `&tema=acik`; `?sayfa=durumlar|bilesen`).

## Oyuna göre kurallar
Genel renk kuralı her oyunda geçerlidir: yeşil ve kırmızı yalnızca anlam taşır, oyun ve marka renkleri nötrdür.

| Oyun / mod | Kural | Kaynak |
|---|---|---|
| **OK mu NOK mu** | `ok` = OK, `nok` = NOK; boş oy `yuzey` (kesik çizgi). Eşitlik `marka`. | #2 |
| **Oda modu** (tüm oyunlar) | Oda rozeti `marka-2` ("ODA" çipi, 2° eğik). Oda kodu **6 hane** (PRD v5). `design/49-oda-modu` ekranlarındaki 4 harfli "ZEPA" eskidir; güncel görünüm `design/120-onon-oda`. Kuranda ★. Bekleme ekranında kimin cevapladığı görünür, ne dediği görünmez. Oda finali: B · Ekolayzer; "hareketi azalt"ta liste. | #49, #120 |
| **10/10 ama** | Puan bantları: **0–3 `nok`** (sert), **4–6 `marka`** (kararsız), **7–10 `ok`** (cömert). Renk her zaman sayının yanında. Ortalama bir ondalık, Türkçe virgülle ("5,8"). Tuş takımı: tek telefonda 6+5, odada 4 sütun, tuş ≥48px; seçili tuş `ok` dolgu. Ödüller: En acımasız `nok`, Melek kalpli `ok`, Ruh ikizleri `marka-2`. | #107, #120 |
| **Casus kim** | Oyun rengi nötr `marka-2` (kart). Yeşil yalnızca "grup casusu yakaladı", kırmızı yalnızca "casus kazandı"; casus için ayrı bir "tehlike" rengi yoktur. Normal kart ve casus kartı aynı renk, düzen, yazı boyutu ve titreşimle gösterilir; kartta emoji yok. Kart yalnızca basılı tutulunca görünür, bırakınca 150ms'de kapanır. | #80 (KK-45, KK-52) |
| **Tanıtım kartı** | Diyalog bileşeni; oyun adı, kişi çipi (`kontur` dolgu, `marka` yazı), metin 16/600, "Tamam" 56px. Kendiliğinden açılmaz. Oyun öncesi ve oyun içi ekranlarda ⓘ düğmesiyle açılır (Bileşenler 10); ana ekranda ikona ~0,5 sn basılı tutunca açılır ve kartın sağ üstünde oyunun ikonu (84, +6°) durur (v11, #292). "Tamam" aynı ekrana döner, oyun durmaz. Ana ekranda açılan kartta emoji yok (KK-134). | #130, #183, #292 |
| **Quiz Night** | `ok` yalnızca doğru, `nok` yalnızca yanlış cevap; yanında her zaman ✓/✕. Zorluk yazıyla, renkle değil. Sayaç `marka`, kırmızı yok. Tek başına: dokununca kilitlenir. Grup: "Cevabı göster"e kadar doğru şık hiçbir biçimde belli olmaz; sonra "Kim bildi?" çipleri. Oda: kilitli seçim `marka-2` "SENİN"; açıklamada her şıkkın altında seçenlerin çipleri; cevap vermeyen yanlış sayılır. Ana ekran kartında emoji yok. | #221 (KK-106…KK-113) |

## Hareket
| Animasyon | Süre | Easing | Not / titreşim |
|---|---|---|---|
| Logo açılışı | 700ms | `cubic-bezier(.34,1.56,.64,1)` | Toplam ≤1 sn (KK-1) |
| Açılış ekranı çubuğu | hazırlığa göre, en az 3 sn | `cubic-bezier(.16,1,.3,1)` | Yalnız ileri; yüzde birlikte artar (KK-95) |
| Sistem görseli → açılış ekranı | 280ms | `cubic-bezier(.2,.8,.2,1)` | Solma; logo yerinde kalır |
| Açılış ekranı logo ve çıkartmalar | logo süzülmesi 300ms; ardından çıkartma ve emojiler 300ms, 80ms arayla | logo `cubic-bezier(.2,.8,.2,1)`; çıkartmalar `cubic-bezier(.34,1.56,.64,1)` | Logo ortadan 230 hizasına. Hareketi azalt: hepsi yerinde 150ms solarak belirir |
| Ekran geçişi | 280ms | `cubic-bezier(.2,.8,.2,1)` | Kaydır + solma |
| Kart çevirme | 450ms | `cubic-bezier(.2,.8,.2,1)` | rotateY 180°; ortada hafif titreşim (impact light) |
| 3-2-1 sayı | her adım 1000ms; sayı girişi 250ms | `cubic-bezier(.34,1.56,.64,1)` | Ölçek 1.4→1; her saniye orta titreşim (KK-9) |
| Düğme basma | 90ms bas / 150ms bırak | `ease-out` / yay | Hafif titreşim (impact light) |
| İkon basma (ana ekran) | 90ms bas / 150ms bırak | `ease-out` / yay | Ölçek 0.94, gölge 6→2px; hareketi azalt: ölçek yok, opaklık 0.7 |
| Uzun basma → tanıtım kartı | ~500ms basılı tutma | — | Kart Diyalog gibi açılır, `impactLight`; parmak kayarsa iptal |
| Oy seçimi | 160ms | `cubic-bezier(.34,1.56,.64,1)` | Dolgu + ölçek 0.92→1; seçim titreşimi |
| Çubuk dolması | 2000ms | `cubic-bezier(.16,1,.3,1)` | Sayılar birlikte artar (KK-11) |
| Sticker girişi (sonuç başlığı) | 300ms | `cubic-bezier(.34,1.56,.64,1)` | Ölçek 0.6→1, −10°→−4°; çubuk bitince |
| Azınlık sarsıntısı | 400ms | `linear` | ±8px × 4; uyarı titreşimi |
| Konfeti (oybirliği) | 1500ms | `ease-out` (yerçekimi) | ~60 parça; oy rengi + `marka`; başarı titreşimi |
| Eşitlik | 300ms | `cubic-bezier(.2,.8,.2,1)` | İki çubuk ortada çarpışır; titreşim yok |
| Quiz Night cevabı (tek başına) | seçim 160ms; 1500ms sonra sıradaki soru (280ms geçiş) | `cubic-bezier(.34,1.56,.64,1)` | Doğru `notificationSuccess`, yanlış `notificationError` |
| Quiz Night oda sayacı | soru süresi (en çok 20 sn), sunucu saatine göre | `linear` | Son 5 sn her saniye `impactLight`; hareketi azalt: saniyede bir adım |

**Hareketi azalt** açıkken: çevirme → 150ms solma; sarsıntı ve konfeti yok; çubuklar 300ms solmayla dolu gelir; sayılar ölçeklenmez (KK-19).

## Titreşim ve ses
- Titreşim (expo-haptics): seçim → `selection`; düğme → `impactLight`; geri sayım → `impactMedium`; azınlık → `notificationWarning`; oybirliği → `notificationSuccess`.
- Ses (3 adet, kısa): kart çevirme "fışş", geri sayım "tık", açıklama "ta-da". Sessiz modda çalmaz. Ses ve titreşim ayarlardan ayrı ayrı kapatılır (KK-20).

## Erişilebilirlik özeti
Kontrast: koyu temada metin/zemin ≈ 15:1; açık temada metin/zemin 16,6:1, `metinSoluk`/zemin 6,4:1, `metinSoluk`/`yuzey` 6,8:1. Dolgu üstü koyu metin ≥ 5:1 (en düşüğü `kontur`/`golge` 5,1:1, Spor paket kartı). İkon ve kart altı yazılar ≥12px, dokunma alanı ≥48px. Ekran okuyucu etiketleri: oy düğmeleri "Ayşe için OK", "Ayşe için NOK"; geri sayım "3 saniye".
