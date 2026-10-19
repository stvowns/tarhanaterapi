import React from 'react';
import { FAQS } from '../data/mockData';
import { CONTENT_UPDATED_LABEL } from '../lib/site';

/**
 * AI cevaplarında alıntılanabilir soru-cevap bloğu.
 * Aynı içerik FAQPage JSON-LD'si ile birebir eşleşir.
 */
export const FaqSection: React.FC = () => {
  return (
    <section id="sss" className="py-16 lg:py-24 bg-surface-container-low border-y border-surface-container-high/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Merak Edilenler
          </span>
          <h2 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            Tarhana Hakkında Sık Sorulan Sorular
          </h2>
          <p className="font-body-md text-on-surface-variant mt-3">
            Fiyat, kargo, içindekiler, saklama ve bebek tarhanası hakkında en çok sorulan
            soruların kısa yanıtları.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((item, index) => (
            <details
              key={item.q}
              className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 px-5 py-4 open:shadow-sm"
              open={index === 0}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <h3 className="font-title-md text-on-surface text-sm sm:text-base font-semibold">
                  {item.q}
                </h3>
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0 transition-transform group-open:rotate-45">
                  add
                </span>
              </summary>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed mt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <p className="text-center text-xs text-outline mt-8">
          Son güncelleme: {CONTENT_UPDATED_LABEL} · Fiyat ve stok bilgisi bu tarihte
          doğrulanmıştır.
        </p>
        <p className="text-center text-sm mt-4">
          <a href="/rehber" className="text-primary font-semibold hover:underline">
            Tarhana rehberleri: kurutma, saklama ve bebek beslenmesi →
          </a>
        </p>
      </div>
    </section>
  );
};
