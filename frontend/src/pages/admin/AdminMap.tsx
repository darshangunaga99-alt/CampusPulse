import React, { useState, useEffect } from 'react';
import { MapPin, Activity, ShieldCheck, AlertTriangle, Layers, Filter } from 'lucide-react';
import { getMapAnalytics } from '../../api/analytics';
import { MapAnalyticsItem } from '../../types';
import { CampusMap } from '../../components/map/CampusMap';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapAnalyticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMap = async () => {
      setIsLoading(true);
      try {
        const data = await getMapAnalytics();
        setMapData(data);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchMap();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-2 self-start inline-flex">
          <MapPin className="w-3.5 h-3.5" />
          Geospatial Operations Intel
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Campus Geospatial Command Map
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interactive facility heat mapping, building health score telemetry, and real-time incident clustering
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-32" />
      ) : (
        <div className="space-y-6">
          <CampusMap data={mapData} />

          {/* Building Health Score Leaderboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mapData.map((item) => {
              const isHealthy = item.health_score >= 90;
              const isCritical = item.critical > 0;

              return (
                <div
                  key={item.building}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : isHealthy
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-100">{item.building}</h4>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isHealthy
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {item.health_score}% Health
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Active Tickets:</span>
                      <span className="text-slate-200 font-bold">{item.active_requests}</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>Critical Safety:</span>
                      <span className="font-bold">{item.critical}</span>
                    </div>
                    <div className="flex justify-between text-orange-400">
                      <span>High Priority:</span>
                      <span className="font-bold">{item.high}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
