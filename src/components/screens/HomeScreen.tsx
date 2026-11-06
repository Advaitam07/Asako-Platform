import React, { useEffect, useState } from 'react';
import { EcosystemRole, Opportunity, PublicTab, UserRole, Workshop } from '../../types/asako';
import { MarketplaceItem } from '../../types/asako';
import { api } from '../../services/api';
import { getWorkshopVisual } from '../../data/workshopVisuals';
import { GuestLandingScreen } from './GuestLandingScreen';
import {
  ArrowRight,
  Briefcase,
  Building,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  MapPin,
  Sparkles,
  User,
  Users,
  Compass,
  Laptop,
  BookOpen,
} from 'lucide-react';

interface HomeScreenProps {
  isLoggedIn: boolean;
  onSelectTab: (tab: PublicTab) => void;
  onOpenAuth: (role?: UserRole) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onSelectWorkshop: (ws: Workshop) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isLoggedIn,
  onSelectTab,
  onOpenAuth,
  onSelectOpportunity,
  onSelectWorkshop,
}) => {
  const [activeEcosystemTab, setActiveEcosystemTab] = useState<EcosystemRole>('student');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [isLoadingLiveContent, setIsLoadingLiveContent] = useState(true);
  const [liveContentError, setLiveContentError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoadingLiveContent(false);
      return;
    }

    setIsLoadingLiveContent(true);
    let isMounted = true;
    const fetchLiveContent = async () => {
      const results = await Promise.allSettled([
        api.opportunities.list(),
        api.workshops.list(),
        api.marketplace.list(),
      ]);
      if (!isMounted) return;

      if (results[0].status === 'fulfilled') setOpportunities(results[0].value.opportunities);
      if (results[1].status === 'fulfilled') setWorkshops(results[1].value.workshops);
      if (results[2].status === 'fulfilled') setMarketplaceItems(results[2].value.listings);

      if (results.some((result) => result.status === 'rejected')) {
        setLiveContentError('Some live listings could not be loaded. Visit a portal to retry.');
      }
      setIsLoadingLiveContent(false);
    };
    fetchLiveContent();
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <GuestLandingScreen onOpenAuth={onOpenAuth} />;
  }

  const ecosystemSegments: Record<
    EcosystemRole,
    {
      title: string;
      tag: string;
      headline: string;
      description: string;
      bullets: string[];
      actionText: string;
      image: string;
      imageAlt: string;
    }
  > = {
    student: {
      title: 'Students',
      tag: 'EARLY TALENT & BUILDERS',
      headline: 'Bridge academic theory with paid, verified experience.',
      description:
        'Access curated internships, junior engineering roles, and competitive freelance projects. Work with industry mentors who invest in your trajectory.',
      bullets: [
        'Vetted roles with guaranteed compensation and clear scopes',
        'Direct connection to hiring managers at forward-thinking companies',
        'Demonstrate practical competencies through project deliverables',
      ],
      actionText: 'Explore Student Pathways',
      image:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
      imageAlt: 'Young university students collaborating on laptops in a modern campus library',
    },
    company: {
      title: 'Companies',
      tag: 'EMPLOYERS & ENTERPRISES',
      headline: 'Source and nurture verified problem solvers.',
      description:
        'Skip the sea of generic resumes. Meet ambitious engineers, designers, and researchers vetted by institutional capstones and specialized masterclasses.',
      bullets: [
        'Engage top students before graduation through capstone challenges',
        'Streamlined candidate review with portfolio artifacts',
        'Direct university partnership linkages across Europe and beyond',
      ],
      actionText: 'Discover Enterprise Hiring',
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80',
      imageAlt: 'Diverse design and engineering team collaborating in an open-plan office',
    },
    institute: {
      title: 'Educational Institutes',
      tag: 'ACADEMIA & UNIVERSITIES',
      headline: 'Empower student cohorts with corporate enterprise linkages.',
      description:
        'Strengthen career placement outcomes, structure formal corporate capstone agreements, and connect faculty research with industry funding.',
      bullets: [
        'Formalized partnership governance and compliant agreement templates',
        'Real-time student cohort application and placement visibility',
        'Organize campus hackathons, recruitment sprints, and masterclasses',
      ],
      actionText: 'Partner Your Institution',
      image:
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
      imageAlt: 'Professor and university students discussing applied research projects',
    },
    provider: {
      title: 'Workshop Providers',
      tag: 'TRAINERS & PRACTITIONERS',
      headline: 'Deliver high-impact training to motivated professionals.',
      description:
        'Monetize your specialized domain expertise by hosting cohort-based bootcamps, technical workshops, and executive certifications.',
      bullets: [
        'Reach active university cohorts and enterprise engineering teams',
        'Transparent enrollment tracking and attendee management',
        'Integrate structured syllabuses with verifiable certification',
      ],
      actionText: 'Host a Masterclass',
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
      imageAlt: 'Interactive technical workshop session with hands-on mentoring',
    },
    consumer: {
      title: 'Consumers',
      tag: 'CREATORS & PRACTITIONERS',
      headline: 'Acquire production toolkits and 1-on-1 expert advisory.',
      description:
        'Browse our curated marketplace for enterprise design systems, curriculum frameworks, and one-on-one portfolio review sessions.',
      bullets: [
        'Instant digital access to battle-tested design tokens and code libraries',
        'Book 1-on-1 strategy calls with verified tech practitioners',
        'Structured roadmaps to accelerate personal career growth',
      ],
      actionText: 'Browse the Marketplace',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
      imageAlt: 'Clean desktop workspace with laptop showing design tokens and code',
    },
  };

  const currentSegment = ecosystemSegments[activeEcosystemTab];

  return (
    <div className="space-y-24 bg-white text-[#202A38]">
      {/* 1. HERO SECTION: Asymmetrical Two-Column Composition */}
      <section className="relative pt-8 md:pt-12 lg:pt-16 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Expressive Headline & Narrative */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-semibold uppercase tracking-[0.14em] text-[#173B70]">
                <span className="w-1.5 h-1.5 bg-[#C9A34E]" aria-hidden="true"></span>
                <span>One platform. A better next step.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold text-[#0F2342] font-heading leading-[1.08] tracking-[-0.03em] text-balance">
                Turn your next idea into <span className="text-[#173B70]">real momentum.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#475569] leading-relaxed max-w-xl font-body">
                Find opportunities, build practical skills and meet the people who can help you move forward - all in one connected community
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onSelectTab('opportunities')}
                  className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-3.5 px-7"
                >
                  Find your next opportunity
                </button>
                <button
                  onClick={() => onSelectTab('platform')}
                  className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-3.5 px-7"
                >
                  See how it works
                </button>
              </div>

              <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-3 gap-6 text-xs font-body">
                <div>
                  <div className="text-2xl font-extrabold text-[#0F2342] font-heading">
                    {isLoggedIn ? (isLoadingLiveContent ? '—' : opportunities.length) : 'Sign in'}
                  </div>
                  <div className="text-[#475569] mt-0.5">Opportunities to explore</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#0F2342] font-heading">
                    {isLoggedIn ? (isLoadingLiveContent ? '—' : workshops.length) : 'Sign in'}
                  </div>
                  <div className="text-[#475569] mt-0.5">Hands-on workshops</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#0F2342] font-heading">
                    5
                  </div>
                  <div className="text-[#475569] mt-0.5">Connected portals</div>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Photography Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative z-10 overflow-hidden bg-[#F5F7FA] border border-[#E2E8F0] shadow-asako-floating">
                {/* Main Hero Photo: Young diverse professionals collaborating */}
                <div className="aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                    alt="Diverse young technology and design professionals collaborating in a bright modern workspace"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* Micro floating insight card on bottom of image */}
                <div className="p-5 bg-white border-t border-[#E2E8F0] flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
                      ACTIVE PLATFORM CORRIDOR
                    </div>
                    <div className="text-xs font-bold text-[#0F2342]">
                      Capstone & Internship Network
                    </div>
                    <div className="text-[11px] text-[#475569]">
                      Engineering, Design & Enterprise Research
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectTab('opportunities')}
                    className="p-2.5 bg-[#173B70] text-white hover:bg-[#0F2342] transition-colors shrink-0 cursor-pointer"
                    aria-label="Explore opportunities"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Decorative gold backdrop hairline frame */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#C9A34E]/40 -z-0 pointer-events-none hidden sm:block"></div>
            </div>
          </div>
        </div>
      </section>

      {liveContentError && (
        <div role="status" className="mx-auto max-w-7xl px-6 text-sm text-[#64748B]">
          {liveContentError}
        </div>
      )}

      {/* SECTION 1: "One Ecosystem. Multiple Possibilities." */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
            <span className="w-1.5 h-1.5 bg-[#C9A34E]" aria-hidden="true"></span>
            <span>A UNIFIED MULTI-SIDED PLATFORM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2342] font-heading tracking-[-0.02em]">
            One Ecosystem. Multiple Possibilities.
          </h2>
          <p className="text-base text-[#475569] leading-relaxed font-body">
            ASAKO coordinates value exchange between five distinct stakeholders, creating mutual momentum across every engagement.
          </p>
        </div>

        {/* Interactive Segment Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#E2E8F0] pb-4">
          {(Object.keys(ecosystemSegments) as EcosystemRole[]).map((role) => {
            const isSelected = activeEcosystemTab === role;
            return (
              <button
                key={role}
                onClick={() => setActiveEcosystemTab(role)}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all cursor-pointer font-heading ${
                  isSelected
                    ? 'bg-[#173B70] text-white shadow-sm'
                    : 'bg-[#F5F7FA] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F2342]'
                }`}
              >
                {ecosystemSegments[role].title}
              </button>
            );
          })}
        </div>

        {/* Active Segment Feature Stage (Asymmetrical layout with photo + narrative) */}
        <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono font-bold text-[#C9A34E] uppercase tracking-wider">
              {currentSegment.tag}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F2342] font-heading leading-snug">
              {currentSegment.headline}
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed font-body">
              {currentSegment.description}
            </p>

            <ul className="space-y-3 pt-2 font-body text-xs text-[#202A38]">
              {currentSegment.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A34E] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <button
                onClick={() => onOpenAuth(activeEcosystemTab)}
                className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-3 px-6"
              >
                {currentSegment.actionText} →
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 overflow-hidden bg-white border border-[#E2E8F0] shadow-sm">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={currentSegment.image}
                alt={currentSegment.imageAlt}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: "Your Potential Deserves a Platform." (Student Ecosystem) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Editorial Image with Gold Frame Accent */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative z-10 bg-white border border-[#E2E8F0] overflow-hidden shadow-asako-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                  alt="Student engineers discussing algorithm design in a workshop"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6 bg-white space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#C9A34E] tracking-wider">
                  STUDENT ADVANCEMENT
                </div>
                <div className="text-base font-bold text-[#0F2342] font-heading">
                  Real Projects. Tangible Evidence.
                </div>
                <p className="text-xs text-[#475569] leading-relaxed font-body">
                  Showcase work through verified project deliverables instead of superficial bullet points.
                </p>
              </div>
            </div>
            <div className="absolute -top-3 -left-3 w-full h-full border border-[#173B70]/30 -z-0 hidden sm:block"></div>
          </div>

          {/* Right: Narrative & Key Openings */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
              <span className="w-1.5 h-1.5 bg-[#C9A34E]" aria-hidden="true"></span>
              <span>FOR STUDENTS & EARLY TALENT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2342] font-heading tracking-[-0.02em] leading-tight">
              Your Potential Deserves a Platform.
            </h2>

            <p className="text-base text-[#475569] leading-relaxed font-body">
              Gain verified experience with technology studios, design practices, and corporate teams looking for driven early talent. Every internship and role on ASAKO guarantees fair compensation, structured mentorship, and legitimate career pathways.
            </p>

            {/* Quick Preview Cards */}
            <div className="space-y-3 pt-2">
              {isLoggedIn && opportunities.slice(0, 2).map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp)}
                  className="p-4 bg-[#F5F7FA] border border-[#E2E8F0] hover:border-[#173B70] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-semibold text-[#C9A34E] uppercase tracking-wider">
                      {opp.category} · {opp.type}
                    </div>
                    <div className="text-sm font-bold text-[#0F2342] group-hover:text-[#173B70] transition-colors font-heading">
                      {opp.title}
                    </div>
                    <div className="text-xs text-[#475569]">
                      {opp.company} · {opp.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-xs font-bold text-[#0F2342]">{opp.compensation}</span>
                    <span className="text-xs font-bold text-[#173B70] flex items-center gap-1">
                      Apply <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
              {!isLoggedIn && (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-5 text-sm text-[#64748B]">
                  Sign in to browse verified opportunities and apply.
                </p>
              )}
              {isLoggedIn && !isLoadingLiveContent && opportunities.length === 0 && !liveContentError && (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-5 text-sm text-[#64748B]">
                  No opportunities are open right now. Check back soon.
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectTab('opportunities')}
                className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-3 px-6"
              >
                Browse All Student Opportunities →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: "Discover Talent. Build What's Next." (Company & Recruitment) */}
      <section className="bg-[#F5F7FA] py-20 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
                <span className="w-1.5 h-1.5 bg-[#C9A34E]" aria-hidden="true"></span>
                <span>FOR COMPANIES & EMPLOYERS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2342] font-heading tracking-[-0.02em] leading-tight">
                Discover Talent. Build What&apos;s Next.
              </h2>

              <p className="text-base text-[#475569] leading-relaxed font-body">
                Access a direct pipeline of disciplined software engineers, product designers, and researchers from leading European and international institutions. Evaluate candidates through real capstone project outputs and hands-on masterclass portfolios.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-body text-xs">
                <div className="p-4 bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="font-bold text-[#0F2342] text-sm">Vetted Project Portfolios</div>
                  <p className="text-[#475569] leading-relaxed">
                    Review candidate code repositories, interface prototypes, and research papers before scheduling initial calls.
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="font-bold text-[#0F2342] text-sm">Sponsored Capstone Briefs</div>
                  <p className="text-[#475569] leading-relaxed">
                    Propose company problems directly to academic courses and mentor the top performers into full-time roles.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onOpenAuth('company')}
                  className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-3 px-6"
                >
                  Post Vacancy or Internship
                </button>
                <button
                  onClick={() => onSelectTab('contact')}
                  className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-3 px-6"
                >
                  Speak With Our Talent Desk
                </button>
              </div>
            </div>

            {/* Right: Modern Office Photography */}
            <div className="lg:col-span-5 relative">
              <div className="overflow-hidden bg-white border border-[#E2E8F0] shadow-asako-floating">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80"
                    alt="Engineers and team leaders discussing strategy in a modern glass office"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-5 bg-white border-t border-[#E2E8F0] space-y-1 font-body">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
                    ENTERPRISE ENGAGEMENT
                  </div>
                  <div className="text-xs font-bold text-[#0F2342]">
                    Structured Recruitment & University Alliances
                  </div>
                  <div className="text-[11px] text-[#475569]">
                    Continuous matching between academic terms and hiring cycles.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: "Connecting Education With Industry." (Institutional Partnerships) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Academic Collaboration Photography */}
          <div className="lg:col-span-5 relative">
            <div className="overflow-hidden bg-white border border-[#E2E8F0] shadow-asako-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80"
                  alt="University department faculty and industry partners reviewing student thesis projects"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6 bg-white space-y-1 font-body">
                <div className="text-[10px] uppercase font-bold text-[#C9A34E] tracking-wider">
                  INSTITUTIONAL PARTNERSHIPS
                </div>
                <div className="text-sm font-bold text-[#0F2342] font-heading">
                  Formalized Corporate Linkages
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Safeguarding student academic accreditation and intellectual property through clear bilateral agreements.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-full h-full border border-[#C9A34E]/30 -z-0 hidden sm:block"></div>
          </div>

          {/* Right: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
              <span className="w-1.5 h-1.5 bg-[#C9A34E]" aria-hidden="true"></span>
              <span>ACADEMIC INSTITUTIONS & FACULTIES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2342] font-heading tracking-[-0.02em] leading-tight">
              Connecting Education With Industry.
            </h2>

            <p className="text-base text-[#475569] leading-relaxed font-body">
              Universities and vocational institutes partner with ASAKO to give students immediate market exposure. Coordinate semester internships, track placement outcomes, and co-sponsor hackathons that bridge classroom curricula with commercial engineering practice.
            </p>

            <div className="space-y-3 pt-2 font-body text-xs">
              <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#173B70] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F2342]">Centralized Cohort Management: </span>
                  <span className="text-[#475569]">Monitor student placement status, company supervisor evaluations, and milestone approvals.</span>
                </div>
              </div>

              <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#173B70] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F2342]">Standardized Legal Frameworks: </span>
                  <span className="text-[#475569]">Pre-reviewed tripartite agreements protecting student safety, academic credits, and IP rights.</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectTab('contact')}
                className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-3 px-6"
              >
                Structure Institutional Agreement →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: "Learn Today. Lead Tomorrow." (Workshops & Masterclasses) */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E2E8F0] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
                <span className="w-1.5 h-1.5 bg-[#C9A34E]" aria-hidden="true"></span>
                <span>PRACTICAL SKILL ACQUISITION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2342] font-heading tracking-[-0.02em]">
                Learn Today. Lead Tomorrow.
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('workshops')}
              className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2.5 px-5 self-start md:self-auto"
            >
              Explore All Workshops ({isLoadingLiveContent ? '…' : workshops.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoggedIn && workshops.slice(0, 2).map((ws) => (
              <div
                key={ws.id}
                onClick={() => onSelectWorkshop(ws)}
                className="asako-interactive-card bg-[#F5F7FA] border border-[#E2E8F0] hover:border-[#173B70] transition-all flex flex-col justify-between group cursor-pointer shadow-asako-card overflow-hidden"
              >
                <div className="relative aspect-[16/7] overflow-hidden bg-white">
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
                    <span className="text-xs font-bold text-[#C9A34E] uppercase tracking-[0.12em] font-heading">
                      {ws.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-white border border-[#E2E8F0] text-[#0F2342]">
                      {ws.format}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#0F2342] font-heading group-hover:text-[#173B70] transition-colors leading-snug">
                    {ws.title}
                  </h3>

                  <p className="text-xs text-[#475569] leading-relaxed font-body">
                    {ws.overview}
                  </p>

                  <div className="p-3 bg-white border border-[#E2E8F0] text-xs font-body text-[#475569]">
                    Lead Instructor:{' '}
                    <span className="font-bold text-[#0F2342]">{ws.instructor.name}</span> ·{' '}
                    <span>{ws.instructor.affiliation}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between font-body">
                  <div>
                    <span className="text-[10px] text-[#75777F] uppercase tracking-wider block">Tuition</span>
                    <span className="text-xl font-bold text-[#0F2342]">{ws.price}</span>
                  </div>

                  <button className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-4 cursor-pointer">
                    Inspect Syllabus
                  </button>
                </div>
                </div>
              </div>
            ))}
            {!isLoggedIn && (
              <p className="col-span-full rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
                Sign in to browse workshops and programme details.
              </p>
            )}
            {isLoggedIn && !isLoadingLiveContent && workshops.length === 0 && !liveContentError && (
              <p className="col-span-full rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
                No workshops are published yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 6: "Discover More. Connect Better." (Marketplace) */}
      <section className="bg-[#F5F7FA] py-20 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E2E8F0] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
                <span className="w-1.5 h-1.5 bg-[#C9A34E]" aria-hidden="true"></span>
                <span>CURATED PRO TOOLKITS & RESOURCES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2342] font-heading tracking-[-0.02em]">
                Discover More. Connect Better.
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('marketplace')}
              className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2.5 px-5 self-start md:self-auto"
            >
              Visit Marketplace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoggedIn && marketplaceItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectTab('marketplace')}
                className="asako-interactive-card bg-white border border-[#E2E8F0] hover:border-[#173B70] transition-all p-6 flex flex-col justify-between space-y-4 cursor-pointer group shadow-asako-card"
              >
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#C9A34E] tracking-[0.12em]">
                    {item.category}
                  </div>
                  <h4 className="text-base font-bold text-[#0F2342] font-heading leading-snug group-hover:text-[#173B70] transition-colors">
                    {item.title}
                  </h4>
                  <div className="text-xs text-[#75777F] font-body">
                    By {item.creator}
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed font-body line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between font-body">
                  <span className="text-base font-bold text-[#0F2342]">{item.price}</span>
                  <span className="text-xs text-[#173B70] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
            {!isLoggedIn && (
              <p className="col-span-full rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
                Sign in to browse marketplace offerings.
              </p>
            )}
            {isLoggedIn && !isLoadingLiveContent && marketplaceItems.length === 0 && !liveContentError && (
              <p className="col-span-full rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
                No marketplace offerings are available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7: "Your Next Chapter Starts With ASAKO." (Final Call-to-Action) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="bg-[#173B70] text-white p-10 md:p-16 border border-[#173B70] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-asako-floating relative overflow-hidden">
          {/* Subtle gold accent top line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#C9A34E]"></div>

          <div className="lg:col-span-8 space-y-4 font-body">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
              JOIN AN INTERCONNECTED GLOBAL NETWORK
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight">
              Your Next Chapter Starts With ASAKO.
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
              Whether you are a student discovering your first internship, an institution building enterprise alliances, or a company seeking exceptional talent, ASAKO is built for you.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={() => onOpenAuth('student')}
              className="btn-asako-gold text-xs uppercase tracking-[0.12em] py-3.5 px-6 text-center cursor-pointer font-heading"
            >
              Create Account Free
            </button>
            <button
              onClick={() => onSelectTab('contact')}
              className="px-6 py-3.5 border border-white/30 text-white hover:bg-white/10 transition-colors text-xs uppercase tracking-[0.12em] font-semibold text-center font-heading cursor-pointer"
            >
              Contact Platform Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
