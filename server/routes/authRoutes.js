import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { checkDbConnection } from '../middleware/dbCheck.js';

const router = express.Router();

router.post('/register', checkDbConnection, register);
router.post('/login', checkDbConnection, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, checkDbConnection, updateProfile);
router.post('/logout', protect, logout);

export default router;
