import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import ActivityLog from '../models/ActivityLog.js';
import { BaseService } from './BaseService.js';
import { ReorderEngine } from './ReorderEngine.js';

export class InventoryManager extends BaseService {
  constructor() {
    super(InventoryLog, 'Inventory');
  }

  /**
   * Process Stock In (Receiving goods / Inbound)
   */
  async stockIn(productId, quantity, options = {}) {
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      throw new Error('Stock in quantity must be greater than zero.');
    }

    const product = await Product.findById(productId).populate('supplier');
    if (!product) {
      const error = new Error(`Product with ID ${productId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const previousStock = product.stock;
    const newStock = previousStock + qty;

    product.stock = newStock;
    if (options.costPrice && Number(options.costPrice) > 0) {
      product.costPrice = Number(options.costPrice);
    }
    await product.save();

    // Create Audit Log
    const log = await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      productName: product.name,
      type: 'IN',
      quantity: qty,
      previousStock,
      newStock,
      reason: options.reason || 'Inventory Inward / Purchase Receipt',
      referenceNumber: options.referenceNumber || `IN-${Date.now().toString().slice(-6)}`,
      user: options.user || 'Warehouse Manager'
    });

    // Create System Activity
    await ActivityLog.create({
      action: 'Stock Added',
      entityType: 'INVENTORY',
      details: `Added ${qty} units to "${product.name}" (${product.sku}). New Stock: ${newStock}`,
      badgeType: 'SUCCESS',
      metadata: { productId: product._id, logId: log._id, qty }
    });

    return { product, log };
  }

  /**
   * Process Stock Out (Sales Dispatch / Outbound)
   */
  async stockOut(productId, quantity, options = {}) {
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      throw new Error('Stock out quantity must be greater than zero.');
    }

    const product = await Product.findById(productId).populate('supplier');
    if (!product) {
      const error = new Error(`Product with ID ${productId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < qty) {
      const error = new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${qty}`);
      error.statusCode = 400;
      throw error;
    }

    const previousStock = product.stock;
    const newStock = previousStock - qty;

    product.stock = newStock;
    await product.save();

    // Create Audit Log
    const log = await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      productName: product.name,
      type: 'OUT',
      quantity: qty,
      previousStock,
      newStock,
      reason: options.reason || 'Sales Dispatch / Customer Order',
      referenceNumber: options.referenceNumber || `OUT-${Date.now().toString().slice(-6)}`,
      user: options.user || 'Warehouse Staff'
    });

    // Activity Log
    await ActivityLog.create({
      action: 'Stock Dispatched',
      entityType: 'INVENTORY',
      details: `Dispatched ${qty} units of "${product.name}" (${product.sku}). Remaining: ${newStock}`,
      badgeType: 'INFO',
      metadata: { productId: product._id, logId: log._id, qty }
    });

    // Check if reorder recommendation triggered
    const analysis = ReorderEngine.analyzeProduct(product, product.supplier);
    if (analysis.reorderNeeded) {
      await ActivityLog.create({
        action: 'Reorder Warning Triggered',
        entityType: 'PRODUCT',
        details: `Reorder needed for ${product.name} (SKU: ${product.sku}). Current Stock: ${newStock}, Suggested: ${analysis.suggestedQuantity}`,
        badgeType: analysis.status === 'CRITICAL' ? 'DANGER' : 'WARNING',
        metadata: { productId: product._id, reorderAnalysis: analysis }
      });
    }

    return { product, log, reorderWarning: analysis.reorderNeeded ? analysis : null };
  }

  /**
   * Process Stock Adjustment (Audit / Cycle Count Correction)
   */
  async adjustStock(productId, newStockValue, options = {}) {
    const targetStock = Number(newStockValue);
    if (isNaN(targetStock) || targetStock < 0) {
      throw new Error('Target stock must be a non-negative number.');
    }

    const product = await Product.findById(productId).populate('supplier');
    if (!product) {
      const error = new Error(`Product with ID ${productId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const previousStock = product.stock;
    const delta = targetStock - previousStock;

    product.stock = targetStock;
    await product.save();

    const log = await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      productName: product.name,
      type: 'ADJUSTMENT',
      quantity: delta,
      previousStock,
      newStock: targetStock,
      reason: options.reason || 'Physical Audit Cycle Count Adjustment',
      referenceNumber: options.referenceNumber || `ADJ-${Date.now().toString().slice(-6)}`,
      user: options.user || 'Warehouse Manager'
    });

    await ActivityLog.create({
      action: 'Stock Adjusted',
      entityType: 'INVENTORY',
      details: `Adjusted "${product.name}" stock from ${previousStock} to ${targetStock} (${delta >= 0 ? '+' : ''}${delta})`,
      badgeType: 'WARNING',
      metadata: { productId: product._id, delta }
    });

    return { product, log };
  }

  /**
   * Retrieve Inventory History Logs with search and filtering
   */
  async getInventoryLogs(filter = {}, limit = 100) {
    return await InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('product', 'name sku category costPrice sellingPrice');
  }
}

export const inventoryManager = new InventoryManager();
