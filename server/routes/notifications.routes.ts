import { Router, Response } from 'express';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /api/notifications
router.get('/', (req: AuthRequest, res: Response) => {
  const notifs = db.findMany('notifications', (n) => n.user_id === req.user!.id);
  res.json({ notifications: notifs, unreadCount: notifs.filter((n) => !n.is_read).length });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req: AuthRequest, res: Response) => {
  const notif = db.findById('notifications', req.params.id);
  if (!notif) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  if (notif.user_id !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const updated = db.update('notifications', req.params.id, { is_read: true });
  res.json({ notification: updated });
});

// PUT /api/notifications/read-all
router.put('/read-all', (req: AuthRequest, res: Response) => {
  const userNotifs = db.findMany('notifications', (n) => n.user_id === req.user!.id && !n.is_read);
  userNotifs.forEach((n) => {
    db.update('notifications', n.id, { is_read: true });
  });

  res.json({ message: 'All notifications marked as read.' });
});

export default router;
