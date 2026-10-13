import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { ReorderEngine } from '../oop/ReorderEngine.js';
import { orderManager } from '../oop/OrderManager.js';
import { memoryStore } from '../config/memoryStore.js';

// @desc    Get all smart reorder recommendations with urgency rankings
// @route   GET /api/reorder/recommendations
export async function getReorderRecommendations(req, res, next) {
  try {
    let products = [];
    if (mongoose.connection.readyState === 1) {
      products = await Product.find().populate('supplier');
    } else {
      products = memoryStore.getProducts();
    }

    const analysis = ReorderEngine.generateRecommendations(products);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
}

// @desc    1-Click Generate Purchase Order from Reorder Recommendation
// @route   POST /api/reorder/create-po
export async function createPOFromRecommendation(req, res, next) {
  try {
    const { productId, suggestedQuantity } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const product = memoryStore.getProductById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      if (!product.supplier) return res.status(400).json({ success: false, message: 'Product has no assigned supplier.' });

      const analysis = ReorderEngine.analyzeProduct(product, product.supplier);
      const quantity = Number(suggestedQuantity) || analysis.suggestedQuantity || 20;

      const po = memoryStore.createOrder({
        supplier: product.supplier._id,
        items: [
          {
            product: product._id,
            sku: product.sku,
            name: product.name,
            quantity,
            unitCost: product.costPrice
          }
        ],
        notes: `Smart Reorder PO for ${product.name} (${quantity} units)`,
        status: 'PENDING'
      });

      return res.status(201).json({
        success: true,
        message: `Purchase Order ${po.poNumber} created successfully!`,
        data: po
      });
    }

    const product = await Product.findById(productId).populate('supplier');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (!product.supplier) {
      return res.status(400).json({
        success: false,
        message: `Product "${product.name}" has no assigned supplier. Please assign a supplier first.`
      });
    }

    const analysis = ReorderEngine.analyzeProduct(product, product.supplier);
    const quantity = Number(suggestedQuantity) || analysis.suggestedQuantity || 20;

    const po = await orderManager.createPurchaseOrder({
      supplier: product.supplier._id,
      items: [
        {
          product: product._id,
          sku: product.sku,
          name: product.name,
          quantity,
          unitCost: product.costPrice
        }
      ],
      notes: `Automated Smart Reorder PO. Weekly sales: ${product.weeklySales}, Current stock: ${product.stock}`,
      status: 'PENDING',
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: `Purchase Order ${po.poNumber} created successfully!`,
      data: po
    });
  } catch (error) {
    next(error);
  }
}
