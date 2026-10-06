import React from 'react';
import { Sparkles, BrainCircuit, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AIAnalysisResult } from '../../types';
import { PriorityBadge } from './PriorityBadge';

interface AiAnalysisCardProps {
  analysis: AIAnalysisResult | null;
  isLoading: boolean;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 p-6 backdrop-blur-sm animate-pulse shadow-glow-brand">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BrainCircuit className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-indigo-200">CampusPulse AI Engine Processing...</h4>
            <p className="text-xs text-slate-400">Extracting semantic intent, category, SLA priority & department</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-indigo-500/10 rounded w-3/4" />
          <div className="h-4 bg-indigo-500/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const confidencePct = Math.round(analysis.confidence * 100);

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-900/90 p-6 backdrop-blur-sm shadow-glow-brand transition-all">
      {/* Header with confidence */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-100 flex items-center gap-1.5">
              AI Understanding & Classification
            </h4>
            <p className="text-xs text-slate-400">
              Department: <span className="text-indigo-300 font-semibold">{analysis.department}</span>
            </p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-indigo-500/20">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Confidence</div>
            <div className="text-xs font-bold font-mono text-indigo-300">{confidencePct}%</div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-900/40 border border-indigo-400/40 text-[11px] font-bold text-indigo-200">
            {confidencePct >= 90 ? 'High' : 'Med'}
          </div>
        </div>
      </div>

      {/* Structured extracted values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Detected Category</span>
          <span className="text-xs font-semibold text-slate-200 uppercase font-mono">
            {analysis.category.replace('_', ' ')}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Recommended Priority</span>
          <PriorityBadge priority={analysis.priority} size="sm" />
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Routed Department</span>
          <span className="text-xs font-semibold text-indigo-300">{analysis.department}</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Executive Summary
        </span>
        <p className="text-sm text-slate-200 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
          {analysis.summary}
        </p>
      </div>

      {/* AI Reasons */}
      {analysis.reason && analysis.reason.length > 0 && (
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Neural Decision Rationale
          </span>
          <ul className="space-y-1.5">
            {analysis.reason.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
