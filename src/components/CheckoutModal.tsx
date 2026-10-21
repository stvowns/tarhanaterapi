import React, { useState, useEffect } from 'react';
import {
  BANK_TRANSFER_DETAILS,
  BANK_TRANSFER_ENABLED,
  FREE_SHIPPING_THRESHOLD,
  HAS_BANK_TRANSFER_DETAILS,
  STANDARD_SHIPPING_FEE,
} from '../lib/commerce';
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
  const [orderCode, setOrderCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ibanCopied, setIbanCopied] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    city: currentUser?.city || 'İstanbul',
    district: currentUser?.district || 'Kadıköy',
    address: currentUser?.address || '',
    note: '',
    kvkkConsent: false,
    paymentMethod: 'cod' as 'cod' | 'bank_transfer',
  });

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setOrderCode('');
    setIsSubmitting(false);
    setFormError('');
    setIbanCopied(false);
    setFormData((prev) => ({
      ...prev,
      note: '',
    }));
  }, [isOpen]);

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


  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee =
    rawSubtotal >= FREE_SHIPPING_THRESHOLD || cartItems.length === 0
      ? 0
      : STANDARD_SHIPPING_FEE;
  const totalAmount = rawSubtotal + shippingFee;

  const copyIban = async () => {
    if (!BANK_TRANSFER_DETAILS.iban) return;
    try {
      await navigator.clipboard.writeText(BANK_TRANSFER_DETAILS.iban);
      setIbanCopied(true);
      window.setTimeout(() => setIbanCopied(false), 2500);
    } catch {
      setIbanCopied(false);
    }
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.kvkkConsent) {
      setFormError('Siparişi tamamlamak için KVKK onay kutusunu işaretlemeniz gerekiyor.');
      return;
    }
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
        weight: ci.product.weight,
        image: ci.product.image,
      })),
      subtotal: rawSubtotal,
      shippingFee,
      discount: 0,
      total: totalAmount,
      kvkkConsent: formData.kvkkConsent,
    };

    try {
      const response = await fetch('/api/create-order', {
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
          weight: ci.product.weight,
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
      const message = err instanceof Error ? err.message : 'Sipariş kaydedilemedi';
      setFormError(
        /KVKK/i.test(message)
          ? 'Siparişi tamamlamak için KVKK onay kutusunu işaretlemeniz gerekiyor.'
          : message
      );
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
              <div className="flex flex-col gap-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cod'
                      ? 'border-primary bg-primary-fixed/25'
                      : 'border-outline-variant/40 bg-surface-container-low hover:border-primary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() =>
                      setFormData({ ...formData, paymentMethod: 'cod' })
                    }
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-on-surface">
                      Kapıda Ödeme
                    </span>
                    <span className="block text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Siparişiniz özel korumalı kutuda kapınıza gelir; kurye teslimi sırasında
                      nakit veya temassız ödeyebilirsiniz.
                    </span>
                  </span>
                </label>

                {BANK_TRANSFER_ENABLED && (
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary-fixed/25'
                        : 'border-outline-variant/40 bg-surface-container-low hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={() =>
                        setFormData({ ...formData, paymentMethod: 'bank_transfer' })
                      }
                      className="mt-1 accent-primary"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-on-surface">
                        Havale / EFT
                      </span>
                      <span className="block text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Sipariş sonrası banka bilgileri e-posta ile gönderilir. Açıklamaya
                        sipariş numaranızı yazıp dekontu bize iletebilirsiniz.
                      </span>
                    </span>
                  </label>
                )}
              </div>

              {formData.paymentMethod === 'bank_transfer' && (
                <div className="p-4 bg-secondary-fixed/30 rounded-xl text-xs text-on-surface leading-relaxed">
                  Havale/EFT seçtiniz. Siparişi onayladıktan sonra banka bilgileri e-posta ile
                  gönderilecek. Ödemeniz kontrol edildikten sonra siparişiniz kargoya verilir.
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-on-surface mt-1">
                <input
                  id="kvkk-consent"
                  type="checkbox"
                  checked={formData.kvkkConsent}
                  onChange={(e) => {
                    setFormData({ ...formData, kvkkConsent: e.target.checked });
                    setFormError('');
                  }}
                  className="mt-0.5"
                  aria-invalid={!formData.kvkkConsent && Boolean(formError)}
                  aria-describedby={formError ? 'kvkk-consent-error' : undefined}
                  required
                />
                <label htmlFor="kvkk-consent" className="leading-relaxed">
                  <a
                    href="/kvkk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold underline underline-offset-2 hover:text-primary-container"
                  >
                    KVKK Aydınlatma Metni
                  </a>
                  'ni okudum; siparişimin oluşturulması, teslimi ve yasal yükümlülükler için
                  kişisel verilerimin işlenmesine onay veriyorum.
                </label>
              </div>
              {formError && (
                <p id="kvkk-consent-error" role="alert" className="text-xs text-error font-medium">
                  {formError}
                </p>
              )}

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

              {formData.paymentMethod === 'bank_transfer' && (
                <div className="mb-6 p-4 rounded-xl bg-secondary-fixed/30 border border-outline-variant/30 text-left w-full max-w-md text-xs text-on-surface leading-relaxed">
                  <p className="font-semibold mb-2">Havale / EFT Bilgileri</p>
                  {HAS_BANK_TRANSFER_DETAILS ? (
                    <>
                      <p>
                        <span className="text-outline">Banka:</span>{' '}
                        {BANK_TRANSFER_DETAILS.bankName}
                      </p>
                      <p>
                        <span className="text-outline">Hesap Sahibi:</span>{' '}
                        {BANK_TRANSFER_DETAILS.accountName}
                      </p>
                      <p className="mt-1 break-all">
                        <span className="text-outline">IBAN:</span>{' '}
                        <strong>{BANK_TRANSFER_DETAILS.iban}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={copyIban}
                        className="mt-2 inline-flex items-center gap-1 text-primary font-semibold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {ibanCopied ? 'check' : 'content_copy'}
                        </span>
                        {ibanCopied ? 'Kopyalandı' : 'IBAN’ı Kopyala'}
                      </button>
                    </>
                  ) : (
                    <p>
                      Banka bilgileri sipariş onay e-postanızda yer alır. E-posta ulaşmazsa
                      satis@tarhanaterapi.com adresine sipariş numaranızla yazabilirsiniz.
                    </p>
                  )}
                  <p className="mt-2 text-on-surface-variant">
                    Açıklama alanına <strong>{orderCode}</strong> yazın; dekontu
                    satis@tarhanaterapi.com adresine iletin.
                  </p>
                </div>
              )}

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
