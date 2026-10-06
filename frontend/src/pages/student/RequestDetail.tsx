import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Star,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { getRequest, getRequestTimeline } from '../../api/requests';
import { submitFeedback } from '../../api/feedback';
import { RequestDetail as IRequestDetail, RequestTimelineItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SlaBadge } from '../../components/common/SlaBadge';
import { TimelineVisualizer } from '../../components/common/TimelineVisualizer';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<IRequestDetail | null>(null);
  const [timeline, setTimeline] = useState<RequestTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback State
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackResolved, setFeedbackResolved] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const [req, time] = await Promise.all([
          getRequest(id),
          getRequestTimeline(id),
        ]);
        setRequest(req);
        setTimeline(time);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(id, {
        rating,
        comment: feedbackComment,
        resolved: feedbackResolved,
      });
      setFeedbackSubmitted(true);
    } catch {
      // Ignored
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Request Not Found</h3>
        <p className="text-sm text-slate-400 mb-4">The ticket ID could not be loaded.</p>
        <button
          onClick={() => navigate('/student/requests')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const isOverdue =
    request.sla_deadline &&
    new Date(request.sla_deadline).getTime() < new Date().getTime() &&
    request.status !== 'completed';

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Back button & Ticket Header */}
      <div>
        <button
          onClick={() => navigate('/student/requests')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Requests
        </button>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                {request.ticket_number}
              </span>
              <PriorityBadge priority={request.priority} />
            </div>

            <div className="flex items-center gap-3">
              <SlaBadge deadline={request.sla_deadline} status={request.status} />
              <StatusBadge status={request.status} size="lg" />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug mb-2">
              {request.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {request.description}
            </p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Department</span>
              <span className="text-xs font-semibold text-slate-200">{request.department}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Assigned Specialist</span>
              <span className="text-xs font-semibold text-slate-200">
                {request.assigned_to?.name || 'Unassigned / Auto-routing'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Location</span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {request.location.building} {request.location.room && `• ${request.location.room}`}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block mb-1">Created At</span>
              <span className="text-xs font-semibold text-slate-200">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Operational Timeline Component */}
      <TimelineVisualizer
        timeline={timeline}
        currentStatus={request.status}
        isOverdue={Boolean(isOverdue)}
      />

      {/* Feedback Card (if status is completed) */}
      {request.status === 'completed' && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Service Resolution Feedback</h3>
              <p className="text-xs text-slate-400">Rate the speed and quality of technician resolution</p>
            </div>
          </div>

          {feedbackSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              Thank you! Your feedback has been recorded in the campus quality analytics ledger.
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-2 font-medium">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg transition-all ${
                        rating >= star
                          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                          : 'text-slate-600 bg-slate-950 border border-slate-800'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-300 ml-2 font-mono">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">
                  Comments / Observations
                </label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="The issue was fixed promptly and lab equipment was verified."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="resolved_checkbox"
                  checked={feedbackResolved}
                  onChange={(e) => setFeedbackResolved(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="resolved_checkbox" className="text-xs text-slate-300 cursor-pointer">
                  I confirm this issue is fully resolved and operational.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                {isSubmittingFeedback ? 'Submitting Feedback...' : 'Submit Resolution Review'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
