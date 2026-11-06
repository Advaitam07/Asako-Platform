import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: 'student' | 'institute' | 'company' | 'provider' | 'consumer' | 'admin';
  status: 'active' | 'suspended' | 'pending_verification';
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileRecord {
  id: string;
  user_id: string;
  full_name: string;
  headline: string;
  bio: string;
  phone: string;
  location: string;
  institution: string;
  degree: string;
  field_of_study: string;
  graduation_year: string;
  gpa: string;
  skills: string[];
  resume_url: string;
  resume_filename: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstituteProfileRecord {
  id: string;
  user_id: string;
  institute_name: string;
  accreditation_status: string;
  campus_location: string;
  website: string;
  contact_person: string;
  contact_email: string;
  phone: string;
  established_year: string;
  student_count: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileRecord {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  company_size: string;
  headquarters: string;
  website: string;
  contact_person: string;
  contact_email: string;
  description: string;
  logo_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ProviderProfileRecord {
  id: string;
  user_id: string;
  provider_name: string;
  specialization: string;
  bio: string;
  website: string;
  contact_email: string;
  phone: string;
  accreditation_status: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ConsumerProfileRecord {
  id: string;
  user_id: string;
  full_name: string;
  occupation: string;
  location: string;
  phone: string;
  interest_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface OpportunityRecord {
  id: string;
  company_id: string;
  title: string;
  company_name: string;
  location: string;
  type: 'Internship' | 'Full-time' | 'Freelance' | 'Part-time';
  category: string;
  compensation: string;
  duration: string;
  description: string;
  requirements: string[];
  skills: string[];
  is_remote: boolean;
  status: 'active' | 'closed' | 'draft' | 'moderation_flagged';
  posted_date: string;
  application_deadline: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRecord {
  id: string;
  opportunity_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  resume_url: string;
  cover_note: string;
  portfolio_links: string[];
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected';
  applied_date: string;
  updated_at: string;
}

export interface SavedOpportunityRecord {
  id: string;
  student_id: string;
  opportunity_id: string;
  saved_at: string;
}

export interface WorkshopRecord {
  id: string;
  provider_id: string;
  title: string;
  provider_name: string;
  category: string;
  level: string;
  format: string;
  schedule: string;
  duration: string;
  price: string;
  seats_total: number;
  seats_booked: number;
  instructor: {
    name: string;
    role: string;
    affiliation: string;
  };
  overview: string;
  syllabus: string[];
  status: 'published' | 'draft' | 'cancelled' | 'completed';
  venue_or_link: string;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface WorkshopRegistrationRecord {
  id: string;
  workshop_id: string;
  user_id: string;
  participant_name: string;
  participant_email: string;
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  registered_at: string;
}

export interface InstitutePartnershipRecord {
  id: string;
  institute_id: string;
  institution_name: string;
  partner_company: string;
  initiative: string;
  students_involved: number;
  status: 'Active' | 'Under Review' | 'Upcoming';
  term: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceListingRecord {
  id: string;
  creator_id: string;
  creator_role: string;
  creator_name: string;
  title: string;
  category: string;
  price: string;
  description: string;
  specs: string[];
  deliverable_type: string;
  status: 'active' | 'archived' | 'pending_review';
  created_at: string;
  updated_at: string;
}

export interface MarketplaceEnquiryRecord {
  id: string;
  listing_id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  sender_role: string;
  message: string;
  contact_number: string;
  status: 'new' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface OrderRecord {
  id: string;
  listing_id: string;
  consumer_id: string;
  consumer_name: string;
  amount: string;
  status: 'pending_fulfillment' | 'in_progress' | 'delivered' | 'cancelled';
  deliverable_download_url: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface VerificationRequestRecord {
  id: string;
  user_id: string;
  role: 'institute' | 'company' | 'provider';
  entity_name: string;
  documents_info: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface AuditLogRecord {
  id: string;
  admin_user_id?: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  student_profiles: StudentProfileRecord[];
  institute_profiles: InstituteProfileRecord[];
  company_profiles: CompanyProfileRecord[];
  provider_profiles: ProviderProfileRecord[];
  consumer_profiles: ConsumerProfileRecord[];
  opportunities: OpportunityRecord[];
  applications: ApplicationRecord[];
  saved_opportunities: SavedOpportunityRecord[];
  workshops: WorkshopRecord[];
  workshop_registrations: WorkshopRegistrationRecord[];
  institute_partnerships: InstitutePartnershipRecord[];
  marketplace_listings: MarketplaceListingRecord[];
  marketplace_enquiries: MarketplaceEnquiryRecord[];
  orders_or_requests: OrderRecord[];
  notifications: NotificationRecord[];
  verification_requests: VerificationRequestRecord[];
  audit_logs: AuditLogRecord[];
}

const DB_FILE = path.resolve(
  process.env.ASAKO_DB_FILE || path.join(process.cwd(), 'data', 'asako_db.json')
);
const DB_DIR = path.dirname(DB_FILE);

export function createId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

function emptyDatabase(): DatabaseSchema {
  return {
    users: [],
    student_profiles: [],
    institute_profiles: [],
    company_profiles: [],
    provider_profiles: [],
    consumer_profiles: [],
    opportunities: [],
    applications: [],
    saved_opportunities: [],
    workshops: [],
    workshop_registrations: [],
    institute_partnerships: [],
    marketplace_listings: [],
    marketplace_enquiries: [],
    orders_or_requests: [],
    notifications: [],
    verification_requests: [],
    audit_logs: [],
  };
}

class DatabaseEngine {
  private data: DatabaseSchema;
  private transactionDepth = 0;

  constructor() {
    this.data = this.initialize();
  }

  private initialize(): DatabaseSchema {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        throw new Error(`[DB] ${DB_FILE} contains invalid JSON; refusing to overwrite existing data.`, {
          cause: error,
        });
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`[DB] ${DB_FILE} must contain a JSON object.`);
      }

      const loaded = { ...emptyDatabase(), ...parsed } as Record<string, unknown>;
      for (const [table, records] of Object.entries(loaded)) {
        if (!Array.isArray(records)) {
          throw new Error(`[DB] Table "${table}" in ${DB_FILE} must be an array.`);
        }
      }
      return loaded as unknown as DatabaseSchema;
    }

    if (process.env.NODE_ENV === 'production') {
      const email = process.env.ASAKO_ADMIN_EMAIL?.trim().toLowerCase();
      const password = process.env.ASAKO_ADMIN_PASSWORD;
      if (!email || !password || password.length < 12) {
        throw new Error(
          '[DB] Production database is missing. Set ASAKO_ADMIN_EMAIL and a 12+ character ASAKO_ADMIN_PASSWORD to bootstrap its first administrator.'
        );
      }

      const initial = emptyDatabase();
      const now = new Date().toISOString();
      initial.users.push({
        id: createId('usr-admin'),
        email,
        password_hash: bcrypt.hashSync(password, 12),
        role: 'admin',
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      });
      this.saveDirect(initial);
      return initial;
    }

    const initial = this.seedInitialDatabase();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    const tempFile = `${DB_FILE}.tmp.${randomUUID()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private persist() {
    if (this.transactionDepth === 0) {
      this.saveDirect(this.data);
    }
  }

  public transaction<T>(callback: () => T): T {
    const snapshot = JSON.parse(JSON.stringify(this.data)) as DatabaseSchema;
    this.transactionDepth += 1;
    try {
      const result = callback();
      this.transactionDepth -= 1;
      if (this.transactionDepth === 0) {
        this.saveDirect(this.data);
      }
      return result;
    } catch (error) {
      this.data = snapshot;
      this.transactionDepth = 0;
      throw error;
    }
  }

  private seedInitialDatabase(): DatabaseSchema {
    const now = new Date().toISOString();
    const salt = bcrypt.genSaltSync(10);

    // Initial pre-hashed passwords
    const adminPass = bcrypt.hashSync('AsakoAdmin2026!', salt);
    const studentPass = bcrypt.hashSync('StudentPass2026!', salt);
    const companyPass = bcrypt.hashSync('CompanyPass2026!', salt);
    const institutePass = bcrypt.hashSync('InstitutePass2026!', salt);
    const providerPass = bcrypt.hashSync('ProviderPass2026!', salt);
    const consumerPass = bcrypt.hashSync('ConsumerPass2026!', salt);

    const users: UserRecord[] = [
      {
        id: 'usr-admin-1',
        email: 'admin@asako.global',
        password_hash: adminPass,
        role: 'admin',
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'usr-student-1',
        email: 'alex.rivera@asako.student',
        password_hash: studentPass,
        role: 'student',
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'usr-company-1',
        email: 'sarah.vance@aethel.com',
        password_hash: companyPass,
        role: 'company',
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'usr-institute-1',
        email: 'marcus.weber@zurichtech.edu',
        password_hash: institutePass,
        role: 'institute',
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'usr-provider-1',
        email: 'elena@monolithdesign.org',
        password_hash: providerPass,
        role: 'provider',
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'usr-consumer-1',
        email: 'jordan.lee@domain.com',
        password_hash: consumerPass,
        role: 'consumer',
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
    ];

    const student_profiles: StudentProfileRecord[] = [
      {
        id: 'prof-std-1',
        user_id: 'usr-student-1',
        full_name: 'Alex Rivera',
        headline: 'Distributed Systems & Cloud Computing Researcher',
        bio: 'Fourth-year undergraduate with a focus on high-throughput microservices, verifiable state machines, and TypeScript/Go development.',
        phone: '+41 44 632 11 11',
        location: 'Zurich, Switzerland',
        institution: 'Zurich Tech Institute',
        degree: 'Bachelor of Science',
        field_of_study: 'Computer Science & Software Systems',
        graduation_year: '2027',
        gpa: '3.92 / 4.00',
        skills: ['TypeScript', 'Node.js', 'Go', 'Distributed Databases', 'React', 'Docker'],
        resume_url: '/api/files/alex_rivera_cv_2026.pdf',
        resume_filename: 'alex_rivera_cv_2026.pdf',
        github_url: 'https://github.com/alexrivera-tech',
        linkedin_url: 'https://linkedin.com/in/alexrivera',
        portfolio_url: 'https://alexrivera.dev',
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
    ];

    const institute_profiles: InstituteProfileRecord[] = [
      {
        id: 'prof-inst-1',
        user_id: 'usr-institute-1',
        institute_name: 'Zurich Tech Institute',
        accreditation_status: 'Swiss National Accreditation Board · Level 1',
        campus_location: 'Zurich, Switzerland',
        website: 'https://zurichtech.edu',
        contact_person: 'Prof. Marcus Weber',
        contact_email: 'marcus.weber@zurichtech.edu',
        phone: '+41 44 632 00 00',
        established_year: '1855',
        student_count: 24500,
        verification_status: 'approved',
        created_at: now,
        updated_at: now,
      },
    ];

    const company_profiles: CompanyProfileRecord[] = [
      {
        id: 'prof-comp-1',
        user_id: 'usr-company-1',
        company_name: 'Aethel Technology Labs',
        industry: 'Enterprise Software & Cloud Systems',
        company_size: '250-500 Employees',
        headquarters: 'Geneva / Zurich, Switzerland',
        website: 'https://aethel.technology',
        contact_person: 'Sarah Vance',
        contact_email: 'sarah.vance@aethel.com',
        description: 'Pioneering verifiable high-throughput infrastructure and modern enterprise applications across EMEA.',
        logo_url: '',
        verification_status: 'approved',
        created_at: now,
        updated_at: now,
      },
    ];

    const provider_profiles: ProviderProfileRecord[] = [
      {
        id: 'prof-prov-1',
        user_id: 'usr-provider-1',
        provider_name: 'Monolith Design Practice',
        specialization: 'Design Systems & Modern Architecture',
        bio: 'Leading studio offering masterclasses in design engineering, multi-platform design systems, and product strategy.',
        website: 'https://monolith.design',
        contact_email: 'elena@monolithdesign.org',
        phone: '+46 8 123 4567',
        accreditation_status: 'European Design Educators Alliance Certified',
        verification_status: 'approved',
        created_at: now,
        updated_at: now,
      },
    ];

    const consumer_profiles: ConsumerProfileRecord[] = [
      {
        id: 'prof-cons-1',
        user_id: 'usr-consumer-1',
        full_name: 'Jordan Lee',
        occupation: 'Independent Technical Consultant',
        location: 'Berlin, Germany',
        phone: '+49 30 9876543',
        interest_areas: ['Design Tokens', 'API Architecture', 'Executive Mentorship'],
        created_at: now,
        updated_at: now,
      },
    ];

    const opportunities: OpportunityRecord[] = [
      {
        id: 'opp-1',
        company_id: 'usr-company-1',
        title: 'Distributed Systems & Cloud Architecture Fellow',
        company_name: 'Aethel Technology Labs',
        location: 'Zurich, Switzerland (Hybrid)',
        type: 'Internship',
        category: 'Software Engineering',
        compensation: '€4,200 / month',
        duration: '6 Months (Summer / Autumn)',
        description:
          'Join our Core Infrastructure engineering group developing high-throughput telemetry pipelines and event streaming engines. You will work side-by-side with principal staff engineers architecting low-latency microservices.',
        requirements: [
          'Enrolled in or recent graduate of Computer Science, Software Engineering, or equivalent',
          'Proficiency in Go, Rust, or modern TypeScript/Node.js',
          'Foundational understanding of network protocols, concurrency primitives, and relational databases',
          'Demonstrated portfolio or open-source contributions',
        ],
        skills: ['TypeScript', 'Go', 'Distributed Databases', 'Docker', 'REST / gRPC'],
        is_remote: true,
        status: 'active',
        posted_date: 'March 18, 2026',
        application_deadline: 'May 30, 2026',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'opp-2',
        company_id: 'usr-company-1',
        title: 'Enterprise Design Systems Engineer',
        company_name: 'Aethel Technology Labs',
        location: 'Geneva, Switzerland / Remote',
        type: 'Full-time',
        category: 'Design & Creative',
        compensation: '€92,000 - €115,000 / year',
        duration: 'Permanent Position',
        description:
          'Drive the cross-platform design token architecture and accessible UI component systems powering 14 flagship SaaS products. Bridges visual design standards with frontend engineering precision.',
        requirements: [
          '3+ years building and maintaining design systems or component libraries in production',
          'Deep expertise in modern React, Tailwind CSS / CSS variables, and accessibility (WCAG AAA)',
          'Experience with Figma token pipelines and automated visual regression testing',
        ],
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma Tokens', 'WCAG AAA'],
        is_remote: true,
        status: 'active',
        posted_date: 'March 14, 2026',
        application_deadline: 'June 15, 2026',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'opp-3',
        company_id: 'usr-company-1',
        title: 'AI Data Operations & Evaluation Specialist',
        company_name: 'Aethel Technology Labs',
        location: 'Zurich, Switzerland (On-site)',
        type: 'Internship',
        category: 'AI & Data Science',
        compensation: '€3,800 / month',
        duration: '4 Months',
        description:
          'Work within the Model Alignment and Grounding division to build automated evaluation benchmarks, curate domain-specific test suites, and quantify inference latency profiles.',
        requirements: [
          'Background in Data Science, Statistics, Mathematics, or Computational Linguistics',
          'Strong Python scripting with pandas, numpy, and evaluation frameworks',
          'Familiarity with embeddings, vector search indexes, and synthetic data generation',
        ],
        skills: ['Python', 'Vector DBs', 'Model Evaluation', 'SQL', 'Data Pipelines'],
        is_remote: false,
        status: 'active',
        posted_date: 'March 20, 2026',
        application_deadline: 'June 01, 2026',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'opp-4',
        company_id: 'usr-company-1',
        title: 'Full-Stack Platform Technical Lead',
        company_name: 'Aethel Technology Labs',
        location: 'Remote (Europe / UK timezones)',
        type: 'Freelance',
        category: 'Software Engineering',
        compensation: '€110 / hour',
        duration: '6-Month Initial Contract',
        description:
          'Lead the migration of a legacy monolithic enterprise portal into an event-driven decoupled architecture using Next.js / React and Node.js microservices.',
        requirements: [
          'Extensive experience with high-traffic enterprise architectures',
          'Strong command of PostgreSQL optimization, caching strategies, and OAuth security',
        ],
        skills: ['React', 'Node.js', 'PostgreSQL', 'System Architecture', 'Security'],
        is_remote: true,
        status: 'active',
        posted_date: 'March 22, 2026',
        application_deadline: 'July 01, 2026',
        created_at: now,
        updated_at: now,
      },
    ];

    const applications: ApplicationRecord[] = [
      {
        id: 'app-1',
        opportunity_id: 'opp-1',
        student_id: 'usr-student-1',
        student_name: 'Alex Rivera',
        student_email: 'alex.rivera@asako.student',
        resume_url: '/api/files/alex_rivera_cv_2026.pdf',
        cover_note:
          'I have built high-throughput message streaming services and would love to contribute to Aethel Labs core infrastructure.',
        portfolio_links: ['https://github.com/alexrivera-tech', 'https://alexrivera.dev'],
        status: 'Under Review',
        applied_date: 'March 24, 2026',
        updated_at: now,
      },
      {
        id: 'app-2',
        opportunity_id: 'opp-3',
        student_id: 'usr-student-1',
        student_name: 'Alex Rivera',
        student_email: 'alex.rivera@asako.student',
        resume_url: '/api/files/alex_rivera_cv_2026.pdf',
        cover_note: 'Demonstrated experience in model benchmarking and automated evaluation pipelines.',
        portfolio_links: ['https://github.com/alexrivera-tech'],
        status: 'Applied',
        applied_date: 'March 25, 2026',
        updated_at: now,
      },
    ];

    const saved_opportunities: SavedOpportunityRecord[] = [
      {
        id: 'saved-1',
        student_id: 'usr-student-1',
        opportunity_id: 'opp-2',
        saved_at: now,
      },
      {
        id: 'saved-2',
        student_id: 'usr-student-1',
        opportunity_id: 'opp-4',
        saved_at: now,
      },
    ];

    const workshops: WorkshopRecord[] = [
      {
        id: 'ws-1',
        provider_id: 'usr-provider-1',
        title: 'High-Throughput Distributed Microservices Architecture',
        provider_name: 'Monolith Design Practice',
        category: 'Tech & Architecture',
        level: 'Intermediate',
        format: 'Hands-on Bootcamp',
        schedule: 'Saturday & Sunday, April 11-12, 2026',
        duration: '16 Hours Intensive',
        price: '€180 (Student Fee: €45)',
        seats_total: 40,
        seats_booked: 28,
        instructor: {
          name: 'Dr. Henrik Lindqvist',
          role: 'Principal Systems Architect',
          affiliation: 'Former Lead Engineer at European Telco Hub',
        },
        overview:
          'Comprehensive practical training in designing resilient distributed systems, handling split-brain scenarios, event streaming with Kafka/Redpanda, and achieving p99 latency targets.',
        syllabus: [
          'Part 1: CAP Theorem tradeoffs and partition tolerance in distributed state',
          'Part 2: Idempotent message consumption and outbox patterns',
          'Part 3: Distributed tracing with OpenTelemetry and Jaeger',
          'Part 4: Load testing and bottleneck profiling under 100k RPS synthetic stress',
        ],
        status: 'published',
        venue_or_link: 'https://meet.asako.global/ws-1-distributed',
        deadline: 'April 08, 2026',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'ws-2',
        provider_id: 'usr-provider-1',
        title: 'Modern Design System Tokens: From Figma to Production React',
        provider_name: 'Monolith Design Practice',
        category: 'Design Systems',
        level: 'Advanced',
        format: 'Live Interactive',
        schedule: 'Friday, April 17, 2026 · 14:00 - 19:00 CET',
        duration: '5 Hours',
        price: '€120 (Student Fee: €30)',
        seats_total: 50,
        seats_booked: 41,
        instructor: {
          name: 'Elena Lindqvist',
          role: 'Head of Design Engineering',
          affiliation: 'Monolith Design Practice',
        },
        overview:
          'Learn the exact token architecture and semantic naming schema used to power large-scale enterprise suites with dark mode, accessibility compliance, and zero-runtime overhead.',
        syllabus: [
          'Module 1: Semantic token hierarchies and alias tiering',
          'Module 2: Figma Variables sync via GitHub Actions CI/CD',
          'Module 3: Accessible color contrast automation and high-contrast modes',
          'Module 4: Multi-brand theming in Tailwind CSS v4 and React 19',
        ],
        status: 'published',
        venue_or_link: 'https://meet.asako.global/ws-2-design-tokens',
        deadline: 'April 15, 2026',
        created_at: now,
        updated_at: now,
      },
    ];

    const workshop_registrations: WorkshopRegistrationRecord[] = [
      {
        id: 'wsreg-1',
        workshop_id: 'ws-1',
        user_id: 'usr-student-1',
        participant_name: 'Alex Rivera',
        participant_email: 'alex.rivera@asako.student',
        status: 'confirmed',
        registered_at: now,
      },
    ];

    const institute_partnerships: InstitutePartnershipRecord[] = [
      {
        id: 'part-1',
        institute_id: 'usr-institute-1',
        institution_name: 'Zurich Tech Institute',
        partner_company: 'Aethel Technology Labs',
        initiative: 'Joint Cloud Systems & Verifiable Architecture Capstone',
        students_involved: 32,
        status: 'Active',
        term: 'Spring 2026 Cohort',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'part-2',
        institute_id: 'usr-institute-1',
        institution_name: 'Zurich Tech Institute',
        partner_company: 'Novartis Informatics',
        initiative: 'Computational Proteomics & High-Throughput Screening',
        students_involved: 18,
        status: 'Active',
        term: 'Academic Year 2025/2026',
        created_at: now,
        updated_at: now,
      },
    ];

    const marketplace_listings: MarketplaceListingRecord[] = [
      {
        id: 'mkt-1',
        creator_id: 'usr-provider-1',
        creator_role: 'provider',
        creator_name: 'Monolith Design Practice',
        title: 'Architectural Design Token Engine & Blueprint System',
        category: 'Design System',
        price: '€140',
        description:
          'A complete multi-tier design token engine with semantic alias hierarchies, automated Figma Variables export scripts, and Tailwind CSS v4 integration modules.',
        specs: [
          'Full TypeScript token generator source',
          'Figma Community library link with 240+ verified styles',
          'WCAG AAA accessible color scales for 12 hues',
          'Continuous integration sync script for GitHub Actions',
        ],
        deliverable_type: 'Digital Archive (.zip) & GitHub Repository Access',
        status: 'active',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'mkt-2',
        creator_id: 'usr-company-1',
        creator_role: 'company',
        creator_name: 'Aethel Technology Labs',
        title: 'Enterprise Event Streaming & Telemetry Starter Kit',
        category: 'Developer Kit',
        price: '€220',
        description:
          'Production-tested microservices scaffold implementing outbox pattern, distributed tracing with OpenTelemetry, and containerized Docker compose harnesses.',
        specs: [
          'Clean Go & Node.js service templates',
          'Outbox and dead-letter queue processors',
          'Prometheus metrics exporter with Grafana dashboards',
          'Stress-test harness capable of 50k sustained RPS',
        ],
        deliverable_type: 'Private Repository License & Documentation',
        status: 'active',
        created_at: now,
        updated_at: now,
      },
    ];

    const marketplace_enquiries: MarketplaceEnquiryRecord[] = [
      {
        id: 'enq-1',
        listing_id: 'mkt-1',
        sender_id: 'usr-consumer-1',
        sender_name: 'Jordan Lee',
        sender_email: 'jordan.lee@domain.com',
        sender_role: 'consumer',
        message: 'Does this token engine support multi-brand themes with independent dark mode hierarchies?',
        contact_number: '+49 30 9876543',
        status: 'responded',
        created_at: now,
        updated_at: now,
      },
    ];

    const orders_or_requests: OrderRecord[] = [
      {
        id: 'ord-1',
        listing_id: 'mkt-1',
        consumer_id: 'usr-consumer-1',
        consumer_name: 'Jordan Lee',
        amount: '€140',
        status: 'delivered',
        deliverable_download_url: '/api/files/monolith_token_engine_v2.zip',
        created_at: now,
        updated_at: now,
      },
    ];

    const notifications: NotificationRecord[] = [
      {
        id: 'notif-1',
        user_id: 'usr-student-1',
        title: 'Application Received',
        message: 'Your application for Distributed Systems Fellow at Aethel Labs is Under Review.',
        type: 'application_status',
        is_read: false,
        link: '/opportunities',
        created_at: now,
      },
      {
        id: 'notif-2',
        user_id: 'usr-student-1',
        title: 'Masterclass Enrolled',
        message: 'Your seat in High-Throughput Distributed Microservices has been confirmed.',
        type: 'workshop_alert',
        is_read: true,
        link: '/workshops',
        created_at: now,
      },
      {
        id: 'notif-3',
        user_id: 'usr-company-1',
        title: 'New Candidate Applied',
        message: 'Alex Rivera submitted an application for Distributed Systems & Cloud Architecture Fellow.',
        type: 'application_status',
        is_read: false,
        link: '/dashboard',
        created_at: now,
      },
    ];

    const verification_requests: VerificationRequestRecord[] = [
      {
        id: 'ver-1',
        user_id: 'usr-institute-1',
        role: 'institute',
        entity_name: 'Zurich Tech Institute',
        documents_info: ['Swiss Bologna Charter Accreditation #CH-88219', 'Authorized Rector Delegation Letter'],
        status: 'approved',
        reviewed_by: 'usr-admin-1',
        review_notes: 'All university credentials verified with the Swiss Department of Education.',
        created_at: now,
        reviewed_at: now,
      },
      {
        id: 'ver-2',
        user_id: 'usr-company-1',
        role: 'company',
        entity_name: 'Aethel Technology Labs',
        documents_info: ['Swiss Commercial Register Excerpt CHE-419.822.019'],
        status: 'approved',
        reviewed_by: 'usr-admin-1',
        review_notes: 'Commercial enterprise registration validated.',
        created_at: now,
        reviewed_at: now,
      },
    ];

    const audit_logs: AuditLogRecord[] = [
      {
        id: 'log-1',
        admin_user_id: 'usr-admin-1',
        admin_email: 'admin@asako.global',
        action: 'VERIFY_ENTITY',
        target_type: 'institute_profile',
        target_id: 'prof-inst-1',
        details: { entity: 'Zurich Tech Institute', status: 'approved' },
        ip_address: '127.0.0.1',
        created_at: now,
      },
    ];

    return {
      users,
      student_profiles,
      institute_profiles,
      company_profiles,
      provider_profiles,
      consumer_profiles,
      opportunities,
      applications,
      saved_opportunities,
      workshops,
      workshop_registrations,
      institute_partnerships,
      marketplace_listings,
      marketplace_enquiries,
      orders_or_requests,
      notifications,
      verification_requests,
      audit_logs,
    };
  }

  // Generic Query Helpers
  public getTable<K extends keyof DatabaseSchema>(tableName: K): DatabaseSchema[K] {
    return this.data[tableName];
  }

  public findMany<K extends keyof DatabaseSchema>(
    tableName: K,
    predicate?: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K] {
    const list = this.data[tableName] as any[];
    if (!predicate) return [...list] as any;
    return list.filter(predicate) as any;
  }

  public findOne<K extends keyof DatabaseSchema>(
    tableName: K,
    predicate: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K][number] | null {
    const list = this.data[tableName] as any[];
    const item = list.find(predicate);
    return item ? { ...item } : null;
  }

  public findById<K extends keyof DatabaseSchema>(
    tableName: K,
    id: string
  ): DatabaseSchema[K][number] | null {
    return this.findOne(tableName, (item: any) => item.id === id);
  }

  public insert<K extends keyof DatabaseSchema>(
    tableName: K,
    record: DatabaseSchema[K][number]
  ): DatabaseSchema[K][number] {
    const list = this.data[tableName] as any[];
    list.unshift(record);
    this.persist();
    return record;
  }

  public update<K extends keyof DatabaseSchema>(
    tableName: K,
    id: string,
    updates: Partial<DatabaseSchema[K][number]>
  ): DatabaseSchema[K][number] | null {
    const list = this.data[tableName] as any[];
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    const existing = list[idx];
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    this.persist();
    return updated;
  }

  public delete<K extends keyof DatabaseSchema>(tableName: K, id: string): boolean {
    const list = this.data[tableName] as any[];
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    list.splice(idx, 1);
    this.persist();
    return true;
  }

  public count<K extends keyof DatabaseSchema>(
    tableName: K,
    predicate?: (item: DatabaseSchema[K][number]) => boolean
  ): number {
    const list = this.data[tableName] as any[];
    if (!predicate) return list.length;
    return list.filter(predicate).length;
  }
}

export const db = new DatabaseEngine();
