import { durumGecerliMi as casusGecerliMi } from './casus-kim/casus';
import { okMuNok } from './ok-mu-nok';
import { durumGecerliMi as okGecerliMi } from './ok-mu-nok/oyun';
import { durumGecerliMi as ononGecerliMi } from './on-on-ama/onon';
import { durumGecerliMi as quizGecerliMi } from './quiz-night/quiz';
import type { Oyun } from './oyun';

const CASUS_MIN = 3; // oyuncu alt sınırı; tanıtımdaki kişi sayısı da bundan türer

// Yeni oyun: modülünü yazıp buraya bir satır eklemek yeterli.
export const oyunlar: Oyun[] = [
  {
    ...okMuNok,
    modSecimi: true,
    ekran: () => import('../oyun-ekranlari/ok-mu-nok'),
    gecerliMi: okGecerliMi,
    tanitim: {
      kisi: '2–12 kişi',
      metin:
        'Kartta bir durum çıkar: "İlk buluşmada hesabı bölmek". 3-2-1\'de herkes başparmağıyla OK (yukarı) ya da NOK (aşağı) gösterir. Telefonu tutan kişi oyları girer, sonra kimin tek başına kaldığı ortaya çıkar. Oda modunda herkes kendi telefonundan oy verir.',
    },
  },
  {
    id: '10-10-ama',
    ad: '10/10 ama',
    emoji: '🔟',
    gorsel: 'assets/gorsel/on-on-ama.webp',
    aktif: true,
    modSecimi: true, // Tek telefon / Oda kur / Odaya katıl (KK-63)
    kurulum: '/onon/hazirlik',
    ekran: () => import('../oyun-ekranlari/on-on-ama'),
    gecerliMi: ononGecerliMi,
    tanitim: {
      kisi: '2–12 kişi',
      metin:
        'Kartta kusursuz biri ve bir "ama" var: "10/10 ama sabah 5\'te kalkıyor". Herkes parmaklarıyla 0–10 arası yeni puanını gösterir, telefonu tutan kişi puanları girer. Ortalama ve en uç puanlar açıklanır. Oda modunda puanlar gizlidir ve her karttan sonra açılır.',
    },
  },
  {
    id: 'casus-kim',
    ad: 'Casus kim',
    emoji: '🕵️',
    gorsel: 'assets/gorsel/casus-kim.webp',
    aktif: true,
    minOyuncu: CASUS_MIN,
    kurulum: '/casus/hazirlik',
    ekran: () => import('../oyun-ekranlari/casus-kim'),
    gecerliMi: casusGecerliMi,
    tanitim: {
      kisi: `${CASUS_MIN}–12 kişi`,
      metin:
        'Telefon elden ele dolaşır. Herkes aynı kelimeyi görür, casus ise yalnızca bir ipucu. Sırayla birbirinize kelimeyle ilgili sorular sorun, ama kelimeyi söylemeyin. Sonunda casusu oylayın. Yakalanan casus kelimeyi bilirse yine kazanır.',
    },
  },
  {
    id: 'quiz-night',
    ad: 'Quiz Night',
    emoji: '🧠',
    gorsel: 'assets/gorsel/quiz-night.webp',
    onecikan: true,
    aktif: true,
    modSecimi: true,
    minOyuncu: 1,
    kurulum: '/quiz/paket',
    ekran: () => import('../oyun-ekranlari/quiz'),
    gecerliMi: quizGecerliMi,
    tanitim: {
      kisi: '1–12 kişi',
      metin:
        'Bir dizi seç, 10 soru gelsin: kolaydan zora, 4 şık. Bildiğin kadar puan, sonunda bir unvan. Tek başına kendi hızında oynarsın; tek telefonda grup modunda telefonu tutan okur, herkes sesli cevaplar, "Cevabı göster"den sonra bilenler işaretlenir. Oda modu yakında.',
    },
  },
];
