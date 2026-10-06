import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapAnalyticsItem } from '../../types';
import { Building2, AlertTriangle, ShieldCheck, Activity, Filter } from 'lucide-react';

interface CampusMapProps {
  data: MapAnalyticsItem[];
  isLoading?: boolean;
}

// Custom Leaflet DivIcon generator
const createCustomIcon = (critical: number, high: number, healthScore: number) => {
  let color = '#3b82f6'; // normal blue
  let glowColor = 'rgba(59, 130, 246, 0.5)';
  let label = 'Normal';

  if (critical > 0) {
    color = '#ef4444'; // critical red
    glowColor = 'rgba(239, 68, 68, 0.6)';
    label = 'Critical';
  } else if (high > 0) {
    color = '#f97316'; // high orange
    glowColor = 'rgba(249, 115, 22, 0.5)';
    label = 'High';
  } else if (healthScore >= 95) {
    color = '#10b981'; // completed/healthy green
    glowColor = 'rgba(16, 185, 129, 0.5)';
    label = 'Healthy';
  }

  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
      <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #0f172a; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${glowColor}; color: #ffffff; font-weight: bold; font-size: 11px; font-family: monospace;">
        ${healthScore}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const CampusMap: React.FC<CampusMapProps> = ({ data, isLoading }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Filtered map points
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedBuilding !== 'all' && item.building !== selectedBuilding) {
        return false;
      }
      if (severityFilter === 'critical' && item.critical === 0) return false;
      if (severityFilter === 'high' && item.high === 0) return false;
      if (severityFilter === 'normal' && (item.critical > 0 || item.high > 0)) return false;
      return true;
    });
  }, [data, selectedBuilding, severityFilter]);

  const defaultCenter: [number, number] = [12.9716, 77.5946];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Map Control Toolbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Campus Geospatial Operations Map
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Building:</span>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Buildings ({data.length})</option>
              {data.map((d) => (
                <option key={d.building} value={d.building}>
                  {d.building}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (Red)</option>
              <option value="high">High (Orange)</option>
              <option value="normal">Normal (Blue)</option>
            </select>
          </div>

          {/* Legend */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-800 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> High
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Normal
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 95%+ Health
            </span>
          </div>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="h-[460px] w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full bg-slate-950"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {filteredData.map((item) => (
            <Marker
              key={item.building}
              position={[item.latitude, item.longitude]}
              icon={createCustomIcon(item.critical, item.high, item.health_score)}
            >
              <Popup className="custom-popup">
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 min-w-[210px]">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-slate-100">{item.building}</h4>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Requests:</span>
                      <span className="font-semibold font-mono text-slate-200">{item.active_requests}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-rose-400">Critical Issues:</span>
                      <span className="font-semibold font-mono text-rose-400">{item.critical}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-orange-400">High Priority:</span>
                      <span className="font-semibold font-mono text-orange-400">{item.high}</span>
                    </div>

                    <div className="flex justify-between pt-1.5 border-t border-slate-800">
                      <span className="text-slate-400">Health Score:</span>
                      <span className="font-bold font-mono text-indigo-400">{item.health_score} / 100</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
