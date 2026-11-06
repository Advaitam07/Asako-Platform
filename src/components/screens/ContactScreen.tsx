import React, { useState } from 'react';
import { Check, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';

export const ContactScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    roleCategory: 'institute',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-16">
      {/* Title */}
      <div className="border-b border-[#E2E8F0] pb-8 space-y-3">
        <div className="text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
          COMMUNICATIONS & PARTNERSHIPS
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F2342] font-heading tracking-[-0.03em]">
          Contact & Partnership Enquiries
        </h1>
        <p className="text-base text-[#475569] max-w-2xl font-body leading-relaxed">
          Connect with the ASAKO platform partnership team to establish academic linkages, enterprise recruitment pipelines, or custom workshop delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start font-body">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] p-8 md:p-10 space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-2xl font-bold text-[#0F2342] font-heading">
              Initiate Platform Dialogue
            </h2>
            <p className="text-xs text-[#475569] mt-1">
              Complete the enquiry details below. Our institutional coordinator will respond within 24 business hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-[rgba(201,163,78,0.08)] border border-[#C9A34E] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2342] uppercase tracking-[0.12em]">
                <Check className="w-4 h-4 text-[#C9A34E]" />
                <span>ENQUIRY RECEIVED SUCCESSFULLY</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Thank you, {formData.fullName}. Your partnership enquiry regarding &ldquo;{formData.subject}&rdquo; has been routed to our institutional partnerships director. Reference: ASAKO-ENQ-{Math.floor(100000 + Math.random() * 900000)}.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2 px-4 mt-2 cursor-pointer"
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Christine Meier"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em]">
                    Work / Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="c.meier@university.ch"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em]">
                    Organization / University Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zurich University of Applied Sciences"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em]">
                    Enquiry Classification *
                  </label>
                  <select
                    value={formData.roleCategory}
                    onChange={(e) => setFormData({ ...formData, roleCategory: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none cursor-pointer"
                  >
                    <option value="institute">Educational Institute Partnership</option>
                    <option value="company">Enterprise Recruitment & Job Postings</option>
                    <option value="provider">Workshop Hosting & Training Delivery</option>
                    <option value="student">Student Inquiries & Ambassador Program</option>
                    <option value="consumer">Marketplace & General Support</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em]">
                  Subject / Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Establishing Annual Capstone Internship Framework"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F2342] uppercase tracking-[0.12em]">
                  Detailed Message / Collaboration Scope *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your student cohort size, recruitment goals, or workshop topic..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-3 px-6 cursor-pointer"
              >
                {isSubmitting ? 'Transmitting Enquiry...' : 'Submit Partnership Enquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Direct Coordinates & Support Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 md:p-8 space-y-6">
            <div className="border-b border-[#E2E8F0] pb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#C9A34E]">
                DIRECT LIAISONS
              </span>
              <h3 className="text-xl font-bold text-[#0F2342] font-heading mt-1">
                Global Coordination Desks
              </h3>
            </div>

            <div className="space-y-4 text-xs text-[#475569]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#173B70] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#0F2342]">Central Operations Desk</div>
                  <div>Bahnhofstrasse 42, 8001 Zurich, Switzerland</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#173B70] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#0F2342]">Partnerships & Universities</div>
                  <div>partnerships@asako-platform.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-[#173B70] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#0F2342]">Employer Talent Solutions</div>
                  <div>employers@asako-platform.com</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] text-xs leading-relaxed text-[#75777F]">
              For student support regarding active internship applications or workshop attendance credentials, please reference your application identifier in the message.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
