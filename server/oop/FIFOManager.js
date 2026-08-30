import { BaseService } from './BaseService.js';

/**
 * FIFOManager
 * OOP Service handling First In, First Out (FIFO) batch sorting and stock allocation
 */
class FIFOManager extends BaseService {
  constructor() {
    super('FIFOManager');
  }

  /**
   * Sort an array of batches using FIFO (earliest expiry date first)
   * If expiry dates are identical, fallback to earliest creation date
   * @param {Array} batches
   * @returns {Array} sorted batches
   */
  sortBatchesFIFO(batches) {
    if (!Array.isArray(batches)) return [];
    return [...batches].sort((a, b) => {
      const expA = new Date(a.expiryDate).getTime();
      const expB = new Date(b.expiryDate).getTime();
      if (expA !== expB) return expA - expB;
      return new Date(a.createdAt || a.mfgDate).getTime() - new Date(b.createdAt || b.mfgDate).getTime();
    });
  }

  /**
   * Calculate FIFO allocations for a dispatch request
   * @param {Array} activeBatches
   * @param {Number} requestedQty
   * @returns {Object} { allocations: [{ batchId, batchNumber, deductQty, remainingAfter }], totalAllocated, shortfall }
   */
  calculateFIFOAllocation(activeBatches, requestedQty) {
    const sorted = this.sortBatchesFIFO(activeBatches.filter((b) => b.remainingQuantity > 0));
    let remainingNeeded = Number(requestedQty);
    const allocations = [];

    for (const batch of sorted) {
      if (remainingNeeded <= 0) break;

      const availableInBatch = Number(batch.remainingQuantity);
      const deduct = Math.min(availableInBatch, remainingNeeded);

      allocations.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        mfgDate: batch.mfgDate,
        location: batch.location,
        deductQty: deduct,
        currentRemaining: availableInBatch,
        remainingAfter: availableInBatch - deduct,
        daysToExpiry: batch.daysToExpiry
      });

      remainingNeeded -= deduct;
    }

    return {
      allocations,
      totalAllocated: Number(requestedQty) - remainingNeeded,
      shortfall: Math.max(0, remainingNeeded),
      isFullySatisfied: remainingNeeded === 0
    };
  }

  /**
   * Determine urgency status based on days to expiry
   * @param {Number} days
   * @returns {String} 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'HEALTHY'
   */
  getExpiryUrgency(days) {
    if (days === null || days === undefined) return 'HEALTHY';
    if (days <= 0) return 'EXPIRED';
    if (days <= 20) return 'CRITICAL';
    if (days <= 60) return 'WARNING';
    return 'HEALTHY';
  }
}

export default new FIFOManager();
