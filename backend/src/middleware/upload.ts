import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { generateId } from '../utils/idGenerator.js';

// Upload directory configuration - use absolute path to project root
// Go up one level from backend to project root
const UPLOAD_DIR = process.env.UPLOAD_PATH || path.join(process.cwd(), '..', 'uploads');

export const UPLOAD_DIRS = {
  files: path.join(UPLOAD_DIR, 'files'),
  images: path.join(UPLOAD_DIR, 'images'),
  banners: path.join(UPLOAD_DIR, 'banners'),
  galleries: path.join(UPLOAD_DIR, 'galleries'),
  missionDirector: path.join(UPLOAD_DIR, 'mission-director'),
  missionLeaders: path.join(UPLOAD_DIR, 'mission-leaders'),
  missions: path.join(UPLOAD_DIR, 'missions')
} as const;

// Ensure upload directories exist
Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Configure multer storage
 */
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    let uploadPath = UPLOAD_DIRS.files;
    
    if (req.path && req.path.includes('upload-banner')) {
      uploadPath = UPLOAD_DIRS.banners;
    } else if (req.path && req.path.includes('mission-director')) {
      uploadPath = UPLOAD_DIRS.missionDirector;
    } else if (req.path && req.path.includes('upload-leader-image')) {
      uploadPath = UPLOAD_DIRS.missionLeaders;
    } else if (req.path && req.path.includes('gallery')) {
      uploadPath = UPLOAD_DIRS.galleries;
    } else if (_file.mimetype.startsWith('image/')) {
      uploadPath = UPLOAD_DIRS.images;
    }
    
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${generateId()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

/**
 * File filter for security
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Gallery/image uploads - only images
  if (req.path && (req.path.includes('gallery') || req.path.includes('image'))) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for gallery'));
    }
    return;
  }

  // Document uploads - allow most file types
  const allowedTypes = [
    'image/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats',
    'application/vnd.ms-',
    'application/zip',
    'application/x-zip',
    'text/',
    'video/',
    'audio/'
  ];

  const isAllowed = allowedTypes.some(type => file.mimetype.includes(type));

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

/**
 * Multer upload instance
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: fileFilter
});

/**
 * Generic upload storage (for dynamic folder selection)
 * Saves to temp directory, controller will move to final destination
 */
const genericStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const tempDir = path.join(UPLOAD_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${generateId()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

/**
 * Generic upload instance (for /admin/upload endpoint)
 */
export const genericUpload = multer({
  storage: genericStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: fileFilter
});

/**
 * Single file upload middleware
 */
export const uploadSingle = (fieldName: string = 'file') => {
  return upload.single(fieldName);
};

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Multiple fields upload middleware
 */
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return upload.fields(fields);
};

/**
 * Error handler for multer errors
 */
export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size exceeds the maximum limit (10MB)'
      });
      return;
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
    return;
  }

  if (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
    return;
  }

  next();
};

/**
 * Validate uploaded file exists
 */
export const requireFile = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file && !req.files) {
    res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
    return;
  }
  next();
};

/**
 * Get file URL from uploaded file
 */
export const getFileUrl = (file: Express.Multer.File): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  const relativePath = file.path.replace(/\\/g, '/').split('uploads/')[1];
  return `${baseUrl}/uploads/${relativePath}`;
};

/**
 * Delete file from filesystem
 */
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export { upload };
