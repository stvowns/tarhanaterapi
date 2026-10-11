import React, { useState } from 'react';
import { Review } from '../types';

interface ReviewsPageProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ reviews, onAddReview }) => {
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Form states
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [productName, setProductName] = useState('Geleneksel Nohutlu Anne Tarhanası');
  const [content, setContent] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const filteredReviews = starFilter
    ? reviews.filter((r) => r.rating === starFilter)
    : reviews;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !content) return;

    const initials = author
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AL';

    onAddReview({
      author,
      initials,
      location: location || 'Türkiye',
      rating,
      productName,
      content,
      verified: true,
      avatarColor: 'primary',
    });

    setFormSuccess(true);
    setAuthor('');
    setLocation('');
    setContent('');
    setTimeout(() => {
      setFormSuccess(false);
      setShowReviewForm(false);
    }, 2000);
  };

  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Gerçek Sofralardan Yankılar
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            Müşteri Deneyimleri ve Şifa Yorumları
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2 leading-relaxed">
            Türkiye'nin dört bir yanından evlerine TarhanaTerapi konuk eden misafirlerimizin
            içten izlenimleri.
          </p>
        </div>

        {/* Rating Breakdown Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-surface-container-low p-6 sm:p-10 rounded-3xl border border-outline-variant/30 mb-12">
          {/* Main Score */}
          <div className="md:col-span-4 text-center md:border-r border-outline-variant/30 pr-0 md:pr-8">
            <span className="font-display-hero text-5xl font-bold text-on-surface block">
              4.9
            </span>
            <div className="flex items-center justify-center gap-1 text-secondary my-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="font-title-md text-on-surface text-sm font-semibold">
              420+ Doğrulanmış Sipariş
            </p>
            <p className="text-xs text-outline mt-0.5">%99.4 Tekrar Satın Alma Oranı</p>
          </div>

          {/* Star Bar Distribution */}
          <div className="md:col-span-5 flex flex-col gap-2">
            {[
              { stars: 5, pct: '94%', count: '395' },
              { stars: 4, pct: '5%', count: '21' },
              { stars: 3, pct: '1%', count: '4' },
              { stars: 2, pct: '0%', count: '0' },
              { stars: 1, pct: '0%', count: '0' },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-on-surface-variant font-medium">
                  {row.stars} Yıldız
                </span>
                <div className="flex-1 bg-surface h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: row.pct }}
                  />
                </div>
                <span className="w-8 text-right text-outline">{row.count}</span>
              </div>
            ))}
          </div>

          {/* Review Action Button */}
          <div className="md:col-span-3 text-center md:text-right">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-3 bg-primary-container hover:bg-primary text-on-primary-container text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              {showReviewForm ? 'Formu Kapat' : 'Deneyimini Paylaş (Yorum Yaz)'}
            </button>
          </div>
        </div>

        {/* Add Review Form Dropdown */}
        {showReviewForm && (
          <form
            onSubmit={handleSubmitReview}
            className="bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-md mb-12 max-w-2xl mx-auto flex flex-col gap-4 animate-fade-in"
          >
            <h3 className="font-headline-sm text-lg text-on-surface font-bold">
              TarhanaTerapi Deneyiminizi Paylaşın
            </h3>

            {formSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Yorumunuz için teşekkür ederiz! Şifa dolu deneyiminiz onaylanıp listelendi.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Adınız Soyadınız *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Elif Kaya"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Şehir
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="İzmir"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Değerlendirme Puanı
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30"
                >
                  <option value={5}>★★★★★ (5 Yıldız - Mükemmel)</option>
                  <option value={4}>★★★★☆ (4 Yıldız - Çok İyi)</option>
                  <option value={3}>★★★☆☆ (3 Yıldız - İyi)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Tattığınız Ürün
                </label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30"
                >
                  <option value="Geleneksel Nohutlu Anne Tarhanası">Geleneksel Nohutlu Anne Tarhanası</option>
                  <option value="Acılı Gurme Terapisi">Acılı Gurme Terapisi</option>
                  <option value="Bebek & Çocuk Dostu Tarhana">Bebek & Çocuk Dostu Tarhana</option>
                  <option value="TarhanaTerapi Başlangıç Seti">TarhanaTerapi Başlangıç Seti</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Yorumunuz &amp; Sofranızdaki Hissi *
              </label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Çorbanın kokusu, kıvamı ve ailedeki etkisi hakkında birkaç cümle..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-xs text-outline hover:text-on-surface"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors"
              >
                Yorumu Yayınla
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <span className="text-xs text-outline font-semibold uppercase tracking-wider mr-2">
            Filtrele:
          </span>
          <button
            onClick={() => setStarFilter(null)}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
              starFilter === null
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Tümü ({reviews.length})
          </button>
          {[5, 4].map((s) => (
            <button
              key={s}
              onClick={() => setStarFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                starFilter === s
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>{s} Yıldız</span>
              <span className="material-symbols-outlined text-[14px]">star</span>
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-2xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(45,36,36,0.05)] border border-outline-variant/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-secondary">
                    {[...Array(review.rating)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-outline">{review.date}</span>
                </div>

                <p className="text-xs font-semibold text-primary mb-2">{review.productName}</p>

                <p className="font-body-md text-sm text-on-surface italic leading-relaxed">
                  "{review.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/20">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
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
                  <p className="font-title-md text-xs font-semibold text-on-surface">
                    {review.author}
                  </p>
                  <p className="text-[11px] text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-emerald-600">
                      verified
                    </span>
                    <span>Doğrulanmış Alıcı • {review.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
