import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { checkDbConnection } from '../middleware/dbCheck.js';

const router = express.Router();

router.use(protect);
router.use(checkDbConnection);

router.get('/stats', getDashboardStats);

export default router;
