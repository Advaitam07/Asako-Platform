import React, { useEffect, useState } from 'react';
import { Opportunity, UserRole } from '../types/asako';
import { AlertCircle, Briefcase, Building, Check, Clock, Globe, MapPin, X, ArrowRight } from 'lucide-react';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onApplySuccess: (opportunity: Opportunity, details: { coverNote: string; portfolioLinks: string[] }) => Promise<void>;
  isApplied?: boolean;
  isLoggedIn: boolean;
  userRole: UserRole;
  onOpenAuth: (role?: UserRole) => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  opportunity,
  onClose,
  onApplySuccess,
  isApplied = false,
  isLoggedIn,
  userRole,
  onOpenAuth,
}) => {
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(isApplied);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSubmitted(isApplied);
    setErrorMessage(null);
    setCoverNote('');
    setPortfolioUrl('');
  }, [opportunity?.id, isApplied]);

  if (!opportunity) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onApplySuccess(opportunity, {
        coverNote,
        portfolioLinks: portfolioUrl ? [portfolioUrl] : [],
      });
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Application could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2342]/70 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white border border-[#0F2342] shadow-asako-floating rounded-none max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#173B70] text-white px-6 py-4 flex items-center justify-between border-b border-[#173B70]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C9A34E]" aria-hidden="true"></span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] font-body">
              OPPORTUNITY SPECIFICATION
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Main Title & Role */}
          <div className="space-y-2 border-b border-[#E2E8F0] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A34E] font-body">
                {opportunity.category}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342]">
                {opportunity.type}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
              {opportunity.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569] font-body pt-1">
              <span className="font-semibold text-[#173B70]">{opportunity.company}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {opportunity.location}
              </span>
              <span>·</span>
              <span className="font-semibold text-[#0F2342]">{opportunity.compensation}</span>
              <span>·</span>
              <span>{opportunity.duration}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 font-body">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
              About The Role
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-3 font-body">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
              Key Requirements
            </h3>
            <ul className="space-y-2 text-sm text-[#475569]">
              {opportunity.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#173B70] mt-2 shrink-0"></span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills Required */}
          <div className="space-y-2 font-body">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
              Required Competencies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Application Section */}
          <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
            {submitted ? (
              <div className="p-4 bg-[rgba(201,163,78,0.08)] border border-[#C9A34E] flex items-start gap-3">
                <Check className="w-5 h-5 text-[#C9A34E] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#0F2342] uppercase tracking-[0.12em] font-body">
                    APPLICATION SUBMITTED SUCCESSFULLY
                  </div>
                  <div className="text-xs text-[#475569] mt-1 leading-relaxed font-body">
                    Your profile and application have been routed directly to the hiring coordinator at {opportunity.company}. Track status updates in your Student Dashboard.
                  </div>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <div className="space-y-4 font-body">
                <p className="text-sm text-[#475569]">
                  Sign in or create a student account to apply for this opportunity.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('student')}
                    className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer"
                  >
                    Sign in to apply
                  </button>
                </div>
              </div>
            ) : userRole !== 'student' ? (
              <p role="status" className="border border-[#E2E8F0] bg-[#F5F7FA] p-4 text-sm text-[#475569] font-body">
                Opportunity applications are available to student accounts. You are signed in as {userRole}.
              </p>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 font-body">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
                  Direct Application Form
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Portfolio / GitHub / LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/alexrivera"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] px-3 py-2 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>

                {errorMessage && (
                  <div role="alert" className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Brief Candidate Statement (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your relevant project work or academic focus..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] px-3 py-2 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2 px-4"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer"
                  >
                    {isSubmitting ? 'Routing Application...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
