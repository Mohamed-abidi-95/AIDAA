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
// FILE FILTER - ACCEPT COMMON MEDIA TYPES (NORMAL USAGE)
// ============================================================================
const fileFilter = (req, file, cb) => {
  // Allowed mime types (common browsers/codecs)
  const allowedMimes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/x-m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/ogg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const allowedExtensions = [
    '.mp4', '.webm', '.mov', '.avi', '.mkv',
    '.mp3', '.wav', '.m4a', '.ogg',
    '.jpg', '.jpeg', '.png', '.gif', '.webp'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isAcceptedByMime =
    allowedMimes.includes(mime) ||
    mime.startsWith('video/') ||
    mime.startsWith('audio/') ||
    mime.startsWith('image/');

  const isAcceptedByExtension = allowedExtensions.includes(ext);

  if (isAcceptedByMime || isAcceptedByExtension) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Please upload a video, audio, or image file.'), false);
  }
};

// ============================================================================
// MULTER INSTANCE CONFIGURATION
// ============================================================================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // No hard file size cap here for normal usage.
  // If needed later, enforce a business limit at reverse proxy level.
});

// ============================================================================
// EXPORT
// ============================================================================
module.exports = upload;

