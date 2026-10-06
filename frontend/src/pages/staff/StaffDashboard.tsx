import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlaGaugeCircle } from '../../components/common/SlaGaugeCircle';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [technicians, setTechnicians] = useState([
    {
      id: 'TECH-01',
      name: 'Vikram Das',
      role: 'Lead AV & Electronics Specialist',
      location: 'Block A (Engineering)',
      activeJobs: 3,
      maxJobs: 4,
      loadPercent: 75,
      status: 'On Job',
      avatarColor: 'bg-secondary text-white',
    },
    {
      id: 'TECH-02',
      name: 'Manoj Sen',
      role: 'Facilities & HVAC Specialist',
      location: 'Central Library',
      activeJobs: 2,
      maxJobs: 4,
      loadPercent: 50,
      status: 'Available',
      avatarColor: 'bg-green-600 text-white',
    },
    {
      id: 'TECH-03',
      name: 'Suresh Nair',
      role: 'High Voltage & Power Lead',
      location: 'Substation 4 (North Quad)',
      activeJobs: 4,
      maxJobs: 4,
      loadPercent: 100,
      status: 'Engaged (P1 War Room)',
      avatarColor: 'bg-error text-white',
    },
  ]);

  const [assignedQueue, setAssignedQueue] = useState([
    {
      id: 'REQ-2026-000123',
      title: 'Ceiling Projector HDMI Port Failure & Sparks',
      location: 'CSE Lab 2 (Block A, 2nd Floor)',
      category: 'Lab AV / Electrical Safety',
      priority: 'HIGH',
      slaMinutes: 138,
      status: 'IN PROGRESS',
      assignedTo: 'Vikram Das',
      recommendedAction: 'Replace HDMI receiver board & test voltage ground.',
    },
    {
      id: 'REQ-2026-000098',
      title: 'AC Thermostat Stuck on 16°C & Dripping Water',
      location: 'Library Quiet Study Hall 3',
      category: 'HVAC & Climate',
      priority: 'MEDIUM',
      slaMinutes: 880,
      status: 'ASSIGNED',
      assignedTo: 'Manoj Sen',
      recommendedAction: 'Clear condensed drain tube & reset thermostat sensor.',
    },
  ]);

  const [autoDispatchTriggered, setAutoDispatchTriggered] = useState(false);

  const handleAutoDispatch = () => {
    setAutoDispatchTriggered(true);
    setTimeout(() => {
      setAutoDispatchTriggered(false);
    }, 2500);
  };

  return (
    <div className="space-y-space-xl">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="space-y-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">Smart Dispatch &amp; Workload Queue</span>
            <span className="font-mono-data-sm text-[11px] bg-tertiary-container text-on-tertiary-container px-space-xs py-space-2xs rounded-full font-bold">
              ✨ Neural Skill &amp; Proximity Routing
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Automated technician workload balancing, real-time proximity matching, and fast priority escalations.
          </p>
        </div>

        <button
          onClick={handleAutoDispatch}
          disabled={autoDispatchTriggered}
          className="flex items-center gap-space-xs bg-primary text-on-primary px-space-xl py-space-xs rounded-lg font-label-md text-label-md shadow-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
        >
          <span className={`material-symbols-outlined text-base ${autoDispatchTriggered ? 'animate-spin' : ''}`}>
            {autoDispatchTriggered ? 'refresh' : 'smart_toy'}
          </span>
          <span>{autoDispatchTriggered ? 'Optimizing Routing...' : 'Trigger AI Auto-Dispatch'}</span>
        </button>
      </div>

      {/* Auto-Dispatch notification banner */}
      {autoDispatchTriggered && (
        <div className="p-space-md bg-tertiary-container text-on-tertiary rounded-xl shadow-sm border border-on-tertiary-container/30 animate-in fade-in flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-xl text-on-tertiary-container animate-pulse">hub</span>
          <p className="font-body-sm text-body-sm text-tertiary-fixed-dim font-medium">
            AI Engine analyzed 3 technician proximities and matched pending tickets with 98.4% skill confidence.
          </p>
        </div>
      )}

      {/* Technician Workload Availability Roster */}
      <div className="space-y-space-sm">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
          Specialist Workload Roster
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {technicians.map((tech) => (
            <div
              key={tech.id}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${tech.avatarColor}`}>
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-bold text-on-surface">{tech.name}</p>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">{tech.role}</p>
                  </div>
                </div>
                <span
                  className={`font-mono-data-sm text-[10px] px-2 py-0.5 rounded font-bold ${
                    tech.loadPercent === 100
                      ? 'bg-error-container text-on-error-container'
                      : tech.loadPercent > 60
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {tech.status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono-data-sm text-xs text-on-surface-variant">
                  <span>Current Load</span>
                  <span className="font-bold text-on-surface">
                    {tech.activeJobs} / {tech.maxJobs} Jobs ({tech.loadPercent}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      tech.loadPercent === 100 ? 'bg-error' : tech.loadPercent > 60 ? 'bg-secondary' : 'bg-green-600'
                    }`}
                    style={{ width: `${tech.loadPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-data-sm text-on-surface-variant pt-space-xs border-t border-surface-container-high/30">
                <span>📍 {tech.location}</span>
                <span className="text-secondary font-semibold hover:underline cursor-pointer">View Shift Details</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Dispatch Work Orders */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-lg">assignment</span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Active Field Work Orders</span>
          </div>
          <span className="font-mono-data-sm text-xs bg-surface-container px-space-xs py-space-2xs rounded">
            {assignedQueue.length} Dispatched
          </span>
        </div>

        <div className="space-y-space-md">
          {assignedQueue.map((item) => (
            <div
              key={item.id}
              className="p-space-lg bg-surface-container-low rounded-xl border border-surface-container-high/60 space-y-space-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">{item.id}</span>
                  <span
                    className={`font-mono-data-sm text-xs px-2 py-0.5 rounded font-bold ${
                      item.priority === 'HIGH' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="font-mono-data-sm text-xs bg-surface-container-lowest px-2 py-0.5 rounded">
                    {item.status}
                  </span>
                </div>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  Assigned to: <strong className="text-on-surface">{item.assignedTo}</strong>
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                <div className="space-y-1 max-w-xl">
                  <h4
                    onClick={() => navigate(`/student/requests/${item.id}`)}
                    className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-secondary cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">📍 {item.location}</p>
                  <p className="font-body-sm text-xs text-on-surface bg-surface-container-lowest p-2 rounded-lg border border-surface-container-high">
                    💡 <strong className="text-secondary font-semibold">AI Recommendation:</strong> {item.recommendedAction}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-space-xs shrink-0">
                  <button
                    onClick={() => navigate(`/student/requests/${item.id}`)}
                    className="px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high"
                  >
                    Update Progress
                  </button>
                  <button
                    onClick={() => navigate(`/student/requests/${item.id}`)}
                    className="px-space-md py-space-xs bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    Complete Job
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
