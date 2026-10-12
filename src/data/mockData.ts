import { Product, Ingredient, Review, CookingStep, Recipe } from '../types';

export const ASSETS = {
  logo: '/logo.svg',
  heroSteamingBowl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7i02NIPaM8ghxMPaVT7TvxErjvIr3Dfn8diAiTZMVJMwXb5MiUS_Ytr7Y-99U--2PT23wUk6ZTvQnyMjgXJ1-v0Hz7XCLy7hMPQBQmNsp3k_dNwIxJx6qkdCCkxcKhruZ-ByLps-Y4tv1s2whyJM0hIxEkH3OtYxs7ddzghDmX3RWTdcjmfnut-tH15yQE-tXlq1CJa5aYy9ejkSmUbQbO32XhrVm0LoGurqF3KkprEPIYncc9tCy',
  womanTasting: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmyPyyT5vK_Te-GLQMSy216y8IxeVeWP9z0UeboXrpj9bnn8sibp5ezULgKvzd_cs0GflTYG3kS9yc_edQNkxypREmhtHJN8O7xdKFCs6yN5vcKQ4-pRM8BNTzV2Bd-wj-X1IrHI1Men4fXoIoYt4y9VMOfcuxCWgIT0fjYSt4V3OALdwGAMb9yVewxVFEZwk1UKGqRClCJIUbwoO379jx5enl6BkAhGahjd4MTZOszPBkbX1I7ixi',
  flatlayIngredients: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdcoIqaDEFTftw4eqE7e2HhRkxfUCrqsE7hof846DYa6gpxnwOM7a9og9N5l-JIL1G5Z0_OrNY14CvzKqq_y3SeuB0eaemXtXZlQPcWA_xCeZ7_4JiCP4mnnHX72k1ucgJkOdFzlAvXfadzZRw5kXRiOp5oRkPC6BHlGgQuKk06zSOKKs8rrQC0C4rEDWoPAURrjghIDvF2eucUqAoQ53nEgfVguswrV-i7gyAgWPgrRzSHtP_9nD1',
  productClassic: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRir_mkdMIg1Gsju3bt3RzMiTb4yoORkTilqQkP6zH7LkNwFOmT16Pzd2nQ3Bjttq6cg6f_SBTi4huQcaJ6kgZ9QJbo8g7fDuzuI2XgVWPrH_Yv4uwNnQysTWH3sv2faYGx1MuvcgdPFURo1aOQ_dMsF422Rz2SG4E6R1Ktkl2d33KxbWw1YzIuxf0ZVoWCXlygeM1kqWMRgy77Z2HrMrLcBo5iztxNrvZMu5StqVxuK_0Ir8EYfoY',
  productSpicy: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtRrtToN6XtcsHt5JmZ6mR4XGQPCAGvSxaktIlxr0mjDyEzCdal_4k_PAgT-LIhKno0-0r7mKmvjfB0vTvCajf0JOY8nszEas25Zq-UercFl1TwCTq4wQhMUajRDG-Nn3OTHoZ9pzYEUubmxlPazw24BNgd-N9-kPBtL6YtougRVT1owJot2J43TJbI2ZD0OnAPAb4AzCR8TXjJ_vmGVssJYzNo1eqe9-wxdyEabQi8SQNXsR0Tf3l',
  productBaby: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj3FwPwkYu2Zo-Bu5M-O1QmHYTgsVTTfIAy2TUvGaWju7NegWsv2Og9e7YFKMBB0KGL3N5eD6NjnywJOmHSnvpYGZ1XKXHEbFqs5tth-HyMSSEQvzf2qaRTLtSWqXc4FzouITMRZ_38L_NHNEdON8AwviliS9SiTU3z2zEr7XmsxDFtVFlG1yhty94oiQH76DlR9kUvmpmWyTnfqCZiPiwVzBqY5DvZBuhOGbL1pOLZCtyV3eR5NVW',
  productStarterSet: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBb6ADlqg5SBVHxOWzSKucWfYK6J4xMpaqFF-mZks4WhCvAKUV3v30UUUHfZmQxxwE_iDzC5CJev7VI8WtHo1kTYTgdH8KRHZPUEzY4qiR56yNgV_VVhKgI_Vx09Etkm0Wf4-wNYKAoqOD16zjuTuy-jGwn_pbZfSCewRs5jb-Rp7P6b-Q09IUGOXg3PCzWbze3qI_s8ODkK0hl61_a-ZN5rnG8MptXqtNZX65QfiI3M7TBYMsrbmDh',
};

