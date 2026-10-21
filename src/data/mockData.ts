import { Product, Ingredient, Review, CookingStep, Recipe } from '../types';

export const ASSETS = {
  logo: '/logo.svg',
  heroSteamingBowl: '/images/hero-tarhana-2026.webp',
  womanTasting: '/images/woman-tasting.webp',
  flatlayIngredients: '/images/ingredients-flatlay-2026.webp',
  productClassic: '/images/urun-klasik.webp',
};

export const PRODUCTS: Product[] = [
  {
    id: 'tarhana-classic',
    name: 'Geleneksel Tarhana',
    tag: 'Tek Çeşit · 1 kg',
    tagColor: 'primary',
    rating: 4.9,
    reviewsCount: 420,
    description: '1 kg pamuk torba. Klasik, katkısız, güneşte kurutulmuş geleneksel tarhana.',
    details:
      'Taş değirmen buğday unu, köy yoğurdu, tarla domatesi, közlenmiş kapya biber, az miktarda nohut unu ve kaya tuzuyla hazırlanır. Hamur yoğrulup ince açılır; güneşte ve hava akımında kurutulur. Koruyucu, renklendirici veya aroma verici içermez.',
    price: 500,
    weight: '1 kg Pamuk Torba',
    image: ASSETS.productClassic,
    category: 'classic',
    ingredients: [
      'Taş Değirmen Buğday Unu',
      'Köy Tipi Süzme Yoğurt',
      'Tarla Domatesi',
      'Közlenmiş Kapya Biber',
      'Az Miktarda Nohut Unu',
      'Dağ Kekiği & Nane',
      'Kaya Tuzu'
    ],
    nutrition: {
      calories: 342,
      protein: '15.4g',
      fiber: '11.8g',
      carbs: '62.1g',
      fat: '3.2g'
    },
    inStock: true,
    isPopular: true
  }
];

export const INGREDIENTS: Ingredient[] = [
  {
    id: 1,
    number: 1,
    name: 'Taş Değirmen Buğday Unu',
    description: 'Karakılçık buğdayının rüşeymi ve kepeği ayrılmadan öğütülmüş besleyici unu.',
    source: 'Gediz Vadisi Taş Değirmenleri',
    benefits: ['Geleneksel taş değirmen', 'Buğdayın doğal kepeği', 'Tarhanaya kıvam'],
    iconName: 'bakery_dining',
    badgeBg: 'bg-tertiary-fixed'
  },
  {
    id: 2,
    number: 2,
    name: 'Köy Tipi Süzme Yoğurt',
    description: 'Otlayan ineklerin sütünden geleneksel usulle yapılmış, ekşimsi ve koyu kıvamlı yoğurt.',
    source: 'Ege & Tire Yaylaları',
    benefits: ['Köy sütünden', 'Doğal ekşilik ve kıvam', 'Kalsiyum ve protein'],
    iconName: 'water_drop',
    badgeBg: 'bg-surface-container-high'
  },
  {
    id: 3,
    number: 3,
    name: 'Tarla Domatesi',
    description: 'Ağustos güneşinde kızarmış, mis kokulu tarla domatesleri.',
    source: 'Çanakkale & Bursa Ovaları',
    benefits: ['Güneşte olgunlaşmış', 'Doğal tat', 'Likopen'],
    iconName: 'nutrition',
    badgeBg: 'bg-primary-fixed'
  },
  {
    id: 4,
    number: 4,
    name: 'Közlenmiş Kapya Biber',
    description: 'Köz ateşiyle tatlanan, tatlı ve etli kapya biberler.',
    source: 'Bursa Ovaları',
    benefits: ['Köz ateşinde hazırlanır', 'Tatlı aroma', 'Doğal renk'],
    iconName: 'local_fire_department',
    badgeBg: 'bg-secondary-fixed'
  },
  {
    id: 5,
    number: 5,
    name: 'Az Miktarda Nohut Unu',
    description: 'Hamurun içine az miktarda karıştırılan nohut unu; çorbaya hafif tokluk ve kıvam katar. Paket içinde ayrıca nohut gönderilmez.',
    source: 'Anadolu',
    benefits: ['Az miktarda kullanılır', 'Hafif tokluk', 'Doğal kıvam'],
    iconName: 'grain',
    badgeBg: 'bg-secondary-fixed'
  },
  {
    id: 6,
    number: 6,
    name: 'Dağ Kekiği & Nane',
    description: 'Yüksek rakımlı yaylalardan toplanan, uçucu yağları zengin aromatik kurutulmuş otlar.',
    source: 'Toros ve Madra Dağları',
    benefits: ['Dağ kekiği', 'Kuru nane', 'Ferah aroma'],
    iconName: 'local_florist',
    badgeBg: 'bg-surface-container-high'
  },
  {
    id: 7,
    number: 7,
    name: 'Kaya Tuzu (Rafinesiz)',
    description: 'Çankırı kaya tuzu mağaralarından çıkarılan, mineral dengesi korunmuş saf beyaz kristaller.',
    source: 'Çankırı Mağaraları',
    benefits: ['Rafinesiz kaya tuzu', 'Mineral içeriği', 'Doğal tat'],
    iconName: 'diamond',
    badgeBg: 'bg-tertiary-fixed'
  }
];

