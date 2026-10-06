import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const NewRequestPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [selectedCategory, setSelectedCategory] = useState('lab');
  const [building, setBuilding] = useState('Block A (Engineering)');
  const [room, setRoom] = useState('CSE Lab 2 (2nd Floor)');
  const [title, setTitle] = useState('Ceiling Projector HDMI Port Failure & Sparks');
  const [description, setDescription] = useState(
    'The ceiling projector in CSE Lab 2 suddenly turned off during lecture. When trying to reconnect the HDMI cable, a small spark was noticed near the port. There is no video output now.'
  );
  const [hasMedia, setHasMedia] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI correlation toggle state (Screen 2 vs Screen 3)
  const [matchedIncident, setMatchedIncident] = useState<{
    id: string;
    title: string;
    similarity: number;
    affectedCount: number;
    department: string;
    eta: string;
    explanation: string;
  } | null>({
    id: 'INC-2024-042',
    title: 'Block A & B Electrical Switchgear Voltage Fluctuation',
    similarity: 93,
    affectedCount: 22,
    department: 'Electrical Engineering & Facility Power',
    eta: 'Today, 3:30 PM (45m remaining)',
    explanation:
      'Our AI correlated your report with 4 other active tickets in Block A 2nd floor experiencing sudden voltage spikes and HDMI/AV disruptions within the last 35 minutes.',
  });

  // Dynamic NLP Token Extraction
  const [tokens, setTokens] = useState<string[]>([
    'Projector',
    'HDMI Port',
    'Spark Hazard',
    'Video Failure',
    'CSE Lab 2',
  ]);

  useEffect(() => {
    // Update tokens dynamically as user types
    const text = (title + ' ' + description).toLowerCase();
    const detected: string[] = [];
    if (text.includes('projector')) detected.push('Projector');
    if (text.includes('hdmi')) detected.push('HDMI Port');
    if (text.includes('spark') || text.includes('fire')) detected.push('Spark Hazard');
    if (text.includes('power') || text.includes('voltage')) detected.push('Power Fault');
    if (text.includes('lab') || text.includes('cse')) detected.push('CSE Lab 2');
    if (text.includes('wifi') || text.includes('network')) detected.push('Network Issue');
    if (detected.length > 0) setTokens(detected);
  }, [title, description]);

  const categories = [
    { id: 'electrical', label: '⚡ Electrical & Power', icon: 'bolt' },
    { id: 'wifi', label: '📶 WiFi & Network', icon: 'wifi' },
    { id: 'hvac', label: '❄️ HVAC & Climate', icon: 'ac_unit' },
    { id: 'plumbing', label: '🚰 Plumbing & Water', icon: 'water_drop' },
    { id: 'lab', label: '🖥️ Lab Equipment & AV', icon: 'desktop_windows' },
    { id: 'safety', label: '🔒 Safety & Security', icon: 'security' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/student/requests/REQ-2026-000123');
    }, 800);
  };

  const handleMergeWithIncident = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/student/incidents?id=INC-2024-042&merged=true');
    }, 600);
  };

  return (
    <div className="space-y-space-xl">
      {/* Header */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="space-y-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Create New Campus Request
            </span>
            <span className="font-mono-data-sm text-mono-data-sm bg-tertiary-container text-on-tertiary-container px-space-xs py-space-2xs rounded-full font-medium">
              ✨ AI Auto-Triage Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Describe the incident or service request. Our neural triage engine parses intent, auto-routes to technicians, and checks for live incident duplicates.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-space-2xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column (7 cols): Request Form */}
        <div className="lg:col-span-7 space-y-space-lg">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-lg">
            {/* Category Selector Pills */}
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Service Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-space-xs p-space-sm rounded-lg border text-left font-body-sm text-body-sm transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-primary-container text-white border-primary-container font-semibold shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-surface-container-high/40 hover:bg-surface-container'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="space-y-space-2xs">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Campus Building
                </label>
                <div className="relative">
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-high/60 rounded-lg px-space-md py-space-xs font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/30"
                  >
                    <option value="Block A (Engineering)">Block A (Engineering)</option>
                    <option value="Block B (Science Labs)">Block B (Science Labs)</option>
                    <option value="Central Library">Central Library</option>
                    <option value="Hostel Complex 4">Hostel Complex 4</option>
                    <option value="Student Activity Center">Student Activity Center</option>
                  </select>
                </div>
              </div>

              <div className="space-y-space-2xs">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Specific Room / Area
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 204, Lab 2, 2nd Floor Corridor"
                  className="w-full bg-surface-container-low border border-surface-container-high/60 rounded-lg px-space-md py-space-xs font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>

            {/* Request Title */}
            <div className="space-y-space-2xs">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Issue Summary / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue..."
                className="w-full bg-surface-container-low border border-surface-container-high/60 rounded-lg px-space-md py-space-xs font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 font-medium"
                required
              />
            </div>

            {/* Natural Language Description */}
            <div className="space-y-space-2xs">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Detailed Description (Natural Language)
                </label>
                <span className="font-mono-data-sm text-[11px] text-on-surface-variant">
                  {description.length}/500 chars
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what happened, error codes, unusual sounds, safety hazards..."
                className="w-full bg-surface-container-low border border-surface-container-high/60 rounded-lg p-space-md font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 resize-none leading-relaxed"
                required
              />
            </div>

            {/* Media Attachment Upload */}
            <div className="space-y-space-2xs">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Photo / Evidence Attachment
              </label>
              {hasMedia ? (
                <div className="flex items-center gap-space-md p-space-md bg-surface-container-low rounded-xl border border-surface-container-high">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant relative overflow-hidden">
                    <span className="material-symbols-outlined text-2xl">image</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface">projector_hdmi_spark.jpg</p>
                    <p className="font-mono-data-sm text-[11px] text-on-surface-variant">2.4 MB • Image Attached</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasMedia(false)}
                    className="p-space-xs text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setHasMedia(true)}
                  className="border-2 border-dashed border-surface-container-high rounded-xl p-space-lg text-center cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">add_photo_alternate</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Click to attach photo or drag &amp; drop evidence
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm pt-space-sm border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="w-full sm:w-auto px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-space-xs bg-primary text-on-primary px-space-xl py-space-xs rounded-lg font-label-md text-label-md shadow-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Submit Standalone Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Live AI Diagnostics & Correlation Matrix */}
        <div className="lg:col-span-5 space-y-space-lg">
          {/* AI Semantic Parser Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/40 space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-on-tertiary-container text-xl">psychology</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">AI Diagnostics</span>
              </div>
              <span className="font-mono-data-sm text-mono-data-sm bg-tertiary-container text-on-tertiary-container px-space-xs py-space-2xs rounded-full font-bold">
                94% Confidence
              </span>
            </div>

            {/* Extracted NLP Entity Tokens */}
            <div className="space-y-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Extracted NLP Tokens
              </span>
              <div className="flex flex-wrap gap-space-2xs">
                {tokens.map((token, i) => (
                  <span
                    key={i}
                    className="font-mono-data-sm text-[11px] bg-surface-container text-on-surface px-space-xs py-space-2xs rounded-md border border-surface-container-high font-medium"
                  >
                    #{token}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Classification Breakdown */}
            <div className="grid grid-cols-2 gap-space-sm pt-space-xs border-t border-surface-container-high/30">
              <div className="p-space-sm bg-surface-container-low rounded-lg space-y-1">
                <span className="font-label-sm text-[10px] uppercase text-on-surface-variant">Calculated Priority</span>
                <p className="font-mono-data-sm text-mono-data-sm font-bold text-error flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                  HIGH (Safety Risk)
                </p>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded-lg space-y-1">
                <span className="font-label-sm text-[10px] uppercase text-on-surface-variant">Target SLA</span>
                <p className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">
                  2.0 Hours (Express)
                </p>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded-lg space-y-1 col-span-2">
                <span className="font-label-sm text-[10px] uppercase text-on-surface-variant">Automated Routing</span>
                <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                  Electrical Infrastructure &amp; AV Support Team
                </p>
              </div>
            </div>
          </div>

          {/* Master Incident Duplicate Match Card (Screen 3 state) */}
          {matchedIncident && (
            <div className="bg-error-container text-on-error-container p-space-lg rounded-xl shadow-sm border border-error/30 space-y-space-md animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-error text-xl animate-ping">crisis_alert</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-on-error-container">
                    Master Incident Match ({matchedIncident.similarity}%)
                  </span>
                </div>
                <span className="font-mono-data-sm text-[10px] bg-error text-on-error px-space-xs py-space-2xs rounded font-bold">
                  {matchedIncident.id}
                </span>
              </div>

              <div className="space-y-space-2xs">
                <h4 className="font-body-md text-body-md font-bold text-on-error-container">
                  {matchedIncident.title}
                </h4>
                <p className="font-body-sm text-body-sm text-on-error-container/90 leading-relaxed">
                  {matchedIncident.explanation}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-data-sm pt-space-xs border-t border-error/20">
                <span>{matchedIncident.affectedCount} Linked Students</span>
                <span>ETA: {matchedIncident.eta}</span>
              </div>

              {/* Merge vs Standalone CTA */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={handleMergeWithIncident}
                  className="w-full flex items-center justify-center gap-space-xs bg-error text-on-error py-space-xs rounded-lg font-label-md text-label-md font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base fill">notifications_active</span>
                  <span>Merge &amp; Follow Incident (Recommended)</span>
                </button>
                <p className="text-[11px] text-center text-on-error-container/80">
                  You will get SMS/App alerts when power is restored without creating duplicate tickets.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
