import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface SlaBadgeProps {
  deadline?: string | null;
  status?: string;
  size?: 'sm' | 'md';
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ deadline, status, size = 'md' }) => {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
        <Clock className="w-3.5 h-3.5" /> No SLA
      </span>
    );
  }

  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diffMs = target - now;
  const isOverdue = diffMs <= 0 && status !== 'completed';
  const isCompleted = status === 'completed';

  const formatRemaining = () => {
    if (isCompleted) return 'Met SLA';
    if (isOverdue) {
      const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      const overdueMins = Math.abs(Math.floor((diffMs / (1000 * 60)) % 60));
      return `Overdue by ${overdueHours > 0 ? `${overdueHours}h ` : ''}${overdueMins}m`;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m remaining`;
    }
    return `${mins}m remaining`;
  };

  const getStyle = () => {
    if (isCompleted) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (isOverdue) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse-subtle font-semibold';
    }
    const hoursRemaining = diffMs / (1000 * 60 * 60);
    if (hoursRemaining < 2) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono rounded-md border px-2.5 py-1 ${getStyle()} ${
        size === 'sm' ? 'text-[11px]' : 'text-xs'
      }`}
      title={`SLA Target: ${new Date(deadline).toLocaleString()}`}
    >
      {isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> : <Clock className="w-3.5 h-3.5" />}
      <span>{formatRemaining()}</span>
    </div>
  );
};
