import React, { useState, useEffect } from 'react';
import { Opportunity } from '../../types/asako';
import { Briefcase, Building, Check, ChevronRight, Plus, Search, User, Users, X, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface CompanyDashboardProps {
  userName: string;
  companyName?: string;
}

interface Candidate {
  id: string;
  name: string;
  university: string;
  roleApplied: string;
  appliedDate: string;
  portfolioLinks: string[];
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected';
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  userName,
  companyName = 'Your company',
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'candidates'>('listings');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Managed opportunities state
  const [myOpportunities, setMyOpportunities] = useState<Opportunity[]>([]);

  // Candidates state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form for posting new opportunity
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Internship' | 'Full-time' | 'Freelance'>('Internship');
  const [newCompensation, setNewCompensation] = useState('');
  const [newCategory, setNewCategory] = useState<'Software Engineering' | 'Design & Creative'>('Software Engineering');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBackendData = async () => {
    try {
      const [oppRes, appRes] = await Promise.all([
        api.companies.getOpportunities(),
        api.companies.getApplications(),
      ]);

      setMyOpportunities(oppRes.opportunities);
      setCandidates(appRes.applications.map((a) => ({
          id: a.id,
          name: a.studentName || 'Candidate',
          university: a.studentInstitution || 'Institution not provided',
          roleApplied: a.opportunityTitle,
          appliedDate: a.appliedDate,
          portfolioLinks: a.portfolioLinks || [],
          status: a.status as Candidate['status'],
        })));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Company data could not be loaded.');
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.companies.createOpportunity({
        title: newTitle,
        type: newType,
        category: newCategory,
        compensation: newCompensation || 'Competitive Compensation',
        description: newDesc,
        isRemote: true,
      });

      if (res.opportunity) {
        setMyOpportunities([res.opportunity, ...myOpportunities]);
      }
      setIsPostModalOpen(false);
      setNewTitle('');
      setNewCompensation('');
      setNewDesc('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Opportunity could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (candidateId: string, newStatus: Candidate['status']) => {
    setErrorMessage(null);
    try {
      await api.companies.updateApplicationStatus(candidateId, newStatus);
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Application status could not be updated.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
      {/* Company Header */}
      <div className="bg-white border border-[#173B70] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 font-body">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#173B70] text-white flex items-center justify-center font-heading font-bold text-2xl shrink-0">
            {companyName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-0.5 bg-[rgba(201,163,78,0.12)] border border-[#C9A34E] text-[#0F2342]">
                EMPLOYER WORKSPACE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
              {companyName}
            </h1>
            <div className="text-xs text-[#475569] flex flex-wrap items-center gap-2 pt-0.5">
              <span>Recruiting Lead: {userName}</span>
              <span>·</span>
              <span>Active Postings: {myOpportunities.length}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-5 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C9A34E]" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {errorMessage && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] flex items-center gap-8 text-xs font-body font-semibold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'listings'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          Published Opportunities ({myOpportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'candidates'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          Candidate Pipeline ({candidates.length})
        </button>
      </div>

      {/* Tab 1: Published Opportunities */}
      {activeTab === 'listings' && (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white font-body">
          {myOpportunities.length === 0 && (
            <p className="p-8 text-sm text-[#64748B]">You have not published any opportunities yet.</p>
          )}
          {myOpportunities.map((opp) => (
            <div key={opp.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#C9A34E] uppercase tracking-[0.12em]">
                    {opp.category}
                  </span>
                  <span>·</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342]">
                    {opp.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                  {opp.title}
                </h3>
                <div className="text-xs text-[#475569]">
                  {opp.location} · {opp.compensation} · Posted {opp.postedDate}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#173B70]">
                  Active & Accepting Candidates
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Candidate Review Pipeline */}
      {activeTab === 'candidates' && (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white font-body">
          {candidates.length === 0 && (
            <p className="p-8 text-sm text-[#64748B]">No applications have been received yet.</p>
          )}
          {candidates.map((cand) => (
            <div key={cand.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#173B70] uppercase tracking-wider">
                    {cand.roleApplied}
                  </span>
                  <span>·</span>
                  <span className="text-[10px] font-mono text-[#75777F]">Applied {cand.appliedDate}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                  {cand.name}
                </h3>
                <div className="text-xs text-[#475569]">
                  {cand.university}
                  {cand.portfolioLinks.length > 0 && (
                    <> · Portfolio: {cand.portfolioLinks.map((link, index) => (
                      <React.Fragment key={link}>
                        {index > 0 && ', '}
                        <a href={link} target="_blank" rel="noreferrer" className="text-[#173B70] underline font-semibold">
                          {link}
                        </a>
                      </React.Fragment>
                    ))}</>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#75777F] uppercase tracking-wider font-semibold">
                  Stage:
                </span>
                <select
                  value={cand.status}
                  onChange={(e) => handleUpdateStatus(cand.id, e.target.value as Candidate['status'])}
                  className="bg-white border border-[#173B70] px-3 py-1.5 text-xs font-semibold text-[#0F2342] focus:outline-none rounded-none cursor-pointer"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Applied">Applied</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Selected">Selected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post New Opportunity Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2342]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#0F2342] shadow-asako-floating p-8 space-y-6 max-h-[90vh] overflow-y-auto font-body">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C9A34E]"></span>
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
                  PUBLISH NEW OPPORTUNITY
                </h2>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-[#75777F] hover:text-[#0F2342] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342]">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Machine Learning Engineering Intern"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Engagement Type *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'Internship' | 'Full-time' | 'Freelance')}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none cursor-pointer"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Compensation / Monthly Stipend *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. €2,600 / month"
                    value={newCompensation}
                    onChange={(e) => setNewCompensation(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342]">
                  Description & Requirements *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail key responsibilities, mentor guidance, and ideal coursework..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer"
                >
                  Publish to ASAKO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
