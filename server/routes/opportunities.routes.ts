import { Router, Request, Response } from 'express';
import { createId, db, ApplicationRecord } from '../db/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { serializeApplication, serializeOpportunity } from '../lib/serializers';

const router = Router();

// GET /api/opportunities (Public discovery with Search & Filters)
router.get('/', (req: Request, res: Response) => {
  const { search, category, type, isRemote } = req.query;

  let results = db.findMany('opportunities', (o) => o.status === 'active');

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.company_name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter((o) => o.category.toLowerCase() === category.toLowerCase());
  }

  if (type && typeof type === 'string' && type !== 'All') {
    results = results.filter((o) => o.type.toLowerCase() === type.toLowerCase());
  }

  if (isRemote !== undefined) {
    const remoteBool = isRemote === 'true';
    results = results.filter((o) => o.is_remote === remoteBool);
  }

  const total = results.length;
  const offsetValue = Number(req.query.offset ?? 0);
  const limitValue = Number(req.query.limit ?? 50);
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;
  const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 50;
  res.json({
    opportunities: results.slice(offset, offset + limit).map(serializeOpportunity),
    total,
    offset,
    limit,
  });
});

// GET /api/opportunities/:id
router.get('/:id', (req: Request, res: Response) => {
  const opp = db.findById('opportunities', req.params.id);
  if (!opp || opp.status !== 'active') {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }
  res.json({ opportunity: serializeOpportunity(opp) });
});

// POST /api/opportunities/:id/apply (Authenticated Student Application)
router.post('/:id/apply', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  try {
    const opp = db.findById('opportunities', req.params.id);
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found.' });
      return;
    }

    if (opp.status !== 'active') {
      res.status(400).json({ error: 'This opportunity listing is closed or inactive.' });
      return;
    }

    const studentProfile = db.findOne('student_profiles', (p) => p.user_id === req.user!.id);
    if (!studentProfile) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const { coverNote, portfolioLinks } = req.body;
    if (
      (coverNote !== undefined && (typeof coverNote !== 'string' || coverNote.length > 5000)) ||
      (portfolioLinks !== undefined &&
        (!Array.isArray(portfolioLinks) ||
          portfolioLinks.length > 10 ||
          portfolioLinks.some((link: unknown) => typeof link !== 'string' || link.length > 2048)))
    ) {
      res.status(400).json({ error: 'Application details are invalid.' });
      return;
    }
    const candidateName = studentProfile.full_name;

    // Check duplicate application
    const existing = db.findOne(
      'applications',
      (a) => a.opportunity_id === opp.id && a.student_id === req.user!.id
    );

    if (existing) {
      res.status(409).json({ error: 'You have already applied to this opportunity.', application: existing });
      return;
    }

    const now = new Date().toISOString();

    const newApp: ApplicationRecord = {
      id: createId('app'),
      opportunity_id: opp.id,
      student_id: req.user!.id,
      student_name: candidateName,
      student_email: req.user!.email,
      resume_url: studentProfile.resume_url,
      cover_note: typeof coverNote === 'string' ? coverNote.trim() : '',
      portfolio_links: Array.isArray(portfolioLinks) ? portfolioLinks : [],
      status: 'Applied',
      applied_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      updated_at: now,
    };

    db.transaction(() => {
      db.insert('applications', newApp);
      db.insert('notifications', {
        id: createId('notif'),
        user_id: opp.company_id,
        title: 'New Candidate Application',
        message: `${candidateName} has submitted an application for "${opp.title}".`,
        type: 'application_status',
        is_read: false,
        link: '/dashboard',
        created_at: now,
      });
      db.insert('notifications', {
        id: createId('notif'),
        user_id: req.user!.id,
        title: 'Application Dispatched',
        message: `Your application for "${opp.title}" at ${opp.company_name} was submitted.`,
        type: 'application_status',
        is_read: false,
        link: '/dashboard',
        created_at: now,
      });
    });

    res.status(201).json({
      message: 'Application lodged successfully.',
      application: serializeApplication(newApp, opp),
    });
  } catch (error) {
    console.error('[Opportunities] Application submission failed:', error);
    res.status(500).json({ error: 'Application submission failed. Please try again.' });
  }
});

export default router;
