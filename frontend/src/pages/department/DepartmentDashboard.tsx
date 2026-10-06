import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getDepartmentAnalytics } from '../../api/analytics';
import { getStaffRequests } from '../../api/requests';
import { DepartmentAnalytics as IDepartmentAnalytics, RequestDetail } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SlaBadge } from '../../components/common/SlaBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const DepartmentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [deptAnalytics, setDeptAnalytics] = useState<IDepartmentAnalytics[]>([]);
  const [deptRequests, setDeptRequests] = useState<RequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [analytics, requests] = await Promise.all([
          getDepartmentAnalytics(),
          getStaffRequests({ limit: 6 }),
        ]);
        setDeptAnalytics(analytics);
        setDeptRequests(requests.items);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalOpen = deptAnalytics.reduce((acc, d) => acc + d.open_requests, 0);
  const totalOverdue = deptAnalytics.reduce((acc, d) => acc + d.overdue, 0);
  const avgSla = (
    deptAnalytics.reduce((acc, d) => acc + d.sla_compliance, 0) / (deptAnalytics.length || 1)
  ).toFixed(1);

  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-400 mb-2 self-start inline-flex">
          <Building className="w-3.5 h-3.5" />
          Department Intelligence & Governance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Department Performance & Resource Allocation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Supervise departmental queue velocity, team SLA adherence, and preventive infrastructure metrics.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Open Department Requests
          </span>
          <span className="text-3xl font-black font-mono text-slate-100">{totalOpen}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Across all units</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 bg-rose-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 block mb-1">
            SLA Breached / Overdue
          </span>
          <span className="text-3xl font-black font-mono text-rose-400">{totalOverdue}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Needs urgent escalation</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
            SLA Compliance Rate
          </span>
          <span className="text-3xl font-black font-mono text-emerald-400">{avgSla}%</span>
          <span className="text-[11px] text-slate-500 block mt-1">Target: &gt;90%</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
            Avg Resolution Velocity
          </span>
          <span className="text-3xl font-black font-mono text-indigo-400">11.8h</span>
          <span className="text-[11px] text-slate-500 block mt-1">First-dispatch to closure</span>
        </div>
      </div>

      {/* Department Workload Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Department Workload & Active Ticket Volume
            </h3>
            <p className="text-xs text-slate-400">Comparing open tickets vs SLA compliance % across campus teams</p>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="open_requests" name="Open Requests" radius={[6, 6, 0, 0]}>
                {deptAnalytics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Active Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Department Active Queue</h3>
          <button
            onClick={() => navigate('/department/requests')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={3} height="h-24" />
        ) : (
          <div className="space-y-3">
            {deptRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/staff/requests/${req.id}`)}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {req.ticket_number}
                    </span>
                    <PriorityBadge priority={req.priority} size="sm" />
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{req.title}</h4>
                  <div className="text-xs text-slate-400 font-mono">
                    {req.location.building} • Specialist: {req.assigned_to?.name || 'Unassigned'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <SlaBadge deadline={req.sla_deadline} status={req.status} />
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