export const COOKING_STEPS: CookingStep[] = [
  {
    number: '01',
    title: 'Soğuk Suyla Çözündürün',
    description: '3 yemek kaşığı tarhanayı tencereye alın. Üzerine 1 su bardağı ılık/soğuk su ekleyip 5 dakika bekletin ve çırpıcıyla pürüzsüzce karıştırın.',
    durationMinutes: 5,
    tip: 'Sıcak su doğrudan dökülürse tarhana topaklanır; soğuk suyla bekletmek kadife kıvamın ilk sırrıdır.',
    badgeBg: 'bg-secondary-fixed text-on-secondary-fixed'
  },
  {
    number: '02',
    title: 'Kısık Ateşte Karıştırın',
    description: 'Üzerine 4 su bardağı et ya da kemik suyu ekleyin. Tahta kaşıkla kaynayana kadar aynı yönde ağır ağır karıştırarak kıvam bağlatın.',
    durationMinutes: 8,
    tip: 'Aynı yönde dairesel hareketlerle karıştırmak nişastanın homojen açılmasını ve ipeksi kıvam almasını sağlar.',
    badgeBg: 'bg-secondary-fixed text-on-secondary-fixed'
  },
  {
    number: '03',
    title: 'Tereyağlı Biberli Sos',
    description: 'Küçük bir tavada halis köy tereyağını eritin. Üzerine pul biber ve kuru nane ekleyip 30 saniye kokusu çıkana kadar çevirin.',
    durationMinutes: 3,
    tip: 'Tereyağı köpürdüğünde baharatları ekleyin; yakmadan ocaktan alın.',
    badgeBg: 'bg-secondary-fixed text-on-secondary-fixed'
  },
  {
    number: '04',
    title: 'Nane & Biberle Taçlandırın',
    description: 'Hazırladığınız tereyağlı sosu çorbaya gezdirin. Kaselere paylaştırıp üzerine bir tutam kuru nane serpin. Afiyetle için!',
    durationMinutes: 1,
    tip: 'Sosu servis anında hazırlayın; tereyağının kokusu ilk kaşıkta en yoğun halini alır.',
    badgeBg: 'bg-primary-fixed text-on-primary-fixed'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Sevgi Öztürk',
    initials: 'SÖ',
    location: 'İzmir',
    rating: 5,
    date: '2 gün önce',
    productName: 'Geleneksel Tarhana',
    content: 'Kapağını açtığım an ev buram buram çocukluğumun geçtiği Ege köyü gibi koktu. Kıvamı ve baharat dengesi harika.',
    verified: true,
    avatarColor: 'primary'
  },
  {
    id: 'rev-2',
    author: 'Burak Karadağ',
    initials: 'BK',
    location: 'Ankara',
    rating: 5,
    date: '1 hafta önce',
    productName: 'Geleneksel Tarhana',
    content: 'Kış aylarında hastalandığımda tek ilacım bu çorba oldu. Hazmı çok hafif, yoğurdun hafif ekşiliği tam ayarında. 3 paket daha sipariş verdim bile.',
    verified: true,
    avatarColor: 'secondary'
  },
  {
    id: 'rev-3',
    author: 'Ayşenur Yılmaz',
    initials: 'AY',
    location: 'İstanbul',
    rating: 5,
    date: '2 hafta önce',
    productName: 'Bebek Tarhanası (istek üzerine)',
    content: 'Kızım için tuzsuz hazırlanan versiyonu istedim, bayılarak içiyor. İçinde katkı maddesi olmaması anne olarak içimi çok rahatlatıyor.',
    verified: true,
    avatarColor: 'tertiary'
  },
  {
    id: 'rev-4',
    author: 'Mehmet Demir',
    initials: 'MD',
    location: 'Bursa',
    rating: 5,
    date: '3 hafta önce',
    productName: 'Geleneksel Tarhana',
    content: 'Paketi açarken hissettiğiniz özen ve nostalji paha biçilemez. Pamuk torba sayesinde tazeliğini koruyor; hediye olarak da aldım.',
    verified: true,
    avatarColor: 'primary'
  },
  {
    id: 'rev-5',
    author: 'Dr. Zeynep Aksoy',
    initials: 'ZA',
    location: 'Eskişehir',
    rating: 5,
    date: '1 ay önce',
    productName: 'Geleneksel Tarhana',
    content: 'Bir hekim ve anne olarak katkısız ve içeriği şeffaf gıdaları önemsiyorum. İçindekilerin açık olması ve tuz dengesi beni memnun etti.',
    verified: true,
    avatarColor: 'secondary'
  },
  {
    id: 'rev-6',
    author: 'Caner Erkin',
    initials: 'CE',
    location: 'Antalya',
    rating: 5,
    date: '1 ay önce',
    productName: 'Geleneksel Tarhana',
    content: 'Tereyağında nane ve pul biberle taçlandırmak çorbayı bambaşka bir noktaya taşıyor. Sıcacık, baharatlı ve tam kıvamında.',
    verified: true,
    avatarColor: 'tertiary'
  }
];

