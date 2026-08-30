import { inventoryManager } from '../oop/InventoryManager.js';
import InventoryLog from '../models/InventoryLog.js';

// @desc    Process Stock In (Receiving goods)
// @route   POST /api/inventory/in
export async function stockIn(req, res, next) {
  try {
    const { productId, quantity, reason, referenceNumber, costPrice } = req.body;
    const user = req.user ? req.user.name : 'Warehouse Operator';

    const result = await inventoryManager.stockIn(productId, quantity, {
      reason,
      referenceNumber,
      user,
      costPrice
    });

    res.json({
      success: true,
      message: `Successfully received ${quantity} units into inventory.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Process Stock Out (Sales Dispatch)
// @route   POST /api/inventory/out
export async function stockOut(req, res, next) {
  try {
    const { productId, quantity, reason, referenceNumber } = req.body;
    const user = req.user ? req.user.name : 'Warehouse Operator';

    const result = await inventoryManager.stockOut(productId, quantity, {
      reason,
      referenceNumber,
      user
    });

    res.json({
      success: true,
      message: `Successfully dispatched ${quantity} units.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Adjust Product Stock Level
// @route   POST /api/inventory/adjust
export async function adjustStock(req, res, next) {
  try {
    const { productId, newStock, reason } = req.body;
    const user = req.user ? req.user.name : 'Warehouse Manager';

    const result = await inventoryManager.adjustStock(productId, newStock, {
      reason,
      user
    });

    res.json({
      success: true,
      message: `Stock level adjusted to ${newStock} units.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get Inventory Transaction History Logs
// @route   GET /api/inventory/logs
export async function getLogs(req, res, next) {
  try {
    const { type, productId, limit = 100, page = 1 } = req.query;
    const filter = {};

    if (type && type !== 'ALL') {
      filter.type = type.toUpperCase();
    }
    if (productId) {
      filter.product = productId;
    }

    const total = await InventoryLog.countDocuments(filter);
    const logs = await InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('product', 'name sku category costPrice sellingPrice');

    res.json({
      success: true,
      count: logs.length,
      total,
      data: logs
    });
  } catch (error) {
    next(error);
  }
}
