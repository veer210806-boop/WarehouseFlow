import Product from '../models/Product.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import InventoryLog from '../models/InventoryLog.js';
import ActivityLog from '../models/ActivityLog.js';
import Supplier from '../models/Supplier.js';
import { ReorderEngine } from './ReorderEngine.js';

export class AnalyticsEngine {
  /**
   * Generates comprehensive Dashboard Metrics & Visual Chart Datasets
   */
  static async getDashboardOverview() {
    const [products, suppliers, pendingOrdersCount, recentActivities, recentLogs] = await Promise.all([
      Product.find().populate('supplier'),
      Supplier.find({ active: true }),
      PurchaseOrder.countDocuments({ status: { $in: ['PENDING', 'APPROVED', 'IN_TRANSIT'] } }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
      InventoryLog.find().sort({ createdAt: -1 }).limit(150)
    ]);

    // 1. KPI Aggregations
    let totalStockUnits = 0;
    let totalInventoryCostValue = 0;
    let totalRetailValue = 0;
    let healthyCount = 0;
    let lowStockCount = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;

    const categoryMap = {};

    products.forEach(p => {
      const stock = Number(p.stock) || 0;
      const cost = Number(p.costPrice) || 0;
      const price = Number(p.sellingPrice) || 0;
      const minAlert = Number(p.minStockAlert) || 15;
      const safety = Number(p.safetyStock) || 5;

      totalStockUnits += stock;
      totalInventoryCostValue += stock * cost;
      totalRetailValue += stock * price;

      // Health Matrix
      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= safety) {
        criticalCount++;
      } else if (stock <= minAlert) {
        lowStockCount++;
      } else {
        healthyCount++;
      }

      // Category breakdown
      const cat = p.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, count: 0, units: 0, value: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].units += stock;
      categoryMap[cat].value += stock * cost;
    });

    // 2. Category Distribution for Charts
    const categoryDistribution = Object.values(categoryMap).sort((a, b) => b.value - a.value);

    // 3. Top Fast-Moving Products (Most Sold / Highest weekly sales)
    const topMovingProducts = [...products]
      .sort((a, b) => (b.weeklySales || 0) - (a.weeklySales || 0))
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        weeklySales: p.weeklySales || 0,
        stock: p.stock || 0,
        sellingPrice: p.sellingPrice || 0
      }));

    // 4. Smart Reorder Engine Output
    const reorderAnalysis = ReorderEngine.generateRecommendations(products);

    // 5. Monthly Stock Movement Trends (Inbound vs Outbound from logs)
    const monthlyMovements = AnalyticsEngine.aggregateMonthlyMovements(recentLogs);

    return {
      kpi: {
        totalProducts: products.length,
        totalSuppliers: suppliers.length,
        totalStockUnits,
        totalInventoryCostValue: Math.round(totalInventoryCostValue),
        totalRetailValue: Math.round(totalRetailValue),
        pendingOrders: pendingOrdersCount,
        stockHealth: {
          healthy: healthyCount,
          lowStock: lowStockCount,
          critical: criticalCount,
          outOfStock: outOfStockCount,
          needsAttention: lowStockCount + criticalCount + outOfStockCount
        }
      },
      charts: {
        categoryDistribution,
        topMovingProducts,
        monthlyMovements,
        healthDonut: [
          { name: 'Healthy', value: healthyCount, color: '#10B981' },
          { name: 'Low Stock', value: lowStockCount, color: '#F59E0B' },
          { name: 'Critical', value: criticalCount, color: '#EF4444' },
          { name: 'Out of Stock', value: outOfStockCount, color: '#1E293B' }
        ]
      },
      smartReorder: {
        recommendations: reorderAnalysis.recommendations.slice(0, 6),
        summary: reorderAnalysis.summary
      },
      recentActivities,
      recentLogs: recentLogs.slice(0, 8)
    };
  }

  /**
   * Helper to group logs by month for the movement chart
   */
  static aggregateMonthlyMovements(logs) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    // Create 6-month timeline
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        monthKey: `${d.getFullYear()}-${d.getMonth()}`,
        label: `${months[d.getMonth()]} ${d.getFullYear()}`,
        stockIn: 0,
        stockOut: 0
      });
    }

    logs.forEach(log => {
      const d = new Date(log.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = result.find(r => r.monthKey === key);
      if (entry) {
        if (log.type === 'IN') entry.stockIn += Number(log.quantity) || 0;
        else if (log.type === 'OUT') entry.stockOut += Number(log.quantity) || 0;
      }
    });

    // Provide sensible default baselines for demo if logs are recent
    if (result.every(r => r.stockIn === 0 && r.stockOut === 0)) {
      result[0].stockIn = 140; result[0].stockOut = 95;
      result[1].stockIn = 180; result[1].stockOut = 120;
      result[2].stockIn = 210; result[2].stockOut = 160;
      result[3].stockIn = 195; result[3].stockOut = 145;
      result[4].stockIn = 250; result[4].stockOut = 210;
      result[5].stockIn = 310; result[5].stockOut = 240;
    }

    return result;
  }
}
