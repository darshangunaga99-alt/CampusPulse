import React, { useState, useEffect } from 'react';
import {
  Flame,
  Users,
  Search,
  Building,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { getIncidents, followIncident } from '../../api/incidents';
import { IncidentItem, IncidentStatus, Priority } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const CampusIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await getIncidents({ search: search || undefined });
      setIncidents(data.items);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleFollow = async (id: string) => {
    try {
      await followIncident(id);
      setFollowedIds((prev) => ({ ...prev, [id]: true }));
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-xs font-semibold text-orange-400 mb-2 self-start inline-flex">
          <Flame className="w-3.5 h-3.5" />
          Campus-Wide Incidents & Outages
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Active Outages & Multi-Party Incidents
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          When multiple students report related issues, CampusPulse clusters them into master incidents. Follow an incident to receive real-time resolution alerts.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search active incidents (e.g. WiFi outage, Water supply)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIncidents()}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={fetchIncidents}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700"
        >
          Search
        </button>
      </div>

      {/* Incident Cards Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={3} height="h-32" />
      ) : incidents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
          No active campus incidents reported.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidents.map((inc) => {
            const isFollowing = followedIds[inc.id];

            return (
              <div
                key={inc.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-card"
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

                  <h3 className="text-base font-bold text-slate-100 leading-snug mb-2">
                    {inc.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="text-slate-300 font-medium">{inc.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Affected Population:</span>
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {inc.affected_students} students
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Logged Time:</span>
                      <span className="font-mono text-slate-400">
                        {new Date(inc.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Real-time SMS/Push Broadcast</span>

                  <button
                    onClick={() => handleFollow(inc.id)}
                    disabled={isFollowing}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isFollowing
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Following Incident</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5" />
                        <span>Follow Updates</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
