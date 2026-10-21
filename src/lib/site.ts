import { FAQS, PRODUCTS } from '../data/mockData';
import { GUIDES, guidePath, type Guide } from '../data/guides';
import { STANDARD_SHIPPING_FEE } from './commerce';
import type { Product } from '../types';

/**
 * Tek kaynak: canonical/OG/sitemap/JSON-LD adresleri buradan üretilir.
 * Özel alan adı (tarhanaterapi.com) HTTPS ile yayına alındığında
 * build sırasında VITE_SITE_URL=https://tarhanaterapi.com verilmesi yeterlidir.
 */
const envUrl = (() => {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SITE_URL;
  } catch {
    return undefined;
  }
})() || (typeof process !== 'undefined' ? process.env?.VITE_SITE_URL : undefined);

export const SITE_URL = (envUrl || 'https://tarhanaterapi.com').replace(/\/+$/, '');
export const SITE_NAME = 'TarhanaTerapi';
export const SITE_LANG = 'tr-TR';
export const CONTENT_UPDATED = '2026-10-21';
export const CONTENT_UPDATED_LABEL = '21 Ekim 2026';
export const OG_IMAGE = `${SITE_URL}/og-image-2026.jpg`;
export const LOGO_URL = `${SITE_URL}/logo.svg`;

export const CONTACT = {
  phone: '+90 850 302 82 74',
  phoneHref: '+908503028274',
  email: 'satis@tarhanaterapi.com',
  address: {
    street: 'Gedelek Köyü Mevkii No: 28',
    locality: 'Orhangazi',
    region: 'Bursa',
    country: 'TR',
  },
  instagram: 'https://www.instagram.com/tarhanaterapi/',
};

export const BRAND_DEFINITION =
  "TarhanaTerapi, Bursa Orhangazi'de aile tarifiyle, katkısız geleneksel tarhana üreten bir aile işletmesidir. Şu anda 1 kg pamuk torba geleneksel tarhana satışı vardır; acılı ve bebek/çocuk dostu versiyonlar istek üzerine hazırlanır.";

export const SHORT_ANSWER =
  "TarhanaTerapi tarhanası; taş değirmen buğday unu, köy yoğurdu, tarla domatesi, közlenmiş kapya biber, az miktarda nohut unu, kaya tuzu ve baharatlarla hazırlanır. Koruyucu, renklendirici ve aroma verici kullanılmaz. 1 kg geleneksel tarhana 500 TL'dir. Türkiye geneli kargo 1-3 iş günü sürer; 2000 TL üzeri siparişlerde ücretsizdir, 2000 TL altı siparişlerde 150 TL'dir.";

export const productPath = (product: Pick<Product, 'id'>) => `/urunler/${product.id}`;
export const productUrl = (product: Pick<Product, 'id'>) => `${SITE_URL}${productPath(product)}`;

