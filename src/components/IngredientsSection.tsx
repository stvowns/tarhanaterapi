import React from 'react';
import { ASSETS, INGREDIENTS } from '../data/mockData';

interface IngredientsSectionProps {
  onOpenIngredientsModal: () => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  onOpenIngredientsModal,
}) => {
  return (
    <section className="py-16 lg:py-28 bg-surface-container-low" id="icindekiler">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10 lg:gap-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-0.5 w-8 bg-secondary"></span>
              <span className="font-label-lg uppercase tracking-wider text-secondary font-bold">
                Tam Şeffaflık
              </span>
            </div>
            <h2 className="font-headline-lg text-on-surface">
              Topraktan Kaseye: Saf, Katkısız ve Şeffaf
            </h2>
            <p className="font-body-lg text-on-surface-variant mt-3 leading-relaxed">
              Neyi içtiğinizi tam olarak biliyorsunuz. Çorbamızda koruyucu, bulyon,
              renklendirici veya yapay kıvam artırıcılar asla yer almaz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenIngredientsModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-highest hover:bg-surface-container-high rounded-lg font-title-md text-on-surface transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">
                fact_check
              </span>
              <span>7 Doğal Bileşen (Tümünü İncele)</span>
            </button>
          </div>
        </div>

        {/* Grid: Flatlay Image + Interactive Ingredient List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Flatlay Image */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-[0_16px_32px_-4px_rgba(45,36,36,0.1)] aspect-[16/11] bg-surface-container group">
            <img
              alt="Ahşap masa üzerinde tarhana, domates, biber, tuz ve taze baharatlar"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              src={ASSETS.flatlayIngredients}
              loading="lazy"
            />
          </div>

          {/* Ingredients List */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {INGREDIENTS.map((item) => (
              <div
                key={item.id}
                onClick={onOpenIngredientsModal}
                className="p-3.5 rounded-xl bg-surface shadow-xs hover:shadow-md transition-all flex items-start gap-3.5 cursor-pointer border border-transparent hover:border-outline-variant/30"
              >
                <div className={`w-9 h-9 rounded-full ${item.badgeBg} flex items-center justify-center text-on-surface font-bold shrink-0`}>
                  {item.number}
                </div>
                <div>
                  <h4 className="font-title-md text-on-surface text-sm">{item.name}</h4>
                  <p className="font-body-sm text-on-surface-variant mt-0.5 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
