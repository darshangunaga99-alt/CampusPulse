import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlaGaugeCircle } from '../../components/common/SlaGaugeCircle';

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const requests = [
    {
      id: 'REQ-2026-000123',
      title: 'Ceiling Projector HDMI Port Failure',
      location: 'CSE Lab 2 (Block A, 2nd Floor)',
      category: 'Lab Equipment & AV',
      priority: 'HIGH',
      status: 'IN PROGRESS',
      technician: 'Vikram Das',
      technicianRole: 'IT Support Specialist',
      target: 'Today, 4:00 PM',
      slaPercent: 72,
      slaRemaining: '02h 18m left',
      slaVariant: 'blue' as const,
      note: 'Replacement HDMI Switcher in transit from Central Store',
    },
    {
      id: 'REQ-2026-000098',
      title: 'AC Thermostat Stuck on 16°C & Dripping Water',
      location: 'Library Quiet Study Hall 3',
      category: 'HVAC & Climate',
      priority: 'MEDIUM',
      status: 'ASSIGNED',
      technician: 'Manoj Sen',
      technicianRole: 'Facilities & HVAC',
      target: 'Tomorrow, 11:00 AM',
      slaPercent: 22,
      slaRemaining: '14h 40m left',
      slaVariant: 'warning' as const,
      note: 'Drain tray inspection scheduled during non-peak library hours',
    },
    {
      id: 'REQ-2026-000084',
      title: 'Hostel 4 Hot Water Boiler Circuit Tripped',
      location: 'Hostel 4, Wing C Basement Plant',
      category: 'Electrical & Power',
      priority: 'HIGH',
      status: 'INVESTIGATING',
      technician: 'Electrical Maintenance Team',
      technicianRole: 'High Voltage Facility',
      target: 'Today, 6:00 PM',
      slaPercent: 55,
      slaRemaining: '04h 12m left',
      slaVariant: 'error' as const,
      note: 'Safety interlock check required before re-energizing main busbar',
    },
    {
      id: 'REQ-2026-000042',
      title: 'Water Cooler Filter Replacement',
      location: 'Student Activity Center, 1st Floor',
      category: 'Plumbing & Water',
      priority: 'LOW',
      status: 'COMPLETED',
      technician: 'Ramesh Kumar',
      technicianRole: 'Plumbing Specialist',
      target: 'Yesterday',
      slaPercent: 100,
      slaRemaining: 'Resolved',
      slaVariant: 'blue' as const,
      note: 'New carbon filter installed and flow rate tested.',
    },
  ];

  const filteredRequests = requests.filter((r) => {
    if (filter === 'open' && r.status === 'COMPLETED') return false;
    if (filter === 'completed' && r.status !== 'COMPLETED') return false;
    if (searchTerm) {
      const match =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-space-xl">
      {/* Header */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="space-y-space-2xs">
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">My Service Requests</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track real-time resolution SLAs, technician assignments, and status updates for your tickets.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/requests/new')}
          className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-space-xs rounded-lg font-label-md text-label-md shadow-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>New Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-space-md py-space-xs rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filter === 'all'
                ? 'bg-primary-container text-white'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-space-md py-space-xs rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filter === 'open'
                ? 'bg-primary-container text-white'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Active / In Progress (3)
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-space-md py-space-xs rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filter === 'completed'
                ? 'bg-primary-container text-white'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Resolved (1)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search tickets by ID, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-low border border-surface-container-high rounded-lg px-space-md py-space-xs text-xs font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>
      </div>

      {/* Requests Stream */}
      <div className="space-y-space-md">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow border border-surface-container-high/40"
          >
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-mono-data-sm text-mono-data-sm bg-surface-container px-space-xs py-space-2xs rounded text-on-surface font-semibold">
                    {req.id}
                  </span>
                  <span
                    className={`font-mono-data-sm text-mono-data-sm px-space-xs py-space-2xs rounded font-bold ${
                      req.priority === 'HIGH'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {req.priority} PRIORITY
                  </span>
                  <span
                    className={`font-mono-data-sm text-mono-data-sm px-space-xs py-space-2xs rounded font-semibold ${
                      req.status === 'IN PROGRESS'
                        ? 'bg-tertiary-container text-on-tertiary-container'
                        : req.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-surface-container-low text-secondary'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Target: {req.target}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                <div className="space-y-space-2xs max-w-lg">
                  <h3
                    onClick={() => navigate(`/student/requests/${req.id}`)}
                    className="font-headline-sm text-headline-sm font-semibold text-on-surface cursor-pointer hover:text-secondary transition-colors"
                  >
                    {req.title}
                  </h3>
                  <div className="flex items-center gap-space-2xs text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{req.location}</span>
                  </div>
                  <div className="flex items-center gap-space-xs pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                    <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                      {req.technician.charAt(0)}
                    </div>
                    <span>
                      Assigned to <strong className="text-on-surface font-medium">{req.technician}</strong> ({req.technicianRole})
                    </span>
                  </div>
                </div>

                <SlaGaugeCircle
                  percentage={req.slaPercent}
                  remainingText={req.slaRemaining}
                  label="SLA Deadline"
                  variant={req.slaVariant}
                />
              </div>

              {/* Context Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl border-t border-surface-container-high/30">
                <div className="flex items-center gap-space-2xs text-on-surface-variant font-mono-data-sm text-mono-data-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>Latest note: {req.note}</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={() => navigate(`/student/requests/${req.id}`)}
                    className="font-label-sm text-label-sm text-secondary hover:underline px-space-xs py-space-2xs cursor-pointer"
                  >
                    View Ticket Thread
                  </button>
                  <button
                    onClick={() => navigate(`/student/requests/${req.id}`)}
                    className="bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-space-sm py-space-2xs rounded shadow-sm hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
