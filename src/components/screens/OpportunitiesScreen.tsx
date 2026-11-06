import React, { useState, useEffect } from 'react';
import { Opportunity, OpportunityType } from '../../types/asako';
import { Briefcase, ChevronRight, Filter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../../services/api';

interface OpportunitiesScreenProps {
  onSelectOpportunity: (opp: Opportunity) => void;
  savedOpportunityIds?: string[];
  onToggleSaveOpportunity?: (oppId: string) => void;
}

export const OpportunitiesScreen: React.FC<OpportunitiesScreenProps> = ({
  onSelectOpportunity,
  savedOpportunityIds = [],
  onToggleSaveOpportunity,
}) => {
  const [opportunitiesList, setOpportunitiesList] = useState<Opportunity[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await api.opportunities.list();
        setOpportunitiesList(res.opportunities);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Opportunities could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const categories = [
    'Software Engineering',
    'Design & Creative',
    'AI & Data Science',
    'Business & Marketing',
  ];

  const types: OpportunityType[] = ['Internship', 'Full-time', 'Freelance', 'Part-time'];

  const filteredOpportunities = opportunitiesList.filter((opp) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchCompany = opp.company.toLowerCase().includes(q);
      const matchDesc = opp.description.toLowerCase().includes(q);
      const matchSkill = opp.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchDesc && !matchSkill) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && opp.category !== selectedCategory) {
      return false;
    }

    // Type filter
    if (selectedType !== 'all' && opp.type !== selectedType) {
      return false;
    }

    // Remote filter
    if (remoteOnly && !opp.isRemote) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setRemoteOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
      {/* Title */}
      <div className="border-b border-[#E2E8F0] pb-8 space-y-3">
        <div className="text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
          DISCOVER ROLES & PROJECTS
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F2342] font-heading tracking-[-0.03em]">
          Opportunities
        </h1>
        <p className="text-base text-[#475569] max-w-2xl font-body leading-relaxed">
          Explore verified internships, full-time positions, and freelance assignments posted directly by employers and university venture partners.
        </p>
      </div>

      {/* Search & Filter Controls */}
      {errorMessage && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
      <div className="space-y-4 font-body">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75777F]" />
          <input
            type="text"
            placeholder="Search by role title, company, technology stack, or keywords..."
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

        {/* Filter Pills / Buttons Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 text-xs">
          {/* Category Filters */}
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
              All Disciplines
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 transition-colors border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#173B70] text-white border-[#173B70]'
                    : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:border-[#173B70]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Type Filters & Remote Checkbox */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[#0F2342] uppercase tracking-[0.12em] mr-1">
                Type:
              </span>
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 text-xs border cursor-pointer ${
                  selectedType === 'all'
                    ? 'bg-[#0F2342] text-white border-[#0F2342]'
                    : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0]'
                }`}
              >
                All
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 text-xs border cursor-pointer ${
                    selectedType === t
                      ? 'bg-[#0F2342] text-white border-[#0F2342]'
                      : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#0F2342] font-semibold border-l border-[#E2E8F0] pl-3">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 rounded-none accent-[#173B70]"
              />
              <span>Remote Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Count & Clear Filter */}
      <div className="flex items-center justify-between text-xs font-body text-[#475569]">
        <span>Showing {filteredOpportunities.length} opportunities</span>
        {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all' || remoteOnly) && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#ba1a1a] hover:underline font-semibold cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Opportunities List (Collapsed-Cell Style) */}
      {isLoading ? (
        <p className="py-8 text-center text-sm text-[#64748B]">Loading opportunities…</p>
      ) : filteredOpportunities.length > 0 ? (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className="asako-interactive-card p-6 md:p-8 hover:bg-[#F5F7FA] transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#C9A34E] uppercase tracking-[0.12em] font-body">
                      {opp.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white border border-[#E2E8F0] text-[#0F2342]">
                      {opp.type}
                    </span>
                    {opp.isRemote && (
                      <span className="text-[10px] font-mono text-[#173B70] font-semibold">
                        REMOTE FRIENDLY
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#0F2342] font-heading group-hover:text-[#173B70] transition-colors">
                    {opp.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#0F2342] font-body">
                    {opp.compensation}
                  </div>
                  <div className="text-[11px] text-[#75777F] font-body">
                    {opp.duration}
                  </div>
                </div>
              </div>

              {/* Company & Location Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569] font-body">
                <span className="font-semibold text-[#173B70]">{opp.company}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {opp.location}
                </span>
                <span>·</span>
                <span>Posted {opp.postedDate}</span>
                <span>·</span>
                <span>Deadline: {opp.applicationDeadline}</span>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed font-body line-clamp-2">
                {opp.description}
              </p>

              {/* Skills and Action Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {opp.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] bg-[#F5F7FA] border border-[#E2E8F0] text-[#475569] font-body"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOpportunity(opp);
                  }}
                  className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-4 cursor-pointer"
                >
                  View & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !errorMessage ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] space-y-3 font-body">
          <Briefcase className="w-8 h-8 text-[#75777F] mx-auto" />
          <h3 className="text-lg font-bold text-[#0F2342] font-heading">
            No opportunities match your filter criteria
          </h3>
          <p className="text-xs text-[#475569] max-w-sm mx-auto">
            Try adjusting your search keywords, clearing category filters, or browsing all disciplines.
          </p>
          <button
            onClick={clearFilters}
            className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2 px-4 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : null}
    </div>
  );
};
