import React from 'react';
import { CheckCircle, Clock, User, MessageSquare, Bot, AlertCircle } from 'lucide-react';
import { RequestTimelineItem, RequestStatus } from '../../types';
import { StatusBadge } from './StatusBadge';

interface TimelineVisualizerProps {
  timeline: RequestTimelineItem[];
  currentStatus: RequestStatus;
  isOverdue?: boolean;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  timeline,
  currentStatus,
  isOverdue = false,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Operational Lifecycle & Audit Trail
          </h3>
          <p className="text-xs text-slate-400">Complete chronological execution stream</p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      {isOverdue && (
        <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>This request has exceeded its agreed SLA threshold and is flagged for escalation.</span>
        </div>
      )}

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {timeline.map((item, index) => {
          const isLatest = index === timeline.length - 1;
          const isAi = item.actor?.name?.toLowerCase().includes('ai') || item.actor?.id?.includes('ai');

          return (
            <div key={item.id || index} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-[27px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isLatest
                    ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/20 shadow-glow-brand'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {isAi ? (
                  <Bot className="w-2.5 h-2.5 text-indigo-200" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Content Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">{item.action}</span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(item.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>
                    Actor: <span className="text-slate-300 font-medium">{item.actor?.name || 'System'}</span>
                  </span>
                </div>

                {item.comment && (
                  <div className="mt-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="italic">{item.comment}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
