import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { ASSETS } from '../data/mockData';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onShowToast: (msg: string) => void;
  onOpenLegalModal: (title: string, text: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onShowToast,
  onOpenLegalModal,
}) => {
  const [bulletinEmail, setBulletinEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletinEmail || !bulletinEmail.includes('@')) {
      onShowToast('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    onShowToast('Şifa bültenimize başarıyla kaydoldunuz! Teşekkürler.');
    setBulletinEmail('');
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
              Anadolu'nun kadim topraklarından sofranıza uzanan şifa ritüeli. Doğal
              fermantasyon, yerel nohut ve ata tohumları ile hazırlanan, modern
              gastronomiyle harmanlanmış geleneksel sağlık iksiri.
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
                href="mailto:sifa@tarhanaterapi.com"
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
              <button
                onClick={() => handleNav('products')}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Şifalı Çorbalar
              </button>
              <button
                onClick={() => handleNav('ingredients')}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Nohut Terapi
              </button>
              <button
                onClick={() => handleNav('story')}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Gelenek &amp; Maya
              </button>
              <button
                onClick={() => handleNav('reviews')}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Müşteri Yorumları
              </button>
              <button
                onClick={() => handleNav('contact')}
                className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                İletişim &amp; Adres
              </button>
            </nav>
          </div>

          {/* Col 3: Kadim Saflık */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="font-title-lg text-on-surface font-semibold">Kadim Saflık</span>
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
                    Anne Eliyle Fermente
                  </p>
                  <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                    Toprak küplerde 21 gün dinlendirilen probiyotik güç.
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
              Mevsimlik harmanlar, slow-food tarifleri ve bağırsak dostu beslenme rehberleri
              posta kutunuzda.
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
            © 2025 TarhanaTerapi. Tüm hakları saklıdır. Bursa Orhangazi'nin şifasıyla sevgiyle üretilmiştir.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() =>
                onOpenLegalModal(
                  'Gizlilik Politikası',
                  'TarhanaTerapi olarak kişisel verilerinizin gizliliğine ve güvenliğine en üst seviyede hassasiyet gösteriyoruz. Sipariş sırasında alınan bilgileriniz asla 3. şahıslarla paylaşılmaz.'
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
                  'Tüm siparişler 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri çerçevesinde güvence altındadır.'
                )
              }
              className="font-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Mesafeli Satış
            </button>
            <button
              onClick={() =>
                onOpenLegalModal(
                  'KVKK Aydınlatma Metni',
                  '6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, verileriniz sipariş yönetimi ve kargo takibi amacıyla sınırlı olarak işlenmektedir.'
                )
              }
              className="font-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              KVKK
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
