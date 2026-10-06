import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Layers, MapPin, ArrowRight, UserPlus, FileText } from 'lucide-react';
import { getStaffRequests } from '../../api/requests';
import { RequestDetail } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SlaBadge } from '../../components/common/SlaBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getStaffRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        search: search || undefined,
      });
      setRequests(data.items);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Master Request Directory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete campus-wide ledger of operational work orders, department routing, and SLA statuses
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, titles, buildings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="escalated">Escalated</option>
          </select>

          <span>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => navigate(`/staff/requests/${req.id}`)}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {req.ticket_number}
                  </span>
                  <PriorityBadge priority={req.priority} size="sm" />
                  <StatusBadge status={req.status} size="sm" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Dept: {req.department}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{req.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{req.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Building: {req.location.building} • {req.location.room || 'General'}</span>
                  <span>•</span>
                  <span>Specialist: {req.assigned_to?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center">
                <SlaBadge deadline={req.sla_deadline} status={req.status} />
                <ArrowRight className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
