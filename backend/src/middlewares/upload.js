// ============================================================================
// MULTER UPLOAD MIDDLEWARE
// ============================================================================
// Handles file uploads for content (videos, audios, images)

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================================
// ENSURE UPLOADS DIRECTORY EXISTS
// ============================================================================
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('[Upload] Created uploads directory:', uploadDir);
}

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================
const storage = multer.diskStorage({
  // Set destination folder
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Set filename with timestamp to avoid conflicts
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// ============================================================================
// FILE FILTER - ACCEPT ONLY SPECIFIC TYPES
// ============================================================================
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  const allowedExtensions = ['.mp4', '.webm', '.mp3', '.wav', '.jpg', '.jpeg', '.png', '.gif'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Supported: mp4, webm, mp3, wav, jpg, png, gif`), false);
  }
};

// ============================================================================
// MULTER INSTANCE CONFIGURATION
// ============================================================================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  }
});

// ============================================================================
// EXPORT
// ============================================================================
module.exports = upload;

