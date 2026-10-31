# Görseller: kaynak ve lisans

`../assets/gorsel/` altındaki bütün dosyalar **kendi çizimimizdir** (#290, Semih msg 1069: yöntem B · Three.js; #292 uygulamaya hazır set). Dış model, ikon seti veya web'den görsel yoktur.

- **Nesneler** (`assets/gorsel/<ad>.webp`, 13 dosya): kaynak `sahne.html`. Her nesne kodla modellenir (Three.js 0.160.0, cdnjs; yalnızca bu tasarım dosyasında kullanılır). Işık, ortam yansıması ve yumuşak gölge her nesnede aynıdır. Dosyalar 512×512, saydam, gölge görselin içinde.
- **Desenler** (`assets/gorsel/desen/<ad>.webp`, 7 dosya): kaynak `desen.html` (Canvas 2D). Desen ve parlaklık saydam bir katmandır. Zemin rengi, köşe, kontur ve gölge uygulamada tema token'larıyla kodla çizilir; katman sırası: token renk → desen → nesne. Oyun desenleri 512×512, kategori desenleri 1024×340 (`resizeMode="cover"`).
- Kural (#290, KK-134): emoji, Fluent Emoji, OpenMoji, 3dicons, kulüp logosu/arması ve sanatçı fotoğrafı yok.
- Sınır (#292): her dosya ≤50 KB, toplam ≤1 MB. Şu an 20 dosya, toplam 249 KB; en büyüğü `desen/muzik.webp` (35 KB).

## Yeniden üretme
`?cikti=1` (desen) ya da `?cikti=512` (nesne) bütün görselleri saydam PNG data URL'si olarak `#cikti` içine yazar. PNG'ler `cwebp` ile WebP'ye çevrilir. Tarayıcının kendi WebP kodlayıcısı saydamlığı kayıpsız sakladığı için sınırı aşar, bu yüzden `cwebp` kullanılır.

```sh
cd design/290-gorsel-yenileme/gorsel
cikar() { "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --use-angle=swiftshader --enable-unsafe-swiftshader \
    --virtual-time-budget=15000 --dump-dom "file://$PWD/$1" > dom.html
  python3 -c "import re,base64,sys;[open(sys.argv[1]+'/'+a+'.png','wb').write(base64.b64decode(u.split(',',1)[1])) for a,u in (l.split(' ',1) for l in re.search(r'<pre id=\"cikti\"[^>]*>(.*?)</pre>',open('dom.html').read(),re.S).group(1).strip().split('\n'))]" "$2"; }
mkdir -p png/nesne png/desen
cikar 'sahne.html?cikti=512' png/nesne
cikar 'desen.html?cikti=1&bicim=png' png/desen
for f in png/nesne/*.png; do cwebp -quiet -q 80 -alpha_q 60 -m 6 "$f" -o "../assets/gorsel/$(basename "$f" .png).webp"; done
for f in png/desen/*.png; do cwebp -quiet -q 80 -alpha_q 60 -m 6 "$f" -o "../assets/gorsel/desen/$(basename "$f" .png).webp"; done
rm -rf png dom.html
```
Kontrol: tek nesne `sahne.html?nesne=spor`, bütün set `sahne.html` (→ `set.png`), desenler token renkleri üstünde `desen.html`.

## Nesneler (`assets/gorsel/`)
| Dosya | Nesne | Nerede |
| --- | --- | --- |
| `ok-mu-nok.webp` | Başparmak yukarı (mavi eldiven, krem manşet) | OK mu NOK mu |
| `on-on-ama.webp` | Kabarık yıldız | 10/10 ama |
| `casus-kim.webp` | Büyüteç | Casus kim |
| `quiz-night.webp` | Yanan ampul, soru işareti teli, hale | Quiz Night |
| `ayarlar.webp` | Dişli çark | Ayarlar düğmesi |
| `ask-i-memnu.webp` | Kalp | Aşk-ı Memnu paketi |
| `hababam-sinifi.webp` | Spiralli defter | Hababam Sınıfı paketi |
| `prison-break.webp` | Açık asma kilit | Prison Break paketi |
| `manifest.webp` | Megafon | Manifest paketi |
| `emir-can-igrek.webp` | Kulaklık | Emir Can İğrek paketi |
| `blok3.webp` | Mikrofon | BLOK3 paketi |
| `mabel-matiz.webp` | Bağlı iki nota | Mabel Matiz paketi |
| `spor.webp` | Kupa (kulüp rengi yok) | Spor paketleri (üç kulüpte aynı) |

## Desenler (`assets/gorsel/desen/`)
| Dosya | Zemin token'ı | Desen | Nerede |
| --- | --- | --- | --- |
| `ok-mu-nok.webp` | `marka` | Çapraz beyaz şerit, alt yarı koyu | OK mu NOK mu ikonu |
| `on-on-ama.webp` | `marka2` | 18 beyaz ışın | 10/10 ama ikonu |
| `casus-kim.webp` | `golge` | Üstte spot ışığı, köşeler karanlık | Casus kim ikonu |
| `quiz-night.webp` | `gece` (yeni, iki temada `#2B2570`) | Hilal ay ve yıldızlar | Quiz Night ikonu |
| `dizi-film.webp` | `marka` | Film şeridi (üst ve alt bant, delikler) | Dizi & Film paket kartı |
| `muzik.webp` | `marka2` | Sağda plak halkaları | Müzik paket kartı |
| `spor.webp` | `golge` | Sağda orta yuvarlak ve orta çizgi | Spor paket kartı |
