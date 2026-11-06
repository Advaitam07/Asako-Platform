import { Router, Response } from 'express';
import { createId, db, InstitutePartnershipRecord } from '../db/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { serializeInstitutePartnership } from '../lib/serializers';

const router = Router();

router.use(requireAuth);
router.use(requireRole('institute'));

// GET /api/institutes/profile
router.get('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('institute_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Institute profile not found.' });
    return;
  }
  res.json({ profile });
});

// PUT /api/institutes/profile
router.put('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('institute_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Institute profile not found.' });
    return;
  }

  const {
    institute_name,
    accreditation_status,
    campus_location,
    website,
    contact_person,
    contact_email,
    phone,
    established_year,
    student_count,
  } = req.body;

  const stringFields: Record<string, unknown> = {
    institute_name,
    accreditation_status,
    campus_location,
    website,
    contact_person,
    contact_email,
    phone,
    established_year,
  };
  for (const [field, value] of Object.entries(stringFields)) {
    if (value !== undefined && (typeof value !== 'string' || value.length > 500)) {
      res.status(400).json({ error: `Invalid value for ${field}.` });
      return;
    }
  }
  if (
    student_count !== undefined &&
    (!Number.isInteger(student_count) || student_count < 0 || student_count > 10000000)
  ) {
    res.status(400).json({ error: 'student_count must be a non-negative whole number.' });
    return;
  }
  if (website !== undefined && website !== '' && !/^https?:\/\/\S+$/i.test(website)) {
    res.status(400).json({ error: 'website must be a valid HTTP(S) URL.' });
    return;
  }

  const updated = db.update('institute_profiles', profile.id, {
    ...(institute_name !== undefined && { institute_name }),
    ...(accreditation_status !== undefined && { accreditation_status }),
    ...(campus_location !== undefined && { campus_location }),
    ...(website !== undefined && { website }),
    ...(contact_person !== undefined && { contact_person }),
    ...(contact_email !== undefined && { contact_email }),
    ...(phone !== undefined && { phone }),
    ...(established_year !== undefined && { established_year }),
    ...(student_count !== undefined && { student_count }),
  });

  res.json({ message: 'Institute profile updated successfully', profile: updated });
});

// GET /api/institutes/partnerships
router.get('/partnerships', (req: AuthRequest, res: Response) => {
  const list = db.findMany('institute_partnerships', (p) => p.institute_id === req.user!.id);
  res.json({ partnerships: list.map(serializeInstitutePartnership) });
});

// POST /api/institutes/partnerships
router.post('/partnerships', (req: AuthRequest, res: Response) => {
  const { partnerCompany, initiative, studentsInvolved, term } = req.body;

  if (
    typeof partnerCompany !== 'string' ||
    !partnerCompany.trim() ||
    partnerCompany.length > 180 ||
    typeof initiative !== 'string' ||
    !initiative.trim() ||
    initiative.length > 3000 ||
    typeof term !== 'string' ||
    !term.trim() ||
    term.length > 100 ||
    (studentsInvolved !== undefined &&
      (!Number.isInteger(studentsInvolved) || studentsInvolved < 0 || studentsInvolved > 100000))
  ) {
    res.status(400).json({ error: 'partnerCompany, initiative, term, and a valid student count are required.' });
    return;
  }

  const profile = db.findOne('institute_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Institute profile not found.' });
    return;
  }
  if (req.user!.role !== 'admin' && profile.verification_status !== 'approved') {
    res.status(403).json({ error: 'Institute verification is required before requesting partnerships.' });
    return;
  }
  const instName = profile.institute_name;

  const now = new Date().toISOString();
  const newPart: InstitutePartnershipRecord = {
    id: createId('part'),
    institute_id: req.user!.id,
    institution_name: instName,
    partner_company: partnerCompany.trim(),
    initiative: initiative.trim(),
    students_involved: studentsInvolved ?? 0,
    status: 'Under Review',
    term: term.trim(),
    created_at: now,
    updated_at: now,
  };

  db.insert('institute_partnerships', newPart);

  res.status(201).json({
    message: 'Partnership request submitted for review.',
    partnership: serializeInstitutePartnership(newPart),
  });
});

export default router;