export const RECIPES_EBOOK: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Tereyağlı Klasik Anne Tarhanası',
    subtitle: 'Köy usulü 15 dakikalık şifa ritüeli',
    prepTime: '15 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Kolay',
    ingredients: [
      '3 dolu yemek kaşığı TarhanaTerapi Geleneksel Tarhanası',
      '1 su bardağı soğuk su (ıslatmak için)',
      '4 su bardağı ilikli kemik suyu veya sıcak su',
      '1 yemek kaşığı köy tereyağı',
      '1 tatlı kaşığı nane ve yarım çay kaşığı pul biber'
    ],
    steps: [
      'Tarhanayı tencereye alın, 1 bardak soğuk su ile 5 dakika bekletip çırpın.',
      'Kemik suyunu ekleyin ve orta ateşte kaynayana kadar devamlı karıştırın.',
      'Kaynamaya başlayınca ocağı en kısığa alın ve 5 dakika kıvam almasını bekleyin.',
      'Ayrı tavada tereyağını eritin, nane ve pul biberi ekleyip 30 saniye kokusu çıkana kadar çevirin.',
      'Çorbayı kaselere paylaştırıp tereyağlı sosu köpürterek üzerine gezdirin.'
    ],
    chefNote: 'Tarhana kaynamadan önce asla tencerenin başından ayrılmayın ve tahta kaşık kullanın.',
    servingIdea: 'Yanında bir dilim köy ekmeği ve bir kaşık süzme yoğurtla servis edin.'
  },
  {
    id: 'recipe-2',
    title: 'Fırınlanmış Sarımsaklı İlikli Tarhana',
    subtitle: 'Kış aylarında bağışıklık kalkanı',
    prepTime: '25 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Orta',
    ingredients: [
      '4 yemek kaşığı TarhanaTerapi Geleneksel Tarhanası',
      '1 baş fırınlanıp püre yapılmış sarımsak',
      '5 su bardağı yoğun kemik suyu',
      '1 tatlı kaşığı dağ kekiği',
      '1 yemek kaşığı sade yağ (ghee)'
    ],
    steps: [
      'Sarımsak başını zeytinyağlayıp 180 derece fırında 20 dakika yumuşatın ve püre haline getirin.',
      'Soğuk suda açılan tarhanayı kemik suyu ve sarımsak püresiyle buluşturun.',
      'Kısık ateşte 10 dakika pişirin.',
      'Sade yağda kekiği cızırdatıp çorbanın üzerine dökün.'
    ],
    chefNote: 'Fırınlanmış sarımsak çiğ kokmaz, karamelize tatlımsı bir aroma bırakır.',
    servingIdea: 'Üzerine bir tutam taze kekik ve karabiber; yanında köy ekmeği.'
  },
  {
    id: 'recipe-3',
    title: 'Bebekler İçin Sebzeli İpeksi Tarhana',
    subtitle: '6. aydan itibaren ek gıda dostu formül',
    prepTime: '12 Dakika',
    servings: '2 Bebek Porsiyonu',
    difficulty: 'Çok Kolay',
    ingredients: [
      '2 tatlı kaşığı tuzsuz TarhanaTerapi tarhanası (istek üzerine)',
      '1.5 su bardağı su veya ev yapımı kemik suyu',
      'Yarım çay kaşığı sızma zeytinyağı'
    ],
    steps: [
      'Tarhanayı soğuk su ile küçük sos tenceresinde karıştırarak açın.',
      'Kısık ateşte 5-7 dakika kaynatın.',
      'Ocaktan aldıktan sonra sızma zeytinyağını ekleyin.',
      'Ilık sıcaklığa gelince bebeğinize servis edin.'
    ],
    chefNote: 'İlave tuz ve baharat eklenmez. Zeytinyağı pişirme bittikten sonra çiğ konmalıdır.',
    servingIdea: 'Ilık servis edin; yanında buharda pişmiş havuç veya kabak püresiyle deneyebilirsiniz.'
  },
  {
    id: 'recipe-4',
    title: 'Acılı Kapya Biberli Tarhana',
    subtitle: 'Közlenmiş biberin dumanıyla ısınan gurme kase',
    prepTime: '20 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Kolay',
    ingredients: [
      '4 yemek kaşığı TarhanaTerapi Geleneksel Tarhanası',
      '5 su bardağı sıcak su veya ilikli kemik suyu',
      '1 adet közlenmiş kapya biber (ince doğranmış)',
      '1 yemek kaşığı tereyağı',
      '1 çay kaşığı pul biber, yarım çay kaşığı kimyon',
      '1 diş sarımsak (isteğe bağlı)'
    ],
    steps: [
      'Tarhanayı 1 bardak soğuk suyla açıp topaksız hale getirin.',
      'Sıcak su veya kemik suyunu ekleyip orta ateşte sürekli karıştırarak kaynatın.',
      'Közlenmiş biberi ekleyip kısık ateşte 8-10 dakika pişirin.',
      'Tereyağını ayrı tavada eritin; pul biber, kimyon ve sarımsağı 30 saniye kokusu çıkana kadar çevirin.',
      'Çorbayı kaselere alın, biberli tereyağını üzerine gezdirin.'
    ],
    chefNote: 'Pul biberi en son ekleyerek acılığı damak zevkine göre ayarlayın.',
    servingIdea: 'Yanında bir dilim köy ekmeği ve bir kaşık süzme yoğurtla servis edin.'
  },
  {
    id: 'recipe-5',
    title: 'Mantarlı Kremalı Tarhana',
    subtitle: 'Sonbahar akşamlarına ipeksi bir dokunuş',
    prepTime: '25 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Orta',
    ingredients: [
      '4 yemek kaşığı TarhanaTerapi Geleneksel Tarhanası',
      '4 su bardağı sıcak su veya ilikli kemik suyu',
      '250 gram mantar (ince dilimlenmiş)',
      '1 yemek kaşığı tereyağı + 1 yemek kaşığı zeytinyağı',
      '1 küçük soğan (ince doğranmış)',
      'Yarım su bardağı süt veya krema',
      'Yarım çay kaşığı tuz, karabiber ve taze kekik'
    ],
    steps: [
      'Tereyağı ve zeytinyağında soğanı 2 dakika kavurun.',
      'Mantarları ekleyip suyunu çekene kadar orta ateşte pişirin.',
      'Ayrı kapta açtığınız tarhanayı ve sıcak suyu ekleyip sürekli karıştırarak kaynatın.',
      'Kısık ateşte 10 dakika pişirin; arzu ederseniz el blenderından geçirin.',
      'Süt veya kremayı ekleyip karıştırın, kaynatmadan ocaktan alın; tuz ve karabiberle tatlandırın.'
    ],
    chefNote: 'Krema eklendikten sonra kaynatmayın; sadece ısıtın, aksi halde çorba ayrışabilir.',
    servingIdea: 'Üzerine taze kekik ve karabiber; yanında köy ekmeği.'
  },
  {
    id: 'recipe-6',
    title: 'Tavuklu Sebzeli Tarhana',
    subtitle: 'Tek tencerede doyurucu akşam yemeği',
    prepTime: '30 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Kolay',
    ingredients: [
      '3 yemek kaşığı TarhanaTerapi Geleneksel Tarhanası',
      '5 su bardağı tavuk suyu',
      '1 su bardağı haşlanmış tavuk eti (didiklenmiş)',
      '1 adet havuç (küp doğranmış)',
      '1 adet patates (küp doğranmış)',
      'Yarım su bardağı bezelye',
      '1 yemek kaşığı tereyağı, tuz ve karabiber',
      'Servis için limon'
    ],
    steps: [
      'Tereyağını tencerede eritip havuç ve patatesi 3-4 dakika kavurun.',
      'Tavuk suyunu ekleyip sebzeler yumuşayana kadar 8-10 dakika kaynatın.',
      'Soğuk suyla açtığınız tarhanayı ekleyin ve sürekli karıştırarak 10 dakika pişirin.',
      'Haşlanmış tavuk etini ve bezelyeyi ekleyip 5 dakika daha pişirin.',
      'Tuz ve karabiberle tatlandırın; servis sırasında limon sıkın.'
    ],
    chefNote: 'Tavuk önceden pişmiş olmalı. Çiğ tavuk kullanırsanız çorbayı 15 dakika daha kaynatın.',
    servingIdea: 'Limon ve pul biberle; yanında yoğurtlu semizotu salatası.'
  },
  {
    id: 'recipe-7',
    title: 'Fırında Tarhana Cipsi',
    subtitle: 'Çay saatine şifalı çıtırlık',
    prepTime: '20 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Kolay',
    ingredients: [
      '3 yemek kaşığı TarhanaTerapi Geleneksel Tarhanası',
      'Yarım su bardağı ılık su',
      '1 yemek kaşığı zeytinyağı',
      'Yarım çay kaşığı tatlı kırmızı biber',
      'Yarım çay kaşığı kuru nane',
      '1 tatlı kaşığı susam',
      'Bir tutam tuz'
    ],
    steps: [
      'Tarhana, ılık su ve tuzu koyu bir macun kıvamına gelene kadar karıştırın; 10 dakika dinlendirin.',
      'Fırını 170 °C’ye ısıtın. Hamuru yağlı kağıt üzerinde 2-3 mm kalınlığında yayın.',
      'Bıçakla üçgen dilimler çizin; üzerine zeytinyağı sürüp baharat ve susam serpin.',
      '12-15 dakika, kenarları altın rengi olana kadar pişirin.',
      'Fırından alıp tamamen soğutun; kapalı kapta 3 gün saklayabilirsiniz.'
    ],
    chefNote: 'Hamur ne kadar ince olursa o kadar çıtır olur; son 3 dakika fırının başında kalın.',
    servingIdea: 'Yoğurtlu dip, zeytinyağlı ezme veya yanında taze nane çayı ile.'
  },
  {
    id: 'recipe-8',
    title: 'Yoğurtlu Soğuk Tarhana Çorbası',
    subtitle: 'Sıcak yaz günlerine serin şifa',
    prepTime: '15 Dakika + Dinlendirme',
    servings: '4 Kişilik',
    difficulty: 'Kolay',
    ingredients: [
      '3 yemek kaşığı TarhanaTerapi Geleneksel Tarhanası',
      '2 su bardağı su',
      '1,5 su bardağı soğuk süzme yoğurt',
      '1 adet salatalık (rendelenmiş)',
      '1 yemek kaşığı zeytinyağı',
      '1 tatlı kaşığı kuru nane, tuz ve buz'
    ],
    steps: [
      'Tarhanayı suyla açıp kısık ateşte 8-10 dakika pişirin.',
      'Çorbayı ocaktan alıp tamamen soğumaya bırakın.',
      'Ayrı kapta yoğurdu çırpın; rendelenmiş salatalığı ekleyin.',
      'Soğuyan tarhanayı yoğurtlu karışıma yavaşça ekleyip karıştırın; tuzla tatlandırın.',
      'En az 1 saat buzdolabında dinlendirin; servis kâselerine buz, zeytinyağı ve nane ile paylaştırın.'
    ],
    chefNote: 'Yoğurdu sıcak çorbaya doğrudan eklemeyin; önce çorbayı tamamen soğutun.',
    servingIdea: 'Buz gibi, üzerine nane yağı ve bir tutam pul biber.'
  }
];

