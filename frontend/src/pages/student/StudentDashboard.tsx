import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('Urgent SLA');
  const [followed, setFollowed] = useState(false);

  return (
    <div className="flex flex-col gap-space-xl">
      {/* Top Greeting & Operational Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-xl rounded-xl shadow-sm">
        <div className="space-y-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Good morning, Rahul
            </span>
            <span className="text-xl">👋</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Here's what's happening with your campus requests &amp; active community incidents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => navigate('/student/requests/new')}
            className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-space-xs rounded-lg shadow-sm hover:opacity-90 transition-all font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Report an Issue</span>
          </button>
          <button
            onClick={() => navigate('/student/requests/new')}
            className="flex items-center gap-space-xs bg-surface-container text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">build</span>
            <span>Request a Service</span>
          </button>
          <button
            onClick={() => navigate('/student/requests/new')}
            className="flex items-center gap-space-xs bg-surface-container text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            <span>Scan QR</span>
          </button>
          <button
            onClick={() => navigate('/student/requests')}
            className="flex items-center gap-space-xs bg-surface-container text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">saved_search</span>
            <span>Track Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Active Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-data-lg text-mono-data-lg text-on-surface font-bold">12</span>
            <span className="font-mono-data-sm text-mono-data-sm text-secondary bg-surface-container-low px-space-xs py-space-2xs rounded flex items-center gap-space-2xs">
              <span className="material-symbols-outlined text-xs">trending_up</span>+2 from yesterday
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">pending_actions</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-data-lg text-mono-data-lg text-on-surface font-bold">05</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">3 parts / 2 dispatch</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Resolved (30d)
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-lg">task_alt</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-data-lg text-mono-data-lg text-on-surface font-bold">24</span>
            <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Avg 4.2h · 98% CSAT</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="bg-on-surface h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Unread Updates
            </span>
            <div className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">mark_chat_unread</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-data-lg text-mono-data-lg text-error font-bold">03</span>
            <span className="font-label-sm text-label-sm bg-error-container text-on-error-container px-space-xs py-space-2xs rounded">
              Action Needed
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>

      {/* Active Campus Master Incident Banner */}
      <div className="relative overflow-hidden bg-error-container text-on-error-container rounded-xl p-space-xl shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="flex items-center gap-space-2xs font-mono-data-sm text-mono-data-sm bg-error text-on-error px-space-sm py-space-2xs rounded font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs animate-ping">warning</span>
                Active Master Incident in your zone
              </span>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-lowest text-on-surface px-space-xs py-space-2xs rounded font-semibold">
                18 Students Affected
              </span>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-lowest text-on-surface px-space-xs py-space-2xs rounded">
                Dept: IT Infrastructure
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-error-container pt-space-xs">
              WiFi Network Outage — Block B &amp; Surrounding Labs
            </h2>
            <p className="font-body-md text-body-md text-on-error-container/90">
              Reported 10:15 AM. Technicians are currently replacing the L3 network core switch on 2nd Floor. Local access points running on backup routing.
            </p>
            <div className="flex items-center gap-space-md pt-space-2xs">
              <span className="flex items-center gap-space-2xs font-mono-data-sm text-mono-data-sm font-semibold">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Estimated resolution: Today, 3:30 PM (45m remaining)
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch xl:items-center gap-space-sm shrink-0">
            <button
              onClick={() => setFollowed(!followed)}
              className="flex items-center justify-center gap-space-xs bg-surface-container-lowest text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base fill">notifications_active</span>
              <span>{followed ? 'Following' : 'Follow Incident'}</span>
            </button>
            <button
              onClick={() => navigate('/student/incidents')}
              className="flex items-center justify-center gap-space-xs bg-error text-on-error px-space-md py-space-xs rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md shadow-sm cursor-pointer"
            >
              <span>View War Room</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Section: 2/3 My Requests vs 1/3 Timeline & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl">
        {/* Left Column (2/3): My Active Requests */}
        <div className="lg:col-span-2 space-y-space-md">
          {/* Section Header & Filter Controls */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">My Active Requests</span>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container text-on-surface px-space-xs rounded-full">
                3 Open
              </span>
            </div>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <div className="flex items-center bg-surface-container-low rounded-lg px-space-sm py-space-2xs">
                <span className="material-symbols-outlined text-sm text-on-surface-variant mr-space-2xs">filter_list</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent font-label-sm text-label-sm text-on-surface border-0 outline-none pr-space-xs cursor-pointer"
                >
                  <option>All Statuses</option>
                  <option>High Priority</option>
                  <option>IT Systems</option>
                  <option>Facilities &amp; HVAC</option>
                </select>
              </div>
              <div className="flex items-center bg-surface-container-low rounded-lg px-space-sm py-space-2xs">
                <span className="material-symbols-outlined text-sm text-on-surface-variant mr-space-2xs">sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-label-sm text-label-sm text-on-surface border-0 outline-none pr-space-xs cursor-pointer"
                >
                  <option>Urgent SLA</option>
                  <option>Recently Updated</option>
                  <option>Submission Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Request Cards Stream */}
          <div className="space-y-space-md">
            {/* Card 1 (Active High Focus) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-mono-data-sm text-mono-data-sm bg-surface-container px-space-xs py-space-2xs rounded text-on-surface font-semibold">
                      REQ-2026-000123
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm bg-error-container text-on-error-container px-space-xs py-space-2xs rounded font-bold">
                      HIGH PRIORITY
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm bg-tertiary-container text-on-tertiary-container px-space-xs py-space-2xs rounded">
                      IN PROGRESS
                    </span>
                  </div>
                  <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Target: Today, 4:00 PM</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                  <div className="space-y-space-2xs max-w-lg">
                    <h3
                      onClick={() => navigate('/student/requests/REQ-2026-000123')}
                      className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-secondary cursor-pointer"
                    >
                      Ceiling Projector HDMI Port Failure
                    </h3>
                    <div className="flex items-center gap-space-2xs text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span>CSE Lab 2 (Block A, 2nd Floor)</span>
                    </div>
                    <div className="flex items-center gap-space-xs pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                      <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs">
                        VD
                      </div>
                      <span>
                        Assigned to <strong className="text-on-surface font-medium">Vikram Das</strong> (IT Support Specialist)
                      </span>
                    </div>
                  </div>

                  {/* SLA Circular Progress Mini Display */}
                  <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center gap-space-md shrink-0">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
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
                          strokeDasharray="72, 100"
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <span className="absolute font-mono-data-sm text-mono-data-sm font-bold text-on-surface">72%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                        SLA Deadline
                      </span>
                      <span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">02h 18m left</span>
                    </div>
                  </div>
                </div>

                {/* Context Footer Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl">
                  <div className="flex items-center gap-space-2xs text-on-surface-variant font-mono-data-sm text-mono-data-sm">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>Latest note: Replacement HDMI Switcher in transit from Central Store</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      onClick={() => navigate('/student/requests/REQ-2026-000123')}
                      className="font-label-sm text-label-sm text-secondary hover:underline px-space-xs py-space-2xs cursor-pointer"
                    >
                      View Ticket Thread
                    </button>
                    <button
                      onClick={() => navigate('/student/requests/REQ-2026-000123')}
                      className="bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-space-sm py-space-2xs rounded shadow-sm hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-mono-data-sm text-mono-data-sm bg-surface-container px-space-xs py-space-2xs rounded text-on-surface font-semibold">
                      REQ-2026-000098
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-high text-on-surface px-space-xs py-space-2xs rounded font-semibold">
                      MEDIUM
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-low text-secondary px-space-xs py-space-2xs rounded font-semibold">
                      ASSIGNED
                    </span>
                  </div>
                  <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Target: Tomorrow, 11:00 AM</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                  <div className="space-y-space-2xs max-w-lg">
                    <h3
                      onClick={() => navigate('/student/requests/REQ-2026-000098')}
                      className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-secondary cursor-pointer"
                    >
                      AC Thermostat Stuck on 16°C &amp; Dripping Water
                    </h3>
                    <div className="flex items-center gap-space-2xs text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span>Library Quiet Study Hall 3</span>
                    </div>
                    <div className="flex items-center gap-space-xs pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                      <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-xs">
                        MS
                      </div>
                      <span>
                        Assigned to <strong className="text-on-surface font-medium">Manoj Sen</strong> (Facilities &amp; HVAC)
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center gap-space-md shrink-0">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-surface-container-high"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="text-on-surface-variant"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="22, 100"
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <span className="absolute font-mono-data-sm text-mono-data-sm font-bold text-on-surface">22%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                        SLA Countdown
                      </span>
                      <span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">14h 40m left</span>
                    </div>
                  </div>
                </div>

                {/* Context Footer Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl">
                  <div className="flex items-center gap-space-2xs text-on-surface-variant font-mono-data-sm text-mono-data-sm">
                    <span className="w-2 h-2 rounded-full bg-outline"></span>
                    <span>Drain tray inspection scheduled during non-peak library hours</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      onClick={() => navigate('/student/requests/REQ-2026-000098')}
                      className="font-label-sm text-label-sm text-secondary hover:underline px-space-xs py-space-2xs cursor-pointer"
                    >
                      View Ticket Thread
                    </button>
                    <button
                      onClick={() => navigate('/student/requests/REQ-2026-000098')}
                      className="bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-space-sm py-space-2xs rounded shadow-sm hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-mono-data-sm text-mono-data-sm bg-surface-container px-space-xs py-space-2xs rounded text-on-surface font-semibold">
                      REQ-2026-000084
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm bg-error-container text-on-error-container px-space-xs py-space-2xs rounded font-bold">
                      HIGH PRIORITY
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-high text-on-surface px-space-xs py-space-2xs rounded">
                      INVESTIGATING
                    </span>
                  </div>
                  <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Target: Today, 6:00 PM</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                  <div className="space-y-space-2xs max-w-lg">
                    <h3
                      onClick={() => navigate('/student/requests/REQ-2026-000084')}
                      className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-secondary cursor-pointer"
                    >
                      Hostel 4 Hot Water Boiler Circuit Tripped
                    </h3>
                    <div className="flex items-center gap-space-2xs text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span>Hostel 4, Wing C Basement Plant</span>
                    </div>
                    <div className="flex items-center gap-space-xs pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                      <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface text-xs font-bold">
                        ⚡
                      </div>
                      <span>
                        Assigned to <strong className="text-on-surface font-medium">Electrical Maintenance Team</strong>
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center gap-space-md shrink-0">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-surface-container-high"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="text-error"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="55, 100"
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <span className="absolute font-mono-data-sm text-mono-data-sm font-bold text-on-surface">55%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                        SLA Countdown
                      </span>
                      <span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">04h 12m left</span>
                    </div>
                  </div>
                </div>

                {/* Context Footer Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl">
                  <div className="flex items-center gap-space-2xs text-on-surface-variant font-mono-data-sm text-mono-data-sm">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    <span>Safety interlock check required before re-energizing main busbar</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      onClick={() => navigate('/student/requests/REQ-2026-000084')}
                      className="font-label-sm text-label-sm text-secondary hover:underline px-space-xs py-space-2xs cursor-pointer"
                    >
                      View Ticket Thread
                    </button>
                    <button
                      onClick={() => navigate('/student/requests/REQ-2026-000084')}
                      className="bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-space-sm py-space-2xs rounded shadow-sm hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Correlation Banner */}
          <div className="p-space-lg bg-tertiary-container text-on-tertiary rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
            <div className="flex items-start gap-space-md">
              <span className="material-symbols-outlined text-on-tertiary-container text-2xl shrink-0 mt-space-2xs">
                auto_awesome
              </span>
              <div className="space-y-space-2xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-tertiary-container">
                  CampusPulse AI Assistant
                </span>
                <p className="font-body-md text-body-md text-tertiary-fixed-dim">
                  We noticed you reported HDMI issues in Lab 2. 3 other students reported similar problems in Lab 3. We auto-linked these under Common Infrastructure Ticket #INF-881.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/incidents')}
              className="bg-on-tertiary-container text-on-tertiary px-space-md py-space-xs rounded-lg hover:opacity-90 font-label-md text-label-md shrink-0 cursor-pointer"
            >
              View Grouped Cluster
            </button>
          </div>
        </div>

        {/* Right Column (1/3): Quick Status Timeline & Campus Service Health */}
        <div className="space-y-space-xl">
          {/* Live Ticket Tracker Timeline */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-lg">
            <div className="flex items-center justify-between border-b-0 pb-space-2xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-lg">timeline</span>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Ticket Timeline</h4>
              </div>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-high px-space-xs py-space-2xs rounded text-on-surface">
                REQ-000123
              </span>
            </div>

            {/* Vertical Timeline Steps */}
            <div className="relative pl-space-lg space-y-space-lg">
              {/* Connecting vertical line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-surface-container-high"></div>

              {/* Step 1 (Completed) */}
              <div className="relative flex items-start gap-space-md">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
                <div className="space-y-space-2xs">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Submitted by Rahul</span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">10:30 AM</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Report logged via CampusPulse Mobile App.</p>
                </div>
              </div>

              {/* Step 2 (Completed) */}
              <div className="relative flex items-start gap-space-md">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
                <div className="space-y-space-2xs">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">AI Automated Triage</span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">10:32 AM</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Categorized as High Priority &amp; routed to IT Dept.</p>
                </div>
              </div>

              {/* Step 3 (Completed) */}
              <div className="relative flex items-start gap-space-md">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
                <div className="space-y-space-2xs">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Assigned to Specialist</span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">10:45 AM</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Assigned to Vikram Das (Desk IT Dispatch).</p>
                </div>
              </div>

              {/* Step 4 (Current / In Progress) */}
              <div className="relative flex items-start gap-space-md">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-on-secondary-container animate-ping"></span>
                </div>
                <div className="space-y-space-2xs bg-surface-container-low p-space-sm rounded-lg w-full">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Diagnostics In Progress</span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">11:15 AM</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Technician verified projector board power. Replacement port switcher dispatched.
                  </p>
                </div>
              </div>

              {/* Step 5 (Upcoming) */}
              <div className="relative flex items-start gap-space-md opacity-60">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
                </div>
                <div className="space-y-space-2xs">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Estimated Resolution</span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">4:00 PM</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Full hardware swap &amp; display re-calibration.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campus Service Health Quick Glance */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Campus Service Health</h4>
              <span className="font-mono-data-sm text-mono-data-sm text-secondary bg-surface-container-low px-space-xs py-space-2xs rounded font-semibold">
                92.4% Avg
              </span>
            </div>

            <div className="space-y-space-md">
              {/* Health Metric 1 */}
              <div className="space-y-space-2xs">
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">wifi</span>
                    <span className="font-medium text-on-surface">Campus Wi-Fi Network</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm bg-error-container text-on-error-container px-space-xs py-space-2xs rounded font-semibold">
                      Block B Outage
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">78%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Health Metric 2 */}
              <div className="space-y-space-2xs">
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">computer</span>
                    <span className="font-medium text-on-surface">Computer Labs &amp; Workstations</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm bg-surface-container text-on-surface px-space-xs py-space-2xs rounded">
                      Optimal
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">96%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              {/* Health Metric 3 */}
              <div className="space-y-space-2xs">
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">air</span>
                    <span className="font-medium text-on-surface">Power &amp; HVAC Systems</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm bg-surface-container text-on-surface px-space-xs py-space-2xs rounded">
                      Optimal
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">92%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Health Metric 4 */}
              <div className="space-y-space-2xs">
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">apartment</span>
                    <span className="font-medium text-on-surface">Hostel Amenities</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm bg-surface-container text-on-surface px-space-xs py-space-2xs rounded">
                      Optimal
                    </span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">89%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/map')}
              className="w-full flex items-center justify-between text-secondary pt-space-xs font-label-md text-label-md hover:underline cursor-pointer"
            >
              <span>Explore Campus Map Grid</span>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          {/* Campus Facilities Spotlight */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Duty Manager on Shift
            </span>
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                AT
              </div>
              <div className="space-y-space-2xs">
                <h5 className="font-headline-sm text-headline-sm font-bold text-on-surface">Dr. Aris Thorne</h5>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Director of Physical Plant &amp; Infrastructure
                </p>
                <div className="flex items-center gap-space-2xs text-secondary font-mono-data-sm text-mono-data-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>Active on campus radio (Ch 4)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
