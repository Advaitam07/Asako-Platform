-- ============================================================================
-- ASAKO PLATFORM — COMPLETE RELATIONAL DATABASE SCHEMA
-- Compatible with PostgreSQL, Cloud SQL, and Supabase
-- ============================================================================

-- Extensions (for Supabase / Postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
CREATE TYPE user_role_enum AS ENUM (
  'student',
  'institute',
  'company',
  'provider',
  'consumer',
  'admin'
);

CREATE TYPE user_status_enum AS ENUM (
  'active',
  'suspended',
  'pending_verification'
);

CREATE TYPE opportunity_type_enum AS ENUM (
  'Internship',
  'Full-time',
  'Freelance',
  'Part-time'
);

CREATE TYPE application_status_enum AS ENUM (
  'Applied',
  'Under Review',
  'Shortlisted',
  'Rejected',
  'Selected'
);

CREATE TYPE verification_status_enum AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'student',
  status user_status_enum NOT NULL DEFAULT 'active',
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3. USER ROLES (RBAC & Multi-Role Grants)
CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  granted_by VARCHAR(64)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- 4. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  headline VARCHAR(255),
  bio TEXT,
  phone VARCHAR(50),
  location VARCHAR(255),
  institution VARCHAR(255),
  degree VARCHAR(255),
  field_of_study VARCHAR(255),
  graduation_year VARCHAR(10),
  gpa VARCHAR(20),
  skills JSONB DEFAULT '[]'::jsonb,
  resume_url TEXT,
  resume_filename VARCHAR(255),
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_user ON student_profiles(user_id);

-- 5. INSTITUTE PROFILES
CREATE TABLE IF NOT EXISTS institute_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  institute_name VARCHAR(255) NOT NULL,
  accreditation_status VARCHAR(255),
  campus_location VARCHAR(255),
  website TEXT,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  established_year VARCHAR(10),
  student_count INT DEFAULT 0,
  verification_status verification_status_enum DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_institute_user ON institute_profiles(user_id);

-- 6. COMPANY PROFILES
CREATE TABLE IF NOT EXISTS company_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  company_size VARCHAR(50),
  headquarters VARCHAR(255),
  website TEXT,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  description TEXT,
  logo_url TEXT,
  verification_status verification_status_enum DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_user ON company_profiles(user_id);

-- 7. WORKSHOP PROVIDER PROFILES
CREATE TABLE IF NOT EXISTS provider_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  provider_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  bio TEXT,
  website TEXT,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  accreditation_status VARCHAR(255),
  verification_status verification_status_enum DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_user ON provider_profiles(user_id);

-- 8. CONSUMER PROFILES
CREATE TABLE IF NOT EXISTS consumer_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  occupation VARCHAR(255),
  location VARCHAR(255),
  phone VARCHAR(50),
  interest_areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consumer_user ON consumer_profiles(user_id);

-- 9. OPPORTUNITIES
CREATE TABLE IF NOT EXISTS opportunities (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type opportunity_type_enum NOT NULL DEFAULT 'Internship',
  category VARCHAR(100) NOT NULL,
  compensation VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  is_remote BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active',
  posted_date VARCHAR(50) NOT NULL,
  application_deadline VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_opportunities_company ON opportunities(company_id);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_status ON opportunities(status);

-- 10. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(64) PRIMARY KEY,
  opportunity_id VARCHAR(64) REFERENCES opportunities(id) ON DELETE CASCADE,
  student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  resume_url TEXT,
  cover_note TEXT,
  portfolio_links JSONB DEFAULT '[]'::jsonb,
  status application_status_enum DEFAULT 'Applied',
  applied_date VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_opportunity UNIQUE (opportunity_id, student_id)
);

CREATE INDEX idx_applications_opp ON applications(opportunity_id);
CREATE INDEX idx_applications_student ON applications(student_id);

-- 11. SAVED OPPORTUNITIES
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id VARCHAR(64) REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_saved_opp UNIQUE (student_id, opportunity_id)
);

CREATE INDEX idx_saved_opps_student ON saved_opportunities(student_id);

-- 12. WORKSHOPS
CREATE TABLE IF NOT EXISTS workshops (
  id VARCHAR(64) PRIMARY KEY,
  provider_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  format VARCHAR(50) NOT NULL,
  schedule VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  seats_total INT NOT NULL DEFAULT 30,
  seats_booked INT NOT NULL DEFAULT 0,
  instructor JSONB NOT NULL,
  overview TEXT NOT NULL,
  syllabus JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'published',
  venue_or_link TEXT,
  deadline VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workshops_provider ON workshops(provider_id);
CREATE INDEX idx_workshops_category ON workshops(category);

-- 13. WORKSHOP REGISTRATIONS
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id VARCHAR(64) PRIMARY KEY,
  workshop_id VARCHAR(64) REFERENCES workshops(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_workshop UNIQUE (workshop_id, user_id)
);

CREATE INDEX idx_ws_reg_workshop ON workshop_registrations(workshop_id);
CREATE INDEX idx_ws_reg_user ON workshop_registrations(user_id);

-- 14. WORKSHOP ATTENDANCE
CREATE TABLE IF NOT EXISTS workshop_attendance (
  id VARCHAR(64) PRIMARY KEY,
  registration_id VARCHAR(64) REFERENCES workshop_registrations(id) ON DELETE CASCADE,
  workshop_id VARCHAR(64) REFERENCES workshops(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  check_in_time TIMESTAMP WITH TIME ZONE
);

-- 15. INSTITUTE PARTNERSHIPS
CREATE TABLE IF NOT EXISTS institute_partnerships (
  id VARCHAR(64) PRIMARY KEY,
  institute_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  institution_name VARCHAR(255) NOT NULL,
  partner_company VARCHAR(255) NOT NULL,
  initiative VARCHAR(255) NOT NULL,
  students_involved INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  term VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partnerships_institute ON institute_partnerships(institute_id);

-- 16. MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  creator_role VARCHAR(50) NOT NULL,
  creator_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  specs JSONB DEFAULT '[]'::jsonb,
  deliverable_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketplace_creator ON marketplace_listings(creator_id);
CREATE INDEX idx_marketplace_category ON marketplace_listings(category);

-- 17. MARKETPLACE ENQUIRIES
CREATE TABLE IF NOT EXISTS marketplace_enquiries (
  id VARCHAR(64) PRIMARY KEY,
  listing_id VARCHAR(64) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  sender_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  contact_number VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_enquiries_listing ON marketplace_enquiries(listing_id);
CREATE INDEX idx_enquiries_sender ON marketplace_enquiries(sender_id);

-- 18. ORDERS OR REQUESTS
CREATE TABLE IF NOT EXISTS orders_or_requests (
  id VARCHAR(64) PRIMARY KEY,
  listing_id VARCHAR(64) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  consumer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  consumer_name VARCHAR(255) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'in_progress',
  deliverable_download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_consumer ON orders_or_requests(consumer_id);

-- 19. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- 20. VERIFICATION REQUESTS
CREATE TABLE IF NOT EXISTS verification_requests (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  documents_info JSONB DEFAULT '[]'::jsonb,
  status verification_status_enum DEFAULT 'pending',
  reviewed_by VARCHAR(64),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_verifications_status ON verification_requests(status);

-- 21. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  admin_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created ON audit_logs(created_at);
