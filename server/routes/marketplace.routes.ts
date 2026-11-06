import { Router, Request, Response } from 'express';
import { createId, db, MarketplaceEnquiryRecord, MarketplaceListingRecord } from '../db/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { serializeMarketplaceListing } from '../lib/serializers';

const router = Router();
const listingCategories = [
  'Developer Kit',
  'Design System',
  'Educational Curriculum',
  'Productivity Tool',
  'Pro Consultation',
];

function getCreatorName(userId: string, role: string, fallback: string): string {
  if (role === 'company') {
    return db.findOne('company_profiles', (profile) => profile.user_id === userId)?.company_name || fallback;
  }
  if (role === 'institute') {
    return db.findOne('institute_profiles', (profile) => profile.user_id === userId)?.institute_name || fallback;
  }
  if (role === 'provider') {
    return db.findOne('provider_profiles', (profile) => profile.user_id === userId)?.provider_name || fallback;
  }
  if (role === 'student') {
    return db.findOne('student_profiles', (profile) => profile.user_id === userId)?.full_name || fallback;
  }
  return fallback;
}

// GET /api/marketplace (Authenticated Listings Discovery)
router.get('/', requireAuth, (req: Request, res: Response) => {
  const { search, category } = req.query;

  let results = db.findMany('marketplace_listings', (m) => m.status === 'active');

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.creator_name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.specs.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter((m) => m.category.toLowerCase() === category.toLowerCase());
  }

  const total = results.length;
  const offsetValue = Number(req.query.offset ?? 0);
  const limitValue = Number(req.query.limit ?? 50);
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;
  const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 50;
  res.json({
    listings: results.slice(offset, offset + limit).map(serializeMarketplaceListing),
    total,
    offset,
    limit,
  });
});

router.get('/mine', requireAuth, (req: AuthRequest, res: Response) => {
  const listings = db.findMany('marketplace_listings', (listing) => listing.creator_id === req.user!.id);
  res.json({ listings: listings.map(serializeMarketplaceListing) });
});

router.get('/seller/enquiries', requireAuth, (req: AuthRequest, res: Response) => {
  const ownedListingIds = new Set(
    db.findMany('marketplace_listings', (listing) => listing.creator_id === req.user!.id).map((listing) => listing.id)
  );
  const enquiries = db.findMany('marketplace_enquiries', (enquiry) => ownedListingIds.has(enquiry.listing_id));
  res.json({ enquiries });
});

router.post(
  '/',
  requireAuth,
  requireRole('student', 'company', 'institute', 'provider'),
  (req: AuthRequest, res: Response) => {
    const { title, category, price, description, specs, deliverableType } = req.body;
    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.length > 180 ||
      typeof category !== 'string' ||
      !listingCategories.includes(category) ||
      typeof price !== 'string' ||
      !price.trim() ||
      price.length > 100 ||
      typeof description !== 'string' ||
      !description.trim() ||
      description.length > 10000 ||
      typeof deliverableType !== 'string' ||
      !deliverableType.trim() ||
      deliverableType.length > 200 ||
      (specs !== undefined &&
        (!Array.isArray(specs) ||
          specs.length > 50 ||
          specs.some((spec: unknown) => typeof spec !== 'string' || spec.length > 500)))
    ) {
      res.status(400).json({ error: 'Marketplace listing details are invalid.' });
      return;
    }

    const creatorName = getCreatorName(req.user!.id, req.user!.role, req.user!.email);
    const now = new Date().toISOString();
    const listing: MarketplaceListingRecord = {
      id: createId('mkt'),
      creator_id: req.user!.id,
      creator_role: req.user!.role,
      creator_name: creatorName,
      title: title.trim(),
      category,
      price: price.trim(),
      description: description.trim(),
      specs: specs || [],
      deliverable_type: deliverableType.trim(),
      status: 'pending_review',
      created_at: now,
      updated_at: now,
    };
    db.insert('marketplace_listings', listing);
    res.status(201).json({
      message: 'Listing submitted for review.',
      listing: serializeMarketplaceListing(listing),
    });
  }
);

