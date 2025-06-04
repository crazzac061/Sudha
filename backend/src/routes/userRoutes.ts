import express from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);

export default router;
