import React, { useState } from 'react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState([
    {
      id: 'SVC-01',
      name: 'Electrical Infrastructure & Lighting',
      department: 'Electrical Engineering',
      lead: 'Dr. K. Raman',
      standardSla: '2.0 Hours',
      p1Sla: '30 Minutes',
      activeTickets: 4,
      status: 'ACTIVE',
    },
    {
      id: 'SVC-02',
      name: 'HVAC, Ventilation & Climate Control',
      department: 'Facilities Operations',
      lead: 'Manoj Sen',
      standardSla: '4.0 Hours',
      p1Sla: '1.0 Hour',
      activeTickets: 2,
      status: 'ACTIVE',
    },
    {
      id: 'SVC-03',
      name: 'Campus Network & WiFi Connectivity',
      department: 'IT Infrastructure',
      lead: 'Vikram Das',
      standardSla: '1.5 Hours',
      p1Sla: '15 Minutes',
      activeTickets: 8,
      status: 'ACTIVE',
    },
    {
      id: 'SVC-04',
      name: 'Classroom AV & Lab Equipment',
      department: 'Academic Computing Support',
      lead: 'Vikram Das',
      standardSla: '3.0 Hours',
      p1Sla: '45 Minutes',
      activeTickets: 3,
      status: 'ACTIVE',
    },
    {
      id: 'SVC-05',
      name: 'Water Supply & Plumbing',
      department: 'Campus Utilities',
      lead: 'Ramesh Kumar',
      standardSla: '3.0 Hours',
      p1Sla: '45 Minutes',
      activeTickets: 1,
      status: 'ACTIVE',
    },
    {
      id: 'SVC-06',
      name: 'Access Control & Electronic Smart Locks',
      department: 'Campus Safety & Security',
      lead: 'Capt. R. Deshmukh',
      standardSla: '1.0 Hour',
      p1Sla: '15 Minutes',
      activeTickets: 0,
      status: 'ACTIVE',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newSla, setNewSla] = useState('2.0 Hours');

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    setServices([
      ...services,
      {
        id: `SVC-0${services.length + 1}`,
        name: newServiceName,
        department: newDept || 'Campus Operations',
        lead: 'Operations Desk',
        standardSla: newSla,
        p1Sla: '30 Minutes',
        activeTickets: 0,
        status: 'ACTIVE',
      },
    ]);
    setShowAddModal(false);
    setNewServiceName('');
    setNewDept('');
  };

  return (
    <div className="space-y-space-xl">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="space-y-space-2xs">
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Campus Services &amp; SLA Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Define service catalog policies, standard SLA resolution windows, and department escalation matrices.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-space-xs rounded-lg font-label-md text-label-md shadow-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table Matrix */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
              <tr>
                <th className="p-space-sm rounded-l-lg">Service Code</th>
                <th className="p-space-sm">Service Name</th>
                <th className="p-space-sm">Department</th>
                <th className="p-space-sm">Team Lead</th>
                <th className="p-space-sm">Standard SLA</th>
                <th className="p-space-sm">P1 Critical SLA</th>
                <th className="p-space-sm">Active Load</th>
                <th className="p-space-sm rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-space-sm font-mono-data-sm font-bold text-secondary">{svc.id}</td>
                  <td className="p-space-sm font-semibold text-on-surface">{svc.name}</td>
                  <td className="p-space-sm text-on-surface-variant">{svc.department}</td>
                  <td className="p-space-sm">{svc.lead}</td>
                  <td className="p-space-sm font-mono font-medium">{svc.standardSla}</td>
                  <td className="p-space-sm font-mono font-bold text-error">{svc.p1Sla}</td>
                  <td className="p-space-sm">
                    <span className="font-mono bg-surface-container px-2 py-0.5 rounded text-xs font-semibold">
                      {svc.activeTickets} Active
                    </span>
                  </td>
                  <td className="p-space-sm">
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold">
                      {svc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-xl shadow-xl border border-surface-container-high space-y-space-md animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Configure New Service</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-space-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Service Name</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Smart Projectors & Displays"
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-2 text-xs text-on-surface outline-none focus:ring-2 focus:ring-secondary/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Responsible Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Media Technology Dept"
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-2 text-xs text-on-surface outline-none focus:ring-2 focus:ring-secondary/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Standard SLA Window</label>
                <select
                  value={newSla}
                  onChange={(e) => setNewSla(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-2 text-xs text-on-surface outline-none focus:ring-2 focus:ring-secondary/30"
                >
                  <option value="1.0 Hour">1.0 Hour</option>
                  <option value="2.0 Hours">2.0 Hours</option>
                  <option value="4.0 Hours">4.0 Hours</option>
                  <option value="24.0 Hours">24.0 Hours</option>
                </select>
              </div>

              <div className="flex justify-end gap-space-xs pt-space-sm">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg shadow-sm hover:opacity-90 cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
