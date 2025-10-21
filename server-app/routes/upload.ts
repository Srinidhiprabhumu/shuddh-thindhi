import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAdmin } from '../auth';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'attached_assets/generated_images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// File upload route
router.post('/', requireAdmin, upload.array('images', 5), (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map(file => `/attached_assets/generated_images/${file.filename}`);
    res.json({ images: imageUrls });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;