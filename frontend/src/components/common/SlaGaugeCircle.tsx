import React from 'react';

interface SlaGaugeCircleProps {
  percentage: number;
  remainingText: string;
  label?: string;
  variant?: 'blue' | 'warning' | 'error' | 'neutral';
}

export const SlaGaugeCircle: React.FC<SlaGaugeCircleProps> = ({
  percentage,
  remainingText,
  label = 'SLA Deadline',
  variant = 'blue',
}) => {
  const strokeColorClass =
    variant === 'error'
      ? 'text-error'
      : variant === 'warning'
      ? 'text-on-surface-variant'
      : 'text-secondary';

  return (
    <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center gap-space-md shrink-0">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-surface-container-high"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={strokeColorClass}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${Math.min(100, Math.max(0, percentage))}, 100`}
            strokeLinecap="round"
            strokeWidth="3.5"
          />
        </svg>
        <span className="absolute font-mono-data-sm text-mono-data-sm font-bold text-on-surface">
          {percentage}%
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
        <span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">
          {remainingText}
        </span>
      </div>
    </div>
  );
};
