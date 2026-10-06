import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Send,
  UserPlus,
} from 'lucide-react';
import { getRequest, getRequestTimeline, updateRequestStatus, assignRequest } from '../../api/requests';
import { RequestDetail as IRequestDetail, RequestTimelineItem, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SlaBadge } from '../../components/common/SlaBadge';
import { TimelineVisualizer } from '../../components/common/TimelineVisualizer';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const StaffRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<IRequestDetail | null>(null);
  const [timeline, setTimeline] = useState<RequestTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status Form State
  const [statusToUpdate, setStatusToUpdate] = useState<RequestStatus>('in_progress');
  const [comment, setComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Assignment State
  const [assignStaffId, setAssignStaffId] = useState('usr_staff_01');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [req, time] = await Promise.all([
        getRequest(id),
        getRequestTimeline(id),
      ]);
      setRequest(req);
      setTimeline(time);
      setStatusToUpdate(req.status);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      await updateRequestStatus(id, {
        status: statusToUpdate,
        comment: comment || undefined,
      });
      setComment('');
      fetchDetail();
    } catch {
      // Handled
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsAssigning(true);
    try {
      await assignRequest(id, { staff_id: assignStaffId });
      fetchDetail();
    } catch {
      // Handled
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-100">Request Not Found</h3>
        <button
          onClick={() => navigate('/staff/requests')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div>
        <button
          onClick={() => navigate('/staff/requests')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Work Queue
        </button>

        {/* Ticket Overview Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                {request.ticket_number}
              </span>
              <PriorityBadge priority={request.priority} />
            </div>

            <div className="flex items-center gap-3">
              <SlaBadge deadline={request.sla_deadline} status={request.status} />
              <StatusBadge status={request.status} size="lg" />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug mb-2">
              {request.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Building & Room</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {request.location.building} • {request.location.room || 'General'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Department</span>
              <span className="text-xs font-semibold text-slate-200">{request.department}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Assigned Staff</span>
              <span className="text-xs font-semibold text-slate-200">
                {request.assigned_to?.name || 'Unassigned'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Logged Date</span>
              <span className="text-xs font-semibold text-slate-200">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Action Controls: Status & Assignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Transition Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400" />
            Update Resolution Status
          </h3>

          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Status Transition</label>
              <select
                value={statusToUpdate}
                onChange={(e) => setStatusToUpdate(e.target.value as RequestStatus)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 capitalize"
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
              <label className="text-xs text-slate-400 block mb-1">Action Notes / Audit Comment</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Detail the field action taken..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-glow-brand flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {isUpdatingStatus ? 'Updating Status...' : 'Apply Status Update'}
            </button>
          </form>
        </div>

        {/* Reassignment Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-400" />
            Dispatch Specialist Reassignment
          </h3>

          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Select Field Specialist</label>
              <select
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="usr_staff_01">Anil Sharma (IT & Hardware Lead)</option>
                <option value="usr_staff_02">Kavita Reddy (High-Voltage Facilities)</option>
                <option value="usr_staff_03">Manoj Verma (HVAC & Mechanical)</option>
                <option value="usr_staff_04">Deepak Joshi (Library & RFID Systems)</option>
              </select>
            </div>

            <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              Reassigning routes this ticket to the selected specialist's active queue and emits a notification.
            </p>

            <button
              type="submit"
              disabled={isAssigning}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {isAssigning ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </form>
        </div>
      </div>

      {/* Complete Audit Timeline */}
      <TimelineVisualizer
        timeline={timeline}
        currentStatus={request.status}
        isOverdue={
          request.sla_deadline
            ? new Date(request.sla_deadline).getTime() < new Date().getTime() && request.status !== 'completed'
            : false
        }
      />
    </div>
  );
};