export const PRODUCTS: Product[] = [
  {
    id: 'tarhana-classic',
    name: 'Geleneksel Nohutlu Anne Tarhanası',
    tag: 'En Çok Satan',
    tagColor: 'primary',
    rating: 4.9,
    reviewsCount: 420,
    description: '500g Cam Kavanoz. Klasik lezzet, yoğun aromalı süzme yoğurt ve güneşte kurutulmuş sebzeler.',
    details: '21 gün boyunca toprak küplerde dinlendirilen anne mayalı canlı tarhana hamuruna haşlanmış yerli koçbaşı nohutlar eşlik eder. Güneşte ağır ağır kurutulup geleneksel gözenekli eleklerden geçirilmiştir. Koruyucu, renklendirici veya katkı maddesi içermez.',
    price: 450,
    originalPrice: 520,
    weight: '500g Cam Kavanoz',
    image: ASSETS.productClassic,
    category: 'classic',
    ingredients: [
      'Ata Tohumu Koçbaşı Nohut',
      'Köy Tipi Süzme Yoğurt',
      'Taş Değirmen Karakılçık Buğday Unu',
      'Tarla Domatesi',
      'Közlenmiş Kapya Biber',
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
  },
  {
    id: 'tarhana-spicy',
    name: 'Acılı Gurme Terapisi',
    tag: 'Acıseverlere Özel',
    tagColor: 'secondary',
    rating: 4.8,
    reviewsCount: 215,
    description: '500g Cam Kavanoz. Maraş ipek pul biberi, dağ kekiği ve nohutla kavrulmuş iştah kabartan acılık.',
    details: 'Geleneksel fermantasyon sürecinde güneşte kurutulmuş acı Maraş biberi ve ipek pul biber eklenerek hazırlanır. Yoğurdun yumuşatıcı probiyotik etkisi acının yakıcılığını dengeler; kış aylarında metabolizmayı canlandıran sıcacık bir şölen sunar.',
    price: 500,
    originalPrice: 580,
    weight: '500g Cam Kavanoz',
    image: ASSETS.productSpicy,
    category: 'spicy',
    ingredients: [
      'Güneşte Kurutulmuş Maraş İpek Biberi',
      'Ata Tohumu Koçbaşı Nohut',
      'Köy Tipi Süzme Yoğurt',
      'Taş Değirmen Tam Buğday Unu',
      'Köz Kapya & Tarla Domatesi',
      'Kekik & Nane',
      'Kaya Tuzu'
    ],
    nutrition: {
      calories: 348,
      protein: '16.1g',
      fiber: '12.4g',
      carbs: '60.5g',
      fat: '3.5g'
    },
    inStock: true,
    isPopular: false
  },
  {
    id: 'tarhana-baby',
    name: 'Bebek & Çocuk Dostu Tarhana',
    tag: 'Tuzsuz & Yumuşak',
    tagColor: 'tertiary',
    rating: 5.0,
    reviewsCount: 310,
    description: '500g Pamuk Torba. İlave tuz içermez, ince çekilmiş nohut unu ve tatlı sebzelerle bebek damaklarına uygun.',
    details: '6. aydan itibaren ek gıdaya geçen bebekler ve hassas mideye sahip çocuklar için sıfır tuz ve sıfır acı formülüyle üretilmiştir. Havuç, tatlı balkabağı ve tatlı kapya biber püresiyle zenginleştirilmiş, sindirimi son derece kolaylaştırılmıştır.',
    price: 400,
    originalPrice: 460,
    weight: '500g Pamuk Torba',
    image: ASSETS.productBaby,
    category: 'baby',
    ingredients: [
      'İnce Öğütülmüş Koçbaşı Nohut Unu',
      'Tuzsuz Köy Yoğurdu',
      'Siyez Buğdayı Ruşeymli Unu',
      'Tatlı Bal Kabağı & Havuç',
      'Tatlı Kırmızı Kapya',
      'Doğal Nane Yaprakları'
    ],
    nutrition: {
      calories: 335,
      protein: '14.2g',
      fiber: '10.5g',
      carbs: '64.0g',
      fat: '2.8g'
    },
    inStock: true,
    isPopular: false
  },
  {
    id: 'tarhana-starter-set',
    name: 'TarhanaTerapi Başlangıç Seti',
    tag: 'Koleksiyon Seti',
    tagColor: 'primary-container',
    rating: 4.9,
    reviewsCount: 180,
    description: 'Toprak El Yapımı Kase + Şimşir Ağacı Kaşık + 500g Anne Tarhanası + Haşlanmış Koçbaşı Nohut.',
    details: 'Avanos ustaları tarafından çömlek çarkında elde şekillendirilip pişirilen terracotta kase, Karadeniz şimşir ağacından oyulmuş kaşık, 500g klasik kavanoz tarhana ve vakumlu haşlanmış çıtır nohut kavanozu ile eksiksiz bir Anadolu ritüeli hediyesi.',
    price: 750,
    originalPrice: 890,
    weight: 'Özel Hediye Kutusu (Tam Set)',
    image: ASSETS.productStarterSet,
    category: 'sets',
    ingredients: [
      '500g Geleneksel Nohutlu Anne Tarhanası',
      '250g Vakumlu Haşlanmış Organik Koçbaşı Nohut',
      'Elde Şekillendirilmiş Terracotta Toprak Kase',
      'Doğal Şimşir Kaşık',
      'Özel Şifa Kitapçığı'
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
  },
  {
    id: 'tarhana-family-pack',
    name: 'Kiler Boyu 1000g Pamuk Çuvallı Tarhana',
    tag: 'Tasarruf Paketi',
    tagColor: 'primary',
    rating: 4.9,
    reviewsCount: 145,
    description: '1000g Nefes Alan Doğal Pamuk Bez Torbada. Kalabalık aile sofraları ve uzun kış günleri için.',
    details: 'Geleneksel köy evlerinde asıldığı gibi nefes alan pamuk torbasında tazeliğini aylarca korur. Yüksek proteinli ve canlı probiyotikli yapısıyla tüm ailenin haftalık şifa kaynağı.',
    price: 330,
    originalPrice: 370,
    weight: '1000g Pamuk Çuval',
    image: ASSETS.productClassic,
    category: 'classic',
    ingredients: [
      'Ata Tohumu Koçbaşı Nohut',
      'Köy Tipi Süzme Yoğurt',
      'Karakılçık Buğday Unu',
      'Tarla Domatesi & Kapya',
      'Dağ Kekiği & Nane'
    ],
    nutrition: {
      calories: 342,
      protein: '15.4g',
      fiber: '11.8g',
      carbs: '62.1g',
      fat: '3.2g'
    },
    inStock: true,
    isPopular: false
  },
  {
    id: 'tarhana-gourmet-duo',
    name: 'İkili Gurme Şifa Paketi (Klasik + Acılı)',
    tag: 'Çift Lezzet',
    tagColor: 'secondary',
    rating: 4.9,
    reviewsCount: 98,
    description: '500g Klasik + 500g Acılı Gurme Cam Kavanoz. Hem sofranın sakinlerine hem acı tutkunlarına.',
    details: 'Evdeki tüm damak tatlarını memnun eden özel avantajlı ikili koli. Yanında özel tereyağlı çıtır nohut sosu reçetesi hediye olarak gelir.',
    price: 355,
    originalPrice: 380,
    weight: '2 x 500g Cam Kavanoz',
    image: ASSETS.productSpicy,
    category: 'sets',
    ingredients: ['Klasik Nohutlu Tarhana (500g)', 'Acılı Gurme Terapisi (500g)'],
    nutrition: {
      calories: 345,
      protein: '15.8g',
      fiber: '12.1g',
      carbs: '61.3g',
      fat: '3.3g'
    },
    inStock: true,
    isPopular: false
  }
];

export const INGREDIENTS: Ingredient[] = [
  {
    id: 1,
    number: 1,
    name: 'Köy Tipi Süzme Yoğurt',
    description: 'Otlayan ineklerin sütünden geleneksel usulle mayalanmış canlı, ekşimsi ve koyu kıvamlı yoğurt.',
    source: 'Ege & Tire Yaylaları',
    benefits: ['Canlı laktobasil probiyotikleri', 'Yüksek kalsiyum & protein', 'Doğal ekşilik ve kıvam'],
    iconName: 'water_drop',
    badgeBg: 'bg-surface-container-high'
  },
  {
    id: 2,
    number: 2,
    name: 'Tarla Domatesi & Közlenmiş Kapya',
    description: 'Ağustos güneşinde kızarmış mis kokulu tarla domatesleri ve köz ateşiyle tatlanan tatlı etli kapya biberler.',
    source: 'Çanakkale & Bursa Ovaları',
    benefits: ['Zengin Likopen antioksidanı', 'A ve C vitamini deposu', 'Derin tütsülenmiş aroma'],
    iconName: 'nutrition',
    badgeBg: 'bg-primary-fixed'
  },
  {
    id: 3,
    number: 3,
    name: 'Yerli Koçbaşı Nohut',
    description: 'İç Anadolu ovalarından toplanmış, suda kabaran, protein ve lif deposu dolgun nohut taneleri.',
    source: 'Konya & Yozgat Havzası',
    benefits: ['Prebiyotik lif kaynağı', 'Bitkisel protein zengini', 'Doyurucu ve kadife tokluk'],
    iconName: 'grain',
    badgeBg: 'bg-secondary-fixed'
  },
  {
    id: 4,
    number: 4,
    name: 'Taş Değirmen Ata Buğday Unu',
    description: 'Karakılçık ve siyez buğdaylarının rüşeymi ve kepeği ayrılmadan öğütülmüş besleyici unu.',
    source: 'Gediz Vadisi Taş Değirmenleri',
    benefits: ['Düşük glisemik indeks', 'B grubu vitaminleri', 'Genetiği bozulmamış ata tohum'],
    iconName: 'bakery_dining',
    badgeBg: 'bg-tertiary-fixed'
  },
  {
    id: 5,
    number: 5,
    name: 'Taze Dağ Kekiği & Nane',
    description: 'Yüksek rakımlı yaylalardan toplanan uçucu yağları zengin şifalı aromatik kurutulmuş otlar.',
    source: 'Toros ve Madra Dağları',
    benefits: ['Doğal timol ve uçucu yağlar', 'Solunum ve sindirim rahatlatıcı', 'Büyüleyici ferah koku'],
    iconName: 'local_florist',
    badgeBg: 'bg-surface-container-high'
  },
  {
    id: 6,
    number: 6,
    name: 'Geleneksel Ekşi Maya Kültürü',
    description: 'Üç nesildir tazelenen ana maya ile 21 gün boyunca toprak küplerde yavaş fermantasyon.',
    source: 'Bursa Orhangazi Köy Ocağı (1954)',
    benefits: ['Doğal sindirim enzimler', 'Fitik asidi parçalayarak mineral emilimi artırır', 'Eşsiz kadim buse'],
    iconName: 'bubble_chart',
    badgeBg: 'bg-primary-fixed'
  },
  {
    id: 7,
    number: 7,
    name: 'Yerli Mor Soğan & Sarımsak',
    description: 'Toprağın doğal antibiyotiği olan Taşköprü sarımsağı ve kokulu mor soğanların tatlı püresi.',
    source: 'Kastamonu Taşköprü',
    benefits: ['Doğal allisin & kükürt bileşenleri', 'Bağışıklık kalkanı', 'Derin umami tat tabanı'],
    iconName: 'spa',
    badgeBg: 'bg-secondary-fixed'
  },
  {
    id: 8,
    number: 8,
    name: 'Kaya Tuzu (Rafinesiz)',
    description: 'Çankırı kaya tuzu mağaralarından çıkarılan, mineral dengesi korunmuş saf beyaz kristaller.',
    source: 'Çankırı Mağaraları',
    benefits: ['84 mineral iz elementi', 'Sıfır mikroplastik', 'Doğal fermantasyon koruyucusu'],
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
    title: 'Tereyağlı Nohutlu Sos',
    description: 'Küçük bir tavada halis köy tereyağını eritin. Haşlanmış koçbaşı nohutları içine atıp hafif çıtırdayana kadar çevirin.',
    durationMinutes: 3,
    tip: 'Tereyağı köpürdüğünde nohutların dışı çıtır, içi lokum gibi kalır; çorbaya muazzam bir dokusal zenginlik katar.',
    badgeBg: 'bg-secondary-fixed text-on-secondary-fixed'
  },
  {
    number: '04',
    title: 'Nane & Biberle Taçlandırın',
    description: 'Nohutlu yağa kuru nane ve pul biber serpin. Çorbayı kaselere paylaştırıp bu coşkulu sosu üstüne gezdirin. Afiyetle için!',
    durationMinutes: 1,
    tip: 'Taze nane ve tereyağının koku buharı ilk kaşıkta burnunuza dolduğunda terapiniz tamamlanır.',
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
    productName: 'Geleneksel Nohutlu Anne Tarhanası',
    content: 'Kapağını açtığım an ev buram buram çocukluğumun geçtiği Ege köyü gibi koktu. Nohutların ekstra lezzet ve tokluk katması ise harika düşünülmüş.',
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
    productName: 'Acılı Gurme Terapisi',
    content: 'Kış aylarında hastalandığımda tek ilacım bu çorba oldu. Hazmı çok hafif, yoğurdun hafif ekşiliği tam ayarında. 3 kavanoz daha sipariş verdim bile.',
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
    productName: 'Bebek & Çocuk Dostu Tarhana',
    content: 'Bebekli tarhanasını 14 aylık kızıma yapıyorum, bayılarak içiyor. İçinde hiçbir katkı maddesi olmaması anne olarak içimi çok rahatlatıyor.',
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
    productName: 'TarhanaTerapi Başlangıç Seti',
    content: 'Toprak kase ve şimşir kaşık ile içmek bambaşka bir keyif. Paketi açarken hissettiğiniz özen ve nostalji paha biçilemez. Hediye olarak da kayınvalideme aldım.',
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
    productName: 'Geleneksel Nohutlu Anne Tarhanası',
    content: 'Bir hekim ve anne olarak fermente gıdaların bağırsak mikrobiyotasına faydasını yakından takip ediyorum. Bu tarhana 21 günlük gerçek fermantasyonun tüm şifasını taşıyor.',
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
    productName: 'Acılı Gurme Terapisi',
    content: 'Acısı genzi yakmıyor, sıcacık göğsü ısıtıyor. Nohut tanelerinin tereyağında kızartılıp üzerine dökülmesi fikri bir gastronomi dehası.',
    verified: true,
    avatarColor: 'tertiary'
  }
];

export const RECIPES_EBOOK: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Nohutlu Tereyağlı Klasik Anne Tarhanası',
    subtitle: 'Köy usulü 15 dakikalık şifa ritüeli',
    prepTime: '15 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Kolay',
    ingredients: [
      '3 dolu yemek kaşığı TarhanaTerapi Anne Tarhanası',
      '1 su bardağı soğuk su (ıslatmak için)',
      '4 su bardağı ilikli kemik suyu veya sıcak su',
      '1 yemek kaşığı köy tereyağı',
      '1 çay bardağı haşlanmış nohut',
      '1 tatlı kaşığı nane ve yarım çay kaşığı pul biber'
    ],
    steps: [
      'Tarhanayı tencereye alın, 1 bardak soğuk su ile 5 dakika bekletip çırpın.',
      'Kemik suyunu ekleyin ve orta ateşte kaynayana kadar devamlı karıştırın.',
      'Kaynamaya başlayınca ocağı en kısığa alın ve 5 dakika kıvam almasını bekleyin.',
      'Ayrı tavada tereyağını eritin, nohutları atıp 2 dakika hafifçe kavurun, nane ve biberi ekleyip ocaktan alın.',
      'Çorbayı kaselere paylaştırıp tereyağlı nohutlu sosu köpürterek üzerine gezdirin.'
    ],
    chefNote: 'Tarhana kaynamadan önce asla tencerenin başından ayrılmayın ve tahta kaşık kullanın.'
  },
  {
    id: 'recipe-2',
    title: 'Fırınlanmış Sarımsaklı İlikli Tarhana',
    subtitle: 'Kış aylarında bağışıklık kalkanı',
    prepTime: '25 Dakika',
    servings: '4 Kişilik',
    difficulty: 'Orta',
    ingredients: [
      '4 yemek kaşığı TarhanaTerapi Anne Tarhanası',
      '1 baş fırınlanıp püre yapılmış sarımsak',
      '5 su bardağı yoğun kemik suyu',
      '1 tatlı kaşığı dağ kekiği',
      '1 yemek kaşığı sade yağ (ghee)',
      '1 su bardağı koçbaşı nohut'
    ],
    steps: [
      'Sarımsak başını zeytinyağlayıp 180 derece fırında 20 dakika yumuşatın ve püre haline getirin.',
      'Soğuk suda açılan tarhanayı kemik suyu ve sarımsak püresiyle buluşturun.',
      'Kısık ateşte 10 dakika pişirin.',
      'Sade yağda kekiği ve nohutları cızırdatıp çorbanın üzerine dökün.'
    ],
    chefNote: 'Fırınlanmış sarımsak çiğ kokmaz, karamelize tatlımsı bir şifa tabakası bırakır.'
  },
  {
    id: 'recipe-3',
    title: 'Bebekler İçin Sebzeli İpeksi Tarhana',
    subtitle: '6. aydan itibaren ek gıda dostu formül',
    prepTime: '12 Dakika',
    servings: '2 Bebek Porsiyonu',
    difficulty: 'Çok Kolay',
    ingredients: [
      '2 tatlı kaşığı TarhanaTerapi Bebek Tarhanası',
      '1.5 su bardağı su veya ev yapımı kemik suyu',
      'Yarım çay kaşığı sızma zeytinyağı',
      '2 yemek kaşığı ince ezilmiş haşlanmış nohut'
    ],
    steps: [
      'Bebek tarhanasını soğuk su ile küçük sos tenceresinde karıştırarak açın.',
      'Kısık ateşte 5-7 dakika kaynatın.',
      'Ocaktan aldıktan sonra sızma zeytinyağı ve püre yapılmış nohut tanelerini ekleyin.',
      'Ilık sıcaklığa gelince bebeğinize servis edin.'
    ],
    chefNote: 'İlave tuz ve baharat eklenmez. Zeytinyağı pişirme bittikten sonra çiğ konmalıdır.'
  }
];

