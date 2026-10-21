import React from 'react';
import { REVIEWS } from '../data/mockData';

interface ReviewsSectionProps {
  onViewAllReviews: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onViewAllReviews }) => {
  const topReviews = REVIEWS.slice(0, 3);

  return (
    <section className="py-16 lg:py-28 bg-surface" id="yorumlar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Top Social Proof Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-center">
          <div className="p-8 rounded-2xl bg-surface-container-low shadow-xs border border-outline-variant/10">
            <span className="font-display-hero text-primary font-bold">420+</span>
            <p className="font-title-lg text-on-surface mt-2">Doğrulanmış Yorum</p>
            <p className="font-body-sm text-on-surface-variant">Gerçek alıcı deneyimleri</p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-container-low shadow-xs border border-outline-variant/10">
            <div className="flex items-center justify-center gap-1 text-secondary mb-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="font-display-hero text-on-surface font-bold">4.9 / 5</span>
            <p className="font-title-lg text-on-surface mt-1">Müşteri Memnuniyeti</p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-container-low shadow-xs border border-outline-variant/10">
            <span className="font-display-hero text-tertiary font-bold">1-3 Gün</span>
            <p className="font-title-lg text-on-surface mt-2">Türkiye Geneli Kargo</p>
            <p className="font-body-sm text-on-surface-variant">2000 TL üzeri ücretsiz</p>
          </div>
        </div>

        {/* Testimonials Mosaic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topReviews.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-2xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(45,36,36,0.05)] border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-1 text-secondary mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-lg text-on-surface italic leading-relaxed">
                  "{review.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/20">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-2xs ${
                    review.avatarColor === 'primary'
                      ? 'bg-primary-fixed text-primary'
                      : review.avatarColor === 'secondary'
                      ? 'bg-secondary-fixed text-secondary'
                      : 'bg-tertiary-fixed text-tertiary'
                  }`}
                >
                  {review.initials}
                </div>
                <div>
                  <p className="font-title-md text-on-surface text-sm font-semibold">
                    {review.author}
                  </p>
                  <p className="font-body-sm text-on-surface-variant text-xs">
                    Doğrulanmış Alıcı • {review.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Reviews Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onViewAllReviews}
            className="inline-flex items-center gap-2 text-primary font-title-md hover:underline cursor-pointer group"
          >
            <span>Tüm 420+ Gerçek Müşteri Yorumunu Gör ve Kendi Yorumunu Yaz</span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
