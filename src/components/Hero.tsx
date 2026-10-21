import React from 'react';
import { ASSETS } from '../data/mockData';
import { BRAND_DEFINITION } from '../lib/site';
import { ActiveTab } from '../types';

interface HeroProps {
  onExploreProducts: () => void;
  onExploreIngredients: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProducts,
  onExploreIngredients,
}) => {
  return (
    <section className="relative overflow-hidden bg-surface-container-low pt-8 pb-16 lg:py-20 border-b border-surface-container-high/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 z-10">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm tracking-wide uppercase shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  eco
                </span>
                %100 Katkısız &amp; Doğal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm tracking-wide uppercase shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  soup_kitchen
                </span>
                Geleneksel Aile Tarifi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm tracking-wide uppercase shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  auto_awesome
                </span>
                1 kg Pamuk Torba
              </span>
            </div>

            {/* Main Emotional Title */}
            <h1 className="font-headline-lg text-on-surface leading-tight tracking-tight text-balance">
              Bir Kasede Saklı{' '}
              <span className="italic text-primary">Çocukluk ve Şifa:</span>{' '}
              Geleneksel Tarhana Çorbası
            </h1>

            {/* AI cevapları için marka tanımı: H1'in hemen altında, görünür metin */}
            <p className="font-body-md text-on-surface max-w-2xl leading-relaxed border-l-2 border-primary/40 pl-4">
              {BRAND_DEFINITION}
            </p>

            {/* Sensory Narrative */}
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Taş değirmen unu, köy yoğurdu, güneşle olgunlaşmış domates ve közlenmiş kapya
              biberin kadim harmonisi. Tereyağında nane ve pul biberle taçlanan, her yudumda
              ruhunuzu saran sıcacık bir esenlik.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onExploreProducts}
                className="inline-flex items-center justify-center gap-3 bg-primary-container text-on-primary-container font-title-lg px-8 py-4 rounded-lg shadow-[0_12px_28px_-4px_rgba(45,36,36,0.12),0_6px_14px_-2px_rgba(200,75,49,0.1)] hover:bg-primary transition-all duration-300 transform hover:-translate-y-0.5 text-center cursor-pointer active:scale-98"
              >
                <span>Şimdi Keşfet &amp; Sipariş Ver</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={onExploreIngredients}
                className="inline-flex items-center justify-center gap-2 bg-surface text-on-surface font-title-lg px-7 py-4 rounded-lg shadow-xs hover:bg-surface-container transition-colors text-center cursor-pointer border border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[20px] text-tertiary">
                  menu_book
                </span>
                <span>İçindekileri İncele</span>
              </button>
            </div>

            {/* Bottom Micro Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline-variant/30 mt-2">
              <div className="flex flex-col">
                <span className="font-headline-md text-primary font-bold">1 kg</span>
                <span className="font-body-sm text-on-surface-variant">
                  Pamuk Torba
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-secondary font-bold">0 Katkı</span>
                <span className="font-body-sm text-on-surface-variant">
                  Koruyucu &amp; Aroma Yok
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-tertiary font-bold">Güneşte</span>
                <span className="font-body-sm text-on-surface-variant">
                  Doğal Kurutma
                </span>
              </div>
            </div>
          </div>

          {/* Visual Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full aspect-square max-w-lg rounded-2xl overflow-hidden shadow-[0_24px_48px_-8px_rgba(45,36,36,0.18),0_12px_24px_-4px_rgba(200,75,49,0.12)] bg-surface-container group">
              <img
                alt="Pamuk torbada geleneksel tarhana"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                src={ASSETS.heroSteamingBowl}
                width={1024}
                height={1024}
                loading="eager"
                fetchPriority="high"
              />

              {/* Steaming & Artisanal Floating Tag */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-surface/90 backdrop-blur-md shadow-md flex items-center justify-between border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">
                      shopping_bag
                    </span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-on-surface text-sm sm:text-base">
                      Pamuk Torbada Tazelik
                    </h4>
                    <p className="font-body-sm text-on-surface-variant text-xs sm:text-sm">
                      1 kg geleneksel tarhana
                    </p>
                  </div>
                </div>
                <span className="font-headline-sm text-primary font-bold text-sm sm:text-lg">
                  Katkısız
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
