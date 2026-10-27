import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import {
  addRound,
  updateRound,
  deleteRound,
} from '../controllers/roundController.js';
import { protect } from '../middleware/auth.js';
import { checkDbConnection } from '../middleware/dbCheck.js';

const router = express.Router();

// Apply auth and DB check to all application routes
router.use(protect);
router.use(checkDbConnection);

// Application CRUD
router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

router.patch('/:id/status', updateApplicationStatus);

// Nested Rounds Routes
router.post('/:appId/rounds', addRound);
router.put('/:appId/rounds/:roundId', updateRound);
router.delete('/:appId/rounds/:roundId', deleteRound);

export default router;
