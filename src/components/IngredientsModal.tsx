import React from 'react';
import { INGREDIENTS } from '../data/mockData';

interface IngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IngredientsModal: React.FC<IngredientsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        {/* Header */}
        <div className="bg-surface-container-low p-6 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[26px]">
              eco
            </span>
            <div>
              <h3 className="font-headline-sm text-on-surface text-xl">
                Topraktan Gelen 12 Doğal Şifa Bileşeni
              </h3>
              <p className="text-xs text-on-surface-variant">
                %100 Doğal, Katkısız, Koruyucusuz ve Ata Tohumu Standartlarında
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {INGREDIENTS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${item.badgeBg}`}
                >
                  {item.number}
                </div>
                <div>
                  <h4 className="font-title-md text-sm text-on-surface font-semibold">
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-outline font-medium flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px] text-secondary">
                      pin_drop
                    </span>
                    {item.source}
                  </span>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Benefits list */}
              <div className="mt-3 pt-2 border-t border-outline-variant/20 flex flex-wrap gap-1">
                {item.benefits.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-md"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span>T.C. Tarım ve Orman Bakanlığı Organik Üretim Kodeksine Tam Uyum</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary-container hover:bg-primary text-on-primary-container text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
