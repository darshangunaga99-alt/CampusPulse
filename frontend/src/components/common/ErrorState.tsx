import React from 'react';
import { AlertTriangle, ShieldAlert, FileQuestion, ServerCrash, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  status?: number;
  code?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  status,
  code,
  message,
  onRetry,
}) => {
  const getErrorConfig = () => {
    switch (status) {
      case 401:
        return {
          icon: ShieldAlert,
          title: '401 - Authentication Required',
          description: message || 'Your session has expired. Please sign in again to continue.',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 403:
        return {
          icon: ShieldAlert,
          title: '403 - Access Forbidden',
          description: message || 'You do not have the required role permissions to view this resource.',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 404:
        return {
          icon: FileQuestion,
          title: '404 - Resource Not Found',
          description: message || 'The requested ticket, incident, or endpoint could not be located.',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        };
      case 422:
        return {
          icon: AlertTriangle,
          title: '422 - Validation Error',
          description: message || 'The submitted parameters did not match the API contract requirements.',
          color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        };
      case 500:
      default:
        return {
          icon: ServerCrash,
          title: status ? `${status} - Server Error` : 'Service Communication Error',
          description: message || 'An internal error occurred while processing the request on the backend.',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
    }
  };

  const { icon: Icon, title, description, color } = getErrorConfig();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60 my-6">
      <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      {code && (
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 mb-3">
          CODE: {code}
        </span>
      )}
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Request
        </button>
      )}
    </div>
  );
};
