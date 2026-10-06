import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  PlusCircle,
  FileText,
  Calendar,
  Building,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getMyRequests } from '../../api/requests';
import { RequestListItem, RequestStatus, Category, Priority } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StudentRequests: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getMyRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: search || undefined,
      });
      setRequests(data.items);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            My Service Requests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active requests, SLA deadlines, and resolution status
          </p>
        </div>

        <button
          onClick={() => navigate('/student/requests/new')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md hover:shadow-glow-brand flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket number or issue title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="maintenance">Maintenance</option>
              <option value="lab_equipment">Lab Equipment</option>
              <option value="it_support">IT Support</option>
              <option value="library">Library</option>
              <option value="hostel">Hostel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-24" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Requests Found"
          description="You have no service tickets matching the active filters or search term."
          actionLabel="Report New Issue"
          onAction={() => navigate('/student/requests/new')}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => navigate(`/student/requests/${req.id}`)}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-850 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-card"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {req.ticket_number}
                  </span>
                  <PriorityBadge priority={req.priority} size="sm" />
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {req.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {req.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Updated: {new Date(req.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center">
                <StatusBadge status={req.status} />
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-all transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
