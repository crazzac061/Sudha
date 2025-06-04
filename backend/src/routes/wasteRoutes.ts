import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth';
import {
  createWaste,
  getWasteById,
  updateWasteStatus,
  getWasteByUser,
  searchWaste
} from '../controllers/wasteController';

// Configure multer for waste image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/waste');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();

// Routes
router.post('/', protect, upload.single('image'), createWaste);
router.get('/user', protect, getWasteByUser);
router.get('/search', protect, searchWaste);
router.get('/:id', protect, getWasteById);
router.patch('/:id/status', protect, updateWasteStatus);

export default router;
