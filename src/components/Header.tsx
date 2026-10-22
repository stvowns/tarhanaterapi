import React, { useState } from 'react';
import { ActiveTab, CartItem, User } from '../types';
import { ASSETS } from '../data/mockData';
import { primaryProductPath, routePaths } from '../lib/site';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAdminModal: () => void;
  newOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartItems,
  onOpenCart,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenAdminModal,
  newOrdersCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'products', label: 'Tarhanamız' },
    { id: 'ingredients', label: 'İçindekiler' },
    { id: 'story', label: 'Hikayemiz' },
    { id: 'reviews', label: 'Yorumlar' },
    { id: 'contact', label: 'İletişim' },
  ];

  const navHref = (tab: ActiveTab) =>
    tab === 'products' ? primaryProductPath : routePaths[tab];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(45,36,36,0.05)] border-b border-surface-container-high/70 h-20">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        {/* Brand Zone - Clean spacing so it never collides with navigation */}
        <div className="flex items-center shrink-0 pr-2 sm:pr-4">
          <a
            href="/"
            aria-label="TarhanaTerapi ana sayfa"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <img
              alt="TarhanaTerapi Logo"
              className="h-8 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              src={ASSETS.logo}
            />
            <span className="hidden sm:inline font-headline-sm text-primary tracking-tight font-bold whitespace-nowrap text-lg sm:text-xl">
              TarhanaTerapi
            </span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-1 justify-center max-w-2xl px-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <a
                key={link.id}
                href={navHref(link.id)}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`transition-all duration-200 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-bold shadow-2xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action Zone: User Membership + Cart + Admin Panel (Admin Only) + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Admin Management Dashboard Button - Only visible to admin users */}
          {Boolean(
            currentUser?.isAdmin || currentUser?.email === 'layeredstudio78@gmail.com'
          ) && (
            <button
              onClick={onOpenAdminModal}
              className="relative hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors text-xs font-semibold cursor-pointer border border-outline-variant/30"
              title="Yönetici Paneli (Sipariş & E-posta Takibi)"
            >
              <span className="material-symbols-outlined text-[17px]">
                admin_panel_settings
              </span>
              <span className="hidden xl:inline">Yönetici</span>
              {newOrdersCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </button>
          )}

          {/* User Membership Button (Active Authentication) */}
          {currentUser ? (
            <button
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Hesabım ve Siparişlerim"
            >
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline max-w-[90px] truncate">
                {currentUser.fullName.split(' ')[0]}
              </span>
              <span className="hidden sm:inline material-symbols-outlined text-[16px] text-outline">
                arrow_drop_down
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                person
              </span>
              <span className="hidden sm:inline">Giriş Yap</span>
            </button>
          )}

          {/* Cart / Sipariş Ver Button */}
          <button
            id="header-cart-button"
            data-fly-target="cart"
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg font-title-md text-xs sm:text-sm shadow-xs hover:bg-primary transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
            aria-label="Sepeti aç"
          >
            <span className="material-symbols-outlined text-[19px]">shopping_bag</span>
            <span className="hidden xs:inline sm:inline font-semibold">Sipariş Ver</span>
            {totalItemsCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold shadow-2xs">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Menüyü aç/kapat"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-surface-container-high px-5 py-4 shadow-xl transition-all max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={navHref(link.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                  className={`flex items-center justify-between text-left py-2.5 px-3.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check
                    </span>
                  )}
                </a>
              );
            })}

            <div className="pt-3 border-t border-surface-container mt-2 flex flex-col gap-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface"
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    account_circle
                  </span>
                  <span>Hesabım: {currentUser.fullName} ({currentUser.points} Şifa Puanı)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-container text-xs font-semibold text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>Üye Girişi / Yeni Kayıt</span>
                </button>
              )}

              {Boolean(
                currentUser?.isAdmin || currentUser?.email === 'layeredstudio78@gmail.com'
              ) && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminModal();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface-variant"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">
                      admin_panel_settings
                    </span>
                    <span>Mağaza Yönetici Paneli</span>
                  </span>
                  {newOrdersCount > 0 && (
                    <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {newOrdersCount} Yeni Sipariş
                    </span>
                  )}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
