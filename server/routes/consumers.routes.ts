import { Router, Response } from 'express';
import { createId, db, OrderRecord } from '../db/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.use(requireRole('consumer'));

// GET /api/consumers/profile
router.get('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('consumer_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Consumer profile not found.' });
    return;
  }
  res.json({ profile });
});

// PUT /api/consumers/profile
router.put('/profile', (req: AuthRequest, res: Response) => {
  const profile = db.findOne('consumer_profiles', (p) => p.user_id === req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'Consumer profile not found.' });
    return;
  }

  const { full_name, occupation, location, phone, interest_areas } = req.body;

  const updated = db.update('consumer_profiles', profile.id, {
    ...(full_name !== undefined && { full_name }),
    ...(occupation !== undefined && { occupation }),
    ...(location !== undefined && { location }),
    ...(phone !== undefined && { phone }),
    ...(interest_areas !== undefined && { interest_areas }),
  });

  res.json({ message: 'Profile updated successfully', profile: updated });
});

// GET /api/consumers/orders
router.get('/orders', (req: AuthRequest, res: Response) => {
  const orders = db.findMany('orders_or_requests', (o) => o.consumer_id === req.user!.id);

  const enriched = orders.map((o) => {
    const listing = db.findById('marketplace_listings', o.listing_id);
    return {
      ...o,
      title: listing ? listing.title : 'Marketplace Resource',
      category: listing ? listing.category : 'General',
      creator: listing ? listing.creator_name : 'Provider',
      date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      price: o.amount,
    };
  });

  res.json({ orders: enriched });
});

// POST /api/consumers/orders
router.post('/orders', (req: AuthRequest, res: Response) => {
  const { listingId } = req.body;
  if (typeof listingId !== 'string' || !listingId.trim()) {
    res.status(400).json({ error: 'listingId is required.' });
    return;
  }

  const listing = db.findById('marketplace_listings', listingId);
  if (!listing || listing.status !== 'active') {
    res.status(404).json({ error: 'Marketplace resource not found.' });
    return;
  }

  const profile = db.findOne('consumer_profiles', (p) => p.user_id === req.user!.id);
  const now = new Date().toISOString();

  const order: OrderRecord = {
    id: createId('req'),
    listing_id: listingId,
    consumer_id: req.user!.id,
    consumer_name: profile ? profile.full_name : 'Valued Consumer',
    amount: listing.price,
    status: 'pending_fulfillment',
    deliverable_download_url: '',
    created_at: now,
    updated_at: now,
  };

  db.transaction(() => {
    db.insert('orders_or_requests', order);
    db.insert('notifications', {
      id: createId('notif'),
      user_id: listing.creator_id,
      title: 'New marketplace request',
      message: `${profile?.full_name || req.user!.email} requested "${listing.title}". Contact them to arrange next steps.`,
      type: 'marketplace_request',
      is_read: false,
      link: '/dashboard',
      created_at: now,
    });
    db.insert('notifications', {
      id: createId('notif'),
      user_id: req.user!.id,
      title: 'Request sent',
      message: `Your request for "${listing.title}" was sent to its creator.`,
      type: 'marketplace_request',
      is_read: false,
      link: '/dashboard',
      created_at: now,
    });
  });

  res.status(201).json({ message: 'Request sent. No payment or download was processed.', order });
});

// GET /api/consumers/enquiries
router.get('/enquiries', (req: AuthRequest, res: Response) => {
  const enquiries = db.findMany('marketplace_enquiries', (e) => e.sender_id === req.user!.id);
  res.json({ enquiries });
});

export default router;
