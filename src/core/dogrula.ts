// Kayıt doğrulayıcılarının ortak yardımcıları (durumGecerliMi, KK-14). Saf; oyun modülleri bunları kullanır.
export const nesne = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

export const metinDizisi = (x: unknown): x is string[] =>
  Array.isArray(x) && x.every((m) => typeof m === 'string');

// Boş olmayan metinlerden oluşan dizi.
export const doluMetinler = (x: unknown): x is string[] =>
  Array.isArray(x) && x.every((s) => typeof s === 'string' && s !== '');

export const benzersiz = (a: string[]) => new Set(a).size === a.length;

// 0–10 tam sayı puan (10/10 ama: tek telefon ve oda modu).
export const puanMi = (p: unknown): p is number =>
  typeof p === 'number' && Number.isInteger(p) && p >= 0 && p <= 10;
