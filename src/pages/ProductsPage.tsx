import React, { useState, useMemo } from 'react';
import { PRODUCTS } from '../data/mockData';
import { productPath } from '../lib/site';
import { Product } from '../types';

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onAddToCart,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  const categories = [
    { id: 'all', label: 'Tüm Şifalı Çorbalar' },
    { id: 'classic', label: 'Geleneksel Anne Mayası' },
    { id: 'spicy', label: 'Acılı & Gurme' },
    { id: 'baby', label: 'Bebek & Çocuk' },
    { id: 'sets', label: 'Setler & Koleksiyon' },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Doğal Kiler Koleksiyonu
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            Şifalı Çorba Çeşitlerimiz
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2">
            Toprak küplerde 21 gün dinlendirilen, ata tohumu nohut taneleriyle lezzetlenen saf ve katkısız harmanlarımız.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-surface-container-high">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-primary-container text-on-primary-container shadow-xs font-bold'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-60">
              <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                placeholder="Çorba ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="popular">Öne Çıkanlar</option>
              <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="rating">Puan: En Yüksek</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-on-surface-variant text-base">
              Aramanızla eşleşen şifalı çorba bulunamadı.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-xs font-semibold"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_16px_-2px_rgba(45,36,36,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(45,36,36,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-outline-variant/20 group"
              >
                {/* Image */}
                <div className="relative w-full aspect-square rounded-xl bg-surface-container overflow-hidden mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-xs px-2.5 py-1 rounded-full uppercase shadow-xs">
                      {product.tag}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-inverse-surface/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-surface/90 text-on-surface px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Detayları Gör
                    </span>
                  </div>
                </div>

                {/* Rating & reviews */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="material-symbols-outlined text-secondary text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    grade
                  </span>
                  <span className="font-label-sm text-on-surface-variant">
                    {product.rating} ({product.reviewsCount}+ Değerlendirme)
                  </span>
                </div>

                <h3 className="font-title-lg text-on-surface group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="font-body-sm text-on-surface-variant mt-1 mb-2 flex-grow line-clamp-2">
                  {product.description}
                </p>

                <a
                  href={productPath(product)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-primary mb-3 hover:underline"
                >
                  Ürün detayı, içindekiler ve fiyat →
                </a>

                {/* Bottom Price & Add */}
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-auto">
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-primary font-bold text-lg">
                      ₺{product.price}
                    </span>
                    <span className="text-[11px] text-outline">{product.weight}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-title-md hover:bg-primary transition-colors cursor-pointer text-xs font-semibold active:scale-95 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    <span>Sepete Ekle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
