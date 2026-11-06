import { Router, Response } from 'express';
import { createId, db, WorkshopRecord } from '../db/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { serializeWorkshop } from '../lib/serializers';

const router = Router();

router.use(requireAuth);
router.use(requireRole('provider'));

// GET /api/providers/profile
router.get('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('provider_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Provider profile not found.' });
    return;
  }
  res.json({ profile });
});

// PUT /api/providers/profile
router.put('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('provider_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Provider profile not found.' });
    return;
  }

  const { provider_name, specialization, bio, website, contact_email, phone, accreditation_status } =
    req.body;

  const updated = db.update('provider_profiles', profile.id, {
    ...(provider_name !== undefined && { provider_name }),
    ...(specialization !== undefined && { specialization }),
    ...(bio !== undefined && { bio }),
    ...(website !== undefined && { website }),
    ...(contact_email !== undefined && { contact_email }),
    ...(phone !== undefined && { phone }),
    ...(accreditation_status !== undefined && { accreditation_status }),
  });

  res.json({ message: 'Provider profile updated successfully', profile: updated });
});

// GET /api/providers/workshops
router.get('/workshops', (req: AuthRequest, res: Response) => {
  const list = db.findMany('workshops', (ws) => ws.provider_id === req.user!.id);
  res.json({ workshops: list.map(serializeWorkshop) });
});

// POST /api/providers/workshops
router.post('/workshops', (req: AuthRequest, res: Response) => {
  const {
    title,
    category,
    level,
    format,
    schedule,
    duration,
    price,
    seatsTotal,
    instructor,
    overview,
    syllabus,
    venueOrLink,
  } = req.body;

  const allowedCategories = ['Tech & Architecture', 'Design Systems', 'Business Innovation', 'AI Engineering', 'Career Growth'];
  const allowedLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const allowedFormats = ['Live Interactive', 'Hands-on Bootcamp', 'Executive Masterclass'];
  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.length > 180 ||
    typeof category !== 'string' ||
    !allowedCategories.includes(category) ||
    typeof overview !== 'string' ||
    !overview.trim() ||
    overview.length > 10000 ||
    (level !== undefined && !allowedLevels.includes(level)) ||
    (format !== undefined && !allowedFormats.includes(format)) ||
    (seatsTotal !== undefined &&
      (!Number.isInteger(Number(seatsTotal)) || Number(seatsTotal) < 1 || Number(seatsTotal) > 10000)) ||
    (syllabus !== undefined &&
      (!Array.isArray(syllabus) ||
        syllabus.length > 50 ||
        syllabus.some((item: unknown) => typeof item !== 'string' || item.length > 500)))
  ) {
    res.status(400).json({ error: 'Title, category, and overview are required.' });
    return;
  }

  const profile = db.findOne('provider_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Provider profile not found.' });
    return;
  }
  if (req.user!.role !== 'admin' && profile.verification_status !== 'approved') {
    res.status(403).json({ error: 'Provider verification is required before publishing workshops.' });
    return;
  }
  const provName = profile.provider_name;

  const now = new Date().toISOString();
  const newWs: WorkshopRecord = {
    id: createId('ws'),
    provider_id: req.user!.id,
    title,
    provider_name: provName,
    category: category || 'Tech & Architecture',
    level: level || 'Intermediate',
    format: format || 'Hands-on Bootcamp',
    schedule: schedule || 'Upcoming Weekend Schedule',
    duration: duration || '12 Hours',
    price: price || '€150',
    seats_total: seatsTotal === undefined ? 30 : Number(seatsTotal),
    seats_booked: 0,
    instructor: instructor || {
      name: profile?.provider_name || 'Lead Instructor',
      role: 'Masterclass Instructor',
      affiliation: provName,
    },
    overview,
    syllabus: Array.isArray(syllabus)
      ? syllabus
      : ['Module 1: Foundations & Architecture', 'Module 2: Practical Implementation'],
    status: 'published',
    venue_or_link: venueOrLink || '',
    deadline: 'Registration Open',
    created_at: now,
    updated_at: now,
  };

  db.insert('workshops', newWs);

  res.status(201).json({ message: 'Workshop published successfully.', workshop: serializeWorkshop(newWs) });
});

// PUT /api/providers/workshops/:id
router.put('/workshops/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const ws = db.findById('workshops', id);

  if (!ws) {
    res.status(404).json({ error: 'Workshop not found.' });
    return;
  }

  if (ws.provider_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: You do not own this workshop.' });
    return;
  }

  const allowedUpdates: Record<string, keyof WorkshopRecord> = {
    title: 'title',
    category: 'category',
    level: 'level',
    format: 'format',
    schedule: 'schedule',
    duration: 'duration',
    price: 'price',
    seatsTotal: 'seats_total',
    instructor: 'instructor',
    overview: 'overview',
    syllabus: 'syllabus',
    venueOrLink: 'venue_or_link',
    deadline: 'deadline',
    status: 'status',
  };
  const persistedUpdates: Partial<WorkshopRecord> = {};
  for (const [key, value] of Object.entries(req.body)) {
    const field = allowedUpdates[key];
    if (field) {
      (persistedUpdates as Record<string, unknown>)[field] = value;
    }
  }
  if (Object.keys(persistedUpdates).length === 0) {
    res.status(400).json({ error: 'No editable workshop fields were provided.' });
    return;
  }
  if (
    (persistedUpdates.status !== undefined && !['draft', 'published', 'cancelled', 'completed'].includes(persistedUpdates.status)) ||
    (persistedUpdates.seats_total !== undefined &&
      (!Number.isInteger(persistedUpdates.seats_total) ||
        persistedUpdates.seats_total < ws.seats_booked ||
        persistedUpdates.seats_total > 10000))
  ) {
    res.status(400).json({ error: 'Workshop updates are invalid.' });
    return;
  }

  const updated = db.update('workshops', id, persistedUpdates);
  res.json({ message: 'Workshop updated successfully', workshop: serializeWorkshop(updated!) });
});

// DELETE /api/providers/workshops/:id
router.delete('/workshops/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const ws = db.findById('workshops', id);

  if (!ws) {
    res.status(404).json({ error: 'Workshop not found.' });
    return;
  }

  if (ws.provider_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: You do not own this workshop.' });
    return;
  }

  db.update('workshops', id, { status: 'cancelled' });
  res.json({ message: 'Workshop cancelled successfully' });
});

// GET /api/providers/workshops/:id/attendees
router.get('/workshops/:id/attendees', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const ws = db.findById('workshops', id);

  if (!ws) {
    res.status(404).json({ error: 'Workshop not found.' });
    return;
  }

  if (ws.provider_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: You do not manage this workshop roster.' });
    return;
  }

  const attendees = db.findMany('workshop_registrations', (r) => r.workshop_id === id);
  res.json({ attendees });
});

export default router;
