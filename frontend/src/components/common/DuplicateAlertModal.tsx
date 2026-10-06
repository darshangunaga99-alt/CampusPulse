import React from 'react';
import { AlertTriangle, Users, ExternalLink, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { DuplicateCheckResult } from '../../types';
import { StatusBadge } from './StatusBadge';

interface DuplicateAlertModalProps {
  isOpen: boolean;
  duplicateData: DuplicateCheckResult | null;
  onFollowIncident: (incidentId: string) => void;
  onCreateAnyway: () => void;
  onCancel: () => void;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  isOpen,
  duplicateData,
  onFollowIncident,
  onCreateAnyway,
  onCancel,
}) => {
  if (!isOpen || !duplicateData || !duplicateData.duplicate_found) return null;

  const incident = duplicateData.incident;
  const matchCount = duplicateData.matching_requests.length;
  const confidencePct = Math.round(duplicateData.confidence * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 text-slate-100">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono font-semibold text-amber-400 mb-1">
              {confidencePct}% SIMILARITY MATCH DETECTED
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              Possible Existing Incident Detected
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              CampusPulse AI detected existing active tickets or a master incident in this area.
            </p>
          </div>
        </div>

        {/* Incident Summary Card if available */}
        {incident && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs font-semibold text-amber-300">
                {incident.incident_number}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{incident.affected_students} students affected</span>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mb-1">{incident.title}</h4>
            <p className="text-xs text-slate-400">
              Teams are actively addressing this outage. You can follow this incident for real-time live SMS/push resolution updates.
            </p>
          </div>
        )}

        {/* Matching Requests list */}
        {matchCount > 0 && (
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Related Active Requests ({matchCount})
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {duplicateData.matching_requests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800"
                >
                  <div className="truncate pr-3">
                    <span className="font-mono text-[11px] text-slate-400 block">{req.ticket_number}</span>
                    <span className="text-xs text-slate-200 font-medium truncate block">{req.title}</span>
                  </div>
                  <StatusBadge status={req.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onCreateAnyway}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all border border-slate-700"
          >
            Create New Request Anyway
          </button>

          {incident ? (
            <button
              onClick={() => onFollowIncident(incident.id)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Follow Existing Incident ({incident.incident_number})
            </button>
          ) : (
            <button
              onClick={onCreateAnyway}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
            >
              Proceed With Submission
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
