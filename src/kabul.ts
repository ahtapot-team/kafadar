import { it } from 'vitest';

// true: o alan henüz yazılmadı, kabul testleri kırmızı olmalı (it.fails, CI kırılmaz).
// İlgili iş bitince geliştirici false yapar; bayrak açıkken "geçen" test CI'ı kırar
// (yani test gerçekten bir şey denemiyor demektir).
// cekirdek = #6 (oyuncular, kayıt, registry), oyun = #7 (OK mu NOK mu durum makinesi),
// kk25 = kart metni oy girişi ve açıklamada görünür kalır (#7 ekranları).
export const BEKLEYEN = { cekirdek: false, oyun: false, kk25: true };

export const kabul = BEKLEYEN.cekirdek ? it.fails : it;
export const kabulOyun = BEKLEYEN.oyun ? it.fails : it;
export const kabulKk25 = BEKLEYEN.kk25 ? it.fails : it;
