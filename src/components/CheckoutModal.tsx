import React, { useState, useEffect } from 'react';
import { CartItem, Order, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: User | null;
  onCreateOrder: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onCreateOrder,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    city: currentUser?.city || 'İstanbul',
    district: currentUser?.district || 'Kadıköy',
    address: currentUser?.address || '',
    note: '',
    paymentMethod: 'credit_card' as 'credit_card' | 'cod',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName,
        email: prev.email || currentUser.email,
        phone: prev.phone || currentUser.phone || '',
        city: prev.city || currentUser.city || 'İstanbul',
        district: prev.district || currentUser.district || 'Kadıköy',
        address: prev.address || currentUser.address || '',
      }));
    }
  }, [currentUser]);

  const [orderCode, setOrderCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = rawSubtotal >= 300 || cartItems.length === 0 ? 0 : 45;
  const totalAmount = rawSubtotal + shippingFee;

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerCity: formData.city,
      customerDistrict: formData.district,
      customerAddress: formData.address,
      deliveryNote: formData.note,
      paymentMethod: formData.paymentMethod,
      items: cartItems.map((ci) => ({
        productId: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        weight: ci.selectedWeight || ci.product.weight,
        image: ci.product.image,
      })),
      subtotal: rawSubtotal,
      shippingFee,
      discount: 0,
      total: totalAmount,
    };

    try {
      const response = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Sipariş kaydedilemedi');
      }

      const finalOrderNumber = data.orderNumber || `TT-${Date.now()}`;

      const newOrder: Order = {
        id: data.id || `ord-${Date.now()}`,
        orderNumber: finalOrderNumber,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        customerDistrict: formData.district,
        deliveryNote: formData.note,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          name: ci.product.name,
          price: ci.product.price,
          quantity: ci.quantity,
          weight: ci.selectedWeight || ci.product.weight,
          image: ci.product.image,
        })),
        subtotal: rawSubtotal,
        shippingFee,
        discount: 0,
        total: totalAmount,
        status: 'Yeni Sipariş',
        createdAt: new Date().toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setOrderCode(finalOrderNumber);
      onCreateOrder(newOrder);
      setStep(3);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Sipariş kaydedilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-xs transition-opacity"
        onClick={() => (step === 3 ? onClose() : null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        {/* Header */}
        <div className="bg-surface-container-low p-6 border-b border-surface-container-high flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-on-surface text-xl">Güvenli Sipariş</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {step === 1 && '1. Adım: Teslimat ve Adres Bilgileri'}
              {step === 2 && '2. Adım: Güvenli Ödeme Tercihi'}
              {step === 3 && 'Siparişiniz Alındı! Şifa Olsun.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="flex border-b border-surface-container">
          <div
            className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 ${
              step >= 1
                ? 'border-primary text-primary bg-primary-fixed/20'
                : 'border-transparent text-outline'
            }`}
          >
            1. Teslimat
          </div>
          <div
            className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 ${
              step >= 2
                ? 'border-primary text-primary bg-primary-fixed/20'
                : 'border-transparent text-outline'
            }`}
          >
            2. Ödeme
          </div>
          <div
            className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 ${
              step === 3
                ? 'border-primary text-primary bg-primary-fixed/20'
                : 'border-transparent text-outline'
            }`}
          >
            3. Onay
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* STEP 1: Address Form */}
          {step === 1 && (
            <form onSubmit={handleSubmitStep1} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ayşe Yılmaz"
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0532 000 00 00"
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  E-posta (Kargo Takip Bilgisi İçin) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@posta.com"
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    İl *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    İlçe *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Açık Adres (Cadde, Sokak, No, Daire) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Mahalle, sokak, bina ve daire numarası..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Teslimat Notu (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Örn: Zili çalmayınız, kapıya bırakınız..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20 mt-2">
                <span className="text-sm font-semibold text-on-surface">
                  Toplam: <strong className="text-primary text-base">₺{totalAmount}</strong>
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary-container rounded-lg font-title-md text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ödemeye Geç</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Form */}
          {step === 2 && (
            <form onSubmit={handleCompleteOrder} className="flex flex-col gap-4">
              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    formData.paymentMethod === 'credit_card'
                      ? 'border-primary bg-primary-fixed/20 shadow-xs'
                      : 'border-outline-variant/40 bg-surface-container-lowest'
                  }`}
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    credit_card
                  </span>
                  <span className="font-semibold text-xs text-on-surface">Kredi / Banka Kartı</span>
                  <span className="text-[10px] text-outline">3D Secure Güvenli Ödeme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-primary bg-primary-fixed/20 shadow-xs'
                      : 'border-outline-variant/40 bg-surface-container-lowest'
                  }`}
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    local_shipping
                  </span>
                  <span className="font-semibold text-xs text-on-surface">Kapıda Ödeme</span>
                  <span className="text-[10px] text-outline">Nakit veya Kartla Kapıda</span>
                </button>
              </div>

              {formData.paymentMethod === 'credit_card' ? (
                <div className="flex flex-col gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Kart Numarası
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">
                        Son Kullanma Tarihi
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="AA/YY (Örn: 12/28)"
                        maxLength={5}
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">
                        CVV / Güvenlik Kodu
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="123"
                        maxLength={4}
                        value={formData.cardCvc}
                        onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-secondary-fixed/30 rounded-xl text-xs text-on-surface leading-relaxed">
                  <p className="font-semibold text-secondary mb-1">Kapıda Ödeme Bilgilendirmesi:</p>
                  Siparişiniz özel korumalı kutuda kapınıza kadar gelir. Kurye teslimi sırasında nakit
                  veya temassız kredi kartınızla güvenle ödeyebilirsiniz.
                </div>
              )}

              <div className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  lock
                </span>
                <span>256-Bit SSL ile tüm işlemleriniz banka güvencesi altındadır.</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  ← Adres Bilgilerine Dön
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-title-md text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSubmitting ? 'Kaydediliyor...' : `Siparişi Onayla (₺${totalAmount})`}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Order Confirmation */}
          {step === 3 && (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <h3 className="font-headline-sm text-on-surface text-xl">
                Siparişiniz Başarıyla Alındı!
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mt-1">
                Şifalı anne tarhananız özenle paketlenip 24 saat içinde kargoya verilecektir.
              </p>

              <div className="my-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-left w-full max-w-md">
                <div className="flex justify-between text-xs py-1 border-b border-outline-variant/20">
                  <span className="text-outline">Sipariş No:</span>
                  <span className="font-bold text-on-surface">{orderCode}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-outline-variant/20">
                  <span className="text-outline">Alıcı:</span>
                  <span className="font-medium text-on-surface">{formData.fullName || 'Değerli Misafirimiz'}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-outline-variant/20">
                  <span className="text-outline">Teslimat Adresi:</span>
                  <span className="font-medium text-on-surface">{formData.city} / {formData.district}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-outline">Tahmini Teslimat:</span>
                  <span className="font-bold text-emerald-700">1-2 İş Günü İçinde</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-primary-container hover:bg-primary text-on-primary-container rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Alışverişe Devam Et
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