/** Aynı sayfanın build sırasında üretilen Markdown kardeşi. */
export const markdownUrl = (canonical: string) => {
  const pathPart = canonical.split(/[?#]/, 1)[0].replace(/\/+$/, '');
  return pathPart === SITE_URL ? `${SITE_URL}/index.md` : `${pathPart}.md`;
};

export const routePaths = {
  home: '/',
  products: '/urunler',
  ingredients: '/icerik',
  story: '/hikaye',
  reviews: '/yorumlar',
  contact: '/iletisim',
  legal: '/kvkk',
} as const;

export type SiteRoute = keyof typeof routePaths;

export const routeSeo: Record<SiteRoute, { title: string; description: string }> = {
  home: {
    title: 'TarhanaTerapi — Geleneksel Katkısız Tarhana | 1 kg 500 TL',
    description:
      "Bursa Orhangazi'de aile tarifiyle hazırlanan katkısız tarhana. 1 kg pamuk torba 500 TL; 2000 TL üzeri kargo ücretsiz, 1-3 iş günde teslimat.",
  },
  products: {
    title: 'Tarhana Ürünleri ve Fiyatları | TarhanaTerapi',
    description:
      '1 kg geleneksel tarhana 500 TL. Acılı ve bebek versiyonları istek üzerine. Güncel fiyat, içindekiler ve kargo bilgisi.',
  },
  ingredients: {
    title: 'İçindekiler ve Üretim Adımları | TarhanaTerapi',
    description:
      'Buğday unu, köy yoğurdu, tarla domatesi, közlenmiş kapya biber, az miktarda nohut unu ve baharatlar. TarhanaTerapi tarhanasının içindekileri ve üretim adımları.',
  },
  story: {
    title: 'Üretim Hikayemiz: Orhangazi ve Aile Tarifi | TarhanaTerapi',
    description:
      "Bursa Orhangazi'deki üretim atölyesi, üç nesillik aile tarifi ve katkısız tarhana üretimi. TarhanaTerapi'nin üretici hikayesi.",
  },
  reviews: {
    title: 'Müşteri Yorumları ve Deneyimler | TarhanaTerapi',
    description:
      "TarhanaTerapi müşterilerinin ürün, lezzet, paketleme ve kargo deneyimleri. Gerçek alıcı yorumları ve sık sorulan soruların yanıtları.",
  },
  contact: {
    title: 'İletişim, Adres, Kargo ve SSS | TarhanaTerapi',
    description:
      'TarhanaTerapi iletişim: 0850 302 82 74, satis@tarhanaterapi.com. Orhangazi atölyesi, İstanbul tadım noktası, kargo süresi ve sık sorulan sorular.',
  },
  legal: {
    title: 'KVKK Aydınlatma Metni | TarhanaTerapi',
    description:
      'TarhanaTerapi kişisel verilerin işlenmesi, aktarımı, saklama süreleri ve KVKK kapsamındaki haklarınıza ilişkin aydınlatma metni.',
  },
};

export const productSeoDescription = (product: Product) => {
  const conciseDescription = product.description.replace(/^1 kg [^.]+\.\s*/, '');
  return `${product.name} ${product.price} TL. ${conciseDescription} 2000 TL üzeri kargo ücretsiz.`;
};

export const GUIDE_INDEX_PATH = '/rehber';
export const guideUrl = (guide: Pick<Guide, 'slug'>) => `${SITE_URL}${guidePath(guide)}`;
export const guideIndexUrl = `${SITE_URL}${GUIDE_INDEX_PATH}`;

const orgId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;
const localBusinessId = `${SITE_URL}/#localbusiness`;

const address = {
  '@type': 'PostalAddress',
  streetAddress: CONTACT.address.street,
  addressLocality: CONTACT.address.locality,
  addressRegion: CONTACT.address.region,
  addressCountry: CONTACT.address.country,
};

const organization = () => ({
  '@type': 'Organization',
  '@id': orgId,
  name: SITE_NAME,
  alternateName: ['Tarhana Terapi', 'TarhanaTerapi Orhangazi'],
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
  },
  image: OG_IMAGE,
  description:
    "Bursa Orhangazi'de aile tarifiyle katkısız geleneksel tarhana üreten aile işletmesi.",
  slogan: 'Bir kasede saklı çocukluk ve şifa.',
  email: CONTACT.email,
  telephone: CONTACT.phone,
  address,
  areaServed: { '@type': 'Country', name: 'Türkiye' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: CONTACT.phone,
    email: CONTACT.email,
    contactType: 'customer service',
    availableLanguage: ['Turkish'],
  },
  sameAs: [CONTACT.instagram],
  knowsAbout: [
    'Tarhana',
    'Geleneksel tarhana üretimi',
    'Anadolu mutfağı',
    'Tarhana çorbası',
    'Katkısız gıda',
  ],
});

const website = () => ({
  '@type': 'WebSite',
  '@id': websiteId,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  inLanguage: SITE_LANG,
  publisher: { '@id': orgId },
});

const localBusiness = () => ({
  '@type': 'Store',
  '@id': localBusinessId,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  image: OG_IMAGE,
  logo: LOGO_URL,
  telephone: CONTACT.phone,
  email: CONTACT.email,
  priceRange: '₺₺',
  currenciesAccepted: 'TRY',
  paymentAccepted: 'Kapıda ödeme, havale/EFT',
  address,
  parentOrganization: { '@id': orgId },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '18:30',
  },
  areaServed: { '@type': 'Country', name: 'Türkiye' },
});

