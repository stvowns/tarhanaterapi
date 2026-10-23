import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, weight: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity, product.weight);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Image */}
          <div className="md:col-span-5 bg-surface-container relative min-h-[300px] md:min-h-full">
            <img
              src={product.image}
              srcSet={`${product.image.replace('.webp', '-400.webp')} 400w, ${product.image.replace('.webp', '-700.webp')} 700w, ${product.image} 1000w`}
              sizes="(min-width: 768px) 40vw, 100vw"
              alt={product.name}
              width={1000}
              height={1000}
              className="w-full h-full object-cover"
            />
            {product.tag && (
              <span className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full uppercase shadow-xs">
                {product.tag}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div>
              {/* Title */}
              <h2 className="font-headline-sm text-2xl text-on-surface mb-2">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-headline-sm text-2xl text-primary font-bold">
                  ₺{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-outline line-through">
                    ₺{product.originalPrice}
                  </span>
                )}
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  Stokta Mevcut
                </span>
              </div>

              {/* Description */}
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed mb-6">
                {product.details}
              </p>

              {/* Fixed weight / packaging */}
              <div className="mb-6">
                <span className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                  Gramaj / Ambalaj
                </span>
                <span className="inline-block px-3 py-2 text-xs rounded-lg border border-outline-variant/40 bg-surface-container-low font-medium text-on-surface">
                  {product.weight}
                </span>
              </div>

              {/* Nutrition Grid */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    nutrition
                  </span>
                  100 g İçin Yaklaşık Besin Değerleri
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-surface rounded-lg">
                    <span className="text-outline block text-[10px]">Kalori</span>
                    <strong className="text-on-surface">{product.nutrition.calories} kcal</strong>
                  </div>
                  <div className="p-2 bg-surface rounded-lg">
                    <span className="text-outline block text-[10px]">Protein</span>
                    <strong className="text-primary">{product.nutrition.protein}</strong>
                  </div>
                  <div className="p-2 bg-surface rounded-lg">
                    <span className="text-outline block text-[10px]">Diyet Lif</span>
                    <strong className="text-secondary">{product.nutrition.fiber}</strong>
                  </div>
                  <div className="p-2 bg-surface rounded-lg">
                    <span className="text-outline block text-[10px]">Yağ</span>
                    <strong className="text-on-surface">{product.nutrition.fat}</strong>
                  </div>
                </div>
              </div>

              {/* Ingredients Tags */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                  Doğal İçerik
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-surface-container-highest text-on-surface text-xs"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="pt-4 border-t border-outline-variant/30 flex items-center gap-4">
              <div className="flex items-center border border-outline-variant/40 rounded-lg bg-surface-container-low">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-on-surface">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={isAdded}
                className="flex-1 py-3 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-title-md text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isAdded ? (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check</span>
                    <span>Sepete Eklendi!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    <span>Sepete Ekle • ₺{product.price * quantity}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
