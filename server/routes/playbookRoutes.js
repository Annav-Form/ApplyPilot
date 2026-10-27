import express from 'express';
import {
  getPlaybookItems,
  createPlaybookItem,
  updatePlaybookItem,
  togglePlaybookItem,
  deletePlaybookItem,
  seedStarterPlaybook,
} from '../controllers/playbookController.js';
import { protect } from '../middleware/auth.js';
import { checkDbConnection } from '../middleware/dbCheck.js';

const router = express.Router();

router.use(protect);
router.use(checkDbConnection);

router.route('/')
  .get(getPlaybookItems)
  .post(createPlaybookItem);

router.post('/seed-starter', seedStarterPlaybook);

router.route('/:id')
  .put(updatePlaybookItem)
  .delete(deletePlaybookItem);

router.patch('/:id/toggle', togglePlaybookItem);

export default router;
