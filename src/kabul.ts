import { it } from 'vitest';

// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// İlgili iş bitince geliştirici false yapar; bayrak açıkken "geçen" test CI'ı kırar
// (yani test gerçekten bir şey denemiyor demektir).
// KURAL: işi kapatan PR bayrağı ve sarmalayıcıyı SİLER, testleri düz `it`e çevirir (docs/KABUL-TESTLERI.md).
// Yeni özellikte QA (bayrak + sarmalayıcı) ekler; iş sürerken yalnızca açık işlerin bayrakları burada durur.
//
// tanitimMantik = tanıtım kartı görüldü bilgisi, politika, registry metinleri (#132),
// tanitimUi = tanıtım kartı ve "Nasıl oynanır?" ekranları, testID sözleşmesi (#132).
export const BEKLEYEN = {
  tanitimMantik: false,
  tanitimUi: false,
};

export const kabulTanitimMantik = BEKLEYEN.tanitimMantik ? it.fails : it;
export const kabulTanitimUi = BEKLEYEN.tanitimUi ? it.fails : it;
