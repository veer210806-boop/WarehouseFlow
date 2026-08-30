import express from 'express';
import {
  getProducts,
  getProductById,
  searchBySKU,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/meta/categories', getCategories);
router.get('/search/sku/:sku', searchBySKU);
router.get('/:id', getProductById);

router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
