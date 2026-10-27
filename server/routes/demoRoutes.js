import express from 'express';
import { seedDemoData } from '../controllers/demoController.js';
import { protect } from '../middleware/auth.js';
import { checkDbConnection } from '../middleware/dbCheck.js';

const router = express.Router();

router.use(protect);
router.use(checkDbConnection);

router.post('/seed', seedDemoData);

export default router;