export const FAQS = [
  {
    q: 'TarhanaTerapi nedir, ne üretir?',
    a: "TarhanaTerapi, Bursa Orhangazi'de aile tarifiyle, katkısız geleneksel tarhana üreten bir aile işletmesidir. Şu anda 1 kg pamuk torba geleneksel tarhana satışı vardır; acılı ve bebek/çocuk dostu versiyonlar istek üzerine hazırlanır."
  },
  {
    q: 'Tarhana fiyatları ne kadar?',
    a: "Ekim 2026 itibarıyla 1 kg geleneksel tarhana 500 TL'dir. Acılı ve bebek versiyonları istek üzerine hazırlanır; fiyat ve stok için iletişime geçebilirsiniz. 2000 TL üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL'dir."
  },
  {
    q: 'Kargo ücreti ne kadar, kaç günde teslim edilir?',
    a: "Siparişler aynı veya ertesi iş günü kargoya verilir; Türkiye geneli teslimat 1-3 iş günüdür. 2000 TL ve üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde kargo 150 TL'dir. Pamuk torbalar hava yastıklı koruyucu ambalajla gönderilir."
  },
  {
    q: 'Tarhana glutensiz mi, çölyak hastaları kullanabilir mi?',
    a: "Hayır. TarhanaTerapi tarhanası buğday unu içerdiği için glutensiz değildir ve çölyak hastaları için uygun değildir. Bebek versiyonu da buğday, süt ve nohut içerir; yalnızca ilave tuz ve acı biber kullanılmaz."
  },
  {
    q: 'Tarhana nerede üretiliyor?',
    a: "Üretim, Bursa Orhangazi'deki Gedelek Köyü Mevkii No: 28 adresindeki aile atölyesinde yapılır. İstanbul Kadıköy Moda'da bir tadım noktası bulunur. Siparişler Türkiye'nin her iline kargolanır."
  },
  {
    q: 'Tarhana nasıl pişirilir?',
    a: "Bir kase tarhanayı 1-2 bardak soğuk suyla topak kalmayacak şekilde karıştırın. Kaynayan et suyu veya suya ekleyip 10-15 dakika kısık ateşte karıştırarak pişirin. Üzerine tereyağında nane ve pul biber ekleyebilirsiniz."
  },
  {
    q: 'Nohut ayrıca gönderiliyor mu?',
    a: "Hayır. Nohut, hamura az miktarda nohut unu olarak katılır; paket içinde ayrı nohut bulunmaz. Ürün nohut içerdiği için alerjen bilgisine dikkat edilmelidir."
  },
  {
    q: 'Tarhana nasıl üretilir?',
    a: "Taş değirmen buğday unu, köy yoğurdu, domates, közlenmiş kapya biber, az miktarda nohut unu ve baharatlar karıştırılır. Hamur yoğrulup ince açılır; güneşte ve hava akımında kurutulur. Uzun dinlendirme veya bekleme süreci yoktur."
  },
  {
    q: 'Bebek tarhanası kaçıncı aydan itibaren verilebilir?',
    a: "Bebek/çocuk dostu versiyon istek üzerine tuzsuz ve acısız hazırlanır. Doktorunuza danışarak 6. aydan itibaren ek gıdaya geçişte kullanılabilir. Şu anda standart katalogda yer almaz; sipariş öncesi iletişime geçin."
  },
  {
    q: 'Açıldıktan sonra nasıl saklanmalıdır?',
    a: "Güneş görmeyen, serin ve kuru bir kilerde veya kapalı saklama kabında buzdolabında 1 yıla kadar tazeliğini korur. İçinde kimyasal koruyucu olmadığı için nemden uzak tutulmalıdır."
  }
];
