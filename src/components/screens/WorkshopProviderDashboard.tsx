import React, { useState, useEffect } from 'react';
import { Workshop } from '../../types/asako';
import { Plus, Sparkles, Users, Calendar, DollarSign, X, Check } from 'lucide-react';
import { api } from '../../services/api';

interface WorkshopProviderDashboardProps {
  userName: string;
  providerName?: string;
}

export const WorkshopProviderDashboard: React.FC<WorkshopProviderDashboardProps> = ({
  userName,
  providerName = 'Your workshop provider',
}) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New workshop form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Design Systems' | 'Tech & Architecture' | 'AI Engineering'>('Design Systems');
  const [newPrice, setNewPrice] = useState('€195');
  const [newSchedule, setNewSchedule] = useState('Saturdays, 11:00 - 14:00 CET');
  const [newDuration, setNewDuration] = useState('3 Weeks');
  const [newOverview, setNewOverview] = useState('');

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await api.providers.getWorkshops();
        setWorkshops(res.workshops);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Provider workshops could not be loaded.');
      }
    };
    fetchWorkshops();
  }, []);

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const res = await api.providers.createWorkshop({
        title: newTitle,
        category: newCategory,
        price: newPrice,
        schedule: newSchedule,
        duration: newDuration,
        overview: newOverview,
        seatsTotal: 25,
      });
      if (res.workshop) {
        setWorkshops([res.workshop, ...workshops]);
      }
      setIsCreateOpen(false);
      setNewTitle('');
      setNewOverview('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Workshop could not be created.');
    }
  };

  const totalAttendees = workshops.reduce((acc, ws) => acc + (ws.seatsBooked || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
      {/* Provider Header */}
      <div className="bg-white border border-[#173B70] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 font-body">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#173B70] text-white flex items-center justify-center font-heading font-bold text-2xl shrink-0">
            {providerName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-0.5 bg-[rgba(201,163,78,0.12)] border border-[#C9A34E] text-[#0F2342]">
                WORKSHOP PROVIDER WORKSPACE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
              {providerName}
            </h1>
            <div className="text-xs text-[#475569] flex flex-wrap items-center gap-2 pt-0.5">
              <span>Primary Instructor: {userName}</span>
              <span>·</span>
              <span>Active Masterclasses: {workshops.length}</span>
              <span>·</span>
              <span>Enrolled Learners: {totalAttendees}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-5 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C9A34E]" />
          <span>Create New Workshop</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#E2E8F0] divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-white font-body">
        <div className="p-6 space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#75777F] tracking-[0.12em]">
            Published Masterclasses
          </div>
          <div className="text-2xl font-bold text-[#0F2342] font-heading">
            {workshops.length} Curriculums
          </div>
          <div className="text-xs text-[#475569]">
            Active enrollment sessions open
          </div>
        </div>

        <div className="p-6 space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#75777F] tracking-[0.12em]">
            Registered Attendees
          </div>
          <div className="text-2xl font-bold text-[#0F2342] font-heading">
            {totalAttendees} Learners
          </div>
          <div className="text-xs text-[#475569]">
            Across current active cohorts
          </div>
        </div>

        <div className="p-6 space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#75777F] tracking-[0.12em]">
            Provider Profile
          </div>
          <div className="text-2xl font-bold text-[#173B70] font-heading">
            Account workspace
          </div>
          <div className="text-xs text-[#475569]">
            Peer-reviewed syllabus standards
          </div>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Workshop List & Attendee Overview */}
      <div className="space-y-4">
        <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0F2342] font-heading">
            Active Workshop Offerings & Rosters
          </h2>
          <span className="text-xs text-[#75777F] font-mono">
            MANAGING {workshops.length} COHORTS
          </span>
        </div>

        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white font-body">
          {workshops.length === 0 && (
            <p className="p-8 text-sm text-[#64748B]">You have not published any workshops yet.</p>
          )}
          {workshops.map((ws) => (
            <div key={ws.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#C9A34E] uppercase tracking-[0.12em]">
                    {ws.category}
                  </span>
                  <span>·</span>
                  <span className="text-xs font-mono font-bold text-[#0F2342]">
                    {ws.price}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                  {ws.title}
                </h3>
                <div className="text-xs text-[#475569]">
                  Schedule: {ws.schedule} ({ws.duration})
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-bold text-[#0F2342]">
                    {ws.seatsBooked} of {ws.seatsTotal} Seats Reserved
                  </div>
                  <div className="text-xs text-[#75777F]">
                    {ws.seatsTotal - ws.seatsBooked} Open Slots
                  </div>
                </div>

                <span className="px-3 py-1.5 text-xs font-semibold bg-[#F5F7FA] border border-[#E2E8F0] text-[#173B70] text-center">
                  Registration Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Workshop Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2342]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#0F2342] shadow-asako-floating p-8 space-y-6 max-h-[90vh] overflow-y-auto font-body">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C9A34E]"></span>
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
                  LAUNCH NEW MASTERCLASS
                </h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#75777F] hover:text-[#0F2342] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342]">
                  Workshop Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Full-Stack System Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as 'Design Systems' | 'Tech & Architecture' | 'AI Engineering')}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none cursor-pointer"
                  >
                    <option value="Design Systems">Design Systems</option>
                    <option value="Tech & Architecture">Tech & Architecture</option>
                    <option value="AI Engineering">AI Engineering</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342]">
                    Tuition Fee *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. €220"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342]">
                  Overview & Learning Objectives *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the target audience, hands-on exercises, and tools used..."
                  value={newOverview}
                  onChange={(e) => setNewOverview(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer"
                >
                  Publish Masterclass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
