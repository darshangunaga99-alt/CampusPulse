import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTES } from '../../auth/roles';

export const IncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const incidentIdParam = searchParams.get('id');
  const [selectedIncident, setSelectedIncident] = useState(incidentIdParam || 'INC-2024-042');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');

  useEffect(() => {
    if (incidentIdParam) {
      setSelectedIncident(incidentIdParam);
    }
  }, [incidentIdParam]);

  const merged = searchParams.get('merged') === 'true';

  const incidents = [
    {
      id: 'INC-2024-042',
      title: 'North Quad Main Substation Feeder Line Fault',
      status: 'CRITICAL P1',
      department: 'Electrical Engineering & Campus Power Grid',
      commander: 'Dr. K. Raman (Chief Electrical Engineer)',
      location: 'Substation 4 (Between Block A & Central Library)',
      affectedCount: 420,
      startTime: '10:05 AM (1h 45m active)',
      eta: '3:30 PM (Today)',
      rootCause:
        'Tripping of 11kV feeder breaker due to localized ground fault in underground cable conduit. Auxiliary UPS active for Tier 1 servers.',
      timeline: [
        {
          time: '11:20 AM',
          title: 'Isolation Complete',
          desc: 'Damaged 40-meter cable segment isolated from the central loop. Backup generator powering Library essential lighting.',
          status: 'completed',
        },
        {
          time: '10:45 AM',
          title: 'Emergency Response Deployed',
          desc: '2 utility excavation vans and high-voltage testing crew dispatched to Substation 4.',
          status: 'completed',
        },
        {
          time: '10:15 AM',
          title: 'AI Cross-Correlation Triggered',
          desc: '18 student tickets in Block A & Library auto-clustered into Master Incident #INC-2024-042.',
          status: 'completed',
        },
        {
          time: '10:05 AM',
          title: 'Initial Voltage Trip Detected',
          desc: 'Telemetry alarm tripped at North Quad substation control panel.',
          status: 'completed',
        },
      ],
      linkedTickets: [
        { id: 'REQ-2026-000123', title: 'Ceiling Projector HDMI Port Failure & Sparks', room: 'CSE Lab 2', user: 'Rahul S.' },
        { id: 'REQ-2026-000125', title: 'Desktop PCs Shut Down in CAD Lab', room: 'Mech Lab 4', user: 'Priya M.' },
        { id: 'REQ-2026-000129', title: 'Elevator 2 Emergency Battery Beep', room: 'Block A Central', user: 'Security' },
        { id: 'REQ-2026-000133', title: 'Library 2nd Floor Fluorescent Flickering', room: 'Study Hall B', user: 'Aman K.' },
      ],
    },
    {
      id: 'INC-2024-039',
      title: 'Central Water Reservoir Pressure Pump Tripping',
      status: 'HIGH P2',
      department: 'Campus Utilities & Plumbing',
      commander: 'M. Sen (Facilities Lead)',
      location: 'Overhead Reservoir 2 (Hostel Zone)',
      affectedCount: 280,
      startTime: '08:30 AM',
      eta: '5:00 PM (Today)',
      rootCause: 'Intake filter clogged by silt buildup following municipal main maintenance.',
      timeline: [
        {
          time: '10:00 AM',
          title: 'Filter Backwash Underway',
          desc: 'Primary dual-stage mesh filters being flushed and pressure tested.',
          status: 'completed',
        },
      ],
      linkedTickets: [
        { id: 'REQ-2026-000084', title: 'Hostel 4 Hot Water Boiler Circuit Tripped', room: 'Hostel 4 Basement', user: 'Caretaker' },
      ],
    },
  ];

  const current = incidents.find((i) => i.id === selectedIncident) || incidents[0];

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastText('');
    }, 3000);
  };

  return (
    <div className="space-y-space-xl">
      {/* Merged Success Alert (if redirected from NewRequest duplicate flow) */}
      {merged && (
        <div className="p-space-md bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-between shadow-sm border border-secondary">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-2xl">link</span>
            <div>
              <p className="font-headline-sm text-headline-sm font-bold">Successfully Merged with Master Incident</p>
              <p className="font-body-sm text-body-sm">
                Your report is now linked to {current.id}. You will receive all real-time SMS and app updates automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner: War Room Cockpit */}
      <div className="bg-error-container text-on-error-container p-space-xl rounded-xl shadow-sm border border-error/30 space-y-space-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="font-mono-data-sm text-mono-data-sm bg-error text-on-error px-space-sm py-space-2xs rounded font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                ACTIVE WAR ROOM
              </span>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-lowest text-on-surface px-space-xs py-space-2xs rounded font-bold">
                {current.id}
              </span>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-lowest text-on-surface px-space-xs py-space-2xs rounded font-semibold">
                {current.status}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-error-container">
              {current.title}
            </h1>
            <p className="font-body-md text-body-md text-on-error-container/90">
              {current.rootCause}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs shrink-0">
            <button
              onClick={() => {
                if (role && ROLE_HOME_ROUTES[role]) {
                  navigate(ROLE_HOME_ROUTES[role]);
                } else {
                  navigate(-1);
                }
              }}
              className="px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface transition-colors cursor-pointer shadow-sm"
            >
              Exit War Room
            </button>
          </div>
        </div>

        {/* War Room Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-md border-t border-error/20">
          <div className="p-space-sm bg-surface-container-lowest/80 rounded-lg text-on-surface">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant font-semibold">Affected Population</span>
            <p className="font-mono-data-lg text-mono-data-lg font-bold text-error">{current.affectedCount}+ Students</p>
          </div>
          <div className="p-space-sm bg-surface-container-lowest/80 rounded-lg text-on-surface">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant font-semibold">Incident Commander</span>
            <p className="font-body-sm text-body-sm font-bold truncate">{current.commander}</p>
          </div>
          <div className="p-space-sm bg-surface-container-lowest/80 rounded-lg text-on-surface">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant font-semibold">Elapsed Duration</span>
            <p className="font-mono-data-sm text-mono-data-sm font-bold">{current.startTime}</p>
          </div>
          <div className="p-space-sm bg-surface-container-lowest/80 rounded-lg text-on-surface">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant font-semibold">Target Restoration</span>
            <p className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">{current.eta}</p>
          </div>
        </div>
      </div>

      {/* Main War-Room Content: Left Timeline & Clusters + Right Broadcast Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column (8 cols): Incident Timeline & Clustered Tickets */}
        <div className="lg:col-span-8 space-y-space-lg">
          {/* Incident Timeline */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary">history</span>
                <span>Live Action &amp; Remediation Timeline</span>
              </h3>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container px-space-xs py-space-2xs rounded">
                Telemetry Log
              </span>
            </div>

            <div className="relative pl-space-lg space-y-space-md pt-space-xs">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-surface-container-high"></div>
              {current.timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-space-md">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-xs shadow-sm">
                    <span className="material-symbols-outlined text-xs">check</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{item.title}</span>
                      <span className="font-mono-data-sm text-[11px] text-on-surface-variant">{item.time}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clustered Tickets Matrix */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Linked Student Request Clusters ({current.linkedTickets.length})
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Correlated automatically based on semantic similarity and proximity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {current.linkedTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    if (role === 'staff' || role === 'department_head' || role === 'admin') {
                      navigate(`/staff/requests/${t.id}`);
                    } else {
                      navigate(`/student/requests/${t.id}`);
                    }
                  }}
                  className="p-space-md bg-surface-container-low rounded-xl border border-surface-container-high hover:border-secondary transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data-sm text-[11px] font-bold text-secondary">{t.id}</span>
                    <span className="font-mono-data-sm text-[11px] text-on-surface-variant">{t.room}</span>
                  </div>
                  <p className="font-body-sm text-body-sm font-medium text-on-surface line-clamp-1">{t.title}</p>
                  <p className="font-label-sm text-[10px] text-on-surface-variant">Reported by {t.user}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Emergency Broadcast Feed */}
        <div className="lg:col-span-4 space-y-space-lg">
          {/* Active Incidents Selector */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Campus Master Incidents</h3>
            <div className="space-y-space-xs">
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc.id)}
                  className={`w-full text-left p-space-sm rounded-xl border transition-all cursor-pointer ${
                    selectedIncident === inc.id
                      ? 'bg-error-container text-on-error-container border-error font-semibold'
                      : 'bg-surface-container-low text-on-surface border-surface-container-high hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold">{inc.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-error text-white text-[10px] font-bold">{inc.status}</span>
                  </div>
                  <p className="text-xs font-bold line-clamp-1">{inc.title}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">{inc.affectedCount} Affected • {inc.department}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Broadcast Widget */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Broadcast Live Alert</h3>
            <form onSubmit={handleSendBroadcast} className="space-y-space-sm">
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                rows={3}
                placeholder="Type emergency announcement for all affected students and facility staff..."
                className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-space-sm font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-error/30 resize-none"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-space-xs bg-error text-on-error py-space-xs rounded-lg font-label-md text-label-md font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">campaign</span>
                <span>Send Push Alert to {current.affectedCount} Students</span>
              </button>
            </form>

            {broadcastSent && (
              <div className="p-space-sm bg-green-100 text-green-800 rounded-lg text-xs font-semibold text-center animate-in fade-in">
                Broadcast notification successfully delivered via Push &amp; SMS!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
