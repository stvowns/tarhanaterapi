import React, { useState } from 'react';

interface NewsletterSectionProps {
  onDownloadEbook: (email: string, marketingConsent: boolean) => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onDownloadEbook }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    if (!consent) {
      setError('Devam etmek için KVKK onay kutusunu işaretleyin.');
      return;
    }

    setError('');
    onDownloadEbook(email.trim(), marketingConsent);
    setEmail('');
    setConsent(false);
    setMarketingConsent(false);
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
            className="w-full lg:w-auto shrink-0 flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
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
            </div>

            <label className="flex items-start gap-2 text-[11px] leading-relaxed text-on-surface-variant max-w-sm cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (e.target.checked) setError('');
                }}
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant text-primary focus:ring-primary/40"
              />
              <span>
                <a
                  href="/kvkk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  KVKK Aydınlatma Metni
                </a>
                'ni okudum; e-posta adresimin e-kitap talebimin yönetilmesi için
                işlenmesine onay veriyorum.
              </span>
            </label>

            <label className="flex items-start gap-2 text-[11px] leading-relaxed text-on-surface-variant max-w-sm cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant text-primary focus:ring-primary/40"
              />
              <span>
                Şifa Bülteni'ne abone olmak ve ticari elektronik ileti almak istiyorum.
                <span className="text-outline"> (isteğe bağlı)</span>
              </span>
            </label>

            {error && (
              <p className="text-[11px] text-red-700" role="alert">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
