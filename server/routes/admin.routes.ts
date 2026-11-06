import { Router, Response } from 'express';
import { createId, db } from '../db/database';
import { requireAuth, requireRole, logAdminAction, AuthRequest } from '../middleware/auth';

const router = Router();

// Strictly enforce Admin authorization for all administrative endpoints
router.use(requireAuth);
router.use(requireRole('admin'));

// GET /api/admin/overview
router.get('/overview', (req: AuthRequest, res: Response) => {
  const usersCount = db.count('users');
  const studentsCount = db.count('student_profiles');
  const companiesCount = db.count('company_profiles');
  const institutesCount = db.count('institute_profiles');
  const providersCount = db.count('provider_profiles');
  const consumersCount = db.count('consumer_profiles');
  const opportunitiesCount = db.count('opportunities');
  const activeOpportunities = db.count('opportunities', (o) => o.status === 'active');
  const applicationsCount = db.count('applications');
  const workshopsCount = db.count('workshops');
  const pendingVerifications = db.count('verification_requests', (v) => v.status === 'pending');
  const auditLogsCount = db.count('audit_logs');

  res.json({
    metrics: {
      totalUsers: usersCount,
      students: studentsCount,
      companies: companiesCount,
      institutes: institutesCount,
      providers: providersCount,
      consumers: consumersCount,
      totalOpportunities: opportunitiesCount,
      activeOpportunities,
      totalApplications: applicationsCount,
      totalWorkshops: workshopsCount,
      pendingVerifications,
      auditLogsCount,
    },
  });
});

// GET /api/admin/users
router.get('/users', (req: AuthRequest, res: Response) => {
  const users = db.findMany('users').map((u) => {
    // Strip password hash from response
    const { password_hash, ...safeUser } = u;
    return safeUser;
  });
  res.json({ users });
});

// PUT /api/admin/users/:id/status (Suspend or Reactivate)
router.put('/users/:id/status', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['active', 'suspended', 'pending_verification'].includes(status)) {
    res.status(400).json({ error: 'Invalid user status.' });
    return;
  }

  const user = db.findById('users', id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  // Prevent suspending the master admin
  if (user.id === req.user!.id) {
    res.status(400).json({ error: 'Cannot alter your own administrative status.' });
    return;
  }

  if (reason !== undefined && (typeof reason !== 'string' || reason.length > 1000)) {
    res.status(400).json({ error: 'Status reason is invalid.' });
    return;
  }

  const updated = db.update('users', id, { status });

  logAdminAction(
    req.user!,
    'UPDATE_USER_STATUS',
    'users',
    id,
    { previousStatus: user.status, newStatus: status, reason: reason || 'Admin action' },
    req
  );

  const { password_hash: _passwordHash, ...safeUser } = updated!;
  res.json({ message: `User status changed to ${status}`, user: safeUser });
});

// GET /api/admin/verifications
router.get('/verifications', (req: AuthRequest, res: Response) => {
  const requests = db.findMany('verification_requests');
  res.json({ verifications: requests });
});

// PUT /api/admin/verifications/:id (Approve or Reject verification)
router.put('/verifications/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Status must be approved or rejected.' });
    return;
  }

  const request = db.findById('verification_requests', id);
  if (!request) {
    res.status(404).json({ error: 'Verification request not found.' });
    return;
  }
  if (request.status !== 'pending') {
    res.status(409).json({ error: 'This verification request has already been reviewed.' });
    return;
  }
  if (reviewNotes !== undefined && (typeof reviewNotes !== 'string' || reviewNotes.length > 2000)) {
    res.status(400).json({ error: 'Review notes are invalid.' });
    return;
  }

  const now = new Date().toISOString();
  db.transaction(() => {
    db.update('verification_requests', id, {
      status,
      reviewed_by: req.user!.id,
      review_notes: reviewNotes || `Decision recorded by ${req.user!.email}`,
      reviewed_at: now,
    });

    if (request.role === 'institute') {
      const prof = db.findOne('institute_profiles', (p) => p.user_id === request.user_id);
      if (prof) db.update('institute_profiles', prof.id, { verification_status: status });
    } else if (request.role === 'company') {
      const prof = db.findOne('company_profiles', (p) => p.user_id === request.user_id);
      if (prof) db.update('company_profiles', prof.id, { verification_status: status });
    } else if (request.role === 'provider') {
      const prof = db.findOne('provider_profiles', (p) => p.user_id === request.user_id);
      if (prof) db.update('provider_profiles', prof.id, { verification_status: status });
    }

    db.insert('notifications', {
      id: createId('notif'),
      user_id: request.user_id,
      title: `Verification Decision: ${status.toUpperCase()}`,
      message: `Your platform verification request has been ${status}. ${reviewNotes || ''}`.trim(),
      type: 'verification_update',
      is_read: false,
      link: '/dashboard',
      created_at: now,
    });

    logAdminAction(
      req.user!,
      'PROCESS_VERIFICATION',
      'verification_requests',
      id,
      { entityName: request.entity_name, decision: status, notes: reviewNotes },
      req
    );
  });

  res.json({ message: `Verification request ${status} successfully.` });
});

// PUT /api/admin/moderation/opportunities/:id
router.put('/moderation/opportunities/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const opp = db.findById('opportunities', id);
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }
  if (!['active', 'closed', 'draft', 'moderation_flagged'].includes(status)) {
    res.status(400).json({ error: 'Invalid opportunity moderation status.' });
    return;
  }

  db.update('opportunities', id, { status });

  logAdminAction(
    req.user!,
    'MODERATE_OPPORTUNITY',
    'opportunities',
    id,
    { previousStatus: opp.status, newStatus: status, note },
    req
  );

  res.json({ message: `Opportunity status updated to ${status}` });
});

router.put('/moderation/marketplace/:id', (req: AuthRequest, res: Response) => {
  const { status, note } = req.body;
  const allowedStatuses = ['active', 'archived', 'pending_review'];
  const listing = db.findById('marketplace_listings', req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Marketplace listing not found.' });
    return;
  }
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}.` });
    return;
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > 1000)) {
    res.status(400).json({ error: 'Moderation note is invalid.' });
    return;
  }

  db.transaction(() => {
    db.update('marketplace_listings', listing.id, { status });
    logAdminAction(
      req.user!,
      'MODERATE_MARKETPLACE_LISTING',
      'marketplace_listings',
      listing.id,
      { previousStatus: listing.status, newStatus: status, note },
      req
    );
    db.insert('notifications', {
      id: createId('notif'),
      user_id: listing.creator_id,
      title: `Marketplace listing ${status}`,
      message: `Your listing "${listing.title}" was ${status}.${note ? ` ${note}` : ''}`,
      type: 'listing_update',
      is_read: false,
      link: '/dashboard',
      created_at: new Date().toISOString(),
    });
  });

  res.json({ message: `Marketplace listing ${status}.` });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req: AuthRequest, res: Response) => {
  const logs = db.findMany('audit_logs');
  res.json({ logs });
});

export default router;
