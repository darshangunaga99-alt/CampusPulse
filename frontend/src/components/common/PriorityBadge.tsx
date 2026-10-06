import React from 'react';
import { Priority } from '../../types';
import { AlertCircle, AlertTriangle, ArrowUpRight, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showIcon = true,
  size = 'md',
}) => {
  const getStyles = () => {
    switch (priority) {
      case 'critical':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30 ring-rose-500/20 font-semibold shadow-glow-critical',
          icon: AlertCircle,
        };
      case 'high':
        return {
          badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30 ring-orange-500/20 font-medium',
          icon: ArrowUpRight,
        };
      case 'medium':
        return {
          badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30 ring-blue-500/20',
          icon: AlertTriangle,
        };
      case 'low':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-emerald-500/20',
          icon: Minus,
        };
      default:
        return {
          badge: 'bg-slate-700/20 text-slate-300 border-slate-600/30 ring-slate-600/20',
          icon: Minus,
        };
    }
  };

  const { badge, icon: Icon } = getStyles();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ring-1 ring-inset uppercase tracking-wider ${badge} ${sizeClasses}`}
    >
      {showIcon && <Icon className={iconSizes} />}
      {priority}
    </span>
  );
};
