import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SlaGaugeCircle } from '../../components/common/SlaGaugeCircle';
import { getRequest, getRequestTimeline } from '../../api/requests';
import { RequestDetail, RequestTimelineItem } from '../../types';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [timeline, setTimeline] = useState<RequestTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [notes, setNotes] = useState([
    {
      author: 'Vikram Das',
      role: 'IT Support Specialist',
      time: '11:15 AM',
      text: 'Replacement HDMI switcher module checked out from Central Stores inventory. Moving to CSE Lab 2.',
    },
    {
      author: 'CampusPulse AI',
      role: 'Automated Diagnostic',
      time: '10:15 AM',
      text: 'Parsed safety tags: Projector, Spark Hazard. Priority escalated to HIGH automatically.',
    },
  ]);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [req, time] = await Promise.all([
          getRequest(id),
          getRequestTimeline(id).catch(() => []),
        ]);
        setRequest(req);
        setTimeline(time);
      } catch (e) {
        console.error('Failed to load request detail:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const ticketNumber = request?.ticket_number || id || 'CP-2024-8841';
  const displayTitle = request?.title || 'Ceiling Projector HDMI Port Failure';
  const displayDescription =
    request?.description ||
    'The ceiling projector in CSE Lab 2 suddenly turned off during lecture. When trying to reconnect the HDMI cable, a small spark was noticed near the port. There is no video output now.';
  const displayLocation = request?.location
    ? `${request.location.building}${request.location.room ? ` — ${request.location.room}` : ''}${
        request.location.floor !== undefined && request.location.floor !== null ? ` (Floor ${request.location.floor})` : ''
      }`
    : 'Block A (Engineering) — CSE Lab 2, 2nd Floor';
  const displayPriority = (request?.priority || 'high').toUpperCase();
  const displayStatus = (request?.status || 'dispatched').toUpperCase().replace('_', ' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([
      ...notes,
      {
        author: 'Student Requester',
        role: 'Requester',
        time: 'Just now',
        text: newNote,
      },
    ]);
    setNewNote('');
  };

  return (
    <div className="space-y-space-xl">
      {/* Top Banner: Submission Confirmation & Ticket Header */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <div className="space-y-space-2xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {displayTitle}
                </span>
                <span className="font-mono-data-sm text-mono-data-sm bg-error-container text-on-error-container px-space-xs py-space-2xs rounded font-bold">
                  {displayPriority} PRIORITY
                </span>
                <span className="font-mono-data-sm text-mono-data-sm bg-secondary text-white px-space-xs py-space-2xs rounded font-semibold">
                  {displayStatus}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Located at: <strong className="text-on-surface">{displayLocation}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-space-2xs bg-surface-container-low text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface-container transition-colors font-mono-data-sm text-mono-data-sm border border-surface-container-high cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">{copied ? 'done' : 'content_copy'}</span>
              <span>{copied ? 'Copied!' : ticketNumber}</span>
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-space-2xs text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs font-label-md text-label-md cursor-pointer"
            >
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* 5-Step Horizontal Lifecycle Telemetry Stepper */}
        <div className="pt-space-md border-t border-surface-container-high/40">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-sm block">
            End-to-End Resolution Pipeline
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-space-xs">
            {/* Node 1 */}
            <div className="p-space-sm bg-surface-container-low rounded-lg border-l-4 border-secondary space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[10px] uppercase text-secondary font-bold">1. Logged</span>
                <span className="material-symbols-outlined text-sm text-secondary">check</span>
              </div>
              <p className="font-mono-data-sm text-[11px] text-on-surface">
                {request?.created_at ? new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:14 AM'}
              </p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">Submitted via Portal</p>
            </div>

            {/* Node 2 */}
            <div className="p-space-sm bg-surface-container-low rounded-lg border-l-4 border-secondary space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[10px] uppercase text-secondary font-bold">2. AI Triage</span>
                <span className="material-symbols-outlined text-sm text-secondary">auto_awesome</span>
              </div>
              <p className="font-mono-data-sm text-[11px] text-on-surface">Auto-Triaged</p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">94% Confidence</p>
            </div>

            {/* Node 3 */}
            <div className="p-space-sm bg-surface-container-low rounded-lg border-l-4 border-secondary space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[10px] uppercase text-secondary font-bold">3. Assigned</span>
                <span className="material-symbols-outlined text-sm text-secondary">person</span>
              </div>
              <p className="font-mono-data-sm text-[11px] text-on-surface">
                {request?.assigned_to?.name || 'Department Queue'}
              </p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">{request?.department || 'Field Support'}</p>
            </div>

            {/* Node 4 (Active) */}
            <div className="p-space-sm bg-secondary-fixed text-on-secondary-fixed rounded-lg border-l-4 border-secondary space-y-1 ring-2 ring-secondary/30">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[10px] uppercase text-secondary font-bold">4. In Progress</span>
                <span className="material-symbols-outlined text-sm text-secondary animate-spin">refresh</span>
              </div>
              <p className="font-mono-data-sm text-[11px] font-bold text-secondary">Live Update</p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">Active ticket</p>
            </div>

            {/* Node 5 (Target) */}
            <div className="p-space-sm bg-surface-container-low/50 rounded-lg border-l-4 border-surface-container-high space-y-1 opacity-70">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[10px] uppercase text-on-surface-variant font-bold">5. Resolution</span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
              </div>
              <p className="font-mono-data-sm text-[11px] text-on-surface">
                {request?.sla_deadline ? new Date(request.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Est. Today'}
              </p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">Target SLA Window</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Split: Left Info & Chat + Right Specialist & SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl">
        {/* Left Column (2/3): Description & Discussion Thread */}
        <div className="lg:col-span-2 space-y-space-lg">
          {/* Issue Details Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Original Incident Report</h3>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              {displayDescription}
            </p>

            <div className="flex flex-wrap gap-space-xs pt-space-xs">
              <span className="font-mono-data-sm text-[11px] bg-surface-container text-on-surface px-space-xs py-space-2xs rounded">
                #{request?.category || 'lab_equipment'}
              </span>
              <span className="font-mono-data-sm text-[11px] bg-surface-container text-on-surface px-space-xs py-space-2xs rounded">
                #{request?.location?.building?.split(' ')[0] || 'Campus'}
              </span>
            </div>
          </div>

          {/* Photo / Evidence Attachment Card (if present) */}
          {request?.attachments && request.attachments.length > 0 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">photo_library</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Photo / Evidence Attachment
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {request.attachments.map((att) => {
                  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
                  const fullUrl = att.url.startsWith('http')
                    ? att.url
                    : `${apiBase}${att.url.startsWith('/') ? '' : '/'}${att.url}`;
                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-space-md p-space-md bg-surface-container-low rounded-xl border border-surface-container-high/60 hover:border-secondary/40 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0 border border-surface-container-high">
                        {att.type === 'image' ? (
                          <img
                            src={fullUrl}
                            alt={att.filename}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(fullUrl, '_blank')}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant">description</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-body-sm text-body-sm font-semibold text-on-surface hover:text-secondary truncate block"
                          title={att.filename}
                        >
                          {att.filename}
                        </a>
                        <p className="font-mono-data-sm text-[11px] text-on-surface-variant">
                          {att.size_bytes ? `${(att.size_bytes / (1024 * 1024)).toFixed(1)} MB • ` : ''}
                          {att.type === 'image' ? '📷 Evidence Photo' : att.type}
                        </p>
                      </div>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-space-xs text-secondary hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Open image in new tab"
                      >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity & Updates Feed */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Live Ticket Thread</h3>

            <div className="space-y-space-sm">
              {notes.map((n, i) => (
                <div key={i} className="p-space-sm bg-surface-container-low rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface">{n.author} ({n.role})</span>
                    <span className="text-on-surface-variant font-mono">{n.time}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">{n.text}</p>
                </div>
              ))}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-space-xs pt-space-xs border-t border-surface-container-high/40">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
                placeholder="Add a comment or additional details for the technician..."
                className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-space-sm font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-space-md py-space-xs rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                >
                  Send Update
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1/3): SLA Meter & Assigned Specialist */}
        <div className="space-y-space-lg">
          {/* SLA Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">SLA Resolution Countdown</h3>
            <div className="flex items-center justify-center py-space-md">
              <SlaGaugeCircle percentage={72} remainingText="01h 40m remaining" label="SLA Target" variant="blue" />
            </div>
            <div className="space-y-1 text-xs text-on-surface-variant font-mono text-center">
              <p>Target Resolution: Today, 12:15 PM</p>
              <p className="text-secondary font-semibold">Priority Tier: High (2 Hour SLA window)</p>
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Assigned Field Specialist</h3>
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                VD
              </div>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">Vikram Das</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Lead AV &amp; Electronics Technician</p>
                <p className="font-mono-data-sm text-[11px] text-secondary font-semibold">📍 On route to Block A</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-xs pt-space-xs border-t border-surface-container-high/30">
              <button
                type="button"
                className="flex items-center justify-center gap-1 py-space-xs bg-surface-container-low rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                <span>Call Desk</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1 py-space-xs bg-surface-container-low rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                <span>Direct Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
