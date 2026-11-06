import React, { useState } from 'react';
import { EcosystemRole, UserRole } from '../../types/asako';
import { Briefcase, Building, ChevronRight, GraduationCap, Sparkles, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PlatformScreenProps {
  onOpenAuth: (role?: UserRole) => void;
}

export const PlatformScreen: React.FC<PlatformScreenProps> = ({ onOpenAuth }) => {
  const [activePersona, setActivePersona] = useState<EcosystemRole>('student');

  const personaDetails: Record<
    EcosystemRole,
    {
      title: string;
      roleLabel: string;
      headline: string;
      summary: string;
      keyCapabilities: string[];
      collaborators: { name: string; interaction: string }[];
      actionLabel: string;
    }
  > = {
    student: {
      title: 'Students & Early Career Builders',
      roleLabel: 'PERSONA 01',
      headline: 'Authentic Experience, Fair Compensation, Real Portfolios',
      summary:
        'ASAKO empowers students to bypass black-hole job boards. Discover verified internships, research assignments, and freelance gigs with transparent compensation, clear scopes, and direct access to company coordinators.',
      keyCapabilities: [
        'Direct application routing with verified review timelines',
        'Enroll in hands-on workshops aligned directly with industry hiring demands',
        'Build a verified public profile showcasing authentic academic and freelance projects',
        'Save opportunities and track interview milestones in a dedicated student dashboard',
      ],
      collaborators: [
        { name: 'Companies & Employers', interaction: 'Direct internship placements, mentorship and hiring pipelines' },
        { name: 'Educational Institutes', interaction: 'Academic credit coordination and capstone project sponsorships' },
        { name: 'Training Providers', interaction: 'Targeted skill workshops and portfolio review sessions' },
      ],
      actionLabel: 'Join as a Student',
    },
    institute: {
      title: 'Educational Institutes & Universities',
      roleLabel: 'PERSONA 02',
      headline: 'Bridge Academics with Verified Enterprise Partnerships',
      summary:
        'Career departments and faculty coordinators use ASAKO to centralize industry relationships, monitor student internship progress, and co-design research programs with corporate partners.',
      keyCapabilities: [
        'Establish and manage formal corporate partnership agreements',
        'Track student cohort applications and internship placements in real time',
        'Host joint campus hackathons, recruitment sprints, and career days',
        'Enforce institutional compliance, safety, and academic credit standards',
      ],
      collaborators: [
        { name: 'Companies & Employers', interaction: 'Corporate research grants and annual recruitment pipelines' },
        { name: 'Students', interaction: 'Career advising, internship approvals, and capstone evaluations' },
        { name: 'Workshop Providers', interaction: 'Guest lectures, faculty training, and accredited skill courses' },
      ],
      actionLabel: 'Register Institution',
    },
    company: {
      title: 'Companies & Employers',
      roleLabel: 'PERSONA 03',
      headline: 'Hire Verified Builders from Top Academic Hubs',
      summary:
        'From high-growth engineering studios to global institutions, companies use ASAKO to recruit candidates who have demonstrated technical ability through real projects and coursework.',
      keyCapabilities: [
        'Publish internships, full-time junior positions, and scoped freelance briefs',
        'Review candidates through authentic portfolios and work samples, not keyword resumes',
        'Sponsor university capstone challenges and discover future talent early',
        'Manage applications through a streamlined candidate review dashboard',
      ],
      collaborators: [
        { name: 'Students', interaction: 'Direct candidate pipelines, interviews, and project evaluations' },
        { name: 'Educational Institutes', interaction: 'Sponsored capstones, campus recruitment, and faculty linkage' },
        { name: 'Workshop Providers', interaction: 'Custom corporate training and internal employee upskilling' },
      ],
      actionLabel: 'Post Company Opportunity',
    },
    provider: {
      title: 'Workshop & Training Providers',
      roleLabel: 'PERSONA 04',
      headline: 'Monetize Expertise & Deliver Structured Masterclasses',
      summary:
        'Experienced practitioners, specialized academies, and consulting practices deliver live interactive workshops, bootcamps, and executive training to learners seeking practical capabilities.',
      keyCapabilities: [
        'Create and list cohort-based masterclasses with transparent seat allocations',
        'Deliver structured curriculums with live sessions and downloadable resource kits',
        'Direct access to motivated students, working professionals, and enterprise cohorts',
        'Integrated attendee management and enrollment tracking in a clean provider portal',
      ],
      collaborators: [
        { name: 'Students & Consumers', interaction: 'Direct masterclass attendance and hands-on skill delivery' },
        { name: 'Educational Institutes', interaction: 'Co-badged certification courses and guest masterclasses' },
        { name: 'Companies', interaction: 'Tailored technical workshops for engineering and design teams' },
      ],
      actionLabel: 'Host a Workshop',
    },
    consumer: {
      title: 'Individual Consumers & Lifelong Learners',
      roleLabel: 'PERSONA 05',
      headline: 'Access Professional Toolkits, Curriculums & Consultations',
      summary:
        'Individual professionals, independent creators, and career changers browse ASAKO Marketplace for production-ready design systems, resume frameworks, books, and 1-on-1 advisory sessions.',
      keyCapabilities: [
        'Download verified digital toolkits, code templates, and design token libraries',
        'Book 1-on-1 portfolio audits and career advisory calls with verified leaders',
        'Access curated educational materials created by institutional educators',
        'Track orders, digital downloads, and booked consultation sessions in one hub',
      ],
      collaborators: [
        { name: 'Workshop Providers', interaction: 'Access to premium session recordings and digital kits' },
        { name: 'Companies & Designers', interaction: 'Purchase commercial-grade templates and production systems' },
      ],
      actionLabel: 'Explore Consumer Marketplace',
    },
  };

  const current = personaDetails[activePersona];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-16">
      {/* Page Header */}
      <div className="border-b border-[#E2E8F0] pb-8 space-y-3">
        <div className="text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
          ECOSYSTEM BLUEPRINT
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F2342] font-heading tracking-[-0.03em]">
          How ASAKO Connects the Ecosystem
        </h1>
        <p className="text-base text-[#475569] max-w-2xl font-body leading-relaxed">
          ASAKO operates as a multi-sided bridge where value flows continuously between learners, educators, corporate employers, skill trainers, and consumers.
        </p>
      </div>

      {/* Persona Interactive Switcher Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-[#E2E8F0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
        {[
          { id: 'student' as const, label: 'Students', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'institute' as const, label: 'Institutes', icon: <Building className="w-4 h-4" /> },
          { id: 'company' as const, label: 'Companies', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'provider' as const, label: 'Providers', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'consumer' as const, label: 'Consumers', icon: <User className="w-4 h-4" /> },
        ].map((tab) => {
          const isSelected = activePersona === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePersona(tab.id)}
              className={`p-4 text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#173B70] text-white'
                  : 'bg-white text-[#475569] hover:bg-[#F5F7FA] hover:text-[#0F2342]'
              }`}
            >
              <span className={isSelected ? 'text-[#C9A34E]' : 'text-[#173B70]'}>
                {tab.icon}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] font-body">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Persona Inspector Card */}
      <div className="border border-[#173B70] bg-white p-8 md:p-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#C9A34E] uppercase tracking-wider">
              {current.roleLabel} // ROLE DEEP DIVE
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
              {current.title}
            </h2>
          </div>

          <button
            onClick={() => onOpenAuth(activePersona)}
            className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-6 self-start md:self-auto cursor-pointer"
          >
            {current.actionLabel}
          </button>
        </div>

        <div className="space-y-3 font-body">
          <h3 className="text-xl font-semibold text-[#173B70]">
            {current.headline}
          </h3>
          <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
            {current.summary}
          </p>
        </div>

        {/* Two Columns: Key Capabilities & Collaborative Value Loop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 font-body">
          {/* Left: What This Persona Does on ASAKO */}
          <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
              Key Capabilities on ASAKO
            </h4>
            <ul className="space-y-2.5 text-xs text-[#475569]">
              {current.keyCapabilities.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#173B70] shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: How Value Exchanges with Other Personas */}
          <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342]">
              Ecosystem Collaborative Loops
            </h4>
            <div className="space-y-3 text-xs">
              {current.collaborators.map((collab, idx) => (
                <div key={idx} className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
                  <div className="font-bold text-[#0F2342]">{collab.name}</div>
                  <div className="text-[#475569]">{collab.interaction}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Architecture Diagram Box */}
      <section className="bg-[#F5F7FA] border border-[#E2E8F0] p-8 md:p-12 space-y-6 font-body">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A34E]">
            THE CO-CREATION ENGINE
          </span>
          <h3 className="text-2xl font-bold text-[#0F2342] font-heading">
            A Multi-Sided Virtuous Growth Cycle
          </h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            By integrating education with market demand, ASAKO removes the friction of talent discovery, authentic skill acquisition, and institutional collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 bg-white border border-[#E2E8F0] space-y-2 text-center">
            <div className="text-base font-bold text-[#0F2342] font-heading">01. Learn & Build</div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Students and professionals gain verified competencies through institute courses and industry-hosted masterclasses.
            </p>
          </div>
          <div className="p-6 bg-white border border-[#E2E8F0] space-y-2 text-center">
            <div className="text-base font-bold text-[#0F2342] font-heading">02. Apply & Deliver</div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Talent matches directly with employer internships, corporate capstones, and freelance projects with real compensation.
            </p>
          </div>
          <div className="p-6 bg-white border border-[#E2E8F0] space-y-2 text-center">
            <div className="text-base font-bold text-[#0F2342] font-heading">03. Grow & Scale</div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Institutes strengthen their corporate network, companies secure top talent, and creators monetize resources in the marketplace.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
