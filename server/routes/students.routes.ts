import { Router, Response } from 'express';
import { createId, db } from '../db/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { serializeApplication, serializeOpportunity, serializeWorkshop } from '../lib/serializers';

const router = Router();

// Apply auth & student role check to all student endpoints
router.use(requireAuth);
router.use(requireRole('student'));

// GET /api/students/profile
router.get('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('student_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Student profile not found.' });
    return;
  }
  res.json({ profile });
});

// PUT /api/students/profile
router.put('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('student_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Student profile not found.' });
    return;
  }

  const {
    full_name,
    headline,
    bio,
    phone,
    location,
    institution,
    degree,
    field_of_study,
    graduation_year,
    gpa,
    skills,
    github_url,
    linkedin_url,
    portfolio_url,
  } = req.body;

  const stringFields: Record<string, unknown> = {
    full_name,
    headline,
    bio,
    phone,
    location,
    institution,
    degree,
    field_of_study,
    graduation_year,
    gpa,
    github_url,
    linkedin_url,
    portfolio_url,
  };
  for (const [field, value] of Object.entries(stringFields)) {
    if (value !== undefined && (typeof value !== 'string' || value.length > (field === 'bio' ? 5000 : 500))) {
      res.status(400).json({ error: `Invalid value for ${field}.` });
      return;
    }
  }
  if (
    skills !== undefined &&
    (!Array.isArray(skills) ||
      skills.length > 50 ||
      skills.some((skill: unknown) => typeof skill !== 'string' || skill.length > 80))
  ) {
    res.status(400).json({ error: 'Skills must be a list of up to 50 short text values.' });
    return;
  }

  const updated = db.update('student_profiles', profile.id, {
    ...(full_name !== undefined && { full_name }),
    ...(headline !== undefined && { headline }),
    ...(bio !== undefined && { bio }),
    ...(phone !== undefined && { phone }),
    ...(location !== undefined && { location }),
    ...(institution !== undefined && { institution }),
    ...(degree !== undefined && { degree }),
    ...(field_of_study !== undefined && { field_of_study }),
    ...(graduation_year !== undefined && { graduation_year }),
    ...(gpa !== undefined && { gpa }),
    ...(skills !== undefined && { skills }),
    ...(github_url !== undefined && { github_url }),
    ...(linkedin_url !== undefined && { linkedin_url }),
    ...(portfolio_url !== undefined && { portfolio_url }),
  });

  res.json({ message: 'Profile updated successfully', profile: updated });
});

// GET /api/students/applications
router.get('/applications', (req: AuthRequest, res: Response) => {
  const studentApps = db.findMany('applications', (app) => app.student_id === req.user!.id);

  // Join opportunity details for rich frontend rendering
  const enriched = studentApps.map((app) => {
    const opp = db.findById('opportunities', app.opportunity_id);
    return serializeApplication(app, opp);
  });

  res.json({ applications: enriched });
});

// GET /api/students/saved-opportunities
router.get('/saved-opportunities', (req: AuthRequest, res: Response) => {
  const savedRecords = db.findMany('saved_opportunities', (s) => s.student_id === req.user!.id);
  const opps = savedRecords
    .map((s) => db.findById('opportunities', s.opportunity_id))
    .filter((opportunity) => opportunity?.status === 'active')
    .map((opportunity) => serializeOpportunity(opportunity!));

  res.json({ savedOpportunities: opps });
});

// POST /api/students/saved-opportunities
router.post('/saved-opportunities', (req: AuthRequest, res: Response) => {
  const { opportunityId } = req.body;
  if (!opportunityId) {
    res.status(400).json({ error: 'opportunityId is required.' });
    return;
  }

  const opp = db.findById('opportunities', opportunityId);
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }

  const existing = db.findOne(
    'saved_opportunities',
    (s) => s.student_id === req.user!.id && s.opportunity_id === opportunityId
  );

  if (existing) {
    res.json({ message: 'Opportunity already saved', saved: existing });
    return;
  }

  const saved = db.insert('saved_opportunities', {
    id: createId('saved'),
    student_id: req.user!.id,
    opportunity_id: opportunityId,
    saved_at: new Date().toISOString(),
  });

  res.status(201).json({ message: 'Opportunity saved successfully', saved });
});

// DELETE /api/students/saved-opportunities/:id
router.delete('/saved-opportunities/:opportunityId', (req: AuthRequest, res: Response) => {
  const { opportunityId } = req.params;
  const existing = db.findOne(
    'saved_opportunities',
    (s) => s.student_id === req.user!.id && s.opportunity_id === opportunityId
  );

  if (existing) {
    db.delete('saved_opportunities', existing.id);
  }

  res.json({ message: 'Opportunity removed from saved list' });
});

// GET /api/students/workshops
router.get('/workshops', (req: AuthRequest, res: Response) => {
  const registrations = db.findMany(
    'workshop_registrations',
    (r) => r.user_id === req.user!.id && r.status === 'confirmed'
  );

  const workshops = registrations
    .map((r) => {
      const ws = db.findById('workshops', r.workshop_id);
      return ws ? { ...serializeWorkshop(ws), registrationDate: r.registered_at } : null;
    })
    .filter(Boolean);

  res.json({ workshops });
});

export default router;
