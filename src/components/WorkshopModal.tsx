import React, { useEffect, useState } from 'react';
import { UserRole, Workshop } from '../types/asako';
import { AlertCircle, Calendar, Check, Clock, Sparkles, User, Users, X } from 'lucide-react';
import { getWorkshopVisual } from '../data/workshopVisuals';

interface WorkshopModalProps {
  workshop: Workshop | null;
  onClose: () => void;
  onEnrollSuccess: (workshop: Workshop) => Promise<void>;
  isEnrolled?: boolean;
  isLoggedIn: boolean;
  onOpenAuth: (role?: UserRole) => void;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({
  workshop,
  onClose,
  onEnrollSuccess,
  isEnrolled = false,
  isLoggedIn,
  onOpenAuth,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setEnrolled(isEnrolled);
    setErrorMessage(null);
  }, [workshop?.id, isEnrolled]);

  if (!workshop) return null;

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onEnrollSuccess(workshop);
      setEnrolled(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Workshop registration failed.');
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
              WORKSHOP & MASTERCLASS ENROLLMENT
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
          <div className="aspect-[16/7] overflow-hidden bg-[#F5F7FA]">
            <img
              src={getWorkshopVisual(workshop.category).image}
              alt={getWorkshopVisual(workshop.category).alt}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2 border-b border-[#E2E8F0] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A34E] font-body">
                {workshop.category}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342]">
                {workshop.level}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
              {workshop.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569] font-body pt-1">
              <span className="font-semibold text-[#173B70]">{workshop.provider}</span>
              <span>·</span>
              <span>{workshop.schedule}</span>
              <span>·</span>
              <span>{workshop.duration}</span>
              <span>·</span>
              <span className="text-sm font-bold text-[#0F2342]">{workshop.price}</span>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2 font-body">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
              Programme Overview
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              {workshop.overview}
            </p>
          </div>

          {/* Instructor Block */}
          <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-4 flex items-center justify-between font-body">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-semibold text-[#75777F] tracking-[0.12em]">
                Lead Instructor
              </div>
              <div className="text-sm font-bold text-[#0F2342]">
                {workshop.instructor.name}
              </div>
              <div className="text-xs text-[#475569]">
                {workshop.instructor.role} · {workshop.instructor.affiliation}
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-white border border-[#E2E8F0] text-[#0F2342]">
              {workshop.seatsTotal - workshop.seatsBooked} Seats Remaining
            </span>
          </div>

          {/* Curriculum Modules */}
          <div className="space-y-3 font-body">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
              Curriculum Syllabus
            </h3>
            <div className="space-y-2">
              {workshop.syllabus.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-[#E2E8F0] text-xs text-[#475569] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-[#C9A34E] shrink-0"></span>
                  <span className="font-medium text-[#0F2342]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment State */}
          <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
            {enrolled ? (
              <div className="p-4 bg-[rgba(201,163,78,0.08)] border border-[#C9A34E] flex items-start gap-3">
                <Check className="w-5 h-5 text-[#C9A34E] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#0F2342] uppercase tracking-[0.12em] font-body">
                    ENROLLMENT CONFIRMED
                  </div>
                  <div className="text-xs text-[#475569] mt-1 leading-relaxed font-body">
                    Your seat in &ldquo;{workshop.title}&rdquo; is reserved. Calendar invites and preparation links have been issued to your email.
                  </div>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <div className="space-y-4 font-body">
                <p className="text-sm text-[#475569]">
                  Sign in or create an account to reserve your place in this workshop.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('student')}
                    className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer"
                  >
                    Sign in to enroll
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnroll} className="space-y-4 font-body">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
                  Reserve Your Seat ({workshop.price})
                </div>

                <p className="text-xs text-[#475569]">
                  We’ll use the name and email address on your signed-in account.
                </p>

                {errorMessage && (
                  <div role="alert" className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

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
                    {isSubmitting ? 'Reserving Seat...' : `Enroll Now • ${workshop.price}`}
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
