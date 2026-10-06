import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>('Block A (Engineering)');

  const buildings = [
    {
      id: 'block-a',
      name: 'Block A (Engineering)',
      health: 84,
      status: 'WARNING',
      activeTickets: 4,
      occupancy: '820 Students',
      incidents: ['REQ-2026-000123: HDMI Port Spark in Lab 2', 'Substation Feeder Outage nearby'],
      color: 'border-amber-500 bg-amber-50 text-amber-900',
    },
    {
      id: 'block-b',
      name: 'Block B (Science Labs)',
      health: 68,
      status: 'DEGRADED',
      activeTickets: 8,
      occupancy: '640 Students',
      incidents: ['Master Incident #INC-2024-042: WiFi Network Outage', 'Chiller Compressor 3 Vibration'],
      color: 'border-error bg-error-container text-on-error-container',
    },
    {
      id: 'library',
      name: 'Central Library',
      health: 96,
      status: 'OPTIMAL',
      activeTickets: 1,
      occupancy: '450 Students',
      incidents: ['REQ-2026-000098: AC Thermostat in Study 3'],
      color: 'border-green-500 bg-green-50 text-green-900',
    },
    {
      id: 'hostel-4',
      name: 'Hostel Complex 4',
      health: 91,
      status: 'OPTIMAL',
      activeTickets: 2,
      occupancy: '280 Residents',
      incidents: ['REQ-2026-000084: Boiler Circuit Breaker Tripped'],
      color: 'border-green-500 bg-green-50 text-green-900',
    },
    {
      id: 'sac',
      name: 'Student Activity Center',
      health: 100,
      status: 'OPTIMAL',
      activeTickets: 0,
      occupancy: '190 Students',
      incidents: [],
      color: 'border-green-500 bg-green-50 text-green-900',
    },
  ];

  const current = buildings.find((b) => b.name === selectedBuilding) || buildings[0];

  return (
    <div className="space-y-space-xl">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="space-y-space-2xs">
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Campus Building Health Map</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Spatial distribution of facilities, live sensor telemetry, and incident impact per building.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="px-space-md py-space-xs bg-surface-container text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          Return to Command Center
        </button>
      </div>

      {/* Map Interactive Canvas & Building Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left (8 cols): Spatial Facility Grid */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">North &amp; Central Campus Grid</span>
            <span className="font-mono-data-sm text-xs bg-surface-container px-space-xs py-space-2xs rounded">
              Live GIS Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {buildings.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBuilding(b.name)}
                className={`p-space-lg rounded-xl border-2 cursor-pointer transition-all ${
                  selectedBuilding === b.name ? 'ring-4 ring-secondary/30 scale-[1.01]' : 'hover:scale-[1.005]'
                } ${b.color}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold leading-tight">{b.name}</h3>
                    <p className="font-mono-data-sm text-xs mt-1">{b.occupancy}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-data-lg text-2xl font-bold">{b.health}</span>
                    <span className="text-[10px] block font-semibold">HEALTH INDEX</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-space-md border-t border-black/10 mt-space-sm font-mono font-semibold">
                  <span>{b.activeTickets} Active Tickets</span>
                  <span>Status: {b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (4 cols): Selected Building Deep-Dive Telemetry */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Building Diagnostics</h3>

          <div className="space-y-space-xs">
            <h4 className="font-body-md text-body-md font-bold text-secondary">{current.name}</h4>
            <div className="flex items-center justify-between font-mono text-xs bg-surface-container-low p-2 rounded">
              <span>Overall Building Health:</span>
              <span className="font-bold text-on-surface">{current.health} / 100</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs bg-surface-container-low p-2 rounded">
              <span>Live Campus Population:</span>
              <span className="font-bold text-on-surface">{current.occupancy}</span>
            </div>
          </div>

          <div className="space-y-space-xs pt-space-xs border-t border-surface-container-high/40">
            <span className="font-label-sm text-xs font-semibold uppercase text-on-surface-variant">
              Active Issues in Building ({current.incidents.length})
            </span>
            {current.incidents.length === 0 ? (
              <p className="text-xs text-green-700 bg-green-100 p-space-sm rounded-lg font-medium">
                ✅ All systems in this facility operating within optimal nominal ranges.
              </p>
            ) : (
              current.incidents.map((inc, i) => (
                <div key={i} className="p-space-sm bg-surface-container-low rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-on-surface">{inc}</p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => navigate('/student/requests/new')}
            className="w-full py-space-xs bg-primary text-on-primary rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Dispatch Technician to {current.name}
          </button>
        </div>
      </div>
    </div>
  );
};
