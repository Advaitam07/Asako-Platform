export type EcosystemRole = 'student' | 'institute' | 'company' | 'provider' | 'consumer';
export type UserRole = EcosystemRole | 'admin';

export type PublicTab =
  | 'home'
  | 'platform'
  | 'opportunities'
  | 'workshops'
  | 'marketplace'
  | 'about'
  | 'contact'
  | 'dashboard';

export type OpportunityType = 'Internship' | 'Full-time' | 'Freelance' | 'Part-time';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: OpportunityType;
  category: 'Software Engineering' | 'Design & Creative' | 'AI & Data Science' | 'Product & Growth' | 'Business & Marketing' | 'Research';
  compensation: string;
  duration: string;
  description: string;
  requirements: string[];
  skills: string[];
  isRemote: boolean;
  postedDate: string;
  applicationDeadline: string;
}

export interface Workshop {
  id: string;
  title: string;
  provider: string;
  category: 'Tech & Architecture' | 'Design Systems' | 'Business Innovation' | 'AI Engineering' | 'Career Growth';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  format: 'Live Interactive' | 'Hands-on Bootcamp' | 'Executive Masterclass';
  schedule: string;
  duration: string;
  price: string;
  seatsTotal: number;
  seatsBooked: number;
  instructor: {
    name: string;
    role: string;
    affiliation: string;
  };
  overview: string;
  syllabus: string[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  creator: string;
  category: 'Developer Kit' | 'Design System' | 'Educational Curriculum' | 'Productivity Tool' | 'Pro Consultation';
  price: string;
  description: string;
  specs: string[];
  deliverableType: string;
}

export interface StudentApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  appliedDate: string;
  status: 'Applied' | 'Submitted' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected' | 'Interview Scheduled';
}

export interface InstitutePartnership {
  id: string;
  institutionName: string;
  partnerCompany: string;
  initiative: string;
  studentsInvolved: number;
  status: 'Active' | 'Under Review' | 'Upcoming';
  term: string;
}
