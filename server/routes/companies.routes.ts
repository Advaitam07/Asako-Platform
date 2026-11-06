import { Router, Response } from 'express';
import { createId, db, OpportunityRecord } from '../db/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { serializeApplication, serializeOpportunity } from '../lib/serializers';

const router = Router();

router.use(requireAuth);
router.use(requireRole('company'));

// GET /api/companies/profile
router.get('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('company_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Company profile not found.' });
    return;
  }
  res.json({ profile });
});

// PUT /api/companies/profile
router.put('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('company_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Company profile not found.' });
    return;
  }

  const {
    company_name,
    industry,
    company_size,
    headquarters,
    website,
    contact_person,
    contact_email,
    description,
    logo_url,
  } = req.body;

  const stringFields: Record<string, unknown> = {
    company_name,
    industry,
    company_size,
    headquarters,
    website,
    contact_person,
    contact_email,
    description,
    logo_url,
  };
  for (const [field, value] of Object.entries(stringFields)) {
    if (value !== undefined && (typeof value !== 'string' || value.length > (field === 'description' ? 10000 : 500))) {
      res.status(400).json({ error: `Invalid value for ${field}.` });
      return;
    }
  }
  for (const url of [website, logo_url]) {
    if (url !== undefined && url !== '' && !/^https?:\/\/\S+$/i.test(url)) {
      res.status(400).json({ error: 'Website and logo must be valid HTTP(S) URLs.' });
      return;
    }
  }

  const updated = db.update('company_profiles', profile.id, {
    ...(company_name !== undefined && { company_name }),
    ...(industry !== undefined && { industry }),
    ...(company_size !== undefined && { company_size }),
    ...(headquarters !== undefined && { headquarters }),
    ...(website !== undefined && { website }),
    ...(contact_person !== undefined && { contact_person }),
    ...(contact_email !== undefined && { contact_email }),
    ...(description !== undefined && { description }),
    ...(logo_url !== undefined && { logo_url }),
  });

  res.json({ message: 'Company profile updated successfully', profile: updated });
});

// GET /api/companies/opportunities
router.get('/opportunities', (req: AuthRequest, res: Response) => {
  const opps = db.findMany('opportunities', (o) => o.company_id === req.user!.id);
  res.json({ opportunities: opps.map(serializeOpportunity) });
});

// POST /api/companies/opportunities
router.post('/opportunities', (req: AuthRequest, res: Response) => {
  const {
    title,
    location,
    type,
    category,
    compensation,
    duration,
    description,
    requirements,
    skills,
    isRemote,
    applicationDeadline,
  } = req.body;

  const allowedTypes = ['Internship', 'Full-time', 'Freelance', 'Part-time'];
  const allowedCategories = [
    'Software Engineering',
    'Design & Creative',
    'AI & Data Science',
    'Product & Growth',
    'Business & Marketing',
    'Research',
  ];
  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.length > 180 ||
    typeof category !== 'string' ||
    !allowedCategories.includes(category) ||
    typeof description !== 'string' ||
    !description.trim() ||
    description.length > 10000 ||
    (type !== undefined && !allowedTypes.includes(type)) ||
    (isRemote !== undefined && typeof isRemote !== 'boolean') ||
    (requirements !== undefined &&
      (!Array.isArray(requirements) ||
        requirements.length > 30 ||
        requirements.some((item: unknown) => typeof item !== 'string' || item.length > 500))) ||
    (skills !== undefined &&
      (!Array.isArray(skills) ||
        skills.length > 50 ||
        skills.some((item: unknown) => typeof item !== 'string' || item.length > 100)))
  ) {
    res.status(400).json({ error: 'Opportunity details are invalid.' });
    return;
  }

  const profile = db.findOne('company_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Company profile not found.' });
    return;
  }
  if (req.user!.role !== 'admin' && profile.verification_status !== 'approved') {
    res.status(403).json({ error: 'Company verification is required before publishing opportunities.' });
    return;
  }

  if (applicationDeadline !== undefined && (typeof applicationDeadline !== 'string' || applicationDeadline.length > 100)) {
    res.status(400).json({ error: 'Application deadline is invalid.' });
    return;
  }

  if (!title || !category || !description) {
    res.status(400).json({ error: 'Title, category, and description are required.' });
    return;
  }

  const companyName = profile.company_name;

  const now = new Date().toISOString();
  const newOpp: OpportunityRecord = {
    id: createId('opp'),
    company_id: req.user!.id,
    title,
    company_name: companyName,
    location: location || 'Zurich / Remote',
    type: type || 'Internship',
    category: category || 'Software Engineering',
    compensation: compensation || 'Competitive Compensation',
    duration: duration || '3-6 Months',
    description,
    requirements: Array.isArray(requirements) ? requirements : ['Strong academic or portfolio standing'],
    skills: Array.isArray(skills) ? skills : ['TypeScript', 'Communication'],
    is_remote: isRemote ?? false,
    status: 'active',
    posted_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    application_deadline: applicationDeadline || 'Open until filled',
    created_at: now,
    updated_at: now,
  };

  db.insert('opportunities', newOpp);

  res.status(201).json({ message: 'Opportunity posted successfully', opportunity: serializeOpportunity(newOpp) });
});

