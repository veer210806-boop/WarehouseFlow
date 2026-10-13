import mongoose from 'mongoose';
import { orderManager } from '../oop/OrderManager.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { memoryStore } from '../config/memoryStore.js';

// @desc    Get all purchase orders
// @route   GET /api/orders
export async function getOrders(req, res, next) {
  try {
    const { status, supplier, search } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const orders = memoryStore.getOrders(status, supplier, search);
      return res.json({ success: true, count: orders.length, data: orders });
    }

    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }
    if (supplier && supplier !== 'ALL') {
      filter.supplier = supplier;
    }
    if (search) {
      filter.poNumber = { $regex: search, $options: 'i' };
    }

    const orders = await orderManager.getOrders(filter);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
}

// @desc    Get single purchase order
// @route   GET /api/orders/:id
export async function getOrderById(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const order = memoryStore.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      return res.json({ success: true, data: order });
    }

    const order = await orderManager.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// @desc    Create new purchase order
// @route   POST /api/orders
export async function createOrder(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const order = memoryStore.createOrder(req.body);
      return res.status(201).json({ success: true, data: order });
    }

    const orderData = {
      ...req.body,
      createdBy: req.user ? req.user._id : null
    };
    const order = await orderManager.createPurchaseOrder(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// @desc    Update order status (transitions & auto stock-in on DELIVERED)
// @route   PATCH /api/orders/:id/status
export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const user = req.user ? req.user.name : 'Warehouse Operator';

    if (mongoose.connection.readyState !== 1) {
      const order = memoryStore.updateOrderStatus(req.params.id, status, user);
      return res.json({
        success: true,
        message: `Purchase Order status updated to ${status}.`,
        data: order
      });
    }

    const order = await orderManager.updateStatus(req.params.id, status, { user });
    res.json({
      success: true,
      message: `Purchase Order status updated to ${status}.`,
      data: order
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete purchase order
// @route   DELETE /api/orders/:id
export async function deleteOrder(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const ok = memoryStore.deleteOrder(req.params.id);
      if (!ok) return res.status(404).json({ success: false, message: 'Order not found.' });
      return res.json({ success: true, message: 'Purchase Order deleted.' });
    }

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.status === 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be deleted.' });
    }

    await orderManager.delete(req.params.id, {
      details: `Deleted Purchase Order ${order.poNumber}`,
      badge: 'DANGER'
    });

    res.json({ success: true, message: 'Purchase Order deleted.' });
  } catch (error) {
    next(error);
  }
}
