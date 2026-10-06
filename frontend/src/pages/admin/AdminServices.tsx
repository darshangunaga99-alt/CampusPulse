import React, { useState, useEffect } from 'react';
import { Layers, Search, Filter, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { getServices } from '../../api/services';
import { ServiceItem } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const data = await getServices({
          category: categoryFilter === 'all' ? undefined : categoryFilter,
        });
        setServices(data);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, [categoryFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Campus Service Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard service offerings, default responsible departments, and auto-routing rules
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Category Filter:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="maintenance">Maintenance</option>
            <option value="it_support">IT Support</option>
            <option value="lab_equipment">Lab Equipment</option>
            <option value="hostel">Hostel</option>
            <option value="library">Library</option>
            <option value="transport">Transport</option>
            <option value="academic">Academic</option>
            <option value="administration">Administration</option>
          </select>
        </div>
        <span className="text-xs font-mono text-slate-500">{services.length} Services Active</span>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-24" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3 shadow-card"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {srv.id}
                  </span>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {srv.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1">{srv.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Routed Dept: <span className="text-slate-200 font-semibold">{srv.department}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active in Catalog
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
