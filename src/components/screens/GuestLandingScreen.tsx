import React, { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, ChevronDown, GraduationCap, Handshake } from 'lucide-react';
import { UserRole } from '../../types/asako';
import { AsakoHero } from '../AsakoHero';

interface GuestLandingScreenProps {
  onOpenAuth: (role?: UserRole) => void;
}

const pathways: {
  role: UserRole;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: React.ReactNode;
  action: string;
}[] = [
  {
    role: 'student',
    title: 'Build your career',
    description: 'Find meaningful opportunities, grow practical skills, and make your work visible to employers.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Students learning and working together on campus',
    icon: <GraduationCap className="h-5 w-5" />,
    action: 'Explore the student journey',
  },
  {
    role: 'company',
    title: 'Meet emerging talent',
    description: 'Connect with motivated candidates and build lasting partnerships with education providers.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'A team working together around a table',
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    action: 'Join as an employer',
  },
  {
    role: 'institute',
    title: 'Connect learning to work',
    description: 'Create stronger pathways between your learners, industry projects, and future careers.',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Students attending a university lecture',
    icon: <Handshake className="h-5 w-5" />,
    action: 'Partner with ASAKO',
  },
];

const faqs = [
  {
    question: 'What is ASAKO?',
    answer:
      'ASAKO connects learners, employers, education institutes, workshop providers, and consumers in one place. The goal is to make it easier to turn learning and skills into practical opportunities.',
  },
  {
    question: 'Who can create an account?',
    answer:
      'Students, companies, educational institutes, workshop providers, and individual consumers can each join through a role-specific account.',
  },
  {
    question: 'Do I need to sign in to use the portals?',
    answer:
      'Yes. The landing page is open to everyone. Sign in or create an account to enter your portal and use features such as applications, workshop registration, and account dashboards.',
  },
  {
    question: 'How do students apply for an opportunity or join a workshop?',
    answer:
      'Create a student account and sign in to browse opportunities and workshops. You can review each listing and submit an application or registration from your account.',
  },
  {
    question: 'Are workshops and marketplace items free?',
    answer:
      'Prices can vary by listing. Check the price and details shown for each workshop or marketplace offering before you register or make an enquiry.',
  },
  {
    question: 'Do organizations need verification?',
    answer:
      'Companies, institutes, and workshop providers may need to complete verification before using certain publishing or partnership features. You can create an account to begin the process.',
  },
];

export const GuestLandingScreen: React.FC<GuestLandingScreenProps> = ({ onOpenAuth }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
  <div className="bg-white text-[#202A38]">
    <AsakoHero onOpenAuth={onOpenAuth} />

    <section className="mx-auto max-w-7xl space-y-12 px-6 py-20 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#C9A34E]">One connected community</div>
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-[#182334] sm:text-4xl">
          Find the pathway that fits you
        </h2>
        <p className="text-base leading-7 text-[#647184]">
          Whether you are building your career, growing a team, or supporting learners, there is a place for you at ASAKO.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pathways.map((pathway) => (
          <article
            key={pathway.role}
            className="group overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-[0_8px_30px_rgba(15,35,66,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,35,66,0.10)]"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-[#F5F7FA]">
              <img
                src={pathway.image}
                alt={pathway.imageAlt}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#173B70] shadow-md">
                {pathway.icon}
              </span>
            </div>
            <div className="space-y-5 p-6 sm:p-7">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#182334]">{pathway.title}</h3>
                <p className="text-sm leading-6 text-[#647184]">{pathway.description}</p>
              </div>
              <button
                onClick={() => onOpenAuth(pathway.role)}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2464B4] hover:text-[#173B70]"
              >
                {pathway.action}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="bg-[#F5F9FD] px-6 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#C9A34E]">
            Frequently asked questions
          </div>
          <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-[#182334] sm:text-4xl">
            A few things you might be wondering
          </h2>
          <p className="max-w-md text-base leading-7 text-[#647184]">
            New to ASAKO? Here are quick answers about joining, using the portals, and what to expect.
          </p>
          <button
            onClick={() => onOpenAuth('student')}
            className="inline-flex items-center gap-2 pt-2 text-sm font-bold text-[#2464B4] hover:text-[#173B70]"
          >
            Get started with ASAKO
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="divide-y divide-[#DFE7F0] border-y border-[#DFE7F0]">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            const triggerId = `guest-faq-trigger-${index}`;
            const panelId = `guest-faq-panel-${index}`;

            return (
              <article key={faq.question} className="guest-faq-item">
                <h3>
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-bold text-[#182334] sm:py-6 sm:text-lg"
                  >
                    <span className="flex items-start gap-4">
                      <span className="pt-0.5 text-xs font-semibold tracking-wider text-[#9AA8BA]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {faq.question}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-[#2464B4] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 pl-9 text-sm leading-7 text-[#647184] sm:pb-7 sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-[#173B70] px-6 py-16 text-center text-white sm:py-20">
      <div className="mx-auto max-w-3xl space-y-5">
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Make your next move with ASAKO</h2>
        <p className="text-sm leading-7 text-white/75 sm:text-base">
          Create an account to access your personalized portal, opportunities, workshops, and partnerships.
        </p>
        <button
          onClick={() => onOpenAuth('student')}
          className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#173B70] transition-colors hover:bg-[#F1F5F9]"
        >
          Create your account
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  </div>
  );
};
