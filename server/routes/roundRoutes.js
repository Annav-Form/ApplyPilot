import express from 'express';
import { getUpcomingRounds } from '../controllers/roundController.js';
import { protect } from '../middleware/auth.js';
import { checkDbConnection } from '../middleware/dbCheck.js';

const router = express.Router();

router.use(protect);
router.use(checkDbConnection);

router.get('/upcoming', getUpcomingRounds);

export default router;
