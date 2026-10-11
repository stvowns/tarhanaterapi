import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 max-w-md border border-white/10 animate-slide-up">
      <span className="material-symbols-outlined text-secondary-fixed text-[24px]">
        check_circle
      </span>
      <span className="font-body-md text-sm font-medium">{message}</span>
    </div>
  );
};
