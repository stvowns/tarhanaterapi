import React from 'react';
import { GUIDES, guidePath } from '../data/guides';
import { CONTENT_UPDATED_LABEL } from '../lib/site';

export const GuidesPage: React.FC = () => {
  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Tarhana Rehberi
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            Tarhana Hakkında Uygulamalı Rehberler
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-3 leading-relaxed">
            Kurutma, saklama, bebek beslenmesi ve etiket okuma: tarhana alırken ve evde
            yaparken en çok sorulan konuları adım adım anlatıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          {GUIDES.map((guide) => (
            <a
              key={guide.slug}
              href={guidePath(guide)}
              className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-6 hover:shadow-md hover:border-primary/30 transition-all"
            >
              <span className="text-[11px] uppercase tracking-wider font-bold text-primary">
                {guide.readingMinutes} dk okuma
              </span>
              <h2 className="font-headline-sm text-xl text-on-surface mt-2">{guide.h1}</h2>
              <p className="font-body-sm text-on-surface-variant mt-2 leading-relaxed">
                {guide.description}
              </p>
              <span className="inline-block text-xs font-semibold text-primary mt-4">
                Rehberi oku →
              </span>
            </a>
          ))}
        </div>

        <p className="text-xs text-outline mt-8">
          Son güncelleme: {CONTENT_UPDATED_LABEL}. İçerikler bilgilendirme amaçlıdır; bebek
          beslenmesi ve alerjenler için hekiminize danışın.
        </p>
      </div>
    </div>
  );
};
