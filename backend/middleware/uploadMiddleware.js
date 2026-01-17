const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
const UPLOAD_DIRS = {
  files: path.join(UPLOAD_DIR, 'files'),
  images: path.join(UPLOAD_DIR, 'images'),
  galleries: path.join(UPLOAD_DIR, 'galleries')
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_DIRS.files;
    
    if (req.path.includes('gallery')) {
      uploadPath = UPLOAD_DIRS.galleries;
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = UPLOAD_DIRS.images;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow all file types for documents
  if (req.path.includes('gallery') || req.path.includes('image')) {
    // Only images for gallery
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for gallery'), false);
    }
  } else {
    // Allow most file types for documents
    const allowedTypes = [
      'image/', 'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats', 'application/zip',
      'text/', 'video/', 'audio/'
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.includes(type));
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds the maximum limit' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError,
  UPLOAD_DIRS
};

