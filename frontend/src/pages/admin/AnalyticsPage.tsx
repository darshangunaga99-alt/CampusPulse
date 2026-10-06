import React, { useState } from 'react';

export const AnalyticsPage: React.FC = () => {
  const [createdOrder, setCreatedOrder] = useState<string | null>(null);

  const predictiveAlerts = [
    {
      id: 'PREV-01',
      equipment: 'HVAC Chiller Compressor Unit 3 (Block B)',
      risk: 82,
      timeframe: 'Next 72 Hours',
      cause: 'Continuous harmonic vibration anomaly exceeding 4.2mm/s threshold.',
      impact: 'Risk of full thermal shutdown in Science Labs 1-4.',
      action: 'Replace dual ball-bearing assembly & lubricate sleeve.',
    },
    {
      id: 'PREV-02',
      equipment: 'Main Pressure Pump 2 (Hostel 4 Quad)',
      risk: 68,
      timeframe: 'Next 5 Days',
      cause: 'Cavitation acoustic profile detected during peak 7:00 AM flow rate.',
      impact: 'Potential water supply reduction to 280 hostel residents.',
      action: 'Inspect intake impeller & bleed trapped air pockets.',
    },
    {
      id: 'PREV-03',
      equipment: 'Substation 2 Inverter Battery Bank',
      risk: 74,
      timeframe: 'Next 7 Days',
      cause: 'Internal cell resistance increased 28% over 90-day baseline.',
      impact: 'Emergency backup runtime reduced from 45 mins to 12 mins.',
      action: 'Schedule cell replacement and recalibrate balancing circuit.',
    },
  ];

  const handleGenerateWorkOrder = (equipment: string) => {
    setCreatedOrder(equipment);
    setTimeout(() => {
      setCreatedOrder(null);
    }, 3000);
  };

  return (
    <div className="space-y-space-xl">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="space-y-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Preventive Maintenance &amp; Neural Anomaly Detection
            </span>
            <span className="font-mono-data-sm text-[11px] bg-tertiary-container text-on-tertiary-container px-space-xs py-space-2xs rounded-full font-bold">
              AI PREDICTIVE ACTIVE
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Neural pattern models correlate repeating failure modes to preemptively prevent equipment breakdowns before students report them.
          </p>
        </div>
      </div>

      {/* Generated Order Toast */}
      {createdOrder && (
        <div className="p-space-md bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-between shadow-sm border border-secondary animate-in fade-in">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-2xl">verified</span>
            <p className="font-body-sm text-body-sm font-semibold">
              Preventive Work Order successfully created &amp; dispatched to Facilities Queue for: {createdOrder}!
            </p>
          </div>
        </div>
      )}

      {/* 3 Critical Predictive Anomaly Warnings */}
      <div className="space-y-space-sm">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
          High-Confidence Predictive Failure Warnings
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {predictiveAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col justify-between space-y-space-md"
            >
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data-sm text-xs font-bold text-secondary">{alert.id}</span>
                  <span className="font-mono-data-sm text-xs font-bold text-error bg-error-container px-2 py-0.5 rounded">
                    {alert.risk}% Failure Probability
                  </span>
                </div>

                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface leading-tight">
                  {alert.equipment}
                </h3>

                <p className="font-mono-data-sm text-xs text-secondary font-semibold">
                  Estimated Failure: {alert.timeframe}
                </p>

                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  <strong>Telemetry Root Cause:</strong> {alert.cause}
                </p>

                <p className="font-body-sm text-xs text-error bg-error-container/40 p-2 rounded-lg">
                  ⚠️ <strong>Potential Impact:</strong> {alert.impact}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateWorkOrder(alert.equipment)}
                className="w-full flex items-center justify-center gap-space-xs bg-primary text-on-primary py-space-xs rounded-lg font-label-md text-xs font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">build_circle</span>
                <span>Generate Preventive Work Order</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recurring Failure Modes & Root Cause Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left (7 cols): Recurring Failure Heatmap */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Recurring Incident Clusters by Zone
            </span>
            <span className="font-mono-data-sm text-xs bg-surface-container px-space-xs py-space-2xs rounded">
              Last 60 Days
            </span>
          </div>

          <div className="space-y-space-sm">
            <div className="p-space-sm bg-surface-container-low rounded-lg space-y-1">
              <div className="flex justify-between font-body-sm text-xs">
                <span className="font-bold text-on-surface">Block A — 2nd Floor AV &amp; Projector Ports</span>
                <span className="font-mono text-error font-bold">14 Reports (High Recurrence)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-error h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[11px] text-on-surface-variant">Recommended Action: Total rewire of ceiling trunk conduit.</p>
            </div>

            <div className="p-space-sm bg-surface-container-low rounded-lg space-y-1">
              <div className="flex justify-between font-body-sm text-xs">
                <span className="font-bold text-on-surface">Library Quiet Study 3 — AC Thermostat Drift</span>
                <span className="font-mono text-secondary font-bold">8 Reports (Medium Recurrence)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '52%' }}></div>
              </div>
              <p className="text-[11px] text-on-surface-variant">Recommended Action: Digital thermostat sensor recalibration.</p>
            </div>

            <div className="p-space-sm bg-surface-container-low rounded-lg space-y-1">
              <div className="flex justify-between font-body-sm text-xs">
                <span className="font-bold text-on-surface">Hostel 4 — Boiler Pressure Valve Trip</span>
                <span className="font-mono text-secondary font-bold">6 Reports (Medium Recurrence)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-[11px] text-on-surface-variant">Recommended Action: Pressure relief spring replacement.</p>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Root Cause Attribution */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Root Cause Attribution
          </span>

          <div className="space-y-space-sm font-body-sm text-xs">
            <div className="flex items-center justify-between p-2 bg-surface-container-low rounded">
              <span>Aging Infrastructure / Wear</span>
              <span className="font-mono font-bold text-on-surface">42%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-surface-container-low rounded">
              <span>Circuit / Load Over capacity</span>
              <span className="font-mono font-bold text-on-surface">31%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-surface-container-low rounded">
              <span>Deferred Routine Maintenance</span>
              <span className="font-mono font-bold text-on-surface">18%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-surface-container-low rounded">
              <span>Environmental Weather Fluctuations</span>
              <span className="font-mono font-bold text-on-surface">9%</span>
            </div>
          </div>

          <div className="p-space-sm bg-tertiary-container text-on-tertiary rounded-lg text-xs space-y-1">
            <p className="font-bold text-on-tertiary-container">CampusPulse AI Optimization Impact</p>
            <p className="text-tertiary-fixed-dim">
              Predictive work orders have reduced emergency incident occurrences by <strong>34.2%</strong> across the last academic quarter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
