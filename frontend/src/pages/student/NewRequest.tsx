import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  QrCode,
  MapPin,
  Paperclip,
  ArrowRight,
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  FileText,
  Upload,
  Layers,
} from 'lucide-react';
import { analyzeRequest, checkDuplicates, createRequest } from '../../api/requests';
import { getServices } from '../../api/services';
import {
  AIAnalysisResult,
  DuplicateCheckResult,
  Category,
  Priority,
  ServiceItem,
  LocationDetail,
} from '../../types';
import { AiAnalysisCard } from '../../components/common/AiAnalysisCard';
import { DuplicateAlertModal } from '../../components/common/DuplicateAlertModal';
import { QrScannerModal } from '../../components/common/QrScannerModal';
import { followIncident } from '../../api/incidents';

export const NewRequest: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('maintenance');
  const [priority, setPriority] = useState<Priority>('medium');
  const [department, setDepartment] = useState('Facilities');
  const [building, setBuilding] = useState('CSE Block');
  const [floor, setFloor] = useState<number>(2);
  const [room, setRoom] = useState('Lab 2');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Attachments UI State
  const [attachments, setAttachments] = useState<string[]>([]);

  // Services Catalog
  const [services, setServices] = useState<ServiceItem[]>([]);

  // AI & Duplicate State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Submission loading & error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const list = await getServices({ active: true });
        setServices(list);
      } catch {
        // Handled
      }
    };
    loadServices();
  }, []);

  // Trigger AI Analysis
  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeRequest({
        description,
        location: { building, floor, room },
      });
      setAiAnalysis(result);
      setCategory(result.category);
      setPriority(result.priority);
      setDepartment(result.department);
      if (!title) {
        setTitle(result.summary.slice(0, 60));
      }
      if (result.location?.building) {
        setBuilding(result.location.building);
      }
    } catch (err: any) {
      setError('AI Analysis failed. You can still fill in the request details manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Submission & Duplicate Check Flow
  const handleInitiateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe the issue or incident.');
      return;
    }

    setIsCheckingDuplicates(true);
    setError(null);

    try {
      // 1. Call POST /requests/check-duplicates
      const dupCheck = await checkDuplicates({
        description,
        category,
        location: { building, floor, room },
      });

      if (dupCheck.duplicate_found) {
        setDuplicateResult(dupCheck);
        setShowDuplicateModal(true);
        setIsCheckingDuplicates(false);
        return;
      }

      // No duplicate found -> proceed directly to create
      await executeCreateRequest();
    } catch (err: any) {
      // If duplicate check failed, attempt direct creation
      await executeCreateRequest();
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Execute Final Creation: POST /requests
  const executeCreateRequest = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title || description.slice(0, 50),
        description,
        category,
        priority,
        location: {
          building,
          floor: Number(floor) || 1,
          room: room || 'General',
        },
        service_id: selectedServiceId || undefined,
      };

      const response = await createRequest(payload);
      navigate(`/student/requests/${response.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request to backend.');
    } finally {
      setIsSubmitting(false);
      setShowDuplicateModal(false);
    }
  };

  const handleFollowIncident = async (incidentId: string) => {
    try {
      await followIncident(incidentId);
      navigate('/student/incidents');
    } catch {
      navigate('/student/incidents');
    }
  };

  const handleQrLocationFound = (loc: LocationDetail) => {
    setBuilding(loc.building);
    setFloor(loc.floor);
    setRoom(loc.room);
  };

  const sampleDescriptions = [
    'Projector in CSE Lab 2 is not working and we have a presentation tomorrow.',
    'WiFi router is dropping connections and no internet access in Hostel Block C 3rd floor.',
    'Sparking and smoke coming from the main electrical distribution panel in Mechanical Workshop B04.',
    'Library RFID scanner failed to record returned textbook causing overdue fine.',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Intelligent Issue Intake
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Report Campus Incident / Service Need
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Describe the situation naturally. CampusPulse AI will analyze priority, route to the correct team, and check for correlated campus incidents.
        </p>
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleInitiateSubmission} className="space-y-6">
        {/* Step 1: Natural Language Description */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              1. Describe What Happened (Natural Language)
            </label>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !description.trim()}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 disabled:opacity-40 transition-all shadow-glow-brand"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAnalyzing ? 'Analyzing with AI...' : 'Run AI Analysis'}
            </button>
          </div>

          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              if (description.trim() && !aiAnalysis) handleAnalyze();
            }}
            placeholder="e.g. The digital projector in CSE Lab 2 won't turn on and blinks red, and our semester project presentation starts in 2 hours."
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
          />

          {/* Quick sample prompt pills for easy testing */}
          <div>
            <span className="text-[11px] text-slate-500 block mb-1.5 font-mono">
              Quick test scenarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleDescriptions.map((desc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDescription(desc);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all truncate max-w-xs text-left"
                >
                  "{desc}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Result Card */}
        <AiAnalysisCard analysis={aiAnalysis} isLoading={isAnalyzing} />

        {/* Step 2: Location & QR Scanner */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              2. Location Details
            </label>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 transition-all font-medium"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              Scan QR Code
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Building</label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. CSE Block"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Floor</label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                placeholder="e.g. 2"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Room / Zone</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Lab 2"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Editable Classification & Optional Service Selection */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl backdrop-blur-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            3. Review & Edit Classification
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="academic">Academic</option>
                <option value="maintenance">Maintenance</option>
                <option value="lab_equipment">Lab Equipment</option>
                <option value="it_support">IT Support</option>
                <option value="library">Library</option>
                <option value="administration">Administration</option>
                <option value="hostel">Hostel</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 uppercase font-mono"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Optional Service Catalog Link
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Auto-detect or select specific service --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 4: Photo / Video Attachment UI */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl backdrop-blur-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-indigo-400" />
            4. Photos & Evidence (Optional)
          </label>

          <div className="border-2 border-dashed border-slate-700/80 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-all bg-slate-950/40">
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">
              Drag & drop photos of equipment error or broken fixture
            </p>
            <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, MP4 up to 25MB</p>
            <button
              type="button"
              onClick={() => {
                const sampleName = `capture_${Date.now().toString().slice(-4)}.jpg`;
                setAttachments((prev) => [...prev, sampleName]);
              }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700"
            >
              + Attach Sample Photo
            </button>
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {attachments.map((name, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-indigo-300 border border-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isCheckingDuplicates}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg hover:shadow-glow-brand flex items-center gap-2"
          >
            {isCheckingDuplicates ? (
              <span>Checking Campus Duplicates...</span>
            ) : isSubmitting ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <span>Submit & Route Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Duplicate & Existing Incident Detection Modal */}
      <DuplicateAlertModal
        isOpen={showDuplicateModal}
        duplicateData={duplicateResult}
        onFollowIncident={handleFollowIncident}
        onCreateAnyway={executeCreateRequest}
        onCancel={() => setShowDuplicateModal(false)}
      />

      {/* QR Location Scanner Modal */}
      <QrScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onLocationFound={handleQrLocationFound}
      />
    </div>
  );
};
