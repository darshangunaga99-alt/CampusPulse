import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Filter,
  Clock,
  AlertTriangle,
  UserCheck,
  Flame,
  Star,
  Info,
} from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../api/notifications';
import { NotificationItem } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const StudentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications({ unread: unreadOnly });
      setNotifications(data.items);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Handled
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'status_change':
      case 'request_update':
        return <Clock className="w-5 h-5 text-indigo-400" />;
      case 'assignment':
        return <UserCheck className="w-5 h-5 text-blue-400" />;
      case 'sla_warning':
      case 'escalation':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'incident_update':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'feedback_request':
        return <Star className="w-5 h-5 text-emerald-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status changes, technician assignments, SLA alerts & incident updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              unreadOnly
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {unreadOnly ? 'Showing Unread Only' : 'Filter Unread'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-20" />
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.read && handleMarkRead(item.id)}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                item.read
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/90 border-indigo-500/30 text-slate-100 shadow-glow-brand cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getNotifIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{item.message}</p>
                  <span className="font-mono text-[11px] text-slate-500">
                    {new Date(item.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {!item.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(item.id);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium"
                  title="Mark as Read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
