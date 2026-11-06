import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { createId, db, UserRecord } from '../db/database';

const configuredSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
}

export const JWT_SECRET = configuredSecret || randomBytes(32).toString('hex');
const demoAccountEmails = new Set([
  'admin@asako.global',
  'alex.rivera@asako.student',
  'sarah.vance@aethel.com',
  'marcus.weber@zurichtech.edu',
  'elena@monolithdesign.org',
  'jordan.lee@domain.com',
]);

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'student' | 'institute' | 'company' | 'provider' | 'consumer' | 'admin';
  status: 'active' | 'suspended' | 'pending_verification';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.asako_token) {
      token = req.cookies.asako_token;
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string' || typeof decoded.id !== 'string') {
      res.status(401).json({ error: 'Invalid or expired session token.' });
      return;
    }

    const user = db.findById('users', decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ASAKO_ALLOW_DEMO_ACCOUNTS !== 'true' &&
      demoAccountEmails.has(user.email.toLowerCase())
    ) {
      res.status(403).json({ error: 'Demo accounts are disabled in production.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'This account has been suspended by administration.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Invalid or expired session token.' });
      return;
    }
    next(error);
  }
}

export function requireRole(...allowedRoles: Array<UserRecord['role']>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      res.status(403).json({
        error: `Forbidden: role '${req.user.role}' is not authorized for this resource.`,
      });
      return;
    }

    next();
  };
}

export function logAdminAction(
  admin: AuthenticatedUser,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, any>,
  req?: Request
) {
  const ip = req ? (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress : undefined;
  db.insert('audit_logs', {
    id: createId('log'),
    admin_user_id: admin.id,
    admin_email: admin.email,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
    ip_address: ip,
    created_at: new Date().toISOString(),
  });
}
