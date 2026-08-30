import express from 'express';
import {
  getAllBatches,
  createBatch,
  dispatchFIFOBatch,
  getBatchSummary
} from '../controllers/batchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public/Protected Routes
router.get('/', protect, getAllBatches);
router.get('/summary', protect, getBatchSummary);
router.post('/', protect, createBatch);
router.post('/dispatch-fifo', protect, dispatchFIFOBatch);

export default router;

