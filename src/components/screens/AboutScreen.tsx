import React from 'react';
import { AsakoLogo } from '../AsakoLogo';
import { Award, Compass, Flag, Lightbulb, ShieldCheck, Target, Users } from 'lucide-react';

export const AboutScreen: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-20">
      {/* Title */}
      <div className="border-b border-[#E2E8F0] pb-8 space-y-3">
        <div className="text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
          ORGANIZATIONAL PHILOSOPHY
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F2342] font-heading tracking-[-0.03em]">
          About ASAKO
        </h1>
        <p className="text-base text-[#475569] max-w-2xl font-body leading-relaxed">
          Bridging educational ambition and enterprise execution through an integrated multi-sided opportunity ecosystem.
        </p>
      </div>

      {/* Brand Identity & Mission Statement */}
      <section className="bg-white border border-[#173B70] p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-4 flex flex-col items-start space-y-4">
          <AsakoLogo size="lg" showTagline={true} />
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A34E] font-body pt-2">
            ESTABLISHED FOR COLLECTIVE PROGRESS
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4 font-body">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
            Our Mission: Remove the Gap Between Ambition and Industry
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Higher education equips students with foundational rigor, while fast-moving enterprises require practical execution capabilities. Traditional job boards fail both sides by prioritizing superficial keywords and generating impersonal rejection cycles.
          </p>
          <p className="text-sm text-[#475569] leading-relaxed">
            ASAKO was founded to construct a coordinated bridge. By integrating students, universities, employers, specialized training providers, and consumers onto a shared platform, we ensure that skills are verified through real artifacts, partnerships are structured with legal clarity, and compensation is transparent and fair.
          </p>
        </div>
      </section>

      {/* The 3 Core Pillars: INNOVATE • BUILD • GROW */}
      <section className="space-y-8">
        <div className="border-b border-[#E2E8F0] pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A34E] font-body">
            OUR GUIDING TRINITY
          </span>
          <h2 className="text-3xl font-bold text-[#0F2342] font-heading mt-1">
            INNOVATE • BUILD • GROW
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-[#E2E8F0] divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] bg-white">
          <div className="p-8 space-y-4">
            <div className="text-3xl font-extrabold font-heading text-[#173B70]">01</div>
            <h3 className="text-xl font-bold text-[#0F2342] font-heading">INNOVATE</h3>
            <div className="text-xs font-semibold text-[#C9A34E] uppercase tracking-wider font-body">
              Continuous Curriculum & Methodologies
            </div>
            <p className="text-xs text-[#475569] leading-relaxed font-body">
              We empower educational institutions and independent training providers to modernize course offerings rapidly, integrating emerging engineering and design practices directly into student learning cycles.
            </p>
          </div>

          <div className="p-8 space-y-4">
            <div className="text-3xl font-extrabold font-heading text-[#173B70]">02</div>
            <h3 className="text-xl font-bold text-[#0F2342] font-heading">BUILD</h3>
            <div className="text-xs font-semibold text-[#C9A34E] uppercase tracking-wider font-body">
              Production-Grade Execution
            </div>
            <p className="text-xs text-[#475569] leading-relaxed font-body">
              We reject passive theoretical drills. On ASAKO, students build real software components, design systems, and research deliverables under the direct guidance of enterprise mentors and practitioners.
            </p>
          </div>

          <div className="p-8 space-y-4">
            <div className="text-3xl font-extrabold font-heading text-[#173B70]">03</div>
            <h3 className="text-xl font-bold text-[#0F2342] font-heading">GROW</h3>
            <div className="text-xs font-semibold text-[#C9A34E] uppercase tracking-wider font-body">
              Sustainable Long-Term Careers
            </div>
            <p className="text-xs text-[#475569] leading-relaxed font-body">
              Growth means equitable opportunities: fair compensation for every internship, clear career progression roadmaps for early talent, and lasting corporate linkages for academic faculties.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Values */}
      <section className="bg-[#F5F7FA] border border-[#E2E8F0] p-8 md:p-12 space-y-6 font-body">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
            OUR COMMITMENT
          </span>
          <h3 className="text-2xl font-bold text-[#0F2342] font-heading">
            Platform Governance & Standards
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-[#475569]">
          <div className="p-5 bg-white border border-[#E2E8F0] space-y-2">
            <div className="font-bold text-[#0F2342] text-sm">Vetted Enterprise Postings</div>
            <p className="leading-relaxed">
              Every job and internship undergoes review to confirm realistic role definitions, required mentorship, and lawful compensation.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E2E8F0] space-y-2">
            <div className="font-bold text-[#0F2342] text-sm">Academic Institutional Integrity</div>
            <p className="leading-relaxed">
              University partnerships are structured with formal agreements that safeguard student intellectual property and academic standing.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E2E8F0] space-y-2">
            <div className="font-bold text-[#0F2342] text-sm">Curated Training Quality</div>
            <p className="leading-relaxed">
              Workshop providers must demonstrate proven professional backgrounds and structured syllabuses prior to publishing masterclasses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
