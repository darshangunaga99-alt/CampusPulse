import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-space-xl">
      {/* Top Banner: Campus Operations Cockpit */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="space-y-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">Campus Command Center</span>
            <span className="font-mono-data-sm text-[11px] bg-secondary-fixed text-on-secondary-fixed px-space-xs py-space-2xs rounded font-bold">
              REAL-TIME TELEMETRY
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Holistic operational health, autonomous AI dispatch queues, and critical infrastructure monitors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => navigate('/admin/map')}
            className="flex items-center gap-space-xs bg-primary-container text-white px-space-md py-space-xs rounded-lg font-label-md text-label-md shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">map</span>
            <span>Building Health Map</span>
          </button>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-space-xs bg-surface-container text-on-surface px-space-md py-space-xs rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">insights</span>
            <span>Preventive AI</span>
          </button>
        </div>
      </div>

      {/* Main Command Grid: 1/3 Health Ring + 2/3 Four Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left (4 cols): Campus Health Ring Gauge */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col justify-between space-y-space-lg">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Campus Health Score
            </span>
            <span className="font-mono-data-sm text-[11px] text-green-700 font-bold bg-green-100 px-space-xs py-space-2xs rounded">
              +2.4% vs last week
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-space-md">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-secondary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="87, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono-data-lg text-4xl font-bold text-on-surface">87</span>
                <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">/ 100 Index</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm font-semibold text-secondary mt-space-md">
              Optimal Operational Stability
            </p>
          </div>

          <div className="space-y-space-xs pt-space-md border-t border-surface-container-high/40 font-mono-data-sm text-xs">
            <div className="flex justify-between text-on-surface-variant">
              <span>SLA Met (Last 24h)</span>
              <span className="font-bold text-on-surface">96.8%</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Mean Time to Resolve</span>
              <span className="font-bold text-on-surface">1.8 Hours</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>AI Auto-Triage Accuracy</span>
              <span className="font-bold text-on-surface">97.4%</span>
            </div>
          </div>
        </div>

        {/* Right (8 cols): The 4 Core Operational Pillars */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
          {/* Pillar 1: Power */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col justify-between h-48">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">bolt</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Power &amp; Energy</span>
              </div>
              <span className="font-mono-data-sm text-xs font-bold text-green-700 bg-green-100 px-space-xs py-0.5 rounded">
                94% OK
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-mono-data-lg text-2xl font-bold text-on-surface">11.4 MW</p>
              <p className="font-body-sm text-xs text-on-surface-variant">Current Campus Load • Peak at 2:00 PM</p>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>

          {/* Pillar 2: Network */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col justify-between h-48">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">wifi_off</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Network &amp; WiFi</span>
              </div>
              <span className="font-mono-data-sm text-xs font-bold text-error bg-error-container px-space-xs py-0.5 rounded">
                78% (Degraded)
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-mono-data-lg text-2xl font-bold text-error">1 Master Incident</p>
              <p className="font-body-sm text-xs text-on-surface-variant">Block B &amp; Lab switchgear core replacement</p>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
              <div className="bg-error h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          {/* Pillar 3: HVAC */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col justify-between h-48">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">ac_unit</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">HVAC &amp; Climate</span>
              </div>
              <span className="font-mono-data-sm text-xs font-bold text-secondary bg-surface-container px-space-xs py-0.5 rounded">
                91% Normal
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-mono-data-lg text-2xl font-bold text-on-surface">22.4°C Avg</p>
              <p className="font-body-sm text-xs text-on-surface-variant">14 Central Chillers Online • 2 on scheduled cycle</p>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '91%' }}></div>
            </div>
          </div>

          {/* Pillar 4: Water */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col justify-between h-48">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">water_drop</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Water &amp; Utilities</span>
              </div>
              <span className="font-mono-data-sm text-xs font-bold text-cyan-800 bg-cyan-100 px-space-xs py-0.5 rounded">
                89% Optimal
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-mono-data-lg text-2xl font-bold text-on-surface">3.8 Bar Flow</p>
              <p className="font-body-sm text-xs text-on-surface-variant">Reservoir 2 backwash flushing in progress</p>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-600 h-full rounded-full" style={{ width: '89%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts & Fast Dispatch Ticker */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-lg">hub</span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Live Autonomous Dispatch Queue</span>
          </div>
          <button
            onClick={() => navigate('/staff/requests')}
            className="font-label-sm text-xs text-secondary hover:underline cursor-pointer"
          >
            View Full Dispatch Matrix →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
              <tr>
                <th className="p-space-sm rounded-l-lg">Ticket / Incident</th>
                <th className="p-space-sm">Location</th>
                <th className="p-space-sm">Category</th>
                <th className="p-space-sm">Severity</th>
                <th className="p-space-sm">Assigned Specialist</th>
                <th className="p-space-sm rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40">
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="p-space-sm font-mono-data-sm font-bold text-secondary">REQ-2026-000123</td>
                <td className="p-space-sm text-on-surface">Block A • CSE Lab 2</td>
                <td className="p-space-sm">Lab Equipment / AV</td>
                <td className="p-space-sm"><span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-xs font-bold">HIGH</span></td>
                <td className="p-space-sm font-medium">Vikram Das (AV Lead)</td>
                <td className="p-space-sm">
                  <button
                    onClick={() => navigate('/staff/requests/REQ-2026-000123')}
                    className="px-3 py-1 bg-surface-container text-on-surface text-xs rounded hover:bg-surface-container-high cursor-pointer font-semibold"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="p-space-sm font-mono-data-sm font-bold text-secondary">REQ-2026-000098</td>
                <td className="p-space-sm text-on-surface">Library Quiet Study 3</td>
                <td className="p-space-sm">HVAC &amp; Climate</td>
                <td className="p-space-sm"><span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-xs font-semibold">MED</span></td>
                <td className="p-space-sm font-medium">Manoj Sen (HVAC Lead)</td>
                <td className="p-space-sm">
                  <button
                    onClick={() => navigate('/staff/requests/REQ-2026-000098')}
                    className="px-3 py-1 bg-surface-container text-on-surface text-xs rounded hover:bg-surface-container-high cursor-pointer font-semibold"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
