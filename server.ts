import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './server/middleware/auth';
import { db } from './server/db/database';

// Import Route Handlers
import authRouter from './server/routes/auth.routes';
import studentsRouter from './server/routes/students.routes';
import companiesRouter from './server/routes/companies.routes';
import institutesRouter from './server/routes/institutes.routes';
import providersRouter from './server/routes/providers.routes';
import consumersRouter from './server/routes/consumers.routes';
import opportunitiesRouter from './server/routes/opportunities.routes';
import workshopsRouter from './server/routes/workshops.routes';
import marketplaceRouter from './server/routes/marketplace.routes';
import notificationsRouter from './server/routes/notifications.routes';
import adminRouter from './server/routes/admin.routes';
import uploadsRouter from './server/routes/uploads.routes';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = new Set(
  [
    process.env.APP_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
    ...(isProduction ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']),
  ]
    .map((origin) => origin?.trim().replace(/\/$/, ''))
    .filter((origin): origin is string => Boolean(origin))
);

// Basic Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
  })
);
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'ASAKO Global Core Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount API Modules
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/institutes', institutesRouter);
app.use('/api/providers', providersRouter);
app.use('/api/consumers', consumersRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/uploads', uploadsRouter);

// Protected File Serving Endpoint
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.get('/api/files/:filename', requireAuth, (req: AuthRequest, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, safeFilename);

  const isOwnResume = db.findOne(
    'student_profiles',
    (profile) => profile.user_id === req.user!.id && profile.resume_url === `/api/files/${safeFilename}`
  );
  const isAuthorizedRecruiter =
    req.user?.role === 'company' &&
    db.findMany('applications', (application) => application.resume_url === `/api/files/${safeFilename}`)
      .some((application) => {
        const opportunity = db.findById('opportunities', application.opportunity_id);
        return opportunity?.company_id === req.user!.id;
      });

  if (!isOwnResume && !isAuthorizedRecruiter) {
    res.status(404).json({ error: 'Requested file does not exist.' });
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Requested file does not exist.' });
    return;
  }

  res.download(filePath, safeFilename, (error) => {
    if (error && !res.headersSent) {
      const status = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
      res.status(status).json({ error: 'Unable to retrieve the requested file.' });
    }
  });
});

app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
});

// Error handling middleware for API routes
app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]', err);
  const errorObject = typeof err === 'object' && err !== null ? err : null;
  const errorStatus =
    errorObject && 'status' in errorObject && typeof errorObject.status === 'number'
      ? errorObject.status
      : undefined;
  const errorCode =
    errorObject && 'code' in errorObject && typeof errorObject.code === 'string'
      ? errorObject.code
      : undefined;
  const status = errorCode === 'LIMIT_FILE_SIZE'
    ? 413
    : _req.path.startsWith('/uploads/') && errorStatus === undefined
      ? 400
      : err instanceof Error && err.message === 'Origin is not allowed by CORS.'
        ? 403
        : errorStatus || 500;
  const message = err instanceof Error ? err.message : 'Internal server error occurred.';
  res.status(status).json({
    error: status >= 500 ? 'Internal server error occurred.' : message,
  });
});

async function startServer() {
  if (!isProduction) {
    // Development mode: attach Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[ASAKO] Dev server configured with Vite middlewares.');
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[ASAKO] Production static serving enabled from dist.');
  }

  app.listen(PORT, () => {
    console.log(`[ASAKO Platform Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ASAKO server:', err);
  process.exit(1);
});
