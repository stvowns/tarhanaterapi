import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { ASSETS } from '../data/mockData';
import { GIZLILIK_POLITIKASI, MESAFELI_SATIS } from '../data/legal';
import { CONTENT_UPDATED_LABEL, primaryProductPath, routePaths } from '../lib/site';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onShowToast: (msg: string) => void;
  onOpenLegalModal: (title: string, text: string) => void;
  onSubscribe: (email: string, marketingConsent: boolean) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onShowToast,
  onOpenLegalModal,
  onSubscribe,
}) => {
  const [bulletinEmail, setBulletinEmail] = useState('');
  const [bulletinConsent, setBulletinConsent] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletinEmail || !bulletinEmail.includes('@')) {
      onShowToast('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (!bulletinConsent) {
      onShowToast('Bültene kaydolmak için KVKK onay kutusunu işaretleyin.');
      return;
    }
    onSubscribe(bulletinEmail.trim(), true);
    onShowToast('Şifa bültenimize başarıyla kaydoldunuz! Teşekkürler.');
    setBulletinEmail('');
    setBulletinConsent(false);
  };

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-surface-container-low text-on-surface mt-16 border-t border-surface-container-high">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img
                alt="TarhanaTerapi Logo"
                className="h-7 w-auto object-contain"
                src={ASSETS.logo}
              />
              <span className="font-headline-sm text-primary font-bold">TarhanaTerapi</span>
            </div>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Anadolu'nun kadim topraklarından sofranıza uzanan şifa ritüeli. Aile tarifi,
              yerel malzemeler ve özenli hazırlıkla üretilen katkısız geleneksel tarhana.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                href="#paylas"
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard?.writeText(window.location.href);
                  onShowToast('Bağlantı panoya kopyalandı!');
                }}
                title="Paylaş"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
              </a>
              <a
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                href="#instagram"
                onClick={(e) => {
                  e.preventDefault();
                  onShowToast('Instagram: @tarhanaterapi');
                }}
                title="Instagram"
              >
                <span className="material-symbols-outlined text-[18px]">camera</span>
              </a>
              <a
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                href="mailto:satis@tarhanaterapi.com"
                title="E-posta Gönder"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </a>
            </div>
          </div>

          {/* Col 2: Keşfet Links */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="font-title-lg text-on-surface font-semibold">Keşfet</span>
            <nav className="flex flex-col gap-2">
              <a
                href={primaryProductPath}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('products');
                }}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Tarhanamız
              </a>
              <a
                href={routePaths.ingredients}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('ingredients');
                }}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                İçindekiler
              </a>
              <a
                href={routePaths.story}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('story');
                }}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Gelenek &amp; Tarif
              </a>
              <a
                href="/rehber"
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Tarhana Rehberi
              </a>
              <a
                href={routePaths.reviews}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('reviews');
                }}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Müşteri Yorumları
              </a>
              <a
                href={routePaths.contact}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('contact');
                }}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                İletişim &amp; Adres
              </a>
            </nav>
          </div>

          {/* Col 3: Kadim Saflık */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="font-title-lg text-on-surface font-semibold">Katkısız Üretim</span>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
                  verified
                </span>
                <div>
                  <p className="font-title-md text-on-surface text-sm font-semibold">
                    %100 Doğal &amp; Katkısız
                  </p>
                  <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                    Sıfır koruyucu, sıfır yapay aroma ve sentetik katkı.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0">
                  spa
                </span>
                <div>
                  <p className="font-title-md text-on-surface text-sm font-semibold">
                    Güneşte Kurutulmuş
                  </p>
                  <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                    Hamur, güneşte ve hava akımında doğal yöntemle kurutulur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5 shrink-0">
                  nest_eco_leaf
                </span>
                <div>
                  <p className="font-title-md text-on-surface text-sm font-semibold">
                    Yerli Üretici Dayanışması
                  </p>
                  <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                    Bursa Orhangazi ve Marmara ovalarından toplanan ata tohumları.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Şifa Bülteni */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="font-title-lg text-on-surface font-semibold">Şifa Bülteni</span>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              Mevsimlik çorba reçeteleri, tarhana pişirme püf noktaları ve yeni ürün
              duyuruları posta kutunuzda.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
              <div className="flex items-center rounded-lg bg-surface-container-lowest px-3 py-2.5 shadow-2xs border border-outline-variant/30">
                <span className="material-symbols-outlined text-outline text-[20px] mr-2">
                  alternate_email
                </span>
                <input
                  className="w-full bg-transparent font-body-sm text-on-surface placeholder:text-outline focus:outline-none text-sm"
                  placeholder="E-posta adresiniz"
                  type="email"
                  value={bulletinEmail}
                  onChange={(e) => setBulletinEmail(e.target.value)}
                  required
                />
              </div>
              <label className="flex items-start gap-2 text-[10px] leading-relaxed text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulletinConsent}
                  onChange={(e) => setBulletinConsent(e.target.checked)}
                  required
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-outline-variant text-primary focus:ring-primary/40"
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
                  'ni okudum; şifa bültenine abone olmak ve ticari elektronik ileti
                  almak istiyorum.
                </span>
              </label>
              <button
                className="bg-primary text-on-primary font-label-lg rounded-lg py-2.5 px-4 text-center hover:bg-primary-container transition-colors cursor-pointer shadow-2xs active:scale-98"
                type="submit"
              >
                Kayıt Ol
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body-sm text-on-surface-variant text-xs">
            © 2026 TarhanaTerapi. Tüm hakları saklıdır. Bursa Orhangazi'nin şifasıyla sevgiyle
            üretilmiştir.
            <span className="block mt-1 text-[11px] text-outline">
              Son içerik güncellemesi: {CONTENT_UPDATED_LABEL}
            </span>
          </p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() =>
                onOpenLegalModal(
                  'Gizlilik Politikası',
                  GIZLILIK_POLITIKASI
                )
              }
              className="font-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Gizlilik Politikası
            </button>
            <button
              onClick={() =>
                onOpenLegalModal(
                  'Mesafeli Satış Sözleşmesi',
                  MESAFELI_SATIS
                )
              }
              className="font-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Mesafeli Satış
            </button>
            <a
              href="/kvkk"
              className="font-body-sm text-on-surface-variant hover:text-on-surface"
            >
              KVKK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
