import React from 'react';
import { RequestStatus, IncidentStatus } from '../../types';

interface StatusBadgeProps {
  status: RequestStatus | IncidentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'pending':
      case 'detected':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 ring-amber-400/20';
      case 'assigned':
      case 'investigating':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20 ring-blue-400/20';
      case 'in_progress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ring-indigo-400/20';
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-400/20';
      case 'escalated':
      case 'critical' as any:
        return 'bg-red-500/10 text-red-400 border-red-500/20 ring-red-400/20 animate-pulse-subtle';
      case 'rejected':
      case 'cancelled':
        return 'bg-slate-700/30 text-slate-400 border-slate-700/40 ring-slate-600/20';
      default:
        return 'bg-slate-700/20 text-slate-300 border-slate-700/30 ring-slate-600/20';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset ${getStyles()} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formatText(status)}
    </span>
  );
};
