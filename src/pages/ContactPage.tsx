import React, { useState } from 'react';
import { FAQS } from '../data/mockData';

interface ContactPageProps {
  onShowToast: (msg: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onShowToast }) => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'siparis',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    try {
      await fetch('/api/contact-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      onShowToast('Mesajınız başarıyla iletildi. Müşteri ekibimiz en kısa sürede dönüş yapacaktır.');
    } catch {
      onShowToast('Mesajınız alındı ancak bildirim gönderimi başarısız oldu.');
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        topic: 'siparis',
        message: '',
      });
    }, 2500);
  };

  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Bize Ulaşın
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            İletişim, Atölye &amp; Merak Edilenler
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2 leading-relaxed">
            Sorularınız, kurumsal hediye siparişleriniz veya kooperatif işbirlikleri için buradayız.
          </p>
        </div>

        {/* Contact Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* Left Info Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Phone Card */}
            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-outline">
                  Telefon &amp; WhatsApp Destek
                </span>
                <a
                  href="tel:+908503028274"
                  className="font-headline-sm text-lg font-bold text-primary block hover:underline mt-0.5"
                >
                  0850 302 82 74
                </a>
                <p className="text-xs text-on-surface-variant mt-1">
                  Pazartesi - Cumartesi: 09:00 - 18:30 (Müşteri ve Şifa Hattı)
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-outline">
                  E-Posta İletişim
                </span>
                <a
                  href="mailto:satis@tarhanaterapi.com"
                  className="font-title-md text-base font-bold text-on-surface block hover:underline mt-0.5"
                >
                  satis@tarhanaterapi.com
                </a>
                <p className="text-xs text-on-surface-variant mt-1">
                  Ortalama 2 saat içinde yanıtlanmaktadır.
                </p>
              </div>
            </div>

            {/* Ateliers */}
            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Atölye &amp; Tadım Noktalarımız
              </span>
              <div className="border-b border-outline-variant/20 pb-3">
                <strong className="text-xs font-bold text-on-surface block">
                  Bursa Orhangazi Doğal Üretim Çiftliği
                </strong>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Gedelek Köyü Mevkii No: 28, Orhangazi / Bursa
                </p>
              </div>
              <div>
                <strong className="text-xs font-bold text-on-surface block">
                  İstanbul Kadıköy Tadım Atölyesi
                </strong>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Caferağa Mah. Şifa Sokak No: 8/B, Moda, Kadıköy / İstanbul
                </p>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-10 rounded-3xl border border-outline-variant/30 shadow-sm">
            <h3 className="font-headline-sm text-2xl text-on-surface mb-2 font-bold">
              Bize Mesaj Gönderin
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Aklınıza takılan her şeyi danışabilir, özel siparişlerinizi belirtebilirsiniz.
            </p>

            {submitted && (
              <div className="p-4 mb-6 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Mesajınız alındı! Ekibimiz gün içinde sizinle iletişime geçecektir.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    E-Posta Adresiniz *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="eposta@adresiniz.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Konu
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40 cursor-pointer"
                  >
                    <option value="siparis">Sipariş &amp; Kargo Durumu</option>
                    <option value="icerik">İçindekiler &amp; Alerjen Bilgisi</option>
                    <option value="hediye">Kurumsal Hediye &amp; Toptan Alım</option>
                    <option value="kooperatif">Kooperatif &amp; Çiftçi Dayanışması</option>
                    <option value="diger">Diğer Konular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Mesajınız *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mesajınızı bu alana yazabilirsiniz..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                />
              </div>

              <button
                type="submit"
                className="mt-2 py-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Mesajı Gönder
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <span className="font-label-lg uppercase text-secondary font-bold">
              Sıkça Sorulan Sorular
            </span>
            <h2 className="font-headline-md text-2xl sm:text-3xl text-on-surface mt-1">
              Merak Ettiğiniz Her Şey
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-low transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-title-md text-sm font-semibold text-on-surface flex items-center justify-between cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[20px] text-primary transition-transform">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
