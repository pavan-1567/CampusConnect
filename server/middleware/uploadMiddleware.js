const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure .gitkeep exists so the uploads dir is preserved
const gitkeepPath = path.join(uploadDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `item-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

/**
 * Handle image post-processing: upload to Cloudinary if available, otherwise return relative URL
 */
const processUploadedImage = async (file) => {
  if (!file) return '';

  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'campusconnect',
        resource_type: 'image',
      });
      // Remove temporary file from local disk
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        // ignore deletion error
      }
      return result.secure_url;
    } catch (uploadError) {
      console.error('[UploadMiddleware] Cloudinary upload failed, falling back to local:', uploadError.message);
      return `/uploads/${file.filename}`;
    }
  }

  return `/uploads/${file.filename}`;
};

module.exports = {
  upload,
  processUploadedImage,
};

