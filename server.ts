
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './server/middleware/auth';
import { db } from './server/db/database';

// Route handlers
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
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Shared upload storage configuration
const UPLOADS_DIR = path.resolve(
  process.env.ASAKO_UPLOADS_DIR || path.join(process.cwd(), 'uploads')
);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// CORS configuration
const allowedOrigins = new Set(
  [
    process.env.APP_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
    ...(isProduction
      ? []
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
        ]),
  ]
    .map((origin) => origin?.trim().replace(/\/$/, ''))
    .filter((origin): origin is string => Boolean(origin))
);

// Basic middleware
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

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'ASAKO Global Core Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
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

// Protected resume file serving
app.get(
  '/api/files/:filename',
  requireAuth,
  (req: AuthRequest, res: Response) => {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    const expectedUrl = `/api/files/${safeFilename}`;

    const isOwnResume = db.findOne(
      'student_profiles',
      (profile) =>
        profile.user_id === req.user!.id &&
        profile.resume_url === expectedUrl
    );

    const isAuthorizedRecruiter =
      req.user?.role === 'company' &&
      db
        .findMany(
          'applications',
          (application) => application.resume_url === expectedUrl
        )
        .some((application) => {
          const opportunity = db.findById(
            'opportunities',
            application.opportunity_id
          );

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
        const status =
          'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500;

        res.status(status).json({
          error: 'Unable to retrieve the requested file.',
        });
      }
    });
  }
);

// API error handler
app.use(
  '/api',
  (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('[API Error]', err);

    const errorObject =
      typeof err === 'object' && err !== null ? err : null;

    const errorStatus =
      errorObject &&
      'status' in errorObject &&
      typeof errorObject.status === 'number'
        ? errorObject.status
        : undefined;

    const errorCode =
      errorObject &&
      'code' in errorObject &&
      typeof errorObject.code === 'string'
        ? errorObject.code
        : undefined;

    const status =
      errorCode === 'LIMIT_FILE_SIZE'
        ? 413
        : req.path.startsWith('/uploads/') && errorStatus === undefined
          ? 400
          : err instanceof Error &&
              err.message === 'Origin is not allowed by CORS.'
            ? 403
            : errorStatus || 500;

    const message =
      err instanceof Error
        ? err.message
        : 'Internal server error occurred.';

    res.status(status).json({
      error:
        status >= 500
          ? 'Internal server error occurred.'
          : message,
    });
  }
);

// API 404 handler
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.path}`,
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

    console.log('[ASAKO] Development Vite middleware enabled.');
  } else {
    // Production: backend API only. Frontend is hosted on Vercel.
    console.log('[ASAKO] Production backend mode enabled.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASAKO Backend] Server listening on port ${PORT}`);
    console.log('[ASAKO] Upload storage configured.');
  });
}

startServer().catch((err) => {
  console.error('Failed to start ASAKO server:', err);
  process.exit(1);
});
