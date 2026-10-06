import React, { useState, useEffect } from 'react';
import { Flame, Users, ShieldAlert, Radio, Search, Filter } from 'lucide-react';
import { getIncidents } from '../../api/incidents';
import { IncidentItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await getIncidents({ search: search || undefined });
      setIncidents(data.items);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Incident Command & Outage Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cluster duplicate tickets into master incidents, broadcast student notifications, and coordinate multi-team root cause resolution
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search master incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIncidents()}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={3} height="h-28" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4 shadow-card"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    {inc.incident_number}
                  </span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={inc.priority} size="sm" />
                    <StatusBadge status={inc.status} size="sm" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-2">{inc.title}</h3>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Affected Population:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {inc.affected_students} students
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Responsible Dept:</span>
                    <span className="text-slate-200 font-medium">{inc.department}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Reported {new Date(inc.created_at).toLocaleDateString()}
                </span>
                <span className="text-xs font-semibold text-indigo-400">
                  Broadcast Alerts Active &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
