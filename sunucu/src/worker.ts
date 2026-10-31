// Giriş: yönlendirme, oda kurma ve hız sınırı. Protokol (adres, mesajlar): src/oda/mesaj.ts; kurallar: src/oda/oda.ts.
import { kodGecerliMi, kodUret } from '../../src/oda/oda';
import { desteBul } from '../../src/icerik';
import { quizPaketiBul } from './quiz-paketler';
import { acilisOku } from '../../src/oda/mesaj';
import { type Env, hataSoketi, rastgele } from './ortak';

export default {
  async fetch(istek: Request, env: Env): Promise<Response> {
    const url = new URL(istek.url);
    if (url.pathname !== '/ws')
      return new Response('Kafadar oda sunucusu', { status: 200 });
    if (istek.headers.get('Upgrade')?.toLowerCase() !== 'websocket')
      return new Response('WebSocket bağlantısı gerekli.', { status: 426 });
    const acilis = acilisOku(url.searchParams);
    if (!acilis) return new Response('Geçersiz istek.', { status: 400 });

    // Odaya iletilen istek: dışarıdan gelen iç başlık atılır; belirteç yalnızca sunucunun kendi kurduğu odada verilir.
    const ilet = (adres: string, kimlik?: string) => {
      const r = new Request(adres, istek);
      r.headers.delete('x-ic-kimlik');
      if (kimlik) r.headers.set('x-ic-kimlik', kimlik);
      return r;
    };
    const ip = istek.headers.get('CF-Connecting-IP') ?? 'bilinmiyor';
    const sinir = env.SINIR.get(env.SINIR.idFromName(ip));

    if (acilis.islem === 'kur') {
      // Sınırsız oda açılmasın (Durable Object + alarm kotası): IP başına dakikada 5.
      if (!(await sinir.dene(`kur:${ip}`)))
        return hataSoketi(
          'cok-deneme',
          'Çok fazla oda kurdunuz. Biraz bekleyin.',
        );
      const tur = acilis.oyun ?? 'ok-mu-nok';
      // Quiz Night paketleri content/quiz'den gelir (yalnızca sunucuda; kaynaklar ve uyum buradan çıkmaz).
      const quiz =
        tur === 'quiz-night' ? quizPaketiBul(acilis.paket) : undefined;
      const deste =
        tur === 'quiz-night' ? undefined : desteBul(tur, acilis.paket);
      if (tur === 'quiz-night' ? !quiz : !deste)
        return hataSoketi('tanimsiz', 'Bilinmeyen deste.');
      for (let i = 0; i < 5; i++) {
        const kod = kodUret(rastgele);
        const kimlik = crypto.randomUUID();
        const oda = env.ODA.get(env.ODA.idFromName(kod));
        const yanit = await oda.fetch('https://oda/kur', {
          method: 'POST',
          body: JSON.stringify({
            kod,
            kurucuAd: acilis.ad,
            kurucuKimlik: kimlik,
            tur,
            deste,
            quiz,
            tohum: Math.floor(rastgele() * 2 ** 32),
          }),
        });
        if (yanit.status === 200)
          return oda.fetch(ilet('https://oda/ws?islem=kur', kimlik));
      }
      return hataSoketi('dolu', 'Oda kurulamadı, tekrar deneyin.');
    }

    const { islem, kod } = acilis;
    // Kod denemeleri istemci IP'sine göre hız sınırlıdır (KK-30). Yalnızca ISKALAYAN denemeler sayılır:
    // aynı Wi-Fi'daki (aynı IP) 12 oyuncunun katılışı engellenmesin. Belirteçle yeniden bağlanma sayılmaz.
    if (islem === 'katil' && !(await sinir.dene(ip)))
      return hataSoketi(
        'cok-deneme',
        'Çok fazla kod denediniz. Biraz bekleyin.',
      );
    if (!kodGecerliMi(kod)) return hataSoketi('kapali', 'Oda bulunamadı.');
    const oda = env.ODA.get(env.ODA.idFromName(kod));
    if (islem === 'katil' && (await oda.varMi())) await sinir.iade(ip);
    const ad = encodeURIComponent(islem === 'katil' ? acilis.ad : '');
    return oda.fetch(ilet(`https://oda/ws?islem=${islem}&ad=${ad}`));
  },
};
