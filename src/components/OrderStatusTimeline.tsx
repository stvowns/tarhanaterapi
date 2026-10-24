import React from 'react';

const STEPS = [
  { label: 'Sipariş Alındı', icon: 'shopping_bag' },
  { label: 'Hazırlanıyor', icon: 'inventory_2' },
  { label: 'Kargoda', icon: 'local_shipping' },
  { label: 'Teslimat', icon: 'check_circle' },
] as const;

type StepState = 'completed' | 'current' | 'pending';

const getStepStates = (status: string): StepState[] => {
  switch (status) {
    case 'Yeni Sipariş':
      return ['current', 'pending', 'pending', 'pending'];
    case 'Hazırlanıyor':
      return ['completed', 'current', 'pending', 'pending'];
    case 'Kargoya Verildi':
      return ['completed', 'completed', 'current', 'pending'];
    case 'Tamamlandı':
    case 'Teslim Edildi':
      return ['completed', 'completed', 'completed', 'completed'];
    default:
      return ['current', 'pending', 'pending', 'pending'];
  }
};

interface OrderStatusTimelineProps {
  status: string;
  compact?: boolean;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  status,
  compact = false,
}) => {
  if (status === 'İptal' || status === 'İptal Edildi') {
    return (
      <div className="rounded-lg bg-error-container px-3 py-2 text-[11px] font-semibold text-on-error-container">
        Bu sipariş iptal edildi.
      </div>
    );
  }

  const states = getStepStates(status);
  const circleSize = compact ? 'h-7 w-7' : 'h-9 w-9';
  const iconSize = compact ? 'text-[15px]' : 'text-[20px]';
  const labelSize = compact ? 'text-[10px]' : 'text-[11px]';
  const lineTop = compact ? 'top-3.5' : 'top-[18px]';

  return (
    <div className="grid grid-cols-4" role="list" aria-label="Sipariş süreci">
      {STEPS.map((step, index) => {
        const state = states[index];
        const nextState = states[index + 1];
        const isCompleted = state === 'completed';
        const isCurrent = state === 'current';
        const lineActive =
          nextState === 'completed' || nextState === 'current';

        const circleClass = isCompleted
          ? 'border-emerald-700 bg-emerald-700 text-white'
          : isCurrent
            ? 'border-emerald-700 bg-surface text-emerald-700 ring-4 ring-emerald-100'
            : 'border-outline-variant/50 bg-surface-container-low text-outline';
        const labelClass = isCompleted || isCurrent ? 'text-emerald-800' : 'text-outline';

        return (
          <div
            key={step.label}
            className="relative flex flex-col items-center gap-1.5 text-center"
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
          >
            {index < STEPS.length - 1 && (
              <span
                className={`absolute left-1/2 h-0.5 w-full ${lineTop} ${
                  lineActive ? 'bg-emerald-600' : 'bg-outline-variant/40'
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex items-center justify-center rounded-full border-2 leading-none ${circleSize} ${circleClass}`}
              aria-hidden="true"
            >
              <span className={`material-symbols-outlined leading-none ${iconSize}`}>
                {step.icon}
              </span>
            </span>
            <span className={`${labelSize} font-semibold leading-tight ${labelClass}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