export const FAQS = [
  {
    q: 'TarhanaTerapi çorbalarında neden nohut var?',
    a: 'Nohut, Anadolu\'nun en kadim baklagilidir. Tarhananın fermantasyon sürecinde yoğurt ve buğdayla harmanlandığında bitkisel protein ve prebiyotik lif dengesini doruk noktaya taşır. Ayrıca çorbaya eşsiz bir tokluk hissi ve ipeksi kıvam kazandırır.'
  },
  {
    q: 'Fermantasyon süresi gerçekten 21 gün mü?',
    a: 'Evet. Tarhana hamurumuz geleneksel toprak küplerde, hava şartlarına göre 21 gün boyunca her gün sabah ve akşam yoğrularak mayalanır. Bu süre canlı probiyotik bakterilerin (Lactobacillus) çoğalması ve sindirimi kolaylaştırması için şarttır.'
  },
  {
    q: 'Bebek tarhanası kaçıncı aydan itibaren verilebilir?',
    a: 'Bebek & Çocuk Dostu Tarhanamız tuzsuz, acısız ve düşük asiditeli sebzelerle hazırlanır. Doktorunuza danışarak 6. aydan itibaren ek gıdaya geçişte güvenle kullanabilirsiniz.'
  },
  {
    q: 'Kargo kaç günde teslim edilir ve nasıl paketlenir?',
    a: 'Siparişleriniz aynı gün veya ertesi gün kargoya verilir. Cam kavanozlarımız kırılmaya karşı %100 dayanıklı hava yastıklı özel koruyucularla sarılır. Türkiye geneli teslimat süresi 1-3 iş günüdür. ₺300 üzeri alışverişlerde kargo tamamen ücretsizdir.'
  },
  {
    q: 'Açıldıktan sonra nasıl saklanmalıdır?',
    a: 'Güneş görmeyen, serin ve kuru bir kilerde veya cam kavanozunda buzdolabında 1 yıla kadar tazeliğini korur. İçinde hiçbir kimyasal koruyucu olmadığı için nemden uzak tutulmalıdır.'
  }
];
