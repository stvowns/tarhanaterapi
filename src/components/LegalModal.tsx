import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high mb-4">
          <h3 className="font-headline-sm text-lg text-on-surface font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-6 max-h-[60vh] overflow-y-auto pr-2 whitespace-pre-line">
          {content}
        </div>
        <div className="text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary-container text-on-primary-container text-xs font-semibold rounded-lg hover:bg-primary transition-colors cursor-pointer"
          >
            Anladım &amp; Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
