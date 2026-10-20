/**
 * Build sonrası statik HTML üretimi.
 *
 * Neden: site React SPA. AI botlarının bir kısmı JavaScript çalıştırmaz.
 * Bu script her rotayı (ürün sayfaları dahil) kendi HTML dosyasına yazar;
 * böylece botlar sayfa metnini, fiyatı, SSS'leri ve JSON-LD'yi kaynak HTML'de görür.
 *
 * Çıktı: dist/index.html, dist/urunler.html, dist/urunler/<id>.html, ...
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAQS, INGREDIENTS, PRODUCTS, REVIEWS } from '../src/data/mockData';
import { GUIDES, guidePath, type Guide } from '../src/data/guides';
import {
  BRAND_DEFINITION,
  CONTACT,
  CONTENT_UPDATED,
  CONTENT_UPDATED_LABEL,
  GUIDE_INDEX_PATH,
  SHORT_ANSWER,
  SITE_NAME,
  SITE_URL,
  guideUrl,
  jsonLdForGuide,
  jsonLdForGuideIndex,
  jsonLdForRoute,
  productPath,
  productSeoDescription,
  routePaths,
  routeSeo,
  type SiteRoute,
} from '../src/lib/site';
import { KVKK_AYDINLATMA } from '../src/data/legal';
import type { Product } from '../src/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const nav = `
  <header>
    <a class="static-brand" href="/">TarhanaTerapi</a>
    <nav aria-label="Ana menü">
      <a href="/urunler">Ürünler ve fiyatlar</a>
      <a href="/icerik">İçindekiler</a>
      <a href="/hikaye">Hikayemiz</a>
      <a href="/yorumlar">Yorumlar</a>
      <a href="/iletisim">İletişim ve SSS</a>
    </nav>
  </header>`;

const footer = `
  <footer>
    <p>© 2026 TarhanaTerapi · Son içerik güncellemesi: ${CONTENT_UPDATED_LABEL}</p>
    <p>
      <a href="/urunler">Ürünler</a> ·
      <a href="/iletisim">İletişim</a> ·
      <a href="/kvkk">KVKK</a> ·
      <a href="/llms.txt">llms.txt</a> ·
      <a href="/llms-full.txt">llms-full.txt</a>
    </p>
  </footer>`;

const contactBlock = `
  <h2>İletişim</h2>
  <p>
    Telefon / WhatsApp: <a href="tel:${CONTACT.phoneHref}">${CONTACT.phone}</a><br />
    E-posta: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a><br />
    Üretim atölyesi: ${esc(CONTACT.address.street)}, ${CONTACT.address.locality} / ${CONTACT.address.region}<br />
    Çalışma saatleri: Pazartesi–Cumartesi 09:00–18:30
  </p>`;

const productTable = () => `
  <table>
    <thead>
      <tr><th>Ürün</th><th>Miktar</th><th>Fiyat</th><th>Özellik</th></tr>
    </thead>
    <tbody>
      ${PRODUCTS.map(
        (product) => `<tr>
        <td><a href="${productPath(product)}">${esc(product.name)}</a></td>
        <td>${esc(product.weight)}</td>
        <td>${product.price} TL</td>
        <td>${esc(product.description)}</td>
      </tr>`
      ).join('\n')}
    </tbody>
  </table>
  <p>2000 TL ve üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL'dir. Teslimat Türkiye genelinde 1-3 iş günüdür.</p>`;

const faqBlock = (limit = FAQS.length) => `
  <h2>Sık sorulan sorular</h2>
  <dl>
    ${FAQS.slice(0, limit)
      .map((item) => `<dt>${esc(item.q)}</dt><dd>${esc(item.a)}</dd>`)
      .join('\n')}
  </dl>`;

const productFaqs = [
  {
    q: 'Kargo kaç günde gelir?',
    a: 'Siparişler aynı veya ertesi iş günü kargoya verilir. Türkiye geneli teslimat 1-3 iş günüdür; 2000 TL üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL\'dir.',
  },
  {
    q: 'Ürün nasıl saklanır?',
    a: 'Güneş görmeyen serin ve kuru bir yerde, pamuk torbasını kapalı tutarak 1 yıla kadar saklayabilirsiniz. Açtıktan sonra buzdolabında muhafaza edilmesi önerilir.',
  },
  {
    q: 'İçinde katkı maddesi var mı?',
    a: 'Koruyucu, renklendirici ve aroma verici kullanılmaz. Ürün buğday unu, yoğurt, nohut, domates, biber, tuz ve baharatlardan oluşur. Buğday içerdiği için glutensiz değildir.',
  },
];

const productContent = (product: Product) => `
  <main>
    <p><a href="/">Ana Sayfa</a> / <a href="/urunler">Ürünler</a> / ${esc(product.name)}</p>
    <h1>${esc(product.name)}</h1>
    <p class="static-definition">
      <strong>${esc(product.name)}</strong>, TarhanaTerapi'nin Bursa Orhangazi'deki aile
      atölyesinde ürettiği ${esc(product.weight.toLowerCase())} üründür. ${esc(product.description)}
    </p>
    <p><strong>Fiyat: ${product.price} TL</strong> · ${esc(product.weight)} · Stokta</p>
    <p><a class="static-cta" href="/urunler">Sepete ekle ve diğer ürünleri gör</a></p>

    <h2>Ürün detayı</h2>
    <p>${esc(product.details)}</p>

    <h2>İçindekiler</h2>
    <ul>${product.ingredients.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    <p>Alerjen bilgisi: buğday (gluten), süt (yoğurt) ve nohut içerir. Glutensiz değildir.</p>

    <h2>100 g başına besin değerleri</h2>
    <table>
      <tbody>
        <tr><th>Kalori</th><td>${product.nutrition.calories} kcal</td></tr>
        <tr><th>Protein</th><td>${esc(product.nutrition.protein)}</td></tr>
        <tr><th>Lif</th><td>${esc(product.nutrition.fiber)}</td></tr>
        <tr><th>Karbonhidrat</th><td>${esc(product.nutrition.carbs)}</td></tr>
        <tr><th>Yağ</th><td>${esc(product.nutrition.fat)}</td></tr>
      </tbody>
    </table>

    <h2>Kargo, saklama ve iade</h2>
    <p>
      Siparişler aynı veya ertesi iş günü kargoya verilir; Türkiye geneli teslimat 1-3 iş
      günüdür. 2000 TL ve üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL'dir. Ürün kapalı pamuk torbasında,
      güneş görmeyen serin ve kuru bir yerde 1 yıla kadar saklanır. Açılmış gıda ürünlerinde
      mesafeli satış mevzuatı gereği cayma hakkı uygulanmaz.
    </p>

    <h2>${esc(product.name)} hakkında sık sorulan sorular</h2>
    <dl>${productFaqs.map((item) => `<dt>${esc(item.q)}</dt><dd>${esc(item.a)}</dd>`).join('')}</dl>

    <h2>Diğer tarhana çeşitleri</h2>
    <ul>
      ${PRODUCTS.filter((item) => item.id !== product.id)
        .map(
          (item) =>
            `<li><a href="${productPath(item)}">${esc(item.name)}</a> — ${item.price} TL</li>`
        )
        .join('')}
    </ul>
  </main>
  ${contactBlock}`;

const homeContent = () => `
  <main>
    <h1>Nohutlu Hakiki Anne Tarhanası</h1>
    <p class="static-definition"><strong>TarhanaTerapi</strong>, ${esc(
      BRAND_DEFINITION.replace(/^TarhanaTerapi,\s*/, '')
    )}</p>
    <p>${esc(SHORT_ANSWER)}</p>
    <p><a class="static-cta" href="/urunler">Ürünleri ve güncel fiyatları gör</a></p>

    <h2>Tarhana çeşitleri ve fiyatları</h2>
    ${productTable()}

    <h2>Neden TarhanaTerapi?</h2>
    <ul>
      <li>21 gün toprak küpte, her gün yoğrularak fermente edilen canlı anne mayası.</li>
      <li>Ata tohumu koçbaşı nohut; bitkisel protein ve prebiyotik lif kaynağı.</li>
      <li>Koruyucu, renklendirici ve aroma verici yok.</li>
      <li>Pamuk torbada, hava yastıklı koruyucu ambalajla Türkiye geneli kargo.</li>
      <li>Üretim yeri: Orhangazi / Bursa; 1-3 iş gününde teslimat.</li>
    </ul>

    ${faqBlock()}
  </main>
  ${contactBlock}`;

const productsContent = () => `
  <main>
    <h1>Tarhana Ürünleri ve Fiyatları</h1>
    <p class="static-definition">
      TarhanaTerapi'nin tüm ürünleri Bursa Orhangazi'deki aile atölyesinde, toprak küpte 21 gün
      fermente edilerek üretilir. Aşağıdaki fiyatlar ${CONTENT_UPDATED_LABEL} tarihinde
      doğrulanmıştır; 2000 TL üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL'dir.
    </p>
    ${productTable()}
    <h2>Hangi tarhana kime uygun?</h2>
    <ul>
      <li><strong>Klasik:</strong> İlk kez alacaklar ve geleneksel nohutlu lezzet arayanlar.</li>
      <li><strong>Acılı gurme:</strong> Maraş ipek biberi sevenler.</li>
      <li><strong>Bebek dostu:</strong> Tuzsuz ve acısız arayan 6 ay üzeri bebekli aileler.</li>
      <li><strong>Aile paketi:</strong> 1 kg ile uzun kış boyunca stok yapmak isteyenler.</li>
      <li><strong>Başlangıç seti:</strong> Hediye ve ilk deneyim için kase + kaşık + tarhana.</li>
    </ul>
    ${faqBlock(6)}
  </main>
  ${contactBlock}`;

const ingredientsContent = () => `
  <main>
    <h1>İçindekiler ve 21 Günlük Fermantasyon</h1>
    <p class="static-definition">
      TarhanaTerapi tarhanası; taş değirmen buğday unu, köy yoğurdu, tarla domatesi, közlenmiş
      kapya biber, ata tohumu koçbaşı nohut, kaya tuzu ve dağ baharatlarından yapılır. Hazır
      çorba değildir; koruyucu, renklendirici ve aroma verici içermez.
    </p>

    <h2>Malzemeler</h2>
    ${INGREDIENTS.map(
      (item) => `<h3>${esc(item.name)}</h3>
      <p>${esc(item.description)} Kaynak: ${esc(item.source)}. ${esc(item.benefits.join(', '))}.</p>`
    ).join('\n')}

    <h2>21 günlük üretim süreci</h2>
    <ol>
      <li>Koçbaşı nohut haşlanır, sebzeler ve baharatlar hazırlanır.</li>
      <li>Un, yoğurt ve malzemeler toprak küpte karıştırılır.</li>
      <li>Hamur 21 gün boyunca her gün yoğrularak fermente edilir.</li>
      <li>İnce açılan hamur güneşte kurutulur ve elenir.</li>
      <li>Pamuk torbalara doldurulup sevk edilir.</li>
    </ol>
    <p>Buğday ve süt içerir; glutensiz ve laktozsuz değildir.</p>
    ${faqBlock(5)}
  </main>
  ${contactBlock}`;

const storyContent = () => `
  <main>
    <h1>Üretim Hikayemiz: Orhangazi ve Üç Nesil Maya</h1>
    <p class="static-definition">${esc(BRAND_DEFINITION)}</p>
    <p>
      TarhanaTerapi'nin mayası, Orhangazi'de üç nesil boyunca kurulan sofralardan geliyor.
      Üretim, Bursa Orhangazi'deki Gedelek Köyü Mevkii'ndeki aile atölyesinde yapılır. Her parti
      hamur, toprak küplerde 21 gün boyunca her gün yoğrularak fermente edilir.
    </p>
    <p>
      Amaç, market rafında uzun süre dayanması için işlenmiş bir çorba tozu değil; anne
      mutfağındaki gibi nohutlu, ekşimsi ve katkısız bir tarhana üretmek. Bu yüzden koruyucu,
      renklendirici ve aroma verici kullanılmaz. Ürünler nefes alan pamuk
      torbalarda paketlenir.
    </p>
    <h2>Üretim bilgileri</h2>
    <ul>
      <li>Üretim yeri: ${esc(CONTACT.address.street)}, ${CONTACT.address.locality} / ${CONTACT.address.region}</li>
      <li>Fermantasyon: toprak küpte 21 gün</li>
      <li>Ana malzemeler: koçbaşı nohut, köy yoğurdu, taş değirmen buğday unu, domates, kapya biber</li>
      <li>Katkı: koruyucu, renklendirici ve aroma verici yok</li>
      <li>Satış: Türkiye geneli kargo, 1-3 iş günü</li>
    </ul>
  </main>
  ${contactBlock}`;

const reviewsContent = () => `
  <main>
    <h1>Müşteri Yorumları ve Deneyimler</h1>
    <p class="static-definition">
      TarhanaTerapi müşterilerinin ürün, lezzet, paketleme ve kargo deneyimleri. Aşağıdaki
      yorumlar sitede yayınlanan müşteri değerlendirmelerinden seçilmiştir.
    </p>
    ${REVIEWS.slice(0, 6)
      .map(
        (review) => `<h3>${esc(review.author)} — ${review.rating}/5</h3>
      <p>${esc(review.content)}</p>
      <p><small>${esc(review.productName)} · ${esc(review.date)} · ${esc(
          review.location
        )}${review.verified ? ' · Doğrulanmış alışveriş' : ''}</small></p>`
      )
      .join('\n')}
    ${faqBlock(5)}
  </main>
  ${contactBlock}`;

const contactContent = () => `
  <main>
    <h1>İletişim, Adres, Kargo ve SSS</h1>
    <p class="static-definition">
      TarhanaTerapi sipariş, kargo ve ürün soruları için ${CONTACT.phone} numarasından veya
      ${CONTACT.email} adresinden ulaşılabilir. Üretim atölyesi Bursa Orhangazi'de, tadım
      noktası İstanbul Kadıköy Moda'dadır.
    </p>
    ${contactBlock}
    <h2>Kargo ve teslimat</h2>
    <p>
      Siparişler aynı veya ertesi iş günü kargoya verilir. Türkiye geneli teslimat 1-3 iş
      günüdür. 2000 TL ve üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL'dir. Pamuk torbalar hava yastıklı
      koruyucu ambalajla gönderilir.
    </p>
    ${faqBlock()}
  </main>`;

const guidesIndexContent = () => `
  <main>
    <h1>Tarhana Rehberi: Kurutma, Saklama ve Bebek Beslenmesi</h1>
    <p class="static-definition">
      Tarhana nasıl kurutulur, neden ekşir, bebeklere ne zaman verilir ve katkısız tarhana nasıl
      anlaşılır? TarhanaTerapi'nin uygulamalı rehberleri, üretici deneyimi ve gıda güvenliği
      bilgileriyle hazırlandı.
    </p>
    <ul>
      ${GUIDES.map(
        (guide) =>
          `<li><a href="${guidePath(guide)}"><strong>${esc(guide.h1)}</strong></a> — ${esc(
            guide.description
          )}</li>`
      ).join('\n')}
    </ul>
    <p>Son güncelleme: ${CONTENT_UPDATED_LABEL}. İçerikler bilgilendirme amaçlıdır.</p>
  </main>
  ${contactBlock}`;

const guideContent = (guide: Guide) => `
  <main>
    <p><a href="/">Ana Sayfa</a> / <a href="${GUIDE_INDEX_PATH}">Rehber</a> / ${esc(guide.h1)}</p>
    <h1>${esc(guide.h1)}</h1>
    <p class="static-definition">${esc(guide.intro)}</p>
    <p>Yayın ve son güncelleme: ${CONTENT_UPDATED_LABEL} · ${guide.readingMinutes} dk okuma · TarhanaTerapi</p>

    ${guide.sections
      .map(
        (section) => `<h2>${esc(section.h2)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('\n')}
      ${
        section.bullets
          ? `<ul>${section.bullets.map((bullet) => `<li>${esc(bullet)}</li>`).join('')}</ul>`
          : ''
      }`
      )
      .join('\n')}

    <h2>Sık sorulan sorular</h2>
    <dl>${guide.faqs
      .map((faq) => `<dt>${esc(faq.q)}</dt><dd>${esc(faq.a)}</dd>`)
      .join('')}</dl>

    <h2>İlgili ürünler</h2>
    <ul>
      ${PRODUCTS.filter((product) => guide.relatedProducts.includes(product.id))
        .map(
          (product) =>
            `<li><a href="${productPath(product)}">${esc(product.name)}</a> — ${product.price} TL</li>`
        )
        .join('')}
    </ul>

    <h2>Diğer rehberler</h2>
    <ul>
      ${GUIDES.filter((item) => item.slug !== guide.slug)
        .map((item) => `<li><a href="${guidePath(item)}">${esc(item.h1)}</a></li>`)
        .join('')}
    </ul>
  </main>
  ${contactBlock}`;

function shell(content: string) {
  return `<div class="static-shell">${nav}${content}${footer}</div>`;
}

function setHead(html: string, route: string, canonical: string, title: string, description: string, jsonLd: unknown, isProduct: boolean) {
  const replaceFirst = (source: string, regex: RegExp, replacement: string) => {
    if (!regex.test(source)) throw new Error(`Head etiketi bulunamadı: ${regex}`);
    return source.replace(regex, replacement);
  };

  let out = html;
  out = replaceFirst(out, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  out = replaceFirst(
    out,
    /<meta[^>]*name="description"[^>]*>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  out = replaceFirst(
    out,
    /<link[^>]*rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${canonical}" />`
  );
  out = replaceFirst(
    out,
    /<link[^>]*rel="alternate"[^>]*hreflang="tr"[^>]*>/,
    `<link rel="alternate" hreflang="tr" href="${canonical}" />`
  );
  out = replaceFirst(
    out,
    /<link[^>]*rel="alternate"[^>]*hreflang="x-default"[^>]*>/,
    `<link rel="alternate" hreflang="x-default" href="${canonical}" />`
  );
  out = replaceFirst(
    out,
    /<meta[^>]*property="og:type"[^>]*>/,
    `<meta property="og:type" content="${isProduct ? 'product' : 'website'}" />`
  );
  out = replaceFirst(
    out,
    /<meta[^>]*property="og:title"[^>]*>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  out = replaceFirst(
    out,
    /<meta[^>]*property="og:description"[^>]*>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  out = replaceFirst(
    out,
    /<meta[^>]*property="og:url"[^>]*>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  out = replaceFirst(
    out,
    /<meta[^>]*name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${esc(title)}" />`
  );
  out = replaceFirst(
    out,
    /<meta[^>]*name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${esc(description)}" />`
  );
  out = replaceFirst(
    out,
    /<script type="application\/ld\+json" id="page-jsonld">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" id="page-jsonld">${JSON.stringify(jsonLd)}</script>`
  );
  return out;
}

function renderPage(options: {
  route: string;
  canonical: string;
  title: string;
  description: string;
  jsonLd: unknown;
  content: string;
  isProduct?: boolean;
}) {
  let html = setHead(
    template,
    options.route,
    options.canonical,
    options.title,
    options.description,
    options.jsonLd,
    Boolean(options.isProduct)
  );

  const rootTag = '<div id="root">';
  const endMarker = '<!--STATIC_CONTENT_END-->';
  const start = html.indexOf(rootTag);
  const end = html.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    throw new Error('index.html içinde #root veya STATIC_CONTENT_END bulunamadı');
  }
  html =
    html.slice(0, start) +
    `${rootTag}${shell(options.content)}\n      ${endMarker}` +
    html.slice(end + endMarker.length);

  return html;
}

const targets: Array<{ file: string; html: string; path: string; priority: string }> = [];
const legalContent = () => {
  const parts: string[] = [];
  let inList = false;

  for (const raw of KVKK_AYDINLATMA.split('\n')) {
    const line = raw.trim();

    if (!line || line === 'KVKK AYDINLATMA METNİ') {
      if (inList) {
        parts.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      if (inList) {
        parts.push('</ul>');
        inList = false;
      }
      parts.push(`<h2>${esc(line)}</h2>`);
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        parts.push('<ul>');
        inList = true;
      }
      parts.push(`<li>${esc(line.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      parts.push('</ul>');
      inList = false;
    }

    if (line.startsWith('Son güncelleme')) {
      parts.push(`<p><em>${esc(line)}</em></p>`);
    } else {
      parts.push(`<p>${esc(line)}</p>`);
    }
  }

  if (inList) parts.push('</ul>');

  return `
  <main>
    <h1>KVKK Aydınlatma Metni</h1>
    <p class="static-definition">
      6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin nasıl
      işlendiğini, kimlere aktarıldığını ve haklarınızı bu sayfada açıklıyoruz.
    </p>
    ${parts.join('\n    ')}
  </main>`;
};

const routeContent: Record<SiteRoute, () => string> = {
  home: homeContent,
  products: productsContent,
  ingredients: ingredientsContent,
  story: storyContent,
  reviews: reviewsContent,
  contact: contactContent,
  legal: legalContent,
};

(Object.keys(routePaths) as SiteRoute[]).forEach((route) => {
  const seo = routeSeo[route];
  const path = routePaths[route];
  const canonical = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const html = renderPage({
    route,
    canonical,
    title: seo.title,
    description: seo.description,
    jsonLd: jsonLdForRoute(route),
    content: routeContent[route](),
  });
  targets.push({
    file: route === 'home' ? 'index.html' : `${path.replace(/^\//, '')}.html`,
    html,
    path,
    priority: route === 'home' ? '1.0' : '0.8',
  });
});

PRODUCTS.forEach((product) => {
  const path = productPath(product);
  const canonical = `${SITE_URL}${path}`;
  const title = `${product.name} — ${product.price} TL | TarhanaTerapi`;
  const description = productSeoDescription(product);
  const html = renderPage({
    route: path,
    canonical,
    title,
    description,
    jsonLd: jsonLdForRoute('products', product),
    content: productContent(product),
    isProduct: true,
  });
  targets.push({
    file: `urunler/${product.id}.html`,
    html,
    path,
    priority: '0.7',
  });
});

targets.push({
  file: 'rehber.html',
  html: renderPage({
    route: GUIDE_INDEX_PATH,
    canonical: `${SITE_URL}${GUIDE_INDEX_PATH}`,
    title: 'Tarhana Rehberi: Kurutma, Saklama ve Bebek | TarhanaTerapi',
    description:
      'Tarhana nasıl kurutulur, neden ekşir, bebeklere ne zaman verilir ve katkısız tarhana nasıl anlaşılır? Uygulamalı tarhana rehberleri.',
    jsonLd: jsonLdForGuideIndex(),
    content: guidesIndexContent(),
  }),
  path: GUIDE_INDEX_PATH,
  priority: '0.8',
});

GUIDES.forEach((guide) => {
  const path = guidePath(guide);
  targets.push({
    file: `rehber/${guide.slug}.html`,
    html: renderPage({
      route: path,
      canonical: guideUrl(guide),
      title: `${guide.title} | TarhanaTerapi`,
      description: guide.description,
      jsonLd: jsonLdForGuide(guide),
      content: guideContent(guide),
    }),
    path,
    priority: '0.8',
  });
});

targets.forEach((target) => {
  const file = join(dist, target.file);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, target.html, 'utf8');
  console.log(`  prerender: /${target.file} (${target.html.length} bayt)`);
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${targets
  .map(
    (target) => `  <url>
    <loc>${SITE_URL}${target.path === '/' ? '/' : target.path}</loc>
    <lastmod>${CONTENT_UPDATED}</lastmod>
    <changefreq>${target.path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${target.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(dist, 'sitemap.xml'), sitemap, 'utf8');
console.log(`  prerender: sitemap.xml (${targets.length} URL)`);
console.log(`  prerender: ${SITE_NAME} için ${targets.length} statik sayfa üretildi.`);
