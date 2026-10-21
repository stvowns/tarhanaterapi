import React, { useState } from 'react';

interface NewsletterSectionProps {
  onDownloadEbook: (email: string) => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onDownloadEbook }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return;
    }
    onDownloadEbook(email);
    setEmail('');
  };

  return (
    <section className="py-14 lg:py-24 bg-surface-container-high relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="bg-surface rounded-3xl p-6 sm:p-8 lg:p-14 shadow-[0_16px_36px_-4px_rgba(45,36,36,0.12)] border border-outline-variant/30 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
          {/* Text */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm uppercase tracking-wide font-bold mb-3 shadow-2xs">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              Hediye Dijital Kitap
            </span>
            <h2 className="font-headline-md text-on-surface">
              "Kadim Çorba Ritüelleri ve Şifalı Tarifler" E-Kitabını Ücretsiz İndirin
            </h2>
            <p className="font-body-md text-on-surface-variant mt-3 leading-relaxed">
              Anadolu'nun dört bir yanından derlenmiş mevsimlik çorba reçeteleri, tarhana
              pişirme püf noktaları ve saklama önerileri bir arada.
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz..."
              required
              className="w-full sm:w-80 px-4 py-3.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-surface shadow-inner font-body-md text-sm sm:text-base border border-outline-variant/30"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary-container text-on-primary-container font-title-md hover:bg-primary transition-all duration-200 whitespace-nowrap shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Hemen İndir</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
