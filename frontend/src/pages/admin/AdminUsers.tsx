import React from 'react';
import { Users, Shield, Mail, Building, CheckCircle } from 'lucide-react';
import { mockUsers } from '../../mock/mockData';

export const AdminUsers: React.FC = () => {
  const usersList = Object.values(mockUsers);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          User & Role Governance
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Campus role-based access control, departmental assignment, and authorization credentials
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3.5">User Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Auth Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3.5 font-bold font-sans text-slate-200">{u.name}</td>
                  <td className="p-3.5 text-slate-400">{u.email}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase text-[11px] font-bold font-mono">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 font-sans">{u.department || 'N/A'}</td>
                  <td className="p-3.5">
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Active JWT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
