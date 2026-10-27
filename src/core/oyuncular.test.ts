import { describe, expect, it } from 'vitest';
import { baslayabilir, taslakEkle } from './oyuncular';

describe("#26: Ekle'ye basılmadan Devam'a basılan isim kaybolmaz", () => {
  it('girdideki geçerli isim listeye eklenir ve Devam açılır', () => {
    // Ali eklendi, "Ayşe" yazıldı ama Ekle'ye basılmadı: tek isimle Devam pasifti.
    expect(baslayabilir(['Ali']).tamam).toBe(false);
    const liste = taslakEkle(['Ali'], ' Ayşe ');
    expect(liste).toEqual(['Ali', 'Ayşe']);
    expect(baslayabilir(liste).tamam).toBe(true);
  });
  it('aynı isim "Ali 2" olarak eklenir', () => {
    expect(taslakEkle(['Ali'], 'Ali')).toEqual(['Ali', 'Ali 2']);
  });
  it('boş ya da geçersiz taslak listeyi değiştirmez', () => {
    expect(taslakEkle(['Ali'], '   ')).toEqual(['Ali']);
    expect(taslakEkle(['Ali'], 'a'.repeat(17))).toEqual(['Ali']);
  });
  it('12 oyuncuda taslak eklenmez', () => {
    const on = Array.from({ length: 12 }, (_, i) => `O${i}`);
    expect(taslakEkle(on, 'Fazla')).toEqual(on);
  });
});
