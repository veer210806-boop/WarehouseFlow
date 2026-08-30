import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierScorecards,
  recordQualityInspection
} from '../controllers/supplierController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSuppliers);
router.get('/scorecards', protect, getSupplierScorecards);
router.get('/:id', getSupplierById);

router.post('/', protect, createSupplier);
router.post('/:id/inspection', protect, recordQualityInspection);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, deleteSupplier);

export default router;
