export interface GuideSection {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  title: string;
  h1: string;
  description: string;
  updated: string;
  readingMinutes: number;
  intro: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  relatedProducts: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'tarhana-nasil-kurutulur',
    title: 'Tarhana Nasıl Kurutulur? Güneşte Kurutma Rehberi',
    h1: 'Tarhana Nasıl Kurutulur?',
    description:
      "Ev yapımı tarhana hamuru nasıl açılır, güneşte kaç günde kurur, kuruturken nelere dikkat edilir ve kuruduktan sonra nasıl saklanır? Adım adım rehber.",
    updated: '2026-10-21',
    readingMinutes: 6,
    intro:
      "Tarhana kurutma, hazırlanan hamurun ince açılıp nemini kaybetmesi sürecidir. Doğru hava akımı, temiz bir bez ve düzenli çevirme ile tarhana 5-10 günde kurur. Kurutma, tarhananın hem raf ömrünü hem de çorbanın kıvamını belirler.",
    sections: [
      {
        h2: 'Hamur kurutmaya nasıl hazırlanır?',
        paragraphs: [
          'Hamur, kurutma gününde fazla suyunu bırakana kadar yoğrulur. Hamur çok sulu kalırsa kuruma süresi uzar ve ekşime artar. Bu yüzden hamurun ele yapışmayan, toparlanan bir kıvamda olması gerekir.',
          'Hamur, temiz bir bez veya tahta üzerinde 2-3 mm kalınlığında ince açılır. Kalın açılan tarhana dışarıdan kurur, içi nemli kalır; bu da kısa sürede küflenmeye yol açar.',
        ],
        bullets: [
          'Hamuru kurutmadan önce iyice yoğurun ve fazla suyunu bırakın.',
          '2-3 mm kalınlığında, eşit aralıklarla açın.',
          'Kurutma bezini temiz ve kuru tutun.',
        ],
      },
      {
        h2: 'Kurutma ortamı nasıl olmalı?',
        paragraphs: [
          'Tarhana doğrudan yakıcı güneşten çok, güneş alan ve hava akımı olan bir ortamda kurur. Balkon, avlu veya güneş alan bir oda uygundur. Nem oranı yüksek günlerde kuruma yavaşlar; bu nedenle yağmurlu ve çok nemli havalarda tarhana dışarıda bırakılmamalıdır.',
          'Kurutma sırasında bezin üzerine sinek, toz veya yağmur gelmemesi gerekir. Üzerini tülbentle kapatmak, hava akımını engellemeyecek şekilde koruma sağlar.',
        ],
        bullets: [
          'Güneş alan, havadar ve tozsuz bir yer seçin.',
          'Yağmur ve yüksek nem riskinde içeri alın.',
          'Tülbent veya temiz bezle toz ve böcekten koruyun.',
        ],
      },
      {
        h2: 'Tarhana kaç günde kurur?',
        paragraphs: [
          'İnce açılan tarhana, hava koşullarına göre genellikle 5-10 günde kurur. Sıcak ve kuru havada süre kısalır; serin ve nemli havada uzar. Kuruma süresini kısaltmak için fırın veya yüksek ısı kullanmak, tarhananın aromasını ve dokusunu bozabilir.',
          'Tarhananın kuruduğu, elle kırıldığında kolayca kırılmasından ve içinin nemli olmamasından anlaşılır. Kalın parçalar kurumamışsa birkaç gün daha bekletilmelidir.',
        ],
      },
      {
        h2: 'Kuruduktan sonra nasıl saklanır?',
        paragraphs: [
          'Kuruyan tarhana temiz bir elekle elenir veya rondodan geçirilir. Nefes alan pamuk torba ya da kapalı saklama kabı içinde, güneş görmeyen serin ve kuru bir yerde saklanır. Nem alan tarhana kısa sürede ekşir veya küflenir.',
          'Kapalı saklama kabında kapak kapalı tutulduğunda tarhana 1 yıla kadar tazeliğini korur. Açılan ürünün buzdolabında saklanması, özellikle yaz aylarında ekşime riskini azaltır.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Tarhana güneşte mi gölgede mi kurutulur?',
        a: 'Tarhana doğrudan yakıcı güneş yerine, güneş alan ve hava akımı olan bir yerde kurutulur. Amaç nemi uzaklaştırmak, aromayı korumaktır.',
      },
      {
        q: 'Tarhana kururken ekşir mi?',
        a: 'Hafif ekşilik normaldir; tarhana yoğurt ve sebzelerle hazırlanan bir gıdadır. Ancak keskin koku, yapışkanlık veya küf varsa ürün bozulmuş olabilir ve tüketilmemelidir.',
      },
      {
        q: 'Kurutma süresi neden değişir?',
        a: 'Hamurun kalınlığı, hava sıcaklığı, nem oranı ve hava akımı kuruma süresini değiştirir. İnce açılan hamur daha çabuk kurur.',
      },
    ],
    relatedProducts: ['tarhana-classic'],
  },
  {
    slug: 'bebeklere-tarhana-ne-zaman-verilir',
    title: 'Bebeklere Tarhana Ne Zaman Verilir? Ay Ay Rehber',
    h1: 'Bebeklere Tarhana Ne Zaman Verilir?',
    description:
      'Bebeklere tarhana kaçıncı ayda verilir, tuz ve acı ne zaman eklenir, alerjen riski nasıl yönetilir? Doktora danışarak uygulanacak güvenli ek gıda rehberi.',
    updated: '2026-10-21',
    readingMinutes: 5,
    intro:
      "Bebeklere tarhana, genellikle 6. aydan sonra ek gıdaya geçişle birlikte, doktor onayıyla ve tuzsuz olarak verilebilir. Tarhana buğday, süt ve nohut içerdiği için alerjen açısından dikkatli başlanmalıdır. Bu rehber bilgilendirme amaçlıdır; bebeğinizin beslenme planı için çocuk doktorunuza danışın.",
    sections: [
      {
        h2: 'Bebek tarhanası kaçıncı ayda başlar?',
        paragraphs: [
          'Ek gıdaya geçiş çoğunlukla 6. ayda başlar. Bebeğin baş kontrolü, oturma becerisi ve yutma refleksi hazırsa doktorunuza danışarak tarhana gibi tahıl bazlı çorbalara başlanabilir. 6. aydan önce tarhana verilmesi önerilmez.',
          'İlk denemede 1-2 tatlı kaşığı ile başlanır. Bebeğin tepkisi izlenir; üç gün kuralı uygulanarak yeni alerjenler tek tek denenir.',
        ],
        bullets: [
          '6. aydan önce başlamayın.',
          'İlk porsiyonu 1-2 tatlı kaşığı tutun.',
          'Yeni bir ürünü 3 gün boyunca tek başına deneyin.',
        ],
      },
      {
        h2: 'Tuz ve acı ne zaman eklenir?',
        paragraphs: [
          'Bebek beslenmesinde 1 yaşından önce ilave tuz önerilmez. Bu nedenle bebek versiyonu istek üzerine tuzsuz ve acısız hazırlanır. Yetişkin tarhanasından bebeğe vermek için yıkama veya seyreltme yeterli değildir; tuz ve acı biber tamamen çıkarılamaz.',
          'TarhanaTerapi bebek versiyonu ilave tuz ve acı biber içermez. Yine de ürün etiketindeki içindekiler ve alerjen bilgisi her alımda kontrol edilmelidir.',
        ],
      },
      {
        h2: 'Alerjen riski nasıl yönetilir?',
        paragraphs: [
          'Tarhana buğday (gluten), süt (yoğurt) ve nohut içerir. Bu besinlere karşı bilinen alerji veya çölyak hastalığı varsa tarhana kullanılmamalıdır. İlk denemede döküntü, kusma, ishal, hırıltı veya şişlik gibi belirtiler görülürse beslenme durdurulup sağlık kuruluşuna başvurulmalıdır.',
          'Aile hekiminiz veya çocuk doktorunuz, bebeğinizin alerji geçmişine göre tarhana başlangıcı için en doğru zamanı söyleyecektir.',
        ],
      },
      {
        h2: 'Bebek tarhanası nasıl pişirilir?',
        paragraphs: [
          'Tarhana, soğuk suyla topak kalmayacak şekilde karıştırılır ve kısık ateşte 10-15 dakika pişirilir. Bebeğin yaşına göre püre kıvamında, ilave tuz ve acı olmadan servis edilir. İlk aylarda sade; ilerleyen aylarda sebze püresiyle birlikte verilebilir.',
          'Pişirilen porsiyon bebeğe özel olmalı, yetişkin tabağından kaşıkla alınmamalıdır. Artan yemek tekrar ısıtılmadan buzdolabında saklanmalı ve 24 saat içinde tüketilmelidir.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Bebeğe tarhana kaçıncı ayda verilir?',
        a: 'Genellikle 6. aydan sonra, ek gıdaya geçişle ve doktor onayıyla verilebilir. 6. aydan önce önerilmez.',
      },
      {
        q: 'Bebek tarhanası tuzsuz mu?',
        a: 'TarhanaTerapi bebek versiyonu istek üzerine ilave tuzsuz ve acısız hazırlanır. Yine de 1 yaşından önce hiçbir bebek yemeğine tuz eklenmemelidir.',
      },
      {
        q: 'Tarhana alerji yapar mı?',
        a: 'Buğday, süt ve nohut içerdiği için alerjisi olan bebeklerde risk vardır. İlk denemede üç gün kuralı uygulanmalı ve belirti görülürse doktora başvurulmalıdır.',
      },
    ],
    relatedProducts: ['tarhana-classic'],
  },
  {
    slug: 'tarhana-neden-eksir',
    title: 'Tarhana Neden Ekşir? Ekşilik, Nem ve Saklama',
    h1: 'Tarhana Neden Ekşir?',
    description:
      'Tarhananın ekşimesi normal mi, bozulma nasıl anlaşılır? Nem, saklama hatası ve küf arasındaki farklar ile çözüm önerileri.',
    updated: '2026-10-21',
    readingMinutes: 5,
    intro:
      "Tarhana, yoğurt ve sebzelerle hazırlandığı için doğal olarak hafif ekşimsi bir tat taşır. Sorun, ekşiliğin keskin ve rahatsız edici hale gelmesi, yapışkanlık, renk değişimi veya küf oluşmasıdır. Ekşimenin başlıca nedenleri nem, sıcaklık, yetersiz kurutma ve uzun süre açık saklamadır.",
    sections: [
      {
        h2: 'Hafif ekşilik normal mi?',
        paragraphs: [
          'Tarhana, yoğurt ve sebzelerle hazırlanan bir hamurdan yapılır. Bu nedenle doğal bir ekşimsi tat taşır. Çorbanın kıvamı ve kokusu dengeliyse, hafif ekşilik bir bozulma işareti değildir.',
          'Ekşilik zamanla artabilir. Özellikle sıcak ve nemli ortamda bekleyen tarhana nem çekerek keskin bir tat kazanır.',
        ],
      },
      {
        h2: 'Bozulma nasıl anlaşılır?',
        paragraphs: [
          'Küf, yeşil-siyah lekeler, yapışkan kıvam, keskin ve ağır koku bozulma işaretleridir. Bu durumda ürün tüketilmemelidir. Tadına bakarak emin olmaya çalışmak doğru değildir; küflü gıdaların görünmeyen kısımlarında da toksin bulunabilir.',
          'Renk değişimi tek başına bozulma demek değildir; ancak nemli bölgelerde topaklanma ve küf bir arada görülüyorsa ürün atılmalıdır.',
        ],
        bullets: [
          'Küf veya renkli lekeler varsa tüketmeyin.',
          'Yapışkan, topaklanmış ve ağır kokulu ürünü atın.',
          'Şüphedeyseniz tadına bakmayın.',
        ],
      },
      {
        h2: 'Saklama hatası ekşimeyi nasıl hızlandırır?',
        paragraphs: [
          'Tarhana nemden en çok etkilenen gıdalardan biridir. Açık bırakılan torba, nemli kiler veya sıcak mutfak, ürünün nem çekmesine ve ekşimesine yol açar. Saklama kabının kapağı her kullanımdan sonra tam kapatılmalıdır.',
          'Buzdolabı, özellikle yaz aylarında ekşimeyi yavaşlatır. Saklama kabı buzdolabına konmadan önce tamamen kuru olmalı; içine kaşıkla nem girmemelidir.',
        ],
      },
      {
        h2: 'Çorba neden fazla ekşi olur?',
        paragraphs: [
          'Çorbanın fazla ekşi olması, tarhananın kendisinden veya pişirme sırasında fazla tarhana kullanmaktan kaynaklanabilir. Daha az tarhana kullanmak, üzerine tereyağı ve nane eklemek ekşiliği dengeler.',
          'Ekşiliği azaltmak için tarhanayı yıkamak önerilmez; bu, ürünün yapısını ve lezzetini bozar. Doğru çözüm, doğru miktarda kullanmak ve serin yerde saklamaktır.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Tarhana ekşiyse bozulmuş mudur?',
        a: 'Hafif ekşilik normaldir. Keskin koku, yapışkanlık, renk değişimi veya küf varsa ürün bozulmuş olabilir ve tüketilmemelidir.',
      },
      {
        q: 'Tarhana buzdolabında saklanır mı?',
        a: 'Evet, özellikle yaz aylarında kapalı saklama kabında buzdolabında saklanabilir. Saklama kabının içi kuru olmalıdır.',
      },
      {
        q: 'Tarhana neden topaklanır?',
        a: 'Nem alan tarhana topaklanır. Topaklanma ile birlikte ağır koku veya küf varsa ürün kullanılmamalıdır.',
      },
    ],
    relatedProducts: ['tarhana-classic'],
  },
  {
    slug: 'ev-tarhanasi-ile-hazir-tarhana-farki',
    title: 'Ev Tarhanası ile Hazır Tarhana Arasındaki Fark',
    h1: 'Ev Tarhanası ile Hazır Tarhana Arasındaki Fark',
    description:
      'Ev yapımı tarhana ile markette satılan hazır tarhana arasındaki içerik, hazırlık, kurutma, katkı ve lezzet farkları. Satın alırken nelere bakmalı?',
    updated: '2026-10-21',
    readingMinutes: 5,
    intro:
      "Ev tarhanası ile hazır tarhana arasındaki en büyük fark içerik ve hazırlık sürecidir. Ev tarhanası un, yoğurt, sebze ve baharatla hazırlanıp güneşte kurutulur; hazır ürünlerde ise kıvam artırıcı, aroma verici veya tuz oranı yüksek formüller bulunabilir. Her hazır ürün katkılı değildir; fark ürün etiketinde ve üretim yönteminde ortaya çıkar.",
    sections: [
      {
        h2: 'İçerik ve katkı farkı',
        paragraphs: [
          'Ev tarhanasında malzeme listesi genellikle un, yoğurt, domates, biber, nohut unu, tuz ve baharattan oluşur. Hazır çorba tozlarında ise lezzet artırıcı, kıvam verici, renklendirici ve aroma verici bulunabilir. Bu nedenle satın alırken içindekiler listesini okumak gerekir.',
          'Katkısız bir tarhanada malzeme listesi kısa ve tanıdıktır. Listede "aroma verici", "lezzet artırıcı" veya "renklendirici" gibi ifadeler varsa ürün işlenmiş bir çorba karışımı olabilir.',
        ],
      },
      {
        h2: 'Hazırlık ve kurutma farkı',
        paragraphs: [
          'Ev tarhanası, hamurun özenle yoğrulup ince açılması ve güneşte kurutulmasıyla yapılır. Bu süreç ürüne kendine özgü tat, koku ve kıvam verir. Hazır ürünlerde kurutma süresi kısaltılabilir veya aroma ile taklit edilebilir.',
          'Kurutma yöntemi de lezzeti etkiler. Güneşte ve hava akımında kuruyan tarhana, fırında hızlı kurutulan ürüne göre daha fazla aroma kaybetmeden kurur.',
        ],
      },
      {
        h2: 'Karşılaştırma tablosu',
        paragraphs: [
          'Aşağıdaki tablo, ev tarhanası ile tipik bir hazır çorba karışımını genel hatlarıyla karşılaştırır. Her ürün farklıdır; kesin bilgi için etiketi okuyun.',
        ],
        bullets: [
          'İçindekiler: Ev tarhanası kısa liste; hazır ürünlerde katkı olabilir.',
          'Hazırlık: Ev tarhanası özenli yoğurma ve kurutma; hazır üründe kısa süreç.',
          'Kurutma: Ev tarhanası güneş/hava; hazır ürün fırın veya endüstriyel kurutma.',
          'Tuz: Ev tarhanası kontrollü; hazır çorbada yüksek olabilir.',
          'Lezzet: Ev tarhanası ekşimsi ve baharatlı; hazır ürün daha düz olabilir.',
        ],
      },
      {
        h2: 'Satın alırken nelere bakmalı?',
        paragraphs: [
          'Etikette içindekiler listesi, üretim yeri, üretim tarihi ve saklama koşulları okunmalıdır. "Organik" veya "katkısız" ifadesi tek başına yeterli değildir; sertifika numarası ve içerik listesi kontrol edilmelidir.',
          'Kapalı saklama kabı, ürünün nemden korunmasına yardımcı olur. Açıldıktan sonra serin ve kuru yerde saklanmalı, nemli kaşık kullanılmamalıdır.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Ev tarhanası daha mı sağlıklı?',
        a: 'Ev tarhanası genellikle daha kısa içerik listesine sahiptir. Ancak "sağlıklı" ifadesi kişiye göre değişir; tuz, gluten ve alerjen durumu etikete göre değerlendirilmelidir.',
      },
      {
        q: 'Hazır tarhana katkılı mıdır?',
        a: 'Her hazır ürün katkılı değildir. İçindekiler listesinde aroma verici, renklendirici veya kıvam artırıcı varsa ürün işlenmiştir.',
      },
      {
        q: 'Katkısız tarhana nasıl anlaşılır?',
        a: 'Kısa içindekiler listesi, tanıdık malzemeler, belirgin ekşimsi koku ve doğal renk katkısız ürünün işaretleridir. Kesin bilgi için etiket okunmalıdır.',
      },
    ],
    relatedProducts: ['tarhana-classic'],
  },
  {
    slug: 'katkisiz-tarhana-nasil-anlasilir',
    title: 'Katkısız Tarhana Nasıl Anlaşılır? Etiket Okuma',
    h1: 'Katkısız Tarhana Nasıl Anlaşılır?',
    description:
      'Katkısız tarhana etiketinden, renginden ve kokusundan nasıl anlaşılır? İçindekiler listesi, tuz oranı, saklama ve yanıltıcı ifadeler hakkında pratik rehber.',
    updated: '2026-10-21',
    readingMinutes: 4,
    intro:
      "Katkısız tarhana, kısa ve tanıdık bir içindekiler listesine sahiptir; koruyucu, renklendirici ve aroma verici içermez. Ancak ambalajdaki “doğal” veya “organik” ifadeleri tek başına yeterli değildir. Karar vermek için etiket, üretim yeri ve saklama koşulları birlikte okunmalıdır.",
    sections: [
      {
        h2: 'İçindekiler listesi nasıl okunur?',
        paragraphs: [
          'İçindekiler listesi, ürünün neyden yapıldığını gösterir. Katkısız bir tarhanada un, yoğurt, domates, biber, nohut unu, tuz ve baharat gibi malzemeler bulunur. Liste ne kadar kısaysa ürün o kadar az işlenmiştir.',
          'Aroma verici, renklendirici, kıvam artırıcı, koruyucu veya tatlandırıcı ifadeleri varsa ürün katkı içeriyordur. Bu ifadelerin bulunmaması, ürünün katkısız olduğunu gösterir.',
        ],
      },
      {
        h2: 'Renk ve koku ne söyler?',
        paragraphs: [
          'Doğal tarhana genellikle krem, açık kahve veya kızıl-kahve tonlarındadır. Aşırı parlak ve tek tip renk, renklendirici kullanıldığını düşündürebilir; ancak bu tek başına kanıt değildir.',
          'Tarhana ekşimsi ve baharatlı kokar. Keskin kimyasal koku, nem veya küf kokusu bozulma işareti olabilir.',
        ],
      },
      {
        h2: 'Tuz ve alerjen kontrolü',
        paragraphs: [
          'Tuz oranı bebekler, çocuklar ve tansiyon hastaları için önemlidir. Bebek versiyonu alırken “ilave tuzsuz” ifadesi ve içindekiler listesi kontrol edilmelidir.',
          'Tarhana buğday, süt ve nohut içerir. Gluten veya süt alerjisi olan kişiler için uygun değildir. Etiketteki alerjen uyarısı mutlaka okunmalıdır.',
        ],
      },
      {
        h2: 'Güvenilir üretici nasıl seçilir?',
        paragraphs: [
          'Üretim yeri, üretici adı, iletişim bilgisi ve üretim tarihi açıkça yazmalıdır. Üreticinin üretim sürecini ve içindekileri açıklaması güven verir.',
          'Fiyatı diğer ürünlerden aşırı düşük olan ürünlerde içerik ve gramaj kontrol edilmelidir. Ucuzluk tek başına kalite göstergesi değildir; gramaj ve içerik birlikte değerlendirilmelidir.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Katkısız tarhana hangi malzemeleri içerir?',
        a: 'Genellikle un, yoğurt, domates, biber, nohut unu, tuz ve baharat içerir. Koruyucu, renklendirici ve aroma verici bulunmaz.',
      },
      {
        q: 'Organik tarhana nasıl anlaşılır?',
        a: 'Organik ürünlerde sertifika numarası ve yetkili kuruluş bilgisi bulunur. Sadece “organik” yazması yeterli değildir.',
      },
      {
        q: 'Tarhana neden farklı renklerde olur?',
        a: 'Kullanılan biber, domates ve kurutma süresi renk farkını etkiler. Doğal tarhana tek tip renkte olmak zorunda değildir.',
      },
    ],
    relatedProducts: ['tarhana-classic'],
  },
];

export const guidePath = (guide: Pick<Guide, 'slug'>) => `/rehber/${guide.slug}`;
