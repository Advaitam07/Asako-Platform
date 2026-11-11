import React, { useState, useEffect } from 'react';
import { Opportunity, StudentApplication, Workshop } from '../../types/asako';
import { Briefcase, Calendar, CheckCircle2, Clock, GraduationCap, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface StudentDashboardProps {
  userName: string;
  userOrg?: string;
  onExploreOpportunities: () => void;
  onExploreWorkshops: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  userName,
  userOrg = 'Add your institute to your profile',
  onExploreOpportunities,
  onExploreWorkshops,
}) => {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [enrolledWorkshops, setEnrolledWorkshops] = useState<Workshop[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'saved' | 'workshops'>('applications');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const firstName = userName.trim().split(/\s+/)[0] || 'there';
  const inReviewCount = applications.filter(
    (application) => application.status === 'Applied' || application.status === 'Submitted' || application.status === 'Under Review',
  ).length;
  const progressingCount = applications.filter(
    (application) => application.status === 'Shortlisted' || application.status === 'Interview Scheduled' || application.status === 'Selected',
  ).length;

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [appRes, savedRes, wsRes] = await Promise.all([
          api.students.getApplications(),
          api.students.getSavedOpportunities(),
          api.students.getWorkshops(),
        ]);
        setApplications(appRes.applications);
        setSavedOpportunities(savedRes.savedOpportunities);
        setEnrolledWorkshops(wsRes.workshops);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Student activity could not be loaded.');
      }
    };
    fetchStudentData();
  }, []);

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-[1.55fr_0.85fr] gap-4">
          <div className="border border-[#173B70] bg-white p-6 sm:p-8 md:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 border border-[#C9A34E] bg-[rgba(201,163,78,0.12)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0F2342]">
                <GraduationCap className="w-4 h-4" />
                <span>Student portal</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0F2342] font-heading tracking-[-0.03em]">
                  Welcome back, {firstName}.
                </h1>
                <p className="max-w-xl text-sm sm:text-base text-[#475569] leading-relaxed font-body">
                  Your next opportunity starts with a small step. Find roles that fit, save the ones you like, and keep every application in view.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#173B70] font-medium">
                <GraduationCap className="w-4 h-4" />
                <span>{userOrg}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onExploreOpportunities}
                className="btn-asako-primary text-xs uppercase tracking-[0.1em] py-3 px-5 cursor-pointer"
              >
                Explore opportunities
              </button>
              <button
                onClick={onExploreWorkshops}
                className="btn-asako-secondary text-xs uppercase tracking-[0.1em] py-3 px-5 cursor-pointer"
              >
                Find a workshop
              </button>
            </div>
          </div>

          <div className="border border-[#E2E8F0] bg-white p-6 sm:p-7 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7B8798]">
                <Sparkles className="w-4 h-4 text-[#C9A34E]" />
                <span>Your journey</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-[#0F2342] font-heading">
                Make your next move count.
              </h2>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-[#173B70]">
                <span className="w-7 h-7 rounded-full bg-[#F5F7FA] flex items-center justify-center text-xs font-bold">1</span>
                <span className="font-semibold">Discover opportunities</span>
              </li>
              <li className="flex items-center gap-3 text-[#475569]">
                <span className="w-7 h-7 rounded-full bg-[#F5F7FA] flex items-center justify-center text-xs font-bold">2</span>
                <span>Apply with confidence</span>
              </li>
              <li className="flex items-center gap-3 text-[#475569]">
                <span className="w-7 h-7 rounded-full bg-[#F5F7FA] flex items-center justify-center text-xs font-bold">3</span>
                <span>Track every update</span>
              </li>
            </ol>
          </div>
        </section>

        <section aria-label="Student activity overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Applications', value: applications.length, icon: Briefcase, accent: 'text-[#173B70]', bg: 'bg-[#F5F7FA]' },
            { label: 'In review', value: inReviewCount, icon: Clock, accent: 'text-[#9A6B12]', bg: 'bg-[#FBF3DF]' },
            { label: 'Moving forward', value: progressingCount, icon: CheckCircle2, accent: 'text-[#2F7658]', bg: 'bg-[#E8F4EE]' },
            { label: 'Workshops', value: enrolledWorkshops.length, icon: Calendar, accent: 'text-[#6655A1]', bg: 'bg-[#F0EDFA]' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} className="border border-[#E2E8F0] bg-white p-4 sm:p-5 flex items-center gap-3">
              <span className={`w-10 h-10 ${bg} ${accent} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <div className="text-xl font-bold text-[#0F2342] font-heading">{value}</div>
                <div className="text-xs text-[#64748B]">{label}</div>
              </div>
            </div>
          ))}
        </section>

      {errorMessage && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="border-b border-[#E2E8F0] flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-body font-semibold">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'applications'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          Saved Opportunities ({savedOpportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('workshops')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'workshops'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          Enrolled Workshops ({enrolledWorkshops.length})
        </button>
      </div>

      {/* Tab Content 1: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {applications.length === 0 && (
            <div className="border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
              No applications yet. Explore opportunities to find your next step.
            </div>
          )}
          <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white font-body">
            {applications.map((app) => (
              <div key={app.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#75777F]">
                      REF: {app.id.toUpperCase()}
                    </span>
                    <span>·</span>
                    <span className="text-xs text-[#75777F]">Applied {app.appliedDate}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2342] font-heading">
                    {app.opportunityTitle}
                  </h3>
                  <div className="text-xs font-semibold text-[#173B70]">
                    {app.company}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase ${
                      app.status === 'Shortlisted'
                        ? 'bg-[rgba(201,163,78,0.12)] border border-[#C9A34E] text-[#0F2342]'
                        : 'bg-[#F5F7FA] border border-[#E2E8F0] text-[#475569]'
                    }`}
                  >
                    Status: {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Saved Opportunities */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedOpportunities.length === 0 && (
            <div className="border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
              You haven’t saved any opportunities yet.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedOpportunities.map((opp) => (
              <div key={opp.id} className="p-6 bg-white border border-[#E2E8F0] space-y-4 font-body">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#C9A34E] uppercase tracking-[0.12em]">
                    {opp.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0F2342]">
                    {opp.compensation}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                  {opp.title}
                </h3>
                <div className="text-xs text-[#475569]">
                  {opp.company} · {opp.location}
                </div>
                <button
                  onClick={onExploreOpportunities}
                  className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-4 cursor-pointer"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Enrolled Workshops */}
      {activeTab === 'workshops' && (
        <div className="space-y-6">
          {enrolledWorkshops.length === 0 && (
            <div className="border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
              You’re not enrolled in a workshop yet.
            </div>
          )}
          <div className="border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0] font-body">
            {enrolledWorkshops.map((ws) => (
              <div key={ws.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#C9A34E] font-semibold uppercase tracking-[0.12em]">
                    <span>{ws.category}</span>
                    <span>·</span>
                    <span>{ws.format}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                    {ws.title}
                  </h3>
                  <div className="text-xs text-[#475569]">
                    Lead Instructor: {ws.instructor.name} ({ws.provider})
                  </div>
                  <div className="text-xs text-[#75777F] pt-1">
                    Schedule: {ws.schedule}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 text-xs bg-[rgba(201,163,78,0.1)] border border-[#C9A34E] text-[#0F2342] font-bold">
                    SEAT CONFIRMED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
