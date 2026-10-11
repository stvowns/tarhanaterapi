import React from 'react';
import { COOKING_STEPS } from '../data/mockData';

interface CookingRitualSectionProps {
  onOpenCookingAssistant: () => void;
}

export const CookingRitualSection: React.FC<CookingRitualSectionProps> = ({
  onOpenCookingAssistant,
}) => {
  return (
    <section className="py-16 lg:py-28 bg-surface-container-low" id="rituel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-label-lg uppercase tracking-wider text-secondary font-bold">
            Mutfakta Huzurlu 15 Dakika
          </span>
          <h2 className="font-headline-lg text-on-surface mt-2">
            Kusursuz Pişirme Ritüeli
          </h2>
          <p className="font-body-lg text-on-surface-variant mt-2">
            Anne usulü çorbanızı tam kıvamında ve kadife pürüzsüzlüğünde pişirmenin dört altın
            kuralı.
          </p>
        </div>

        {/* 4-Step Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {COOKING_STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col p-6 rounded-2xl bg-surface shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-outline-variant/20"
            >
              <div
                className={`w-12 h-12 rounded-full font-headline-sm flex items-center justify-center font-bold mb-4 shadow-2xs ${step.badgeBg}`}
              >
                {step.number}
              </div>
              <h3 className="font-title-lg text-on-surface mb-2">{step.title}</h3>
              <p className="font-body-md text-on-surface-variant leading-relaxed flex-grow">
                {step.description}
              </p>
              {step.tip && (
                <div className="mt-4 pt-3 border-t border-outline-variant/20 text-xs text-outline italic flex items-start gap-1">
                  <span className="material-symbols-outlined text-[15px] text-secondary shrink-0 mt-0.5">
                    lightbulb
                  </span>
                  <span>{step.tip}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Assistant Banner Callout */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenCookingAssistant}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-surface text-on-surface hover:bg-surface-container font-title-md shadow-xs border border-outline-variant/50 transition-all cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-primary text-[22px]">
              timer
            </span>
            <span>İnteraktif Pişirme Asistanını Başlat (Zamanlayıcılı)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
