import express from 'express';
import { getReorderRecommendations, createPOFromRecommendation } from '../controllers/reorderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/recommendations', getReorderRecommendations);
router.post('/create-po', protect, createPOFromRecommendation);

export default router;
