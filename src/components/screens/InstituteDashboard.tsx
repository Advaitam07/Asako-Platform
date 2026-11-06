import React, { useState, useEffect } from 'react';
import { InstitutePartnership } from '../../types/asako';
import { Building, CheckCircle2, ChevronRight, GraduationCap, Handshake, Plus, Users, X } from 'lucide-react';
import { api } from '../../services/api';

interface InstituteDashboardProps {
  userName: string;
  instituteName?: string;
}

export const InstituteDashboard: React.FC<InstituteDashboardProps> = ({
  userName,
  instituteName = 'Your institute',
}) => {
  const [partnerships, setPartnerships] = useState<InstitutePartnership[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [partnerCompany, setPartnerCompany] = useState('');
  const [initiative, setInitiative] = useState('');
  const [studentsCount, setStudentsCount] = useState('');
  const [term, setTerm] = useState('Fall 2026');

  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        const res = await api.institutes.getPartnerships();
        setPartnerships(res.partnerships);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Institute partnerships could not be loaded.');
      }
    };
    fetchPartnerships();
  }, []);

  const handleCreatePartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const res = await api.institutes.createPartnership({
        partnerCompany,
        initiative,
        studentsInvolved: Number(studentsCount),
        term,
      });
      if (res.partnership) {
        setPartnerships([res.partnership, ...partnerships]);
      }
      setIsModalOpen(false);
      setPartnerCompany('');
      setInitiative('');
      setStudentsCount('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Partnership request could not be created.');
    }
  };

  const totalStudentsInvolved = partnerships.reduce((acc, p) => acc + (p.studentsInvolved || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
      {/* Institute Header */}
      <div className="bg-white border border-[#173B70] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 font-body">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#173B70] text-white flex items-center justify-center font-heading font-bold text-2xl shrink-0">
            {instituteName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-0.5 bg-[rgba(201,163,78,0.12)] border border-[#C9A34E] text-[#0F2342]">
                INSTITUTE WORKSPACE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
              {instituteName}
            </h1>
            <div className="text-xs text-[#475569] flex flex-wrap items-center gap-2 pt-0.5">
              <span>Faculty Coordinator: {userName}</span>
              <span>·</span>
              <span>Active Corporate Alliances: {partnerships.length}</span>
              <span>·</span>
              <span>Students in Placement: {totalStudentsInvolved}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-5 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C9A34E]" />
          <span>Structure New Alliance</span>
        </button>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#E2E8F0] divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-white font-body">
        <div className="p-6 space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#75777F] tracking-[0.12em]">
            Active Corporate Linkages
          </div>
          <div className="text-2xl font-bold text-[#0F2342] font-heading">
            {partnerships.length} Enterprise Agreements
          </div>
          <div className="text-xs text-[#475569]">
            Formal memorandums for student capstones
          </div>
        </div>

        <div className="p-6 space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#75777F] tracking-[0.12em]">
            Placed Cohort Students
          </div>
          <div className="text-2xl font-bold text-[#0F2342] font-heading">
            {totalStudentsInvolved} Students
          </div>
          <div className="text-xs text-[#475569]">
            Enrolled in sponsored research & internships
          </div>
        </div>

        <div className="p-6 space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#75777F] tracking-[0.12em]">
            Institute Profile
          </div>
          <div className="text-2xl font-bold text-[#173B70] font-heading">
            Account workspace
          </div>
          <div className="text-xs text-[#475569]">
            Manage your institutional partnerships
          </div>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Corporate Alliances List */}
      <div className="space-y-4">
        <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0F2342] font-heading">
            Enterprise Linkages & Capstones
          </h2>
          <span className="text-xs text-[#75777F] font-mono">
            {partnerships.length} REGISTERED INITIATIVES
          </span>
        </div>

        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white font-body">
          {partnerships.length === 0 && (
            <p className="p-8 text-sm text-[#64748B]">No partnership requests have been created yet.</p>
          )}
          {partnerships.map((part) => (
            <div key={part.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#173B70] uppercase tracking-wider">
                    {part.partnerCompany}
                  </span>
                  <span>·</span>
                  <span className="text-xs text-[#75777F]">{part.term}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                  {part.initiative}
                </h3>
                <div className="text-xs text-[#475569]">
                  {part.studentsInvolved} Students participating with faculty oversight
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[rgba(201,163,78,0.1)] border border-[#C9A34E] text-[#0F2342]">
                  {part.status} Alliance
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Partnership Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2342]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-[#0F2342] shadow-asako-floating p-8 space-y-6 font-body">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C9A34E]"></span>
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
                  STRUCTURE CORPORATE PARTNERSHIP
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#75777F] hover:text-[#0F2342] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartnership} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342]">
                  Corporate Partner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Helios Data Systems AG"
                  value={partnerCompany}
                  onChange={(e) => setPartnerCompany(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342]">
                  Initiative / Program Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Capstone Project 2026"
                  value={initiative}
                  onChange={(e) => setInitiative(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Cohort Size *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Academic Term *
                  </label>
                  <input
                    type="text"
                    required
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer"
                >
                  Confirm Alliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
