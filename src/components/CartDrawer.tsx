import React, { useState } from 'react';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../lib/commerce';
import { CartItem } from '../types';
import { productPath } from '../lib/site';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const subtotalAfterDiscount = rawSubtotal - discountAmount;
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD;
  const shippingFee =
    subtotalAfterDiscount >= freeShippingThreshold || cartItems.length === 0
      ? 0
      : STANDARD_SHIPPING_FEE;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalAfterDiscount);
  const finalTotal = subtotalAfterDiscount + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'SIFA10' || clean === 'KOD10') {
      setDiscountPercent(10);
      setPromoSuccess('%10 Şifa İndirimi uygulandı!');
    } else if (clean === 'ANNE15') {
      setDiscountPercent(15);
      setPromoSuccess('%15 Anne Sevgisi İndirimi uygulandı!');
    } else {
      setPromoError('Geçersiz indirim kodu. (Örnek: SIFA10)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex w-full max-w-md">
        <div className="flex h-full w-full flex-col justify-between border-l border-surface-container-high bg-surface shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-surface-container-high bg-surface-container-low p-4 sm:p-6">
            <div className="flex min-w-0 items-center gap-2">
              <span className="material-symbols-outlined shrink-0 text-primary text-[24px]">
                shopping_bag
              </span>
              <h2 className="truncate font-headline-sm text-on-surface text-lg sm:text-xl">Şifa Sepetiniz</h2>
              <span className="shrink-0 text-xs bg-primary-fixed text-primary px-2 py-0.5 rounded-full font-bold">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Ürün
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Free Shipping Tracker */}
          <div className="bg-surface-container-high px-6 py-3 border-b border-surface-container">
            {remainingForFreeShipping > 0 ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-on-surface">
                  <span className="font-medium">
                    Kargo bedava için <strong>₺{remainingForFreeShipping}</strong> daha ekleyin
                  </span>
                  <span className="text-primary font-bold">₺{freeShippingThreshold}</span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (subtotalAfterDiscount / freeShippingThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">
                  local_shipping
                </span>
                <span>Tebrikler! Siparişinizde kargo ÜCRETSİZ.</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
            {cartItems.length === 0 ? (
              <div className="my-auto text-center flex flex-col items-center py-12">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-[32px]">
                    production_quantity_limits
                  </span>
                </div>
                <h3 className="font-title-lg text-on-surface">Sepetiniz henüz boş</h3>
                <p className="font-body-sm text-on-surface-variant max-w-xs mt-1">
                  Aile tarifiyle hazırlanan geleneksel tarhanamızı sepete ekleyin.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg text-sm font-semibold hover:bg-primary transition-colors cursor-pointer"
                >
                  Çorbaları İncele
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs items-center"
                >
                  <a
                    href={productPath(item.product)}
                    onClick={onClose}
                    title={`${item.product.name} ürün sayfasına git`}
                    className="flex flex-1 min-w-0 items-center gap-4 group"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.product.image.replace('.webp', '-400.webp')}
                      srcSet={`${item.product.image.replace('.webp', '-400.webp')} 400w, ${item.product.image.replace('.webp', '-700.webp')} 700w`}
                      sizes="72px"
                      alt={item.product.name}
                      width={72}
                      height={72}
                      loading="lazy"
                      className="w-18 h-18 object-cover rounded-lg bg-surface-container shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-title-md text-sm text-on-surface truncate font-semibold group-hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-outline mt-0.5">{item.product.weight}</p>
                      <div className="font-headline-sm text-sm text-primary font-bold mt-1">
                        ₺{item.product.price * item.quantity}
                      </div>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-outline mt-0.5">
                          {item.quantity} × ₺{item.product.price}
                        </p>
                      )}
                    </div>
                  </a>

                  {/* Stepper & Remove */}
                  <div className="flex flex-col items-end justify-between h-full gap-2">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-outline hover:text-error transition-colors p-1"
                      title="Ürünü sil"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>

                    <div className="flex items-center border border-outline-variant/40 rounded-md bg-surface-container-low">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-xs hover:bg-surface-container text-on-surface"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-on-surface">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs hover:bg-surface-container text-on-surface"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-surface-container-low border-t border-surface-container-high flex flex-col gap-4">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kupon Kodu (Örn: SIFA10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-surface border border-outline-variant/40 uppercase"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-surface-container-highest text-on-surface text-xs font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                  Uygula
                </button>
              </form>
              {promoSuccess && (
                <p className="text-xs text-emerald-700 font-medium">{promoSuccess}</p>
              )}
              {promoError && <p className="text-xs text-error font-medium">{promoError}</p>}

              {/* Price Breakdown */}
              <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span className="font-medium text-on-surface">₺{rawSubtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>İndirim ({discountPercent}%)</span>
                    <span>-₺{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Kargo Ücreti</span>
                  <span className="font-medium text-on-surface">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">Ücretsiz</span>
                    ) : (
                      `₺${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-on-surface pt-2 border-t border-outline-variant/30">
                  <span>Genel Toplam</span>
                  <span className="text-primary font-headline-sm">₺{finalTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-primary-container hover:bg-primary text-on-primary-container rounded-lg font-title-md font-semibold text-center shadow-md transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Siparişi Tamamla</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
