import { Router, Request, Response } from 'express';
import { createId, db, WorkshopRegistrationRecord } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { serializeWorkshop } from '../lib/serializers';

const router = Router();

// GET /api/workshops (Authenticated Discovery with Search & Filter)
router.get('/', requireAuth, (req: Request, res: Response) => {
  const { search, category, level, format } = req.query;

  let results = db.findMany('workshops', (ws) => ws.status === 'published');

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (ws) =>
        ws.title.toLowerCase().includes(q) ||
        ws.provider_name.toLowerCase().includes(q) ||
        ws.overview.toLowerCase().includes(q) ||
        ws.instructor.name.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter((ws) => ws.category.toLowerCase() === category.toLowerCase());
  }

  if (level && typeof level === 'string' && level !== 'All') {
    results = results.filter((ws) => ws.level.toLowerCase() === level.toLowerCase());
  }

  if (format && typeof format === 'string' && format !== 'All') {
    results = results.filter((ws) => ws.format.toLowerCase() === format.toLowerCase());
  }

  const total = results.length;
  const offsetValue = Number(req.query.offset ?? 0);
  const limitValue = Number(req.query.limit ?? 50);
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;
  const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 50;
  res.json({ workshops: results.slice(offset, offset + limit).map(serializeWorkshop), total, offset, limit });
});

// GET /api/workshops/:id
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const ws = db.findById('workshops', req.params.id);
  if (!ws || ws.status !== 'published') {
    res.status(404).json({ error: 'Workshop not found.' });
    return;
  }
  res.json({ workshop: serializeWorkshop(ws) });
});

// POST /api/workshops/:id/register (Enroll in workshop with capacity validation)
router.post('/:id/register', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const ws = db.findById('workshops', req.params.id);
    if (!ws) {
      res.status(404).json({ error: 'Workshop not found.' });
      return;
    }

    if (ws.status !== 'published') {
      res.status(400).json({ error: 'This workshop is not accepting active enrollments.' });
      return;
    }

    // Duplicate check
    const existing = db.findOne(
      'workshop_registrations',
      (r) => r.workshop_id === ws.id && r.user_id === req.user!.id
    );

    if (existing?.status === 'confirmed') {
      res.status(409).json({ error: 'You are already registered for this masterclass.', registration: existing });
      return;
    }

    // Capacity validation
    if (ws.seats_booked >= ws.seats_total) {
      res.status(400).json({ error: 'Capacity reached. This workshop cohort is fully booked.' });
      return;
    }

    let userName = req.user!.email;
    if (req.user!.role === 'student') {
      userName = db.findOne('student_profiles', (profile) => profile.user_id === req.user!.id)?.full_name || userName;
    } else if (req.user!.role === 'consumer') {
      userName = db.findOne('consumer_profiles', (profile) => profile.user_id === req.user!.id)?.full_name || userName;
    }
    const now = new Date().toISOString();

    const newReg: WorkshopRegistrationRecord = {
      id: existing?.id || createId('wsreg'),
      workshop_id: ws.id,
      user_id: req.user!.id,
      participant_name: userName,
      participant_email: req.user!.email,
      status: 'confirmed',
      registered_at: now,
    };

    db.transaction(() => {
      if (existing) {
        db.update('workshop_registrations', existing.id, newReg);
      } else {
        db.insert('workshop_registrations', newReg);
      }
      db.update('workshops', ws.id, { seats_booked: ws.seats_booked + 1 });
      db.insert('notifications', {
        id: createId('notif'),
        user_id: ws.provider_id,
        title: 'New Workshop Registration',
        message: `${userName} has registered for "${ws.title}".`,
        type: 'workshop_alert',
        is_read: false,
        link: '/dashboard',
        created_at: now,
      });
      db.insert('notifications', {
        id: createId('notif'),
        user_id: req.user!.id,
        title: 'Workshop registration confirmed',
        message: `Your registration for "${ws.title}" is confirmed.`,
        type: 'workshop_alert',
        is_read: false,
        link: '/workshops',
        created_at: now,
      });
    });

    res.status(201).json({
      message: 'Registration confirmed successfully.',
      registration: newReg,
    });
  } catch (error) {
    console.error('[Workshops] Registration failed:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/workshops/:id/cancel
router.post('/:id/cancel', requireAuth, (req: AuthRequest, res: Response) => {
  const ws = db.findById('workshops', req.params.id);
  if (!ws) {
    res.status(404).json({ error: 'Workshop not found.' });
    return;
  }

  const existing = db.findOne(
    'workshop_registrations',
    (r) => r.workshop_id === ws.id && r.user_id === req.user!.id && r.status === 'confirmed'
  );

  if (!existing) {
    res.status(404).json({ error: 'No active registration found for this workshop.' });
    return;
  }

  db.transaction(() => {
    db.update('workshop_registrations', existing.id, { status: 'cancelled' });
    db.update('workshops', ws.id, { seats_booked: Math.max(0, ws.seats_booked - 1) });
  });

  res.json({ message: 'Registration cancelled.' });
});

export default router;
