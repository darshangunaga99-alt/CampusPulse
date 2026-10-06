import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckSquare,
  MapPin,
  Clock,
  ArrowRight,
  User,
  MessageSquare,
  Edit,
  X,
} from 'lucide-react';
import { getStaffRequests, updateRequestStatus } from '../../api/requests';
import { RequestDetail, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SlaBadge } from '../../components/common/SlaBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StaffRequests: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Status Change Modal State
  const [selectedReq, setSelectedReq] = useState<RequestDetail | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>('in_progress');
  const [comment, setComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchStaffRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getStaffRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        department: departmentFilter === 'all' ? undefined : departmentFilter,
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
    fetchStaffRequests();
  }, [statusFilter, priorityFilter, departmentFilter]);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setIsUpdating(true);
    try {
      await updateRequestStatus(selectedReq.id, {
        status: newStatus,
        comment,
      });
      setSelectedReq(null);
      setComment('');
      fetchStaffRequests();
    } catch {
      // Ignored
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Field Dispatch Work Queue
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review work orders, update field diagnostic logs, and fulfill campus SLAs
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, titles, or campus buildings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStaffRequests()}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

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
              <option value="rejected">Rejected</option>
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
        </div>
      </div>

      {/* Requests Table / Cards */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Work Orders"
          description="There are currently no tickets matching your dispatch query."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {req.ticket_number}
                  </span>
                  <PriorityBadge priority={req.priority} size="sm" />
                  <StatusBadge status={req.status} size="sm" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {req.department}
                  </span>
                </div>

                <h3
                  onClick={() => navigate(`/staff/requests/${req.id}`)}
                  className="text-base font-bold text-slate-100 hover:text-indigo-300 cursor-pointer transition-colors"
                >
                  {req.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-1">{req.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {req.location.building} • {req.location.room || 'General'}
                  </span>
                  <span>•</span>
                  <SlaBadge deadline={req.sla_deadline} status={req.status} size="sm" />
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedReq(req);
                    setNewStatus(req.status === 'assigned' ? 'in_progress' : req.status === 'in_progress' ? 'completed' : req.status);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Update Status
                </button>

                <button
                  onClick={() => navigate(`/staff/requests/${req.id}`)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  Open Ticket
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <button
              onClick={() => setSelectedReq(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 mb-1">
              Update Request Status — <span className="font-mono text-indigo-400">{selectedReq.ticket_number}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedReq.title}</p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="escalated">Escalated</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">
                  Field Diagnostic Notes / Action Log
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Technician arrived at Lab 2. Replaced faulty lamp module and verified HDMI output."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-glow-brand"
                >
                  {isUpdating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
