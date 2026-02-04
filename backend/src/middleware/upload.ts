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
  missions: path.join(UPLOAD_DIR, 'missions'),
  outreaches: path.join(UPLOAD_DIR, 'outreaches'),
  missionArtifacts: path.join(UPLOAD_DIR, 'mission-artifacts'),
  missionGalleries: path.join(UPLOAD_DIR, 'mission-galleries'),
  outreachArtifacts: path.join(UPLOAD_DIR, 'outreach-artifacts'),
  outreachGalleries: path.join(UPLOAD_DIR, 'outreach-galleries'),
  featuredVideos: path.join(UPLOAD_DIR, 'featured-videos'),
  futureExplorers: path.join(UPLOAD_DIR, 'future-explorers')
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
    } else if (req.path && req.path.includes('upload-featured-video')) {
      uploadPath = UPLOAD_DIRS.featuredVideos;
    } else if (req.path && req.path.includes('mission-director')) {
      uploadPath = UPLOAD_DIRS.missionDirector;
    } else if (req.path && req.path.includes('upload-leader-image')) {
      uploadPath = UPLOAD_DIRS.missionLeaders;
    } else if (req.path && req.path.includes('future-explorers')) {
      uploadPath = UPLOAD_DIRS.futureExplorers;
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB default
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB default
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
      // Try to get the actual limit from the request or use a default message
      const maxSize = process.env.MAX_ARTIFACT_SIZE || process.env.MAX_GALLERY_SIZE || process.env.MAX_FILE_SIZE || '104857600';
      const sizeInMB = Math.round(parseInt(maxSize) / (1024 * 1024));
      res.status(400).json({
        success: false,
        message: `File size exceeds the maximum limit (${sizeInMB}MB)`
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

/**
 * Artifact upload storage (saves to mission-specific folder)
 */
const artifactStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { missionId } = req.body;
    if (!missionId) {
      cb(new Error('Mission ID is required'), '');
      return;
    }
    
    // Mission folder will be created in the controller after fetching mission details
    // For now, save to temp and move in controller
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
 * Artifact upload instance
 */
export const artifactUpload = multer({
  storage: artifactStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_ARTIFACT_SIZE || '104857600') // 100MB default for artifacts
  },
  fileFilter: fileFilter
});

/**
 * Gallery upload storage (saves to mission-specific folder)
 */
const galleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Mission folder will be created in the controller after fetching mission details
    // For now, save to temp and move in controller
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
 * Gallery upload instance (for mission galleries)
 */
export const galleryUpload = multer({
  storage: galleryStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_GALLERY_SIZE || '209715200') // 200MB default for gallery (videos can be large)
  },
  fileFilter: (_req, file, cb) => {
    // Allow images and videos for gallery
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      const error = new Error('Only image and video files are allowed for gallery') as any;
      cb(error);
    }
  }
});

export { upload };
