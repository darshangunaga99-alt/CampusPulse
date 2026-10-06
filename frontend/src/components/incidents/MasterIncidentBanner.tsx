import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MasterIncidentBannerProps {
  title?: string;
  department?: string;
  affectedCount?: number;
  description?: string;
  resolutionTime?: string;
  incidentId?: string;
  onFollow?: () => void;
}

export const MasterIncidentBanner: React.FC<MasterIncidentBannerProps> = ({
  title = 'WiFi Network Outage — Block B & Surrounding Labs',
  department = 'IT Infrastructure',
  affectedCount = 18,
  description = 'Reported 10:15 AM. Technicians are currently replacing the L3 network core switch on 2nd Floor. Local access points running on backup routing.',
  resolutionTime = 'Today, 3:30 PM (45m remaining)',
  incidentId = 'INC-2024-042',
  onFollow,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-error-container text-on-error-container rounded-xl p-space-xl shadow-sm border border-error/20">
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="flex items-center gap-space-2xs font-mono-data-sm text-[11px] bg-error text-on-error px-space-sm py-space-2xs rounded font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-xs animate-ping">warning</span>
              Active Master Incident in your zone
            </span>
            <span className="font-mono-data-sm text-[11px] bg-surface-container-lowest text-on-surface px-space-xs py-space-2xs rounded font-semibold shadow-xs">
              {affectedCount} Students Affected
            </span>
            <span className="font-mono-data-sm text-[11px] bg-surface-container-lowest text-on-surface px-space-xs py-space-2xs rounded shadow-xs">
              Dept: {department}
            </span>
          </div>

          <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-error-container pt-space-xs">
            {title}
          </h2>

          <p className="font-body-md text-body-md text-on-error-container/90 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-space-md pt-space-2xs">
            <span className="flex items-center gap-space-2xs font-mono-data-sm text-mono-data-sm font-semibold text-on-error-container">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Estimated resolution: {resolutionTime}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch xl:items-center gap-space-sm shrink-0">
          <button
            onClick={onFollow}
            className="flex items-center justify-center gap-space-xs bg-surface-container-lowest text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface transition-colors font-label-md text-label-md shadow-sm border border-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-base fill">notifications_active</span>
            <span>Follow Incident</span>
          </button>
          <button
            onClick={() => navigate(`/student/incidents?id=${incidentId}`)}
            className="flex items-center justify-center gap-space-xs bg-error text-on-error px-space-md py-space-xs rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md shadow-sm cursor-pointer"
          >
            <span>View War Room</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
