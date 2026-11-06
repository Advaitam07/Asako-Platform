import React from 'react';
import { PublicTab, UserRole } from '../types/asako';
import { AsakoLogo } from './AsakoLogo';

interface FooterProps {
  onSelectTab: (tab: PublicTab) => void;
  onOpenAuth: (role?: UserRole) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenAuth }) => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <AsakoLogo size="md" showTagline={true} />
          <p className="text-sm text-[#475569] leading-relaxed max-w-sm font-body pt-2">
            A unified multi-sided digital platform bridging education, enterprise talent, skills training, and creative consumer offerings.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-heading text-[#173B70] font-semibold tracking-[0.12em] uppercase">
            <span className="w-1.5 h-1.5 bg-[#C9A34E]"></span>
            <span>INNOVATE • BUILD • GROW</span>
          </div>
        </div>

        {/* Discovery Links */}
        <div className="md:col-span-2 space-y-3 font-body">
          <div className="text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em] font-heading">
            Ecosystem
          </div>
          <ul className="space-y-2 text-sm text-[#475569]">
            <li>
              <button
                onClick={() => onSelectTab('platform')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                Platform Model
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('opportunities')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                Opportunities
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('workshops')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                Workshops
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('marketplace')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                Marketplace
              </button>
            </li>
          </ul>
        </div>

        {/* Persona Portals */}
        <div className="md:col-span-2 space-y-3 font-body">
          <div className="text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em] font-heading">
            Personas
          </div>
          <ul className="space-y-2 text-sm text-[#475569]">
            <li>
              <button
                onClick={() => onOpenAuth('student')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                For Students
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenAuth('institute')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                For Educational Institutes
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenAuth('company')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                For Companies & Employers
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenAuth('provider')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                For Training Providers
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenAuth('consumer')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                For Individual Consumers
              </button>
            </li>
          </ul>
        </div>

        {/* Company & Support */}
        <div className="md:col-span-3 space-y-3 font-body">
          <div className="text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em] font-heading">
            Institutional & Contact
          </div>
          <ul className="space-y-2 text-sm text-[#475569]">
            <li>
              <button
                onClick={() => onSelectTab('about')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                About ASAKO
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('contact')}
                className="hover:text-[#173B70] transition-colors cursor-pointer text-left"
              >
                Partnership Enquiries
              </button>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={() => onSelectTab('contact')}
              className="btn-asako-secondary text-[11px] uppercase tracking-[0.12em] py-2 px-4 cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] bg-[#F5F7FA] px-6 lg:px-12 py-6 text-xs text-[#475569] font-body">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} ASAKO Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.12em]">
            <span>Terms of Service</span>
            <span className="text-[#CBD5E1]">·</span>
            <span>Privacy Policy</span>
            <span className="text-[#CBD5E1]">·</span>
            <span>Institute Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
