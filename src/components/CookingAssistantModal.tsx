import React, { useState, useEffect } from 'react';
import { COOKING_STEPS } from '../data/mockData';

interface CookingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookingAssistantModal: React.FC<CookingAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep = COOKING_STEPS[currentStepIdx];
  const initialSeconds = (currentStep?.durationMinutes || 5) * 60;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync timer when step changes
  useEffect(() => {
    setSecondsLeft((currentStep?.durationMinutes || 5) * 60);
    setIsRunning(false);
    setIsCompleted(false);
  }, [currentStepIdx, currentStep]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent =
    ((((currentStep?.durationMinutes || 5) * 60) - secondsLeft) /
      ((currentStep?.durationMinutes || 5) * 60)) *
    100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        {/* Header */}
        <div className="bg-surface-container-low p-6 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              soup_kitchen
            </span>
            <div>
              <h3 className="font-headline-sm text-on-surface text-xl">
                İnteraktif Pişirme Asistanı
              </h3>
              <p className="text-xs text-on-surface-variant">
                Adım {currentStepIdx + 1} / {COOKING_STEPS.length}: {currentStep.title}
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

        {/* Step Tabs */}
        <div className="grid grid-cols-4 border-b border-surface-container">
          {COOKING_STEPS.map((step, idx) => (
            <button
              key={step.number}
              onClick={() => setCurrentStepIdx(idx)}
              className={`py-3 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                idx === currentStepIdx
                  ? 'border-primary text-primary bg-primary-fixed/20'
                  : idx < currentStepIdx
                  ? 'border-secondary text-secondary bg-surface-container-low'
                  : 'border-transparent text-outline hover:bg-surface-container-low'
              }`}
            >
              Adım {step.number}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Step Icon Badge */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center font-headline-md text-2xl font-bold mb-4 shadow-sm ${currentStep.badgeBg}`}
          >
            {currentStep.number}
          </div>

          <h2 className="font-headline-md text-2xl text-on-surface mb-2">
            {currentStep.title}
          </h2>

          <p className="font-body-lg text-on-surface-variant max-w-md mb-6 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Interactive Timer Box */}
          <div className="w-full max-w-xs bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-inner flex flex-col items-center mb-6">
            <span className="text-xs text-outline font-semibold uppercase tracking-wider mb-1">
              Önerilen Süre Sayacı
            </span>
            <div className="font-mono text-4xl font-bold tracking-widest text-primary my-2 tabular-nums">
              {formattedTime}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden my-3">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {isCompleted ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm animate-bounce">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Bu adım tamamlandı! Sonrakine geçebilirsiniz.</span>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isRunning
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-primary-container text-on-primary-container hover:bg-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isRunning ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isRunning ? 'Durdur' : 'Sayacı Başlat'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setSecondsLeft((currentStep?.durationMinutes || 5) * 60);
                  }}
                  className="px-3 py-2 bg-surface text-outline hover:text-on-surface rounded-lg text-xs border border-outline-variant/40"
                >
                  Sıfırla
                </button>
              </div>
            )}
          </div>

          {/* Chef's Pro Tip */}
          {currentStep.tip && (
            <div className="w-full max-w-md p-4 bg-secondary-fixed/20 border border-secondary-fixed-dim/40 rounded-xl text-left flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                  Usta Aşçının Sırrı:
                </span>
                <p className="text-xs text-on-surface leading-relaxed mt-0.5">
                  {currentStep.tip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-between items-center">
          <button
            onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
            disabled={currentStepIdx === 0}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Önceki Adım</span>
          </button>

          <span className="text-xs text-outline font-medium">
            {currentStepIdx + 1} / {COOKING_STEPS.length}
          </span>

          {currentStepIdx < COOKING_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStepIdx(currentStepIdx + 1)}
              className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary-container text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Sonraki Adım</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Afiyet Olsun! Kapat</span>
              <span className="material-symbols-outlined text-[16px]">done_all</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
