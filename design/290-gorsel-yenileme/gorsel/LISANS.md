# Görseller: kaynak ve lisans

Bu klasördeki PNG'lerin hepsi **kendi çizimimizdir** (#290, Semih msg 1069: yöntem B · Three.js). Dış model, ikon seti veya web'den görsel yok.

- Kaynak: `sahne.html`. Her nesne kodla modellenir (Three.js 0.160.0, cdnjs; yalnızca bu tasarım dosyasında). Işık, ortam yansıması ve yumuşak gölge her nesnede aynıdır.
- Çıktı: 256 px, saydam zemin, gölge görselin içinde. Logo zeminleri (renk, şerit, ışın, spot, gece, film şeridi, plak, saha çizgisi) düz CSS'tir (`../konsept.html`).
- Kural (#290): emoji, Fluent Emoji, OpenMoji, 3dicons, kulüp logosu/arması ve sanatçı fotoğrafı yok.

## Yeniden üretme
`?cikti=<px>` bütün nesneleri data URL olarak `#cikti` içine yazar:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --use-angle=swiftshader --enable-unsafe-swiftshader \
  --virtual-time-budget=15000 --dump-dom "file://$PWD/sahne.html?cikti=256" > dom.html
python3 -c "import re,base64;[open(a+'.png','wb').write(base64.b64decode(u.split(',',1)[1])) for a,u in (l.split(' ',1) for l in re.search(r'<pre id=\"cikti\"[^>]*>(.*?)</pre>',open('dom.html').read(),re.S).group(1).strip().split('\n'))]"
```
Tek nesneyi görmek için `sahne.html?nesne=spor`; set kontrolü için `sahne.html` (→ `set.png`).

| Dosya | Nesne | Nerede |
| --- | --- | --- |
| `ok-mu-nok.png` | Başparmak yukarı (mavi eldiven, krem manşet) | OK mu NOK mu |
| `on-on-ama.png` | Kabarık yıldız | 10/10 ama |
| `casus-kim.png` | Büyüteç | Casus kim |
| `quiz-night.png` | Yanan ampul, soru işareti teli, hale | Quiz Night |
| `ayarlar.png` | Dişli çark | Ayarlar düğmesi |
| `ask-i-memnu.png` | Kalp | Aşk-ı Memnu paketi |
| `hababam-sinifi.png` | Spiralli defter | Hababam Sınıfı paketi |
| `prison-break.png` | Açık asma kilit | Prison Break paketi |
| `manifest.png` | Megafon | Manifest paketi |
| `emir-can-igrek.png` | Kulaklık | Emir Can İğrek paketi |
| `blok3.png` | Mikrofon | BLOK3 paketi |
| `mabel-matiz.png` | Bağlı iki nota | Mabel Matiz paketi |
| `spor.png` | Kupa (kulüp rengi yok) | Spor paketleri |
