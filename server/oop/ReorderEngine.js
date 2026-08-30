/**
 * ReorderEngine - Smart Inventory Replenishment & DSA Urgency Analyzer
 * 
 * Computes:
 * 1. Daily Sales Velocity (V_d) = weeklySales / 7
 * 2. Lead Time Demand (LTD) = V_d * leadTimeDays
 * 3. Reorder Point (ROP) = LTD + safetyStock
 * 4. Days Until Stockout = currentStock / V_d
 * 5. Suggested Reorder Quantity = (30 Days Target Demand + SafetyStock) - currentStock
 * 6. Urgency Score Ranking (Priority Queue / Comparator)
 */

export class ReorderEngine {
  /**
   * Evaluates a single product and computes smart replenishment metrics
   * @param {Object} product - Product document
   * @param {Object|null} supplier - Supplier document (or populated object)
   * @returns {Object} Smart Reorder Analysis
   */
  static analyzeProduct(product, supplier = null) {
    const stock = Number(product.stock) || 0;
    const weeklySales = Number(product.weeklySales) || 0;
    const minAlert = Number(product.minStockAlert) || 15;
    const safetyStock = Number(product.safetyStock) || 5;
    const costPrice = Number(product.costPrice) || 0;
    
    // Supplier lead time in days (defaults to 5 days if unassigned)
    const leadTimeDays = supplier && supplier.leadTimeDays ? Number(supplier.leadTimeDays) : 5;
    
    // 1. Daily Sales Velocity
    const dailyVelocity = weeklySales > 0 ? Number((weeklySales / 7).toFixed(2)) : 0;
    
    // 2. Lead Time Demand (Units needed while waiting for supplier shipment)
    const leadTimeDemand = Math.ceil(dailyVelocity * leadTimeDays);
    
    // 3. Reorder Point (When stock hits this level, an order must be placed)
    const reorderPoint = leadTimeDemand + safetyStock;
    
    // 4. Days until stockout
    const daysUntilStockout = dailyVelocity > 0 
      ? Number((stock / dailyVelocity).toFixed(1))
      : (stock === 0 ? 0 : 999);
    
    // 5. Stock Health & Replenishment Flag
    let status = 'HEALTHY';
    let urgencyLevel = 'LOW'; // LOW, MEDIUM, HIGH, CRITICAL
    let reorderNeeded = false;
    let warningMessage = 'Stock levels are optimal.';

    if (stock === 0) {
      status = 'OUT_OF_STOCK';
      urgencyLevel = 'CRITICAL';
      reorderNeeded = true;
      warningMessage = '⚫ Out of Stock! Immediate replenishment required.';
    } else if (stock <= safetyStock || (dailyVelocity > 0 && daysUntilStockout <= leadTimeDays)) {
      status = 'CRITICAL';
      urgencyLevel = 'CRITICAL';
      reorderNeeded = true;
      warningMessage = `🔴 Critical stockout risk! Only ${daysUntilStockout} days of inventory remaining (Lead time: ${leadTimeDays} days).`;
    } else if (stock <= reorderPoint || stock <= minAlert) {
      status = 'LOW';
      urgencyLevel = 'HIGH';
      reorderNeeded = true;
      warningMessage = `🟡 Reorder Recommended. Current stock (${stock}) is at or below Reorder Point (${reorderPoint}).`;
    }

    // 6. Suggested Order Quantity (Coverage for 30 days cycle + Safety Stock - Current Stock)
    let suggestedQty = 0;
    if (reorderNeeded) {
      const targetDemand30Days = Math.ceil(dailyVelocity * 30);
      const neededQty = (targetDemand30Days + safetyStock) - stock;
      // Guardrails: ensure a practical batch size
      suggestedQty = Math.max(neededQty, minAlert * 2, 20);
      // Round to nearest 5 for clean warehouse packing
      suggestedQty = Math.ceil(suggestedQty / 5) * 5;
    }

    // Estimated reorder cost in ₹ INR
    const estimatedCost = suggestedQty * costPrice;

    // Numerical Urgency Score for sorting / priority queue
    // Higher score = higher priority to reorder first
    const urgencyScore = stock === 0
      ? 1000 + (weeklySales * 5)
      : Number(((Math.max(0, reorderPoint - stock + 10) * (weeklySales + 1)) / (Math.max(1, daysUntilStockout))).toFixed(2));

    return {
      productId: product._id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: stock,
      weeklySales,
      dailyVelocity,
      leadTimeDays,
      safetyStock,
      reorderPoint,
      daysUntilStockout,
      status,
      urgencyLevel,
      urgencyScore,
      reorderNeeded,
      warningMessage,
      suggestedQuantity: suggestedQty,
      costPrice,
      estimatedCost,
      supplier: supplier ? {
        id: supplier._id,
        name: supplier.name,
        company: supplier.company,
        email: supplier.email,
        phone: supplier.phone,
        leadTimeDays: supplier.leadTimeDays
      } : null
    };
  }

  /**
   * Analyzes an array of products and returns sorted recommendations using DSA Priority Scoring
   * @param {Array} products - List of populated product objects
   * @returns {Object} { recommendations: Array, summary: Object }
   */
  static generateRecommendations(products) {
    const allAnalyses = products.map(p => {
      const supp = p.supplier && typeof p.supplier === 'object' ? p.supplier : null;
      return this.analyzeProduct(p, supp);
    });

    // Filter only items needing reorder
    const reorderList = allAnalyses.filter(item => item.reorderNeeded);

    // DSA Sorting (Quicksort / Comparator based on urgency score descending)
    reorderList.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Summary metrics
    const totalSuggestedUnits = reorderList.reduce((acc, curr) => acc + curr.suggestedQuantity, 0);
    const totalEstimatedCapital = reorderList.reduce((acc, curr) => acc + curr.estimatedCost, 0);
    const criticalCount = reorderList.filter(item => item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK').length;
    const lowCount = reorderList.filter(item => item.status === 'LOW').length;

    return {
      recommendations: reorderList,
      summary: {
        totalItemsToReorder: reorderList.length,
        criticalItemsCount: criticalCount,
        lowStockItemsCount: lowCount,
        totalSuggestedUnits,
        totalEstimatedCapital
      },
      allProductsAnalysis: allAnalyses
    };
  }
}
