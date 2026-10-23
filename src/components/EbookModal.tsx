import React, { useState } from 'react';
import { RECIPES_EBOOK } from '../data/mockData';

interface EbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onCollectEmail?: (email: string) => void;
}

export const EbookModal: React.FC<EbookModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onCollectEmail,
}) => {
  const [selectedRecipeIdx, setSelectedRecipeIdx] = useState(0);
  const [emailInput, setEmailInput] = useState(userEmail || '');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const activeRecipe = RECIPES_EBOOK[selectedRecipeIdx];

  if (!isOpen) return null;

  const handleDownloadFile = () => {
    if (emailInput && onCollectEmail) {
      onCollectEmail(emailInput);
    }

    const link = document.createElement('a');
    link.href = '/kadim-corba-rituelleri-ve-sifali-tarifler.pdf';
    link.download = 'TarhanaTerapi_Kadim_Corba_Rituelleri_ve_Sifali_Tarifler.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        {/* Header */}
        <div className="bg-surface-container-low p-6 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface text-xl font-bold">
                Kadim Çorba Ritüelleri ve Şifalı Tarifler
              </h3>
              <p className="text-xs text-on-surface-variant">
                8 Tarif + Pişirme ve Saklama Rehberi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Recipe Selection Tabs */}
        <div className="flex border-b border-surface-container overflow-x-auto bg-surface-container-lowest">
          {RECIPES_EBOOK.map((recipe, idx) => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipeIdx(idx)}
              className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                idx === selectedRecipeIdx
                  ? 'border-primary text-primary bg-primary-fixed/20 font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              Reçete #{idx + 1}: {recipe.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Recipe Body */}
        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {downloadSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              E-Kitap dosyanız başarıyla cihazınıza indirildi! E-postanız şifa listemize kaydedildi.
            </div>
          )}

          <div className="mb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-primary">
              Özel Reçete #{selectedRecipeIdx + 1}
            </span>
            <h2 className="font-headline-md text-2xl text-on-surface mt-0.5">
              {activeRecipe.title}
            </h2>
            <p className="text-xs text-on-surface-variant italic mt-0.5">
              {activeRecipe.subtitle}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 mb-6 text-center text-xs">
            <div>
              <span className="text-outline block text-[10px]">Hazırlama Süresi</span>
              <strong className="text-on-surface">{activeRecipe.prepTime}</strong>
            </div>
            <div>
              <span className="text-outline block text-[10px]">Porsiyon</span>
              <strong className="text-on-surface">{activeRecipe.servings}</strong>
            </div>
            <div>
              <span className="text-outline block text-[10px]">Zorluk</span>
              <strong className="text-secondary">{activeRecipe.difficulty}</strong>
            </div>
          </div>

          {/* Ingredients list */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">
                kitchen
              </span>
              Malzemeler
            </h3>
            <ul className="space-y-1.5">
              {activeRecipe.ingredients.map((ing, i) => (
                <li key={i} className="text-xs text-on-surface flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                format_list_numbered
              </span>
              Adım Adım Hazırlanışı
            </h3>
            <div className="space-y-2">
              {activeRecipe.steps.map((st, i) => (
                <div key={i} className="flex gap-2.5 text-xs text-on-surface-variant">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{st}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chef's Note */}
          <div className="p-3.5 bg-primary-fixed/20 border border-primary-fixed/40 rounded-xl text-xs text-on-surface flex items-start gap-2.5">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
              soup_kitchen
            </span>
            <div>
              <strong className="text-primary block font-semibold">Şifa Püf Noktası:</strong>
              <p className="mt-0.5 text-on-surface-variant leading-relaxed">
                {activeRecipe.chefNote}
              </p>
            </div>
          </div>

          {activeRecipe.servingIdea && (
            <div className="mt-3 p-3.5 bg-secondary-fixed/20 border border-secondary-fixed/40 rounded-xl text-xs text-on-surface flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                restaurant
              </span>
              <div>
                <strong className="text-secondary block font-semibold">Sunum Önerisi:</strong>
                <p className="mt-0.5 text-on-surface-variant leading-relaxed">
                  {activeRecipe.servingIdea}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with email verification & download */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-auto flex-1 max-w-sm">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="E-postanızı girin..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-outline-variant/40"
            />
          </div>

          <button
            onClick={handleDownloadFile}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary-container hover:bg-primary text-on-primary-container rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>E-Kitabı PDF İndir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