// GET /api/marketplace/:id
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const item = db.findById('marketplace_listings', req.params.id);
  if (!item || item.status !== 'active') {
    res.status(404).json({ error: 'Marketplace listing not found.' });
    return;
  }
  res.json({ listing: serializeMarketplaceListing(item) });
});

// POST /api/marketplace/:id/enquire (Submit Enquiry)
router.post('/:id/enquire', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const listing = db.findById('marketplace_listings', req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Marketplace listing not found.' });
      return;
    }

    const { message, contactNumber } = req.body;
    if (typeof message !== 'string' || !message.trim() || message.length > 5000) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }
    if (contactNumber !== undefined && (typeof contactNumber !== 'string' || contactNumber.length > 40)) {
      res.status(400).json({ error: 'Contact number is invalid.' });
      return;
    }
    if (listing.creator_id === req.user!.id) {
      res.status(400).json({ error: 'You cannot submit an enquiry to your own listing.' });
      return;
    }

    const now = new Date().toISOString();
    const senderName = getCreatorName(req.user!.id, req.user!.role, req.user!.email);

    const enquiry: MarketplaceEnquiryRecord = {
      id: createId('enq'),
      listing_id: listing.id,
      sender_id: req.user!.id,
      sender_name: senderName,
      sender_email: req.user!.email,
      sender_role: req.user!.role,
      message: message.trim(),
      contact_number: contactNumber?.trim() || '',
      status: 'new',
      created_at: now,
      updated_at: now,
    };

    db.transaction(() => {
      db.insert('marketplace_enquiries', enquiry);
      db.insert('notifications', {
        id: createId('notif'),
        user_id: listing.creator_id,
        title: 'New Marketplace Enquiry',
        message: `${senderName} enquired regarding "${listing.title}".`,
        type: 'enquiry_received',
        is_read: false,
        link: '/dashboard',
        created_at: now,
      });
    });

    res.status(201).json({
      message: 'Enquiry dispatched successfully to offering creator.',
      enquiry,
    });
  } catch (error) {
    console.error('[Marketplace] Enquiry submission failed:', error);
    res.status(500).json({ error: 'Failed to submit enquiry. Please try again.' });
  }
});

router.put('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const listing = db.findById('marketplace_listings', req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Marketplace listing not found.' });
    return;
  }
  if (listing.creator_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'You can only manage your own listings.' });
    return;
  }

  const { title, category, price, description, specs, deliverableType } = req.body;
  if (
    (title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 180)) ||
    (category !== undefined && (typeof category !== 'string' || !listingCategories.includes(category))) ||
    (price !== undefined && (typeof price !== 'string' || !price.trim() || price.length > 100)) ||
    (description !== undefined && (typeof description !== 'string' || !description.trim() || description.length > 10000)) ||
    (deliverableType !== undefined &&
      (typeof deliverableType !== 'string' || !deliverableType.trim() || deliverableType.length > 200)) ||
    (specs !== undefined &&
      (!Array.isArray(specs) ||
        specs.length > 50 ||
        specs.some((spec: unknown) => typeof spec !== 'string' || spec.length > 500)))
  ) {
    res.status(400).json({ error: 'Marketplace listing updates are invalid.' });
    return;
  }

  const updated = db.update('marketplace_listings', listing.id, {
    ...(title !== undefined && { title: title.trim() }),
    ...(category !== undefined && { category }),
    ...(price !== undefined && { price: price.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(specs !== undefined && { specs }),
    ...(deliverableType !== undefined && { deliverable_type: deliverableType.trim() }),
    status: listing.status === 'active' ? 'pending_review' : listing.status,
  });
  res.json({ message: 'Listing updated.', listing: serializeMarketplaceListing(updated!) });
});

router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const listing = db.findById('marketplace_listings', req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Marketplace listing not found.' });
    return;
  }
  if (listing.creator_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'You can only manage your own listings.' });
    return;
  }
  db.update('marketplace_listings', listing.id, { status: 'archived' });
  res.json({ message: 'Listing archived.' });
});

export default router;
