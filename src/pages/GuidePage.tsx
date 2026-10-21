import React from 'react';
import { PRODUCTS } from '../data/mockData';
import { GUIDES, Guide, guidePath } from '../data/guides';
import { CONTENT_UPDATED_LABEL, GUIDE_INDEX_PATH, productPath } from '../lib/site';

interface GuidePageProps {
  guide: Guide;
}

export const GuidePage: React.FC<GuidePageProps> = ({ guide }) => {
  const related = PRODUCTS.filter((product) => guide.relatedProducts.includes(product.id));
  const otherGuides = GUIDES.filter((item) => item.slug !== guide.slug);

  return (
    <article className="py-10 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
        <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant mb-6 flex flex-wrap items-center gap-1.5">
          <a href="/" className="hover:text-primary">Ana Sayfa</a>
          <span aria-hidden="true">/</span>
          <a href={GUIDE_INDEX_PATH} className="hover:text-primary">Rehber</a>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">{guide.h1}</span>
        </nav>

        <span className="font-label-lg uppercase tracking-wider text-primary font-bold text-xs">
          Tarhana Rehberi · {guide.readingMinutes} dk okuma
        </span>
        <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl leading-tight">
          {guide.h1}
        </h1>
        <p className="font-body-lg text-on-surface-variant mt-4 leading-relaxed">
          {guide.intro}
        </p>
        <p className="text-xs text-outline mt-3">
          Yayın ve son güncelleme: {CONTENT_UPDATED_LABEL} · TarhanaTerapi
        </p>

        <div className="mt-10 flex flex-col gap-8">
          {guide.sections.map((section) => (
            <section key={section.h2}>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-3">{section.h2}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="font-body-md text-on-surface-variant leading-relaxed mb-3"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-on-surface-variant">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-headline-sm text-2xl text-on-surface mb-4">
            Sık sorulan sorular
          </h2>
          <div className="flex flex-col gap-3">
            {guide.faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl bg-surface-container-low border border-outline-variant/30 px-5 py-4"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <h3 className="font-title-md text-sm sm:text-base font-semibold text-on-surface">
                    {faq.q}
                  </h3>
                  <span className="material-symbols-outlined text-primary text-[22px] shrink-0 transition-transform group-open:rotate-45">
                    add
                  </span>
                </summary>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6">
            <h2 className="font-headline-sm text-xl text-on-surface mb-2">
              Bu rehberdeki ürünler
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Katkısız, aile tarifiyle hazırlanan geleneksel tarhanamızı inceleyin.
            </p>
            <ul className="flex flex-col gap-2">
              {related.map((product) => (
                <li key={product.id}>
                  <a
                    href={productPath(product)}
                    className="flex items-center justify-between gap-3 text-sm text-on-surface hover:text-primary"
                  >
                    <span>{product.name} · {product.weight}</span>
                    <span className="font-semibold text-primary whitespace-nowrap">
                      {product.price} TL
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-headline-sm text-xl text-on-surface mb-3">Diğer rehberler</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {otherGuides.map((item) => (
              <li key={item.slug}>
                <a href={guidePath(item)} className="text-primary hover:underline">
                  {item.h1}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-outline mt-10 leading-relaxed">
          Bu içerik bilgilendirme amaçlıdır; tıbbi tavsiye yerine geçmez. Bebek beslenmesi,
          alerjenler ve özel sağlık durumları için hekiminize danışın.
        </p>
      </div>
    </article>
  );
};
