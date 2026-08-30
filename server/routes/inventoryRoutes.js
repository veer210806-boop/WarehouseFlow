import express from 'express';
import { stockIn, stockOut, adjustStock, getLogs } from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/logs', getLogs);
router.post('/in', protect, stockIn);
router.post('/out', protect, stockOut);
router.post('/adjust', protect, adjustStock);

export default router;
