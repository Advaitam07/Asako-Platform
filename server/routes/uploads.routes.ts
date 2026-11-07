
import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { db } from '../db/database';

const router = Router();

const UPLOADS_DIR = path.resolve(
  process.env.ASAKO_UPLOADS_DIR || path.join(process.cwd(), 'uploads')
);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);

    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only PDF, DOC, DOCX, and TXT files are permitted.'
        )
      );
    }
  },
});

router.post(
  '/resume',
  requireAuth,
  requireRole('student'),
  upload.single('resume'),
  (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded.' });
      return;
    }

    const profile = db.findOne(
      'student_profiles',
      (p) => p.user_id === req.user!.id
    );

    if (!profile) {
      fs.unlinkSync(req.file.path);
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const fileUrl = `/api/files/${req.file.filename}`;

    db.update('student_profiles', profile.id, {
      resume_url: fileUrl,
      resume_filename: path.basename(req.file.originalname).slice(0, 255),
    });

    res.status(201).json({
      message: 'Resume uploaded successfully.',
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
    });
  }
);

export default router;