// PUT /api/companies/opportunities/:id
router.put('/opportunities/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const opp = db.findById('opportunities', id);

  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }

  // STRICT OWNERSHIP CHECK: Only the company that posted this opportunity can edit it
  if (opp.company_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: You do not own this opportunity listing.' });
    return;
  }

  const updates = req.body;
  const allowedUpdates: Record<string, keyof OpportunityRecord> = {
    title: 'title',
    location: 'location',
    type: 'type',
    category: 'category',
    compensation: 'compensation',
    duration: 'duration',
    description: 'description',
    requirements: 'requirements',
    skills: 'skills',
    isRemote: 'is_remote',
    applicationDeadline: 'application_deadline',
    status: 'status',
  };
  const persistedUpdates: Partial<OpportunityRecord> = {};
  for (const [key, value] of Object.entries(updates)) {
    const field = allowedUpdates[key];
    if (field) {
      (persistedUpdates as Record<string, unknown>)[field] = value;
    }
  }
  if (Object.keys(persistedUpdates).length === 0) {
    res.status(400).json({ error: 'No editable opportunity fields were provided.' });
    return;
  }
  if (
    (persistedUpdates.title !== undefined && (typeof persistedUpdates.title !== 'string' || !persistedUpdates.title.trim() || persistedUpdates.title.length > 180)) ||
    (persistedUpdates.description !== undefined && (typeof persistedUpdates.description !== 'string' || persistedUpdates.description.length > 10000)) ||
    (persistedUpdates.status !== undefined && !['active', 'closed', 'draft'].includes(persistedUpdates.status)) ||
    (persistedUpdates.is_remote !== undefined && typeof persistedUpdates.is_remote !== 'boolean')
  ) {
    res.status(400).json({ error: 'Opportunity updates are invalid.' });
    return;
  }

  if (
    (persistedUpdates.type !== undefined &&
      !['Internship', 'Full-time', 'Freelance', 'Part-time'].includes(persistedUpdates.type)) ||
    (persistedUpdates.category !== undefined &&
      !['Software Engineering', 'Design & Creative', 'AI & Data Science', 'Product & Growth', 'Business & Marketing', 'Research'].includes(persistedUpdates.category)) ||
    (persistedUpdates.requirements !== undefined &&
      (!Array.isArray(persistedUpdates.requirements) ||
        persistedUpdates.requirements.length > 30 ||
        persistedUpdates.requirements.some((item) => typeof item !== 'string' || item.length > 500))) ||
    (persistedUpdates.skills !== undefined &&
      (!Array.isArray(persistedUpdates.skills) ||
        persistedUpdates.skills.length > 50 ||
        persistedUpdates.skills.some((item) => typeof item !== 'string' || item.length > 100)))
  ) {
    res.status(400).json({ error: 'Opportunity updates are invalid.' });
    return;
  }
  const updated = db.update('opportunities', id, persistedUpdates);
  res.json({ message: 'Opportunity updated successfully', opportunity: serializeOpportunity(updated!) });
});

// DELETE /api/companies/opportunities/:id
router.delete('/opportunities/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const opp = db.findById('opportunities', id);

  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }

  if (opp.company_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: You do not own this opportunity listing.' });
    return;
  }

  db.update('opportunities', id, { status: 'closed' });
  res.json({ message: 'Opportunity closed successfully' });
});

// GET /api/companies/applications (All applications for opportunities owned by this company)
router.get('/applications', (req: AuthRequest, res: Response) => {
  const companyOpps = db.findMany('opportunities', (o) => o.company_id === req.user!.id);
  const companyOppIds = new Set(companyOpps.map((o) => o.id));

  // Filter applications belonging only to this company's listings
  const receivedApps = db.findMany('applications', (app) => companyOppIds.has(app.opportunity_id));

  const enriched = receivedApps.map((app) => {
    const opp = companyOpps.find((o) => o.id === app.opportunity_id);
    const studentProfile = db.findOne('student_profiles', (sp) => sp.user_id === app.student_id);

    return serializeApplication(app, opp, {
      studentInstitution: studentProfile?.institution || '',
      studentSkills: studentProfile?.skills || [],
    });
  });

  res.json({ applications: enriched });
});

// PUT /api/companies/applications/:id/status
router.put('/applications/:id/status', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const app = db.findById('applications', id);
  if (!app) {
    res.status(404).json({ error: 'Application record not found.' });
    return;
  }

  // Verify ownership of the target opportunity
  const opp = db.findById('opportunities', app.opportunity_id);
  if (!opp || (opp.company_id !== req.user!.id && req.user!.role !== 'admin')) {
    res.status(403).json({ error: 'Forbidden: You do not manage the opportunity for this application.' });
    return;
  }

  if (note !== undefined && (typeof note !== 'string' || note.length > 1000)) {
    res.status(400).json({ error: 'Status note is invalid.' });
    return;
  }

  const now = new Date().toISOString();
  let updated = app;
  db.transaction(() => {
    updated = db.update('applications', id, { status }) || app;
    db.insert('notifications', {
      id: createId('notif'),
      user_id: app.student_id,
      title: `Application Status: ${status}`,
      message: `${opp.company_name} updated your application for "${opp.title}" to ${status}.${note ? ` ${note}` : ''}`,
      type: 'application_status',
      is_read: false,
      link: '/dashboard',
      created_at: now,
    });
  });

  res.json({
    message: `Application status updated to ${status}`,
    application: serializeApplication(updated!, opp),
  });
});

export default router;
