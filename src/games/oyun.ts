// Oyun sözleşmesi: yeni oyun = bu tipte bir kayıt + registry.ts'ye bir satır.
// aktif=false: ana ekranda "Yakında" olarak görünür, açılmaz (KK-1).
export type Oyun = { id: string; ad: string; aktif: boolean };