const webPage = (route: SiteRoute, name: string, description: string) => ({
  '@type': 'WebPage',
  '@id': `${SITE_URL}${routePaths[route]}#webpage`,
  url: `${SITE_URL}${routePaths[route]}`,
  name,
  description,
  isPartOf: { '@id': websiteId },
  inLanguage: SITE_LANG,
  dateModified: CONTENT_UPDATED,
  primaryImageOfPage: OG_IMAGE,
  about: { '@id': orgId },
  publisher: { '@id': orgId },
});

const breadcrumb = (items: Array<{ name: string; path: string }>) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

const productSchema = (product: Product) => ({
  '@type': 'Product',
  '@id': `${productUrl(product)}#product`,
  name: product.name,
  description: product.details,
  image: product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`,
  sku: product.id,
  mpn: product.id,
  category: 'Gıda > Çorba > Tarhana',
  brand: { '@type': 'Brand', name: SITE_NAME },
  manufacturer: { '@id': orgId },
  additionalProperty: [
    { '@type': 'PropertyValue', name: 'Net miktar', value: product.weight },
    { '@type': 'PropertyValue', name: 'Menşe ülke', value: 'Türkiye' },
    { '@type': 'PropertyValue', name: 'Üretim yeri', value: "Orhangazi, Bursa" },
  ],
  offers: {
    '@type': 'Offer',
    url: productUrl(product),
    price: product.price.toFixed(2),
    priceCurrency: 'TRY',
    priceValidUntil: '2026-12-31',
    availability: product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': orgId },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: STANDARD_SHIPPING_FEE.toFixed(2),
        currency: 'TRY',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'TR',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
      },
    },
  },
});

const faqSchema = () => ({
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
});

/** Client-side gezinmede ve build sırasında aynı şema üretilir. */
export function jsonLdForRoute(route: SiteRoute, product?: Product): Record<string, unknown> {
  const seo = routeSeo[route];

  // Ürün sayfası: koleksiyon şeması eklenmez; tek sayfa + tek ürün + tek breadcrumb.
  if (product) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        organization(),
        website(),
        {
          ...webPage('products', `${product.name} | ${SITE_NAME}`, productSeoDescription(product)),
          '@type': 'ProductPage',
          '@id': `${productUrl(product)}#webpage`,
          url: productUrl(product),
          mainEntity: { '@id': `${productUrl(product)}#product` },
        },
        productSchema(product),
        breadcrumb([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Ürünler', path: routePaths.products },
          { name: product.name, path: productPath(product) },
        ]),
      ],
    };
  }

  const graph: Array<Record<string, unknown>> = [organization(), website()];

  switch (route) {
    case 'home':
      graph.push(
        localBusiness(),
        {
          ...webPage('home', seo.title, seo.description),
          '@type': 'WebPage',
          mainEntity: { '@id': `${SITE_URL}/#products` },
        },
        {
          '@type': 'ItemList',
          '@id': `${SITE_URL}/#products`,
          name: 'TarhanaTerapi ürünleri',
          numberOfItems: PRODUCTS.length,
          itemListElement: PRODUCTS.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: productUrl(p),
          })),
        },
        faqSchema()
      );
      break;
    case 'products':
      graph.push(
        {
          ...webPage('products', seo.title, seo.description),
          '@type': 'CollectionPage',
          mainEntity: { '@id': `${SITE_URL}/#product-list` },
        },
        {
          '@type': 'ItemList',
          '@id': `${SITE_URL}/#product-list`,
          name: 'Tarhana ürünleri ve fiyatları',
          numberOfItems: PRODUCTS.length,
          itemListElement: PRODUCTS.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              url: productUrl(p),
              image: p.image.startsWith('http') ? p.image : `${SITE_URL}${p.image}`,
              description: p.description,
              offers: {
                '@type': 'Offer',
                price: p.price.toFixed(2),
                priceCurrency: 'TRY',
                availability: p.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                url: productUrl(p),
              },
            },
          })),
        },
        breadcrumb([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Ürünler', path: routePaths.products },
        ])
      );
      break;
    case 'ingredients':
      graph.push(
        webPage('ingredients', seo.title, seo.description),
        breadcrumb([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'İçindekiler', path: routePaths.ingredients },
        ])
      );
      break;
    case 'story':
      graph.push(
        {
          ...webPage('story', seo.title, seo.description),
          '@type': 'AboutPage',
        },
        breadcrumb([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Hikayemiz', path: routePaths.story },
        ])
      );
      break;
    case 'reviews':
      graph.push(
        webPage('reviews', seo.title, seo.description),
        breadcrumb([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Yorumlar', path: routePaths.reviews },
        ])
      );
      break;
    case 'contact':
      graph.push(
        {
          ...webPage('contact', seo.title, seo.description),
          '@type': 'ContactPage',
        },
        localBusiness(),
        faqSchema(),
        breadcrumb([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'İletişim', path: routePaths.contact },
        ])
      );
      break;
    case 'legal':
      graph.push(
        {
          ...webPage('legal', seo.title, seo.description),
          '@type': 'WebPage',
        },
        breadcrumb([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'KVKK Aydınlatma Metni', path: routePaths.legal },
        ])
      );
      break;
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function jsonLdForGuideIndex(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(),
      website(),
      {
        '@type': 'CollectionPage',
        '@id': `${guideIndexUrl}#webpage`,
        url: guideIndexUrl,
        name: 'Tarhana Rehberi: Kurutma, Saklama ve Bebek Beslenmesi',
        description:
          'Tarhana nasıl kurutulur, neden ekşir, bebeklere ne zaman verilir ve katkısız tarhana nasıl anlaşılır? Uygulamalı rehberler.',
        isPartOf: { '@id': websiteId },
        inLanguage: SITE_LANG,
        dateModified: CONTENT_UPDATED,
        publisher: { '@id': orgId },
      },
      {
        '@type': 'ItemList',
        name: 'Tarhana rehberleri',
        numberOfItems: GUIDES.length,
        itemListElement: GUIDES.map((guide, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: guide.h1,
          url: guideUrl(guide),
        })),
      },
      breadcrumb([
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Rehber', path: GUIDE_INDEX_PATH },
      ]),
    ],
  };
}

export function jsonLdForGuide(guide: Guide): Record<string, unknown> {
  const url = guideUrl(guide);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(),
      website(),
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: guide.h1,
        name: guide.title,
        description: guide.description,
        url,
        mainEntityOfPage: url,
        datePublished: '2026-10-21',
        dateModified: guide.updated,
        inLanguage: SITE_LANG,
        author: { '@id': orgId },
        publisher: { '@id': orgId },
        image: OG_IMAGE,
        articleSection: 'Tarhana Rehberi',
        keywords: [
          'tarhana',
          'tarhana nasıl kurutulur',
          'bebek tarhanası',
          'katkısız tarhana',
          'tarhana saklama',
        ],
        about: { '@type': 'Thing', name: 'Tarhana' },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: guide.faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      breadcrumb([
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Rehber', path: GUIDE_INDEX_PATH },
        { name: guide.h1, path: guidePath(guide) },
      ]),
    ],
  };
}
