import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import { productPath } from '../lib/site';
import { FlyToCartLayer, makeFlyer, type Flyer } from './FlyToCart';

interface ProductsSectionProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  onAddToCart,
  onSelectProduct,
}) => {
  const [addingId, setAddingId] = useState<string | null>(null);
  const [flyers, setFlyers] = useState<Flyer[]>([]);

  const featuredProducts = PRODUCTS.filter((product) => product.inStock).slice(0, 1);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const card = (e.currentTarget as HTMLElement).closest('[data-product-card]');
    const image = card?.querySelector('img') as HTMLImageElement | null;
    const flyer = makeFlyer(product.image, image);
    setFlyers((prev) => [...prev, flyer]);
    window.setTimeout(() => {
      setFlyers((prev) => prev.filter((item) => item.id !== flyer.id));
    }, 900);

    setAddingId(product.id);
    onAddToCart(product);
    setTimeout(() => {
      setAddingId(null);
    }, 1200);
  };

  return (
    <section className="py-16 lg:py-28 bg-surface" id="urunler">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10 lg:gap-12">
        {/* Section Titles */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Doğal Kilerimizden Sofranıza
          </span>
          <h2 className="font-headline-lg text-on-surface mt-2">
            Geleneksel Tarhanamız
          </h2>
          <p className="font-body-lg text-on-surface-variant mt-3">
            Şu anda tek çeşit, 1 kg pamuk torba geleneksel tarhana sunuyoruz. Acılı ve bebek
            versiyonları istek üzerine hazırlanır.
          </p>
        </div>

        {/* Product Card */}
        <div className="grid grid-cols-1 max-w-md mx-auto gap-6">
          {featuredProducts.map((product) => {
            const isAdding = addingId === product.id;

            return (
              <div
                key={product.id}
                data-product-card
                onClick={() => onSelectProduct(product)}
                className="flex flex-col rounded-2xl p-5 bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(45,36,36,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(45,36,36,0.1)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              >
                {/* Image Container with Badge */}
                <div className="relative w-full aspect-square rounded-xl bg-surface-container overflow-hidden mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badge */}
                  {product.tag && (
                    <span
                      className={`absolute top-3 left-3 font-label-sm px-2.5 py-1 rounded-full uppercase shadow-xs ${
                        product.tagColor === 'primary'
                          ? 'bg-primary text-on-primary'
                          : product.tagColor === 'secondary'
                          ? 'bg-secondary text-on-secondary'
                          : product.tagColor === 'tertiary'
                          ? 'bg-tertiary text-on-tertiary'
                          : 'bg-primary-container text-on-primary-container'
                      }`}
                    >
                      {product.tag}
                    </span>
                  )}

                  {/* Quick Detail View Overlay Icon */}
                  <div className="absolute inset-0 bg-inverse-surface/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-surface/90 text-on-surface px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Hızlı İncele
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-title-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                {/* Description */}
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

                {/* Price and Add Button */}
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-auto">
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-primary font-bold">
                      ₺{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-outline line-through">
                        ₺{product.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleAdd(e, product)}
                    disabled={isAdding}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-title-md hover:bg-primary transition-colors cursor-pointer shadow-xs active:scale-95 text-sm"
                  >
                    {isAdding ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        <span>Eklendi!</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">
                          shopping_bag
                        </span>
                        <span>Sepete Ekle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <FlyToCartLayer flyers={flyers} />
    </section>
  );
};
