import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import ActivityLog from '../models/ActivityLog.js';
import { BaseService } from './BaseService.js';
import { inventoryManager } from './InventoryManager.js';

export class OrderManager extends BaseService {
  constructor() {
    super(PurchaseOrder, 'PurchaseOrder');
  }

  /**
   * Generate Next PO Number
   */
  static generatePONumber() {
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `PO-${dateStr}-${randomSuffix}`;
  }

  /**
   * Create a new Purchase Order
   */
  async createPurchaseOrder(data) {
    if (!data.supplier) {
      throw new Error('Supplier is required to create a Purchase Order.');
    }
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Purchase Order must contain at least one item.');
    }

    const supplier = await Supplier.findById(data.supplier);
    if (!supplier) {
      const error = new Error(`Supplier with ID ${data.supplier} not found.`);
      error.statusCode = 404;
      throw error;
    }

    // Validate and calculate item totals
    let calculatedSubtotal = 0;
    const items = [];

    for (const item of data.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product ${item.product} not found.`);
      }

      const qty = Number(item.quantity) || 1;
      const unitCost = Number(item.unitCost !== undefined ? item.unitCost : product.costPrice);
      const lineTotal = Number((qty * unitCost).toFixed(2));

      items.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        hsnCode: product.hsnCode || 'HSN 8479',
        unit: product.unit || 'Pieces',
        quantity: qty,
        unitCost,
        total: lineTotal
      });

      calculatedSubtotal += lineTotal;
    }

    const gstRate = Number(data.gstRate || 18);
    const taxAmount = Number(((calculatedSubtotal * gstRate) / 100).toFixed(2));
    const shippingCost = Number(data.shippingCost || 0);
    const totalAmount = Number((calculatedSubtotal + taxAmount + shippingCost).toFixed(2));

    // Determine GST Type (Intra-state CGST+SGST vs Inter-state IGST)
    const isIntraState = supplier.stateCode === '27' || (!supplier.stateCode && supplier.state === 'Maharashtra');
    const gstType = isIntraState ? 'INTRA_STATE' : 'INTER_STATE';
    const cgstAmount = isIntraState ? Number((taxAmount / 2).toFixed(2)) : 0;
    const sgstAmount = isIntraState ? Number((taxAmount / 2).toFixed(2)) : 0;
    const igstAmount = isIntraState ? 0 : taxAmount;

    const poNumber = data.poNumber || OrderManager.generatePONumber();

    // Default expected delivery date based on supplier lead time
    const leadDays = supplier.leadTimeDays || 5;
    const expectedDeliveryDate = data.expectedDeliveryDate || new Date(Date.now() + leadDays * 24 * 60 * 60 * 1000);

    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      supplier: supplier._id,
      items,
      subtotal: calculatedSubtotal,
      gstRate,
      gstType,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxAmount,
      shippingCost,
      placeOfSupply: `${supplier.state || 'Maharashtra'} (${supplier.stateCode || '27'})`,
      ewayBillNo: data.ewayBillNo || '',
      warehouseGSTIN: '27AAACW8899F1Z4',
      warehouseAddress: 'Bhiwandi Logistics Hub, Building C-4, Thane, Maharashtra - 421302',
      totalAmount,
      status: data.status || 'PENDING',
      expectedDeliveryDate,
      notes: data.notes || '',
      createdBy: data.createdBy || null
    });

    await ActivityLog.create({
      action: 'Purchase Order Created',
      entityType: 'ORDER',
      details: `Created Purchase Order ${poNumber} for ${supplier.company} (₹${totalAmount.toLocaleString('en-IN')})`,
      badgeType: 'PRIMARY',
      metadata: { orderId: purchaseOrder._id, poNumber, supplierId: supplier._id }
    });

    return await PurchaseOrder.findById(purchaseOrder._id).populate('supplier').populate('items.product');
  }

  /**
   * Update Purchase Order Status with State Machine Logic
   */
  async updateStatus(orderId, newStatus, options = {}) {
    const validStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    const targetStatus = newStatus.toUpperCase();

    if (!validStatuses.includes(targetStatus)) {
      throw new Error(`Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await PurchaseOrder.findById(orderId).populate('supplier').populate('items.product');
    if (!order) {
      const error = new Error(`Purchase Order with ID ${orderId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = order.status;
    if (previousStatus === 'DELIVERED' && targetStatus !== 'DELIVERED') {
      throw new Error('Completed and delivered purchase orders cannot have their status reversed.');
    }

    order.status = targetStatus;

    // If marked as DELIVERED: Automatic stock-in for all items!
    if (targetStatus === 'DELIVERED' && previousStatus !== 'DELIVERED') {
      order.deliveredAt = new Date();

      for (const item of order.items) {
        if (item.product) {
          await inventoryManager.stockIn(
            item.product._id || item.product,
            item.quantity,
            {
              reason: `Automatic PO Delivery Receipt (${order.poNumber})`,
              referenceNumber: order.poNumber,
              user: options.user || 'Warehouse Receiver',
              costPrice: item.unitCost
            }
          );
        }
      }

      await ActivityLog.create({
        action: 'Purchase Order Delivered & Stocked',
        entityType: 'ORDER',
        details: `PO ${order.poNumber} marked as Delivered. Inventory auto-replenished for ${order.items.length} items.`,
        badgeType: 'SUCCESS',
        metadata: { orderId: order._id, poNumber: order.poNumber }
      });
    } else {
      await ActivityLog.create({
        action: 'Purchase Order Status Updated',
        entityType: 'ORDER',
        details: `PO ${order.poNumber} status changed from ${previousStatus} to ${targetStatus}`,
        badgeType: targetStatus === 'CANCELLED' ? 'DANGER' : 'INFO',
        metadata: { orderId: order._id, previousStatus, targetStatus }
      });
    }

    await order.save();
    return order;
  }

  /**
   * Get all Purchase Orders with populated supplier and product data
   */
  async getOrders(filter = {}, sort = { createdAt: -1 }) {
    return await PurchaseOrder.find(filter)
      .sort(sort)
      .populate('supplier')
      .populate('items.product');
  }

  /**
   * Get Single PO
   */
  async getOrderById(orderId) {
    const order = await PurchaseOrder.findById(orderId)
      .populate('supplier')
      .populate('items.product');
    if (!order) {
      const error = new Error(`Purchase Order with ID ${orderId} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return order;
  }
}

export const orderManager = new OrderManager();
