import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkOrderItem {
  id: string;
  title: string;
  location: string;
  category: string;
  priority: string;
  slaMinutes: number;
  status: string;
  assignedTo: string;
  recommendedAction: string;
  progressNotes?: string[];
}

interface Technician {
  id: string;
  name: string;
  role: string;
  location: string;
  activeJobs: number;
  maxJobs: number;
  loadPercent: number;
  status: string;
  avatarColor: string;
  shiftHours?: string;
  contactNumber?: string;
}

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [technicians, setTechnicians] = useState<Technician[]>([
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
      shiftHours: '08:00 AM - 04:30 PM (Morning Shift)',
      contactNumber: '+91 98450 11234',
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
      shiftHours: '09:00 AM - 05:30 PM (General Shift)',
      contactNumber: '+91 98450 22345',
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
      shiftHours: '07:00 AM - 03:30 PM (Emergency Roster)',
      contactNumber: '+91 98450 33456',
    },
  ]);

  const [assignedQueue, setAssignedQueue] = useState<WorkOrderItem[]>([
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
      progressNotes: ['10:45 AM: Diagnostic multimeter verified ground fault in receiver.'],
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
      progressNotes: [],
    },
  ]);

  const [autoDispatchTriggered, setAutoDispatchTriggered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update Progress Modal State
  const [progressItem, setProgressItem] = useState<WorkOrderItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('IN PROGRESS');
  const [noteInput, setNoteInput] = useState<string>('');

  // Shift Details Modal State
  const [shiftTech, setShiftTech] = useState<Technician | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAutoDispatch = () => {
    setAutoDispatchTriggered(true);
    setTimeout(() => {
      setAutoDispatchTriggered(false);
      showToast('✨ AI Auto-Dispatch optimized 3 technician routes with 98.4% skill confidence.');
    }, 1500);
  };

  const openProgressModal = (item: WorkOrderItem) => {
    setProgressItem(item);
    setSelectedStatus(item.status);
    setNoteInput('');
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressItem) return;

    setAssignedQueue((prev) =>
      prev.map((job) => {
        if (job.id === progressItem.id) {
          const updatedNotes = noteInput.trim()
            ? [...(job.progressNotes || []), `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${noteInput.trim()}`]
            : job.progressNotes || [];
          return {
            ...job,
            status: selectedStatus,
            progressNotes: updatedNotes,
          };
        }
        return job;
      })
    );

    // If marked completed, update technician load
    if (selectedStatus === 'COMPLETED' || selectedStatus === 'RESOLVED') {
      setTechnicians((prev) =>
        prev.map((t) => {
          if (t.name === progressItem.assignedTo) {
            const nextJobs = Math.max(0, t.activeJobs - 1);
            const nextLoad = Math.round((nextJobs / t.maxJobs) * 100);
            return {
              ...t,
              activeJobs: nextJobs,
              loadPercent: nextLoad,
              status: nextJobs === 0 ? 'Available' : 'On Job',
            };
          }
          return t;
        })
      );
      showToast(`🎉 Work order ${progressItem.id} marked as COMPLETED!`);
    } else {
      showToast(`✅ Progress updated for ${progressItem.id} (${selectedStatus}).`);
    }

    setProgressItem(null);
  };

  const handleQuickComplete = (item: WorkOrderItem) => {
    setAssignedQueue((prev) =>
      prev.map((job) => {
        if (job.id === item.id) {
          return {
            ...job,
            status: 'COMPLETED',
            progressNotes: [
              ...(job.progressNotes || []),
              `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: Job completed by specialist & verified.`,
            ],
          };
        }
        return job;
      })
    );

    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.name === item.assignedTo) {
          const nextJobs = Math.max(0, t.activeJobs - 1);
          const nextLoad = Math.round((nextJobs / t.maxJobs) * 100);
          return {
            ...t,
            activeJobs: nextJobs,
            loadPercent: nextLoad,
            status: nextJobs === 0 ? 'Available' : 'On Job',
          };
        }
        return t;
      })
    );

    showToast(`🎉 Job ${item.id} successfully completed & SLA logged!`);
  };

  return (
    <div className="space-y-space-xl">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-space-md bg-surface-container-lowest text-on-surface rounded-xl shadow-lg border border-primary flex items-center gap-space-sm animate-in slide-in-from-top duration-200">
          <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
          <p className="font-body-sm text-body-sm font-semibold">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

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
            AI Engine analyzed technician proximities and matched pending tickets with 98.4% skill confidence.
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
                    className={`h-full rounded-full transition-all duration-500 ${
                      tech.loadPercent === 100 ? 'bg-error' : tech.loadPercent > 60 ? 'bg-secondary' : 'bg-green-600'
                    }`}
                    style={{ width: `${tech.loadPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-data-sm text-on-surface-variant pt-space-xs border-t border-surface-container-high/30">
                <span>📍 {tech.location}</span>
                <span
                  onClick={() => setShiftTech(tech)}
                  className="text-secondary font-semibold hover:underline cursor-pointer"
                >
                  View Shift Details
                </span>
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
            {assignedQueue.filter((q) => q.status !== 'COMPLETED').length} Active
          </span>
        </div>

        <div className="space-y-space-md">
          {assignedQueue.map((item) => (
            <div
              key={item.id}
              className={`p-space-lg rounded-xl border transition-all ${
                item.status === 'COMPLETED'
                  ? 'bg-surface-container-lowest border-green-300 opacity-80'
                  : 'bg-surface-container-low border-surface-container-high/60'
              } space-y-space-sm`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span
                    onClick={() => navigate(`/staff/requests/${item.id}`)}
                    className="font-mono-data-sm text-mono-data-sm font-bold text-secondary hover:underline cursor-pointer"
                  >
                    {item.id}
                  </span>
                  <span
                    className={`font-mono-data-sm text-xs px-2 py-0.5 rounded font-bold ${
                      item.priority === 'HIGH' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span
                    className={`font-mono-data-sm text-xs px-2 py-0.5 rounded font-bold ${
                      item.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'IN PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-surface-container-lowest'
                    }`}
                  >
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
                    onClick={() => navigate(`/staff/requests/${item.id}`)}
                    className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-secondary cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">📍 {item.location}</p>
                  <p className="font-body-sm text-xs text-on-surface bg-surface-container-lowest p-2 rounded-lg border border-surface-container-high">
                    💡 <strong className="text-secondary font-semibold">AI Recommendation:</strong> {item.recommendedAction}
                  </p>

                  {item.progressNotes && item.progressNotes.length > 0 && (
                    <div className="mt-2 text-[11px] font-mono-data-sm bg-surface-container/60 p-2 rounded border border-surface-container-high text-on-surface-variant">
                      <strong>Latest Update:</strong> {item.progressNotes[item.progressNotes.length - 1]}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-space-xs shrink-0">
                  <button
                    onClick={() => openProgressModal(item)}
                    className="px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high shadow-xs"
                  >
                    Update Progress
                  </button>
                  {item.status !== 'COMPLETED' ? (
                    <button
                      onClick={() => handleQuickComplete(item)}
                      className="px-space-md py-space-xs bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Complete Job</span>
                    </button>
                  ) : (
                    <span className="px-space-md py-space-xs bg-green-100 text-green-800 rounded-lg text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">done_all</span>
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Update Progress */}
      {progressItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">update</span>
                  Update Work Order Progress
                </h3>
                <span className="font-mono-data-sm text-xs text-secondary font-bold">{progressItem.id}</span>
              </div>
              <button
                onClick={() => setProgressItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4">
              <div>
                <p className="text-xs font-medium text-on-surface-variant mb-1">Issue</p>
                <p className="text-sm font-semibold text-on-surface">{progressItem.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">📍 {progressItem.location}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Current Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'IN PROGRESS', label: 'In Progress', icon: 'engineering' },
                    { val: 'ASSIGNED', label: 'Assigned', icon: 'schedule' },
                    { val: 'BLOCKED', label: 'Waiting on Parts', icon: 'pause_circle' },
                    { val: 'COMPLETED', label: 'Completed & Tested', icon: 'check_circle' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setSelectedStatus(s.val)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedStatus === s.val
                          ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-xs'
                          : 'bg-surface-container-low text-on-surface border-surface-container-high hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Diagnostic Note / Action Performed
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Replaced faulty fuse, tested signal output, verified 230V rail..."
                  rows={3}
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-xl p-3 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-surface-container-high/60 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProgressItem(null);
                    navigate(`/staff/requests/${progressItem.id}`);
                  }}
                  className="text-xs font-semibold text-secondary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Open Full Work Order</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProgressItem(null)}
                    className="px-4 py-2 bg-surface-container text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer shadow-sm"
                  >
                    Save Progress
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shift Details */}
      {shiftTech && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${shiftTech.avatarColor}`}>
                  {shiftTech.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">{shiftTech.name}</h3>
                  <p className="text-xs text-on-surface-variant">{shiftTech.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShiftTech(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <span className="text-on-surface-variant font-medium">Shift Schedule</span>
                <p className="text-sm font-semibold text-on-surface">🕒 {shiftTech.shiftHours}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <span className="text-on-surface-variant font-medium">Assigned Zone</span>
                <p className="text-sm font-semibold text-on-surface">📍 {shiftTech.location}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <span className="text-on-surface-variant font-medium">Emergency Contact</span>
                <p className="text-sm font-semibold text-on-surface">📞 {shiftTech.contactNumber}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <span className="text-on-surface-variant font-medium">Active Workload Capacity</span>
                <p className="text-sm font-semibold text-on-surface">
                  {shiftTech.activeJobs} of {shiftTech.maxJobs} active jobs ({shiftTech.loadPercent}%)
                </p>
              </div>
            </div>

            <button
              onClick={() => setShiftTech(null)}
              className="w-full py-2.5 bg-surface-container text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
