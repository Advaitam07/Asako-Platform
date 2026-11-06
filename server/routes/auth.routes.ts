import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createId, db, UserRecord } from '../db/database';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function isDemoAccount(email: string): boolean {
  return new Set([
    'admin@asako.global',
    'alex.rivera@asako.student',
    'sarah.vance@aethel.com',
    'marcus.weber@zurichtech.edu',
    'elena@monolithdesign.org',
    'jordan.lee@domain.com',
  ]).has(email);
}

// POST /api/auth/register
router.post('/register', (req, res: Response) => {
  try {
    const { email, password, role, fullName, organizationName } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || typeof role !== 'string') {
      res.status(400).json({ error: 'Email, password, and role are required.' });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    // STRICT SECURITY RULE: Admin privileges cannot be acquired via public registration
    if (role === 'admin') {
      res.status(403).json({ error: 'Administrative roles cannot be assigned through public registration.' });
      return;
    }

    const validRoles: Array<UserRecord['role']> = ['student', 'institute', 'company', 'provider', 'consumer'];
    if (!validRoles.includes(role as UserRecord['role'])) {
      res.status(400).json({ error: `Invalid role specified. Must be one of: ${validRoles.join(', ')}` });
      return;
    }
    const userRole = role as UserRecord['role'];

    if (password.length < 8 || password.length > 72) {
      res.status(400).json({ error: 'Password must be between 8 and 72 characters in length.' });
      return;
    }

    if (
      (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length > 120)) ||
      (organizationName !== undefined &&
        (typeof organizationName !== 'string' || organizationName.trim().length > 160))
    ) {
      res.status(400).json({ error: 'Name or organization is invalid or too long.' });
      return;
    }

    const existing = db.findOne('users', (u) => u.email === normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();
    const userId = createId(`usr-${userRole}`);
    const profileName = (typeof fullName === 'string' && fullName.trim()) || normalizedEmail.split('@')[0];
    const organization = typeof organizationName === 'string' ? organizationName.trim() : '';

    // Create User record
    const newUser: UserRecord = {
      id: userId,
      email: normalizedEmail,
      password_hash,
      role: userRole,
      status: 'active',
      is_email_verified: false,
      created_at: now,
      updated_at: now,
    };
    db.transaction(() => {
      db.insert('users', newUser);

      if (userRole === 'student') {
        db.insert('student_profiles', {
          id: createId('prof-std'),
          user_id: userId,
          full_name: profileName,
          headline: 'Student & Emerging Technologist',
          bio: '',
          phone: '',
          location: '',
          institution: organization,
          degree: '',
          field_of_study: '',
          graduation_year: '',
          gpa: '',
          skills: [],
          resume_url: '',
          resume_filename: '',
          github_url: '',
          linkedin_url: '',
          portfolio_url: '',
          is_verified: false,
          created_at: now,
          updated_at: now,
        });
      } else if (userRole === 'company') {
        const entityName = organization || profileName;
        db.insert('company_profiles', {
          id: createId('prof-comp'),
          user_id: userId,
          company_name: entityName,
          industry: '',
          company_size: '',
          headquarters: '',
          website: '',
          contact_person: profileName,
          contact_email: normalizedEmail,
          description: '',
          logo_url: '',
          verification_status: 'pending',
          created_at: now,
          updated_at: now,
        });
        db.insert('verification_requests', {
          id: createId('ver'),
          user_id: userId,
          role: 'company',
          entity_name: entityName,
          documents_info: [],
          status: 'pending',
          created_at: now,
        });
      } else if (userRole === 'institute') {
        const entityName = organization || profileName;
        db.insert('institute_profiles', {
          id: createId('prof-inst'),
          user_id: userId,
          institute_name: entityName,
          accreditation_status: 'Pending review',
          campus_location: '',
          website: '',
          contact_person: profileName,
          contact_email: normalizedEmail,
          phone: '',
          established_year: '',
          student_count: 0,
          verification_status: 'pending',
          created_at: now,
          updated_at: now,
        });
        db.insert('verification_requests', {
          id: createId('ver'),
          user_id: userId,
          role: 'institute',
          entity_name: entityName,
          documents_info: [],
          status: 'pending',
          created_at: now,
        });
      } else if (userRole === 'provider') {
        const entityName = organization || profileName;
        db.insert('provider_profiles', {
          id: createId('prof-prov'),
          user_id: userId,
          provider_name: entityName,
          specialization: '',
          bio: '',
          website: '',
          contact_email: normalizedEmail,
          phone: '',
          accreditation_status: 'Pending review',
          verification_status: 'pending',
          created_at: now,
          updated_at: now,
        });
        db.insert('verification_requests', {
          id: createId('ver'),
          user_id: userId,
          role: 'provider',
          entity_name: entityName,
          documents_info: [],
          status: 'pending',
          created_at: now,
        });
      } else {
        db.insert('consumer_profiles', {
          id: createId('prof-cons'),
          user_id: userId,
          full_name: profileName,
          occupation: '',
          location: '',
          phone: '',
          interest_areas: [],
          created_at: now,
          updated_at: now,
        });
      }

      db.insert('notifications', {
        id: createId('notif'),
        user_id: userId,
        title: 'Welcome to ASAKO',
        message: `Your account as a ${userRole} has been created.`,
        type: 'system',
        is_read: false,
        link: '/dashboard',
        created_at: now,
      });
    });

    const token = generateToken(newUser);

    res.cookie('asako_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        name: profileName,
        organization: organization || undefined,
      },
    });
  } catch (error) {
    console.error('[Auth] Registration failed:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Valid email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ error: 'Valid email and password are required.' });
      return;
    }

    const key = req.socket.remoteAddress || 'unknown';
    const nowMs = Date.now();
    const attempt = loginAttempts.get(key);
    if (attempt && attempt.resetAt > nowMs && attempt.count >= LOGIN_ATTEMPT_LIMIT) {
      res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
      return;
    }
    if (!attempt || attempt.resetAt <= nowMs) {
      loginAttempts.set(key, { count: 0, resetAt: nowMs + LOGIN_WINDOW_MS });
    }

    const user = db.findOne('users', (u) => u.email === normalizedEmail);
    if (!user) {
      const current = loginAttempts.get(key)!;
      current.count += 1;
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    const isMatch = password.length <= 72 && bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      const current = loginAttempts.get(key)!;
      current.count += 1;
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ASAKO_ALLOW_DEMO_ACCOUNTS !== 'true' &&
      isDemoAccount(user.email.toLowerCase())
    ) {
      res.status(403).json({ error: 'Demo accounts are disabled in production.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'This account has been suspended. Please contact administrator.' });
      return;
    }
    loginAttempts.delete(key);

    // Fetch associated profile name and organization
    let name = user.email.split('@')[0];
    let organization: string | undefined;

    if (user.role === 'student') {
      const p = db.findOne('student_profiles', (sp) => sp.user_id === user.id);
      if (p) {
        name = p.full_name;
        organization = p.institution;
      }
    } else if (user.role === 'company') {
      const p = db.findOne('company_profiles', (cp) => cp.user_id === user.id);
      if (p) {
        name = p.contact_person || p.company_name;
        organization = p.company_name;
      }
    } else if (user.role === 'institute') {
      const p = db.findOne('institute_profiles', (ip) => ip.user_id === user.id);
      if (p) {
        name = p.contact_person || p.institute_name;
        organization = p.institute_name;
      }
    } else if (user.role === 'provider') {
      const p = db.findOne('provider_profiles', (pp) => pp.user_id === user.id);
      if (p) {
        name = p.provider_name;
        organization = p.provider_name;
      }
    } else if (user.role === 'consumer') {
      const p = db.findOne('consumer_profiles', (cp) => cp.user_id === user.id);
      if (p) {
        name = p.full_name;
      }
    } else if (user.role === 'admin') {
      name = 'ASAKO Administrator';
      organization = 'ASAKO Global Authority';
    }

    const token = generateToken(user);

    res.cookie('asako_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        name,
        organization,
      },
    });
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res: Response) => {
  res.clearCookie('asako_token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = db.findById('users', req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let profileData: any = null;
  let name = user.email.split('@')[0];
  let organization: string | undefined;

  if (user.role === 'student') {
    profileData = db.findOne('student_profiles', (sp) => sp.user_id === user.id);
    if (profileData) {
      name = profileData.full_name;
      organization = profileData.institution;
    }
  } else if (user.role === 'company') {
    profileData = db.findOne('company_profiles', (cp) => cp.user_id === user.id);
    if (profileData) {
      name = profileData.contact_person || profileData.company_name;
      organization = profileData.company_name;
    }
  } else if (user.role === 'institute') {
    profileData = db.findOne('institute_profiles', (ip) => ip.user_id === user.id);
    if (profileData) {
      name = profileData.contact_person || profileData.institute_name;
      organization = profileData.institute_name;
    }
  } else if (user.role === 'provider') {
    profileData = db.findOne('provider_profiles', (pp) => pp.user_id === user.id);
    if (profileData) {
      name = profileData.provider_name;
      organization = profileData.provider_name;
    }
  } else if (user.role === 'consumer') {
    profileData = db.findOne('consumer_profiles', (cp) => cp.user_id === user.id);
    if (profileData) {
      name = profileData.full_name;
    }
  } else if (user.role === 'admin') {
    name = 'ASAKO Administrator';
    organization = 'ASAKO Global Authority';
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name,
      organization,
    },
    profile: profileData,
  });
});

// PUT /api/auth/update-password
router.put('/update-password', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      res.status(400).json({ error: 'New password must be between 8 and 72 characters in length.' });
      return;
    }

    const user = db.findById('users', req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ error: 'Incorrect current password.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(newPassword, salt);
    db.update('users', user.id, { password_hash });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[Auth] Password update failed:', error);
    res.status(500).json({ error: 'Failed to update password. Please try again.' });
  }
});

export default router;
