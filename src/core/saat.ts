// Zamana bağlı mantık saati parametre olarak alır; testte sahte saat verilir.
export type Saat = () => number;

export const gercekSaat: Saat = () => Date.now();
