import Batch from '../models/Batch.js';
import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import ActivityLog from '../models/ActivityLog.js';
import FIFOManager from '../oop/FIFOManager.js';

/**
 * @desc Get all inventory batches with FIFO sorting and urgency filters
 * @route GET /api/batches
 */
export const getAllBatches = async (req, res) => {
  try {
    const { status, urgency, productId, search } = req.query;

    let query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    } else {
      // Default to active batches unless specified
      query.status = { $ne: 'DEPLETED' };
    }

    if (productId) {
      query.product = productId;
    }

    if (search) {
      query.$or = [
        { batchNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    let batches = await Batch.find(query)
      .populate('product', 'name sku category price sellingPrice costPrice')
      .populate('supplier', 'company name')
      .sort({ expiryDate: 1, createdAt: 1 });

    // Apply urgency in-memory filter if requested
    if (urgency && urgency !== 'ALL') {
      batches = batches.filter((b) => {
        const days = b.daysToExpiry;
        if (urgency === 'EXPIRED') return days <= 0;
        if (urgency === 'CRITICAL') return days > 0 && days <= 20;
        if (urgency === 'WARNING') return days > 20 && days <= 60;
        if (urgency === 'HEALTHY') return days > 60;
        return true;
      });
    }

    // Attach computed urgency tag
    const formatted = batches.map((b) => {
      const obj = b.toObject();
      obj.urgency = FIFOManager.getExpiryUrgency(b.daysToExpiry);
      obj.totalValue = Number(b.remainingQuantity || 0) * Number(b.costPrice || 0);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message
    });
  }
};

/**
 * @desc Create a new inventory batch upon receiving fresh stock
 * @route POST /api/batches
 */
export const createBatch = async (req, res) => {
  try {
    const {
      productId,
      batchNumber,
      quantity,
      mfgDate,
      expiryDate,
      costPrice,
      supplierId,
      location,
      notes
    } = req.body;

    if (!productId || !batchNumber || !quantity || !mfgDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Product, Batch Number, Quantity, MFG Date, and Expiry Date are required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Create the batch record
    const batch = await Batch.create({
      batchNumber: batchNumber.toUpperCase().trim(),
      product: product._id,
      productName: product.name,
      sku: product.sku,
      initialQuantity: Number(quantity),
      remainingQuantity: Number(quantity),
      unit: product.unit || 'Pieces',
      mfgDate: new Date(mfgDate),
      expiryDate: new Date(expiryDate),
      costPrice: costPrice !== undefined ? Number(costPrice) : product.costPrice,
      supplier: supplierId || product.supplier,
      location: location || product.location || 'Aisle 1 - Section A',
      status: 'ACTIVE',
      notes: notes || ''
    });

    // Update Product stock
    const prevStock = product.stock;
    product.stock += Number(quantity);
    await product.save();

    // Log the transaction
    await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      productName: product.name,
      type: 'IN',
      quantity: Number(quantity),
      previousStock: prevStock,
      newStock: product.stock,
      reason: `Batch Receipt: ${batch.batchNumber} (Exp: ${new Date(expiryDate).toLocaleDateString('en-IN')})`,
      referenceNumber: batch.batchNumber,
      user: req.user?.name || 'System Admin'
    });

    await ActivityLog.create({
      action: 'Batch Created',
      entityType: 'INVENTORY',
      details: `Received batch ${batch.batchNumber} for ${product.name} (${quantity} ${product.unit}).`,
      badgeType: 'SUCCESS'
    });

    res.status(201).json({
      success: true,
      message: `Batch ${batch.batchNumber} created successfully!`,
      data: batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message
    });
  }
};

/**
 * @desc Dispatch stock using strict FIFO (automatically picking earliest expiring batches first)
 * @route POST /api/batches/dispatch-fifo
 */
export const dispatchFIFOBatch = async (req, res) => {
  try {
    const { productId, quantity, reason, referenceNumber } = req.body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product and a valid quantity are required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reqQty = Number(quantity);
    if (product.stock < reqQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Requested: ${reqQty}, Available: ${product.stock}`
      });
    }

    // Find active batches for this product
    const activeBatches = await Batch.find({
      product: product._id,
      remainingQuantity: { $gt: 0 }
    });

    // Calculate FIFO allocations
    const allocationResult = FIFOManager.calculateFIFOAllocation(activeBatches, reqQty);

    // Apply deductions to each batch
    for (const alloc of allocationResult.allocations) {
      const batchDoc = await Batch.findById(alloc.batchId);
      if (batchDoc) {
        batchDoc.remainingQuantity = alloc.remainingAfter;
        if (batchDoc.remainingQuantity === 0) {
          batchDoc.status = 'DEPLETED';
        }
        await batchDoc.save();
      }
    }

    // Deduct total from product stock
    const prevStock = product.stock;
    product.stock -= reqQty;
    await product.save();

    // Log movement
    const batchSummaryText = allocationResult.allocations
      .map((a) => `${a.batchNumber} (-${a.deductQty})`)
      .join(', ');

    await InventoryLog.create({
      product: product._id,
      sku: product.sku,
      productName: product.name,
      type: 'OUT',
      quantity: reqQty,
      previousStock: prevStock,
      newStock: product.stock,
      reason: `${reason || 'FIFO Sales Dispatch'} [Batches: ${batchSummaryText}]`,
      referenceNumber: referenceNumber || 'FIFO-DISPATCH',
      user: req.user?.name || 'Warehouse Operator'
    });

    await ActivityLog.create({
      action: 'FIFO Stock Dispatched',
      entityType: 'INVENTORY',
      details: `Dispatched ${reqQty} units of ${product.name} using FIFO from batches: ${batchSummaryText}`,
      badgeType: 'INFO'
    });

    res.status(200).json({
      success: true,
      message: `Successfully dispatched ${reqQty} units using FIFO!`,
      data: {
        product: product.name,
        dispatchedQuantity: reqQty,
        newStock: product.stock,
        allocations: allocationResult.allocations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'FIFO dispatch failed',
      error: error.message
    });
  }
};

/**
 * @desc Get summary metrics for batches, expiring goods, and FIFO priority recommendations
 * @route GET /api/batches/summary
 */
export const getBatchSummary = async (req, res) => {
  try {
    const activeBatches = await Batch.find({ remainingQuantity: { $gt: 0 } })
      .populate('product', 'name sku category sellingPrice costPrice unit')
      .sort({ expiryDate: 1 });

    const totalActiveBatches = activeBatches.length;
    let expiredCount = 0;
    let criticalCount = 0; // <= 20 days
    let warningCount = 0; // 21 - 60 days
    let capitalAtRisk = 0; // Cost of expired or critical items

    const fifoQueue = [];

    activeBatches.forEach((batch) => {
      const days = batch.daysToExpiry;
      const val = Number(batch.remainingQuantity || 0) * Number(batch.costPrice || 0);

      if (days <= 0) {
        expiredCount++;
        capitalAtRisk += val;
      } else if (days <= 20) {
        criticalCount++;
        capitalAtRisk += val;
      } else if (days <= 60) {
        warningCount++;
      }

      // Add to FIFO queue (first 6 items to sell immediately)
      if (fifoQueue.length < 6 && batch.remainingQuantity > 0) {
        fifoQueue.push({
          batchId: batch._id,
          batchNumber: batch.batchNumber,
          productName: batch.productName,
          sku: batch.sku,
          remainingQuantity: batch.remainingQuantity,
          unit: batch.unit,
          location: batch.location,
          expiryDate: batch.expiryDate,
          daysToExpiry: days,
          urgency: FIFOManager.getExpiryUrgency(days)
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActiveBatches,
          expiredCount,
          criticalCount,
          warningCount,
          healthyCount: totalActiveBatches - (expiredCount + criticalCount + warningCount),
          capitalAtRisk
        },
        fifoPriorityQueue: fifoQueue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to compute batch summary',
      error: error.message
    });
  }
};

