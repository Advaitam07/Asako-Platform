import React, { useState, useEffect } from 'react';
import { Workshop } from '../../types/asako';
import { Calendar, ChevronRight, Clock, Search, Sparkles, User, Users, X } from 'lucide-react';
import { api } from '../../services/api';
import { getWorkshopVisual } from '../../data/workshopVisuals';

interface WorkshopsScreenProps {
  onSelectWorkshop: (ws: Workshop) => void;
  enrolledWorkshopIds?: string[];
}

export const WorkshopsScreen: React.FC<WorkshopsScreenProps> = ({
  onSelectWorkshop,
  enrolledWorkshopIds = [],
}) => {
  const [workshopsList, setWorkshopsList] = useState<Workshop[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await api.workshops.list();
        setWorkshopsList(res.workshops);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Workshops could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const categories = [
    'Tech & Architecture',
    'Design Systems',
    'Business Innovation',
    'AI Engineering',
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredWorkshops = workshopsList.filter((ws) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ws.title.toLowerCase().includes(q);
      const matchProvider = ws.provider.toLowerCase().includes(q);
      const matchDesc = ws.overview.toLowerCase().includes(q);
      const matchInstructor = ws.instructor.name.toLowerCase().includes(q);
      if (!matchTitle && !matchProvider && !matchDesc && !matchInstructor) return false;
    }

    if (selectedCategory !== 'all' && ws.category !== selectedCategory) {
      return false;
    }

    if (selectedLevel !== 'all' && ws.level !== selectedLevel) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
      {/* Title */}
      <div className="border-b border-[#E2E8F0] pb-8 space-y-3">
        <div className="text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
          KNOWLEDGE DELIVERY & MASTERCLASSES
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F2342] font-heading tracking-[-0.03em]">
          Workshops & Programmes
        </h1>
        <p className="text-base text-[#475569] max-w-2xl font-body leading-relaxed">
          Interactive masterclasses, intensive technical bootcamps, and executive certifications hosted by verified industry practitioners and academic fellows.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4 font-body">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75777F]" />
          <input
            type="text"
            placeholder="Search workshops by topic, technology, instructor, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] pl-11 pr-4 py-3.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777F] hover:text-[#0F2342] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 text-xs">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-[#0F2342] uppercase tracking-[0.12em] mr-2">
              Discipline:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 transition-colors border cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#173B70] text-white border-[#173B70]'
                  : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:border-[#173B70]'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 transition-colors border cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-[#173B70] text-white border-[#173B70]'
                    : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:border-[#173B70]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#0F2342] uppercase tracking-[0.12em] mr-1">
              Level:
            </span>
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-2.5 py-1 text-xs border cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bg-[#0F2342] text-white border-[#0F2342]'
                  : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0]'
              }`}
            >
              All
            </button>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 text-xs border cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#0F2342] text-white border-[#0F2342]'
                    : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      {errorMessage && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading && (
          <p className="col-span-full py-8 text-center text-sm text-[#64748B]">Loading workshops…</p>
        )}
        {!isLoading && filteredWorkshops.length === 0 && !errorMessage && (
          <p className="col-span-full rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
            No workshops match your search and filters.
          </p>
        )}
        {filteredWorkshops.map((ws) => (
          <article
            key={ws.id}
            onClick={() => onSelectWorkshop(ws)}
            className="asako-interactive-card bg-white border border-[#E2E8F0] hover:border-[#173B70] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="relative aspect-[16/8] overflow-hidden bg-[#F5F7FA]">
              <img
                src={getWorkshopVisual(ws.category).image}
                alt={getWorkshopVisual(ws.category).alt}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-3 left-3 bg-[#0F2342]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                {ws.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-between space-y-6 p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A34E] uppercase tracking-[0.12em] font-body">
                  {ws.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342]">
                  {ws.level}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#0F2342] font-heading group-hover:text-[#173B70] transition-colors leading-snug">
                {ws.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569] font-body">
                <span className="font-semibold text-[#173B70]">{ws.provider}</span>
                <span>·</span>
                <span>{ws.format}</span>
                <span>·</span>
                <span>{ws.duration}</span>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed font-body">
                {ws.overview}
              </p>

              {/* Schedule and Instructor Box */}
              <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-4 space-y-2 text-xs font-body">
                <div className="flex items-center justify-between">
                  <span className="text-[#75777F] uppercase tracking-wider text-[10px] font-semibold">
                    Schedule:
                  </span>
                  <span className="font-medium text-[#0F2342]">{ws.schedule}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#75777F] uppercase tracking-wider text-[10px] font-semibold">
                    Instructor:
                  </span>
                  <span className="font-semibold text-[#173B70]">
                    {ws.instructor.name} ({ws.instructor.affiliation})
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                  <span className="text-[#75777F] uppercase tracking-wider text-[10px] font-semibold">
                    Seats Available:
                  </span>
                  <span className="font-bold text-[#0F2342]">
                    {ws.seatsTotal - ws.seatsBooked} of {ws.seatsTotal}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between font-body">
              <div>
                <span className="text-[10px] text-[#75777F] uppercase tracking-wider block">
                  Registration Fee
                </span>
                <span className="text-xl font-bold text-[#0F2342]">
                  {ws.price}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWorkshop(ws);
                }}
                className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-5 cursor-pointer"
              >
                Inspect Curriculum
              </button>
            </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
