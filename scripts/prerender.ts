/**
 * Build sonrası statik HTML üretimi.
 *
 * Neden: site React SPA. AI botlarının bir kısmı JavaScript çalıştırmaz.
 * Bu script her rotayı (ürün sayfaları dahil) kendi HTML dosyasına yazar;
 * böylece botlar sayfa metnini, fiyatı, SSS'leri ve JSON-LD'yi kaynak HTML'de görür.
 *
 * Çıktı: dist/index.html, dist/urunler/<id>.html, ...
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
  markdownUrl,
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

const decodeEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…');

const resolveHref = (href: string) => {
  if (
    /^https?:\/\//i.test(href) ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  ) {
    return href;
  }
  return `${SITE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
};

const inlineMarkdown = (html: string): string => {
  let value = html;

  value = value.replace(
    /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href: string, label: string) => `[${inlineMarkdown(label)}](${resolveHref(href)})`
  );
  value = value.replace(
    /<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi,
    (_match, _tag, text: string) => `**${inlineMarkdown(text)}**`
  );
  value = value.replace(
    /<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi,
    (_match, _tag, text: string) => `*${inlineMarkdown(text)}*`
  );
  value = value.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_match, text: string) => `\`${text}\``);
  value = value.replace(/<br\s*\/?>/gi, '\n');
  value = value.replace(/<[^>]+>/g, '');
  value = decodeEntities(value);
  value = value.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();

  return value;
};

const tableMarkdown = (table: string): string => {
  const rows = Array.from(table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)).map((row) => {
    const cells = Array.from(row[1].matchAll(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi)).map((cell) =>
      inlineMarkdown(cell[2]).replace(/\|/g, '\\|')
    );
    return { cells, hasHeader: /<th\b/i.test(row[1]) };
  });

  if (!rows.length) return '';

  const first = rows[0];
  const header = first.hasHeader
    ? first.cells
    : first.cells.map((_cell, index) => (index === 0 ? 'Özellik' : index === 1 ? 'Değer' : ''));
  const data = first.hasHeader ? rows.slice(1) : rows;
  const columnCount = Math.max(header.length, ...data.map((row) => row.cells.length), 1);
  const pad = (cells: string[]) => [...cells, ...Array(columnCount - cells.length).fill('')];
  const lines = [
    `| ${pad(header).join(' | ')} |`,
    `| ${Array(columnCount).fill('---').join(' | ')} |`,
    ...data.map((row) => `| ${pad(row.cells).join(' | ')} |`),
  ];

  return `\n\n${lines.join('\n')}\n\n`;
};

const htmlToMarkdown = (html: string): string => {
  const tables: string[] = [];
  let value = html.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    tables.push(tableMarkdown(table));
    return `\n\n__TABLE_${tables.length - 1}__\n\n`;
  });

  value = value.replace(
    /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, text: string) =>
      `\n\n${'#'.repeat(Number(level))} ${inlineMarkdown(text)}\n\n`
  );

  value = value.replace(/<dl[^>]*>([\s\S]*?)<\/dl>/gi, (_match, body: string) => {
    const parts: string[] = [];
    body.replace(
      /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi,
      (_pair, question: string, answer: string) => {
        parts.push(`\n\n**${inlineMarkdown(question)}**\n\n${inlineMarkdown(answer)}\n\n`);
        return '';
      }
    );
    return parts.join('');
  });

  value = value.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, body: string) => {
    const items = Array.from(body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(
      (item) => `- ${inlineMarkdown(item[1])}`
    );
    return `\n\n${items.join('\n')}\n\n`;
  });

  value = value.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, body: string) => {
    const items = Array.from(body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(
      (item, index) => `${index + 1}. ${inlineMarkdown(item[1])}`
    );
    return `\n\n${items.join('\n')}\n\n`;
  });

  value = value.replace(
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
    (_match, text: string) => `\n\n${inlineMarkdown(text)}\n\n`
  );
  value = value.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
  value = value.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, text: string) => {
    const quote = inlineMarkdown(text)
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
    return `\n\n${quote}\n\n`;
  });
  value = value.replace(/<[^>]+>/g, '');
  value = decodeEntities(value);
  value = value.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  return value
    .replace(/__TABLE_(\d+)__/g, (_match, index: string) => tables[Number(index)] ?? '')
    .trim();
};

const renderMarkdown = (options: {
  title: string;
  description: string;
  canonical: string;
  content: string;
}) => `---
title: ${JSON.stringify(options.title)}
description: ${JSON.stringify(options.description)}
url: ${JSON.stringify(options.canonical)}
language: "tr-TR"
---

${htmlToMarkdown(options.content)}
`;

const nav = `
  <header>
    <a class="static-brand" href="/">TarhanaTerapi</a>
    <nav aria-label="Ana menü">
      <a href="/urunler/tarhana-classic">Ürünler ve fiyatlar</a>
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
      <a href="/urunler/tarhana-classic">Ürünler</a> ·
      <a href="/iletisim">İletişim</a> ·
      <a href="/kvkk">KVKK</a> ·
      <a href="/llms.txt">llms.txt</a> ·
      <a href="/llms-full.txt">llms-full.txt</a>
    </p>
  </footer>`;

const contactBlock = `
  <h2>İletişim</h2>
  <p>
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
    a: 'Koruyucu, renklendirici ve aroma verici kullanılmaz. Ürün buğday unu, yoğurt, domates, biber, az miktarda nohut unu, tuz ve baharatlardan oluşur. Buğday içerdiği için glutensiz değildir.',
  },
];

const productContent = (product: Product) => `
  <main>
    <p><a href="/">Ana Sayfa</a> / ${esc(product.name)}</p>
    <h1>${esc(product.name)}</h1>
    <p class="static-definition">
      <strong>${esc(product.name)}</strong>, TarhanaTerapi'nin Bursa Orhangazi'deki aile
      atölyesinde ürettiği ${esc(product.weight.toLowerCase())} üründür. ${esc(
        product.description.replace(/^1 kg pamuk torba\.\s*/, '')
      )}
    </p>
    <p><strong>Fiyat: ${product.price} TL</strong> · ${esc(product.weight)} · Stokta</p>
    <p><a class="static-cta" href="/iletisim">Sipariş ve stok için iletişime geç</a></p>

    <h2>Ürün detayı</h2>
    <p>${esc(product.details)}</p>

    <h2>İçindekiler</h2>
    <ul>${product.ingredients.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    <p>Alerjen bilgisi: buğday (gluten), süt (yoğurt) ve nohut (az miktarda nohut unu) içerir. Glutensiz değildir.</p>

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

    <h2>İstek üzerine çeşitler</h2>
    <p>
      Acılı ve bebek/çocuk dostu versiyonlar istek üzerine hazırlanır. Sipariş öncesi
      <a href="/iletisim">iletişime geçebilirsiniz</a>.
    </p>
  </main>
  ${contactBlock}`;

const homeContent = () => `
  <main>
    <h1>Geleneksel Tarhana</h1>
    <p class="static-definition"><strong>TarhanaTerapi</strong>, ${esc(
      BRAND_DEFINITION.replace(/^TarhanaTerapi,\s*/, '')
    )}</p>
    <p>${esc(SHORT_ANSWER)}</p>
    <p><a class="static-cta" href="/urunler/tarhana-classic">Ürünü ve güncel fiyatı gör</a></p>

    <h2>Ürün ve fiyat</h2>
    ${productTable()}

    <h2>Neden TarhanaTerapi?</h2>
    <ul>
      <li>Üç nesillik aile tarifi; taş değirmen unu, köy yoğurdu ve güneşte olgunlaşmış sebzeler.</li>
      <li>Az miktarda nohut unu hamura karışır; paket içinde ayrı nohut gönderilmez.</li>
      <li>Koruyucu, renklendirici ve aroma verici yok.</li>
      <li>Hamur güneşte ve hava akımında kurutulur; pamuk torbada paketlenir.</li>
      <li>Üretim yeri: Orhangazi / Bursa; 1-3 iş gününde teslimat.</li>
    </ul>

    ${faqBlock()}
  </main>
  ${contactBlock}`;

const ingredientsContent = () => `
  <main>
    <h1>İçindekiler ve Üretim Adımları</h1>
    <p class="static-definition">
      TarhanaTerapi tarhanası; taş değirmen buğday unu, köy yoğurdu, tarla domatesi, közlenmiş
      kapya biber, az miktarda nohut unu, kaya tuzu ve dağ baharatlarından yapılır. Hazır
      çorba değildir; koruyucu, renklendirici ve aroma verici içermez.
    </p>

    <h2>Malzemeler</h2>
    ${INGREDIENTS.map(
      (item) => `<h3>${esc(item.name)}</h3>
      <p>${esc(item.description)} Kaynak: ${esc(item.source)}. ${esc(item.benefits.join(', '))}.</p>`
    ).join('\n')}

    <h2>Üretim adımları</h2>
    <ol>
      <li>Un, yoğurt, domates, biber, az miktarda nohut unu ve baharatlar hazırlanır.</li>
      <li>Malzemeler hamur kıvamına gelene kadar yoğrulur.</li>
      <li>Hamur ince ve eşit kalınlıkta açılır.</li>
      <li>Güneşte ve hava akımında kurutulur, elenir.</li>
      <li>Pamuk torbalara doldurulup sevk edilir.</li>
    </ol>
    <p>Buğday, süt ve nohut içerir; glutensiz ve laktozsuz değildir.</p>
    ${faqBlock(5)}
  </main>
  ${contactBlock}`;

const storyContent = () => `
  <main>
    <h1>Üretim Hikayemiz: Orhangazi ve Aile Tarifi</h1>
    <p class="static-definition">${esc(BRAND_DEFINITION)}</p>
    <p>
      TarhanaTerapi'nin tarifi, Orhangazi'de üç nesil boyunca kurulan sofralardan geliyor.
      Üretim, Bursa Orhangazi'deki Muradiye Mh.'ndeki aile atölyesinde yapılır. Hamur,
      aile tarifine göre yoğrulur; ince açılır ve güneşte/hava akımında kurutulur.
    </p>
    <p>
      Amaç, market rafında uzun süre dayanması için işlenmiş bir çorba tozu değil; anne
      mutfağındaki gibi ekşimsi ve katkısız bir tarhana üretmek. Bu yüzden koruyucu,
      renklendirici ve aroma verici kullanılmaz. Ürünler nefes alan pamuk
      torbalarda paketlenir.
    </p>
    <h2>Üretim bilgileri</h2>
    <ul>
      <li>Üretim yeri: ${esc(CONTACT.address.street)}, ${CONTACT.address.locality} / ${CONTACT.address.region}</li>
      <li>Üretim: yoğurma, ince açma ve güneşte/hava akımında kurutma</li>
      <li>Ana malzemeler: taş değirmen buğday unu, köy yoğurdu, domates, kapya biber, az miktarda nohut unu</li>
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
      TarhanaTerapi sipariş, kargo ve ürün soruları için ${CONTACT.email} adresinden
      ulaşılabilir. Üretim atölyesi Bursa Orhangazi'deki Muradiye Mh. adresindedir.
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
    /<link[^>]*rel="alternate"[^>]*type="text\/markdown"[^>]*>/,
    `<link rel="alternate" type="text/markdown" href="${markdownUrl(canonical)}" />`
  );
  out = replaceFirst(
    out,
    /<link[^>]*rel="describedby"[^>]*>/,
    `<link rel="describedby" type="text/plain" href="${SITE_URL}/llms.txt" />`
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

const targets: Array<{
  file: string;
  html: string;
  markdown: string;
  path: string;
  priority: string;
}> = [];
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

const routeContent: Record<Exclude<SiteRoute, 'products'>, () => string> = {
  home: homeContent,
  ingredients: ingredientsContent,
  story: storyContent,
  reviews: reviewsContent,
  contact: contactContent,
  legal: legalContent,
};

const prerenderRoutes = (Object.keys(routePaths) as SiteRoute[]).filter(
  (route): route is Exclude<SiteRoute, 'products'> => route !== 'products'
);

prerenderRoutes.forEach((route) => {
  const seo = routeSeo[route];
  const path = routePaths[route];
  const canonical = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const content = routeContent[route]();
  const html = renderPage({
    route,
    canonical,
    title: seo.title,
    description: seo.description,
    jsonLd: jsonLdForRoute(route),
    content,
  });
  targets.push({
    file: route === 'home' ? 'index.html' : `${path.replace(/^\//, '')}.html`,
    html,
    markdown: renderMarkdown({
      title: seo.title,
      description: seo.description,
      canonical,
      content,
    }),
    path,
    priority: route === 'home' ? '1.0' : '0.8',
  });
});

PRODUCTS.forEach((product) => {
  const path = productPath(product);
  const canonical = `${SITE_URL}${path}`;
  const title = `${product.name} — ${product.price} TL | TarhanaTerapi`;
  const description = productSeoDescription(product);
  const content = productContent(product);
  const html = renderPage({
    route: path,
    canonical,
    title,
    description,
    jsonLd: jsonLdForRoute('products', product),
    content,
    isProduct: true,
  });
  targets.push({
    file: `urunler/${product.id}.html`,
    html,
    markdown: renderMarkdown({ title, description, canonical, content }),
    path,
    priority: '0.7',
  });
});

const guideIndexTitle = 'Tarhana Rehberi: Kurutma, Saklama ve Bebek | TarhanaTerapi';
const guideIndexDescription =
  'Tarhana nasıl kurutulur, neden ekşir, bebeklere ne zaman verilir ve katkısız tarhana nasıl anlaşılır? Uygulamalı tarhana rehberleri.';
const guideIndexContent = guidesIndexContent();
const guideIndexCanonical = `${SITE_URL}${GUIDE_INDEX_PATH}`;
targets.push({
  file: 'rehber.html',
  html: renderPage({
    route: GUIDE_INDEX_PATH,
    canonical: guideIndexCanonical,
    title: guideIndexTitle,
    description: guideIndexDescription,
    jsonLd: jsonLdForGuideIndex(),
    content: guideIndexContent,
  }),
  markdown: renderMarkdown({
    title: guideIndexTitle,
    description: guideIndexDescription,
    canonical: guideIndexCanonical,
    content: guideIndexContent,
  }),
  path: GUIDE_INDEX_PATH,
  priority: '0.8',
});

GUIDES.forEach((guide) => {
  const path = guidePath(guide);
  const canonical = guideUrl(guide);
  const title = `${guide.title} | TarhanaTerapi`;
  const content = guideContent(guide);
  targets.push({
    file: `rehber/${guide.slug}.html`,
    html: renderPage({
      route: path,
      canonical,
      title,
      description: guide.description,
      jsonLd: jsonLdForGuide(guide),
      content,
    }),
    markdown: renderMarkdown({
      title,
      description: guide.description,
      canonical,
      content,
    }),
    path,
    priority: '0.8',
  });
});

targets.forEach((target) => {
  const file = join(dist, target.file);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, target.html, 'utf8');

  const markdownFile = target.file === 'index.html' ? 'index.md' : target.file.replace(/\.html$/, '.md');
  const markdownPath = join(dist, markdownFile);
  mkdirSync(dirname(markdownPath), { recursive: true });
  writeFileSync(markdownPath, target.markdown, 'utf8');

  console.log(`  prerender: /${target.file} (${target.html.length} bayt)`);
  console.log(`  prerender: /${markdownFile} (${target.markdown.length} bayt)`);
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
