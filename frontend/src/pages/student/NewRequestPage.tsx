import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAttachment, createRequest } from '../../api/requests';
import { Category } from '../../types';

export const NewRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState('lab');
  const [building, setBuilding] = useState('Block A (Engineering)');
  const [room, setRoom] = useState('CSE Lab 2 (2nd Floor)');
  const [title, setTitle] = useState('Ceiling Projector HDMI Port Failure & Sparks');
  const [description, setDescription] = useState(
    'The ceiling projector in CSE Lab 2 suddenly turned off during lecture. When trying to reconnect the HDMI cable, a small spark was noticed near the port. There is no video output now.'
  );

  // Real Attachment States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Cleanup object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const categories = [
    { id: 'electrical', label: '⚡ Electrical & Power', icon: 'bolt' },
    { id: 'wifi', label: '📶 WiFi & Network', icon: 'wifi' },
    { id: 'hvac', label: '❄️ HVAC & Climate', icon: 'ac_unit' },
    { id: 'plumbing', label: '🚰 Plumbing & Water', icon: 'water_drop' },
    { id: 'lab', label: '🖥️ Lab Equipment & AV', icon: 'desktop_windows' },
    { id: 'safety', label: '🔒 Safety & Security', icon: 'security' },
  ];

  const categoryMap: Record<string, Category> = {
    electrical: 'maintenance',
    wifi: 'it_support',
    hvac: 'maintenance',
    plumbing: 'maintenance',
    lab: 'lab_equipment',
    safety: 'other',
  };

  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    setSubmitError(null);

    // Accept common image formats: JPG / JPEG, PNG, WEBP
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = /\.(jpe?g|png|webp)$/i;

    const isMimeValid = validMimeTypes.includes(file.type.toLowerCase());
    const isExtValid = validExtensions.test(file.name);

    if (!isMimeValid && !isExtValid) {
      setUploadError('Please upload a JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Size limit: 10 MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError('Image must be smaller than 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let attachmentPayload = undefined;

      if (selectedFile) {
        try {
          const uploaded = await uploadAttachment(selectedFile);
          attachmentPayload = [uploaded];
        } catch (uploadErr: any) {
          console.error('Upload failed:', uploadErr);
          setSubmitError(uploadErr?.message || 'Unable to upload the image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const res = await createRequest({
        title: title.trim(),
        description: description.trim(),
        category: categoryMap[selectedCategory] || 'lab_equipment',
        location: {
          building: building.trim(),
          room: room.trim() || undefined,
        },
        attachments: attachmentPayload,
      });

      navigate(`/student/requests/${res.id}`);
    } catch (err: any) {
      console.error('Request creation failed:', err);
      setSubmitError(err?.message || 'Unable to submit the request. Please try again.');
      setIsSubmitting(false);
    }
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
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Photo / Evidence Attachment
                </label>
                <span className="font-mono-data-sm text-[11px] text-on-surface-variant">
                  Optional • JPG, PNG, WEBP (Max 10 MB)
                </span>
              </div>

              {/* Hidden native file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    validateAndSetFile(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="evidence-file-input"
              />

              {selectedFile && previewUrl ? (
                <div className="flex items-center gap-space-md p-space-md bg-surface-container-low rounded-xl border border-surface-container-high transition-all">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant relative overflow-hidden shrink-0 border border-surface-container-high">
                    <img
                      src={previewUrl}
                      alt="Evidence preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="font-mono-data-sm text-[11px] text-on-surface-variant">
                      {formatFileSize(selectedFile.size)} • Image
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-1 px-space-sm py-space-xs text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer font-label-md text-label-md shrink-0"
                    title="Remove attachment"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-space-lg text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]'
                      : 'border-surface-container-high hover:bg-surface-container-low hover:border-secondary/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">add_photo_alternate</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Click to attach photo or drag &amp; drop evidence
                  </p>
                  <p className="font-mono-data-sm text-[11px] text-on-surface-variant/70 mt-0.5">
                    Supports JPG, PNG, or WEBP up to 10 MB
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-1.5 p-space-xs px-space-sm bg-error-container text-on-error-container rounded-lg text-xs font-medium animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-base text-error">error</span>
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-1.5 p-space-sm bg-error-container text-on-error-container rounded-lg text-xs font-medium">
                <span className="material-symbols-outlined text-base text-error">error</span>
                <span>{submitError}</span>
              </div>
            )}

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
