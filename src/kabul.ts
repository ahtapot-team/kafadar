import { it } from 'vitest';

// Geliştirme başlarken true: uygulama henüz yok, kabul testleri kırmızı olmalı.
// Backend/frontend ilgili testleri yeşile çevirince bunu false yapar;
// bu bayrak açıkken "geçen" test CI'ı kırar (yani test gerçekten bir şey denemiyor demektir).
export const BEKLEYEN = true;

export const kabul = BEKLEYEN ? it.fails : it;
