/**
 * Client-Side In-Memory Warehouse Engine
 * Automatically activates on static hosting (e.g. Vercel) when a standalone backend is not present,
 * ensuring the live demo works instantly with 100% interactive functionality and zero server dependencies.
 */

const STORAGE_KEY = 'warehouseflow_mock_db_v1';

function getDefaultData() {
  const now = new Date();

  const suppliers = [
    {
      _id: 'supp_01',
      name: 'Rajesh Malhotra',
      company: 'Punjab Food Mills & Grains Ltd',
      email: 'sales@punjabfoodmills.in',
      phone: '+91 98201 45678',
      address: 'Plot 42, GT Road Industrial Area, Ludhiana, Punjab - 141003',
      leadTimeDays: 4,
      paymentTerms: 'Net 30 (RTGS/NEFT)',
      rating: 4.9,
      active: true
    },
    {
      _id: 'supp_02',
      name: 'Sunita Venkatesh',
      company: 'Bangalore Gadgets & Mobile Tech',
      email: 'orders@bangaloregadgets.com',
      phone: '+91 80234 56789',
      address: '14/B Electronic City Phase 1, Bengaluru, Karnataka - 560100',
      leadTimeDays: 5,
      paymentTerms: 'Net 15 (UPI/NEFT)',
      rating: 4.8,
      active: true
    },
    {
      _id: 'supp_03',
      name: 'Vikram Joshi',
      company: 'Mumbai Home Essentials & Lighting',
      email: 'contact@mumbaihome.co.in',
      phone: '+91 94251 12345',
      address: 'B-108, MIDC Industrial Area, Pune, Maharashtra - 411026',
      leadTimeDays: 3,
      paymentTerms: 'Net 30',
      rating: 4.7,
      active: true
    },
    {
      _id: 'supp_04',
      name: 'Deepak Agarwal',
      company: 'Surat Eco Packaging & Boxes',
      email: 'support@suratpack.in',
      phone: '+91 98790 33445',
      address: 'Plot 88, GIDC Industrial Estate, Surat, Gujarat - 395006',
      leadTimeDays: 3,
      paymentTerms: 'Immediate UPI/RTGS',
      rating: 4.6,
      active: true
    },
    {
      _id: 'supp_05',
      name: 'Ananya Roy',
      company: 'Delhi Stationery & Office Supplies',
      email: 'info@delhistationery.com',
      phone: '+91 93310 99887',
      address: 'Sector 5, Connaught Place, New Delhi - 110001',
      leadTimeDays: 4,
      paymentTerms: 'Net 30',
      rating: 4.8,
      active: true
    }
  ];

  const products = [
    {
      _id: 'prod_01',
      sku: 'GRO-RICE-5KG',
      name: 'Royal Basmati Rice (5 Kg Bag)',
      category: 'Groceries',
      description: 'Premium long-grain aged aromatic Basmati rice, carefully packed for freshness.',
      costPrice: 420,
      sellingPrice: 620,
      stock: 85,
      minStockAlert: 30,
      safetyStock: 10,
      weeklySales: 35,
      supplier: suppliers[0],
      unit: 'Bags',
      location: 'Aisle 1 - Section A',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString()
    },
    {
      _id: 'prod_02',
      sku: 'GRO-TEA-500G',
      name: 'Tata Tea Gold Leaf (500g Pack)',
      category: 'Groceries',
      description: 'Rich aroma CTC tea blend with gently rolled aromatic long leaves.',
      costPrice: 240,
      sellingPrice: 330,
      stock: 12,
      minStockAlert: 25,
      safetyStock: 8,
      weeklySales: 28,
      supplier: suppliers[0],
      unit: 'Packs',
      location: 'Aisle 1 - Section B',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString()
    },
    {
      _id: 'prod_03',
      sku: 'ELE-CBL-TYPEC',
      name: 'boAt Fast Charging Type-C USB Cable (1.5m)',
      category: 'Electronics',
      description: 'Braided tangle-free fast charging mobile data cable with 3A power delivery.',
      costPrice: 180,
      sellingPrice: 399,
      stock: 4,
      minStockAlert: 15,
      safetyStock: 6,
      weeklySales: 18,
      supplier: suppliers[1],
      unit: 'Pieces',
      location: 'Aisle 3 - Shelf E-12',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 13 * 86400000).toISOString()
    },
    {
      _id: 'prod_04',
      sku: 'ELE-LED-9W',
      name: 'Havells 9W Cool Day LED Bulb (Pack of 2)',
      category: 'Electrical',
      description: 'Energy saving bright LED light bulbs with 1 year replacement warranty.',
      costPrice: 160,
      sellingPrice: 270,
      stock: 0,
      minStockAlert: 20,
      safetyStock: 5,
      weeklySales: 22,
      supplier: suppliers[2],
      unit: 'Packs',
      location: 'Aisle 3 - Shelf E-05',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString()
    },
    {
      _id: 'prod_05',
      sku: 'HOM-BOT-1L',
      name: 'Milton Stainless Steel Water Bottle (1 Litre)',
      category: 'Home & Kitchen',
      description: 'Rust-proof insulated thermo-steel water bottle for daily school and office use.',
      costPrice: 480,
      sellingPrice: 750,
      stock: 45,
      minStockAlert: 20,
      safetyStock: 8,
      weeklySales: 16,
      supplier: suppliers[2],
      unit: 'Pieces',
      location: 'Aisle 2 - Shelf B-01',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 11 * 86400000).toISOString()
    },
    {
      _id: 'prod_06',
      sku: 'STA-NOTE-6PK',
      name: 'Classmate Long Notebooks (Pack of 6)',
      category: 'Stationery',
      description: 'High-quality smooth ruled white paper notebooks for school and college.',
      costPrice: 210,
      sellingPrice: 320,
      stock: 90,
      minStockAlert: 30,
      safetyStock: 12,
      weeklySales: 40,
      supplier: suppliers[4],
      unit: 'Packs',
      location: 'Aisle 4 - Shelf D-02',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString()
    },
    {
      _id: 'prod_07',
      sku: 'STA-PEN-GOLD',
      name: 'Parker Classic Gold Ball Pen',
      category: 'Stationery',
      description: 'Premium stainless steel gold-plated ballpoint pen with smooth blue ink refill.',
      costPrice: 190,
      sellingPrice: 320,
      stock: 6,
      minStockAlert: 12,
      safetyStock: 4,
      weeklySales: 10,
      supplier: suppliers[4],
      unit: 'Pieces',
      location: 'Aisle 4 - Shelf D-06',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 9 * 86400000).toISOString()
    },
    {
      _id: 'prod_08',
      sku: 'PCK-BOX-M25',
      name: 'Brown Corrugated Packing Boxes (Pack of 25)',
      category: 'Packaging',
      description: 'Strong 3-ply heavy duty brown cardboard delivery and storage boxes.',
      costPrice: 650,
      sellingPrice: 950,
      stock: 120,
      minStockAlert: 40,
      safetyStock: 15,
      weeklySales: 60,
      supplier: suppliers[3],
      unit: 'Bags',
      location: 'Aisle 5 - Pallet Zone',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString()
    },
    {
      _id: 'prod_09',
      sku: 'PCK-BUB-20M',
      name: 'Plastic Bubble Wrap Roll (20 Meters)',
      category: 'Packaging',
      description: 'Protective air cushion packaging wrap to safeguard fragile items during delivery.',
      costPrice: 320,
      sellingPrice: 520,
      stock: 8,
      minStockAlert: 20,
      safetyStock: 10,
      weeklySales: 30,
      supplier: suppliers[3],
      unit: 'Rolls',
      location: 'Aisle 5 - Rack C',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString()
    },
    {
      _id: 'prod_10',
      sku: 'HRD-LOCK-3K',
      name: 'Godrej 7-Lever Brass Padlock with 3 Keys',
      category: 'Hardware',
      description: 'Solid heavy brass safety lock for warehouse shutters, shops, and main gates.',
      costPrice: 380,
      sellingPrice: 590,
      stock: 35,
      minStockAlert: 15,
      safetyStock: 5,
      weeklySales: 12,
      supplier: suppliers[2],
      unit: 'Pieces',
      location: 'Aisle 2 - Shelf A-04',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 6 * 86400000).toISOString()
    },
    {
      _id: 'prod_11',
      sku: 'PER-HAND-750',
      name: 'Dettol Liquid Handwash Refill (750 ml)',
      category: 'Personal Care',
      description: 'Antibacterial germ protection liquid hand wash refill pouch.',
      costPrice: 110,
      sellingPrice: 175,
      stock: 70,
      minStockAlert: 25,
      safetyStock: 10,
      weeklySales: 25,
      supplier: suppliers[0],
      unit: 'Packs',
      location: 'Aisle 1 - Section C',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString()
    }
  ];

  const orders = [
    {
      _id: 'po_01',
      poNumber: 'PO-20260825-1001',
      supplier: suppliers[0],
      items: [
        { product: products[0], sku: products[0].sku, name: products[0].name, quantity: 50, unitCost: 420, total: 21000 },
        { product: products[1], sku: products[1].sku, name: products[1].name, quantity: 40, unitCost: 240, total: 9600 }
      ],
      subtotal: 30600,
      taxAmount: 1530,
      shippingCost: 800,
      totalAmount: 32930,
      status: 'DELIVERED',
      deliveredAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      notes: 'Initial Basmati Rice and Tea delivery',
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString()
    },
    {
      _id: 'po_02',
      poNumber: 'PO-20260828-1002',
      supplier: suppliers[1],
      items: [
        { product: products[2], sku: products[2].sku, name: products[2].name, quantity: 30, unitCost: 180, total: 5400 }
      ],
      subtotal: 5400,
      taxAmount: 972,
      shippingCost: 300,
      totalAmount: 6672,
      status: 'IN_TRANSIT',
      expectedDeliveryDate: new Date(now.getTime() + 2 * 86400000).toISOString(),
      notes: 'Fast charging cables order',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString()
    },
    {
      _id: 'po_03',
      poNumber: 'PO-20260829-1003',
      supplier: suppliers[2],
      items: [
        { product: products[3], sku: products[3].sku, name: products[3].name, quantity: 50, unitCost: 160, total: 8000 }
      ],
      subtotal: 8000,
      taxAmount: 1440,
      shippingCost: 400,
      totalAmount: 9840,
      status: 'PENDING',
      expectedDeliveryDate: new Date(now.getTime() + 3 * 86400000).toISOString(),
      notes: 'Havells LED bulbs order',
      createdAt: new Date(now.getTime() - 86400000).toISOString()
    }
  ];

  const logs = [
    {
      _id: 'log_01',
      product: products[0],
      sku: products[0].sku,
      productName: products[0].name,
      type: 'IN',
      quantity: 50,
      previousStock: 35,
      newStock: 85,
      reason: 'Received shipment from Punjab Food Mills (PO-20260825-1001)',
      referenceNumber: 'PO-20260825-1001',
      user: 'Veer Goel (Admin)',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString()
    },
    {
      _id: 'log_02',
      product: products[1],
      sku: products[1].sku,
      productName: products[1].name,
      type: 'OUT',
      quantity: 15,
      previousStock: 27,
      newStock: 12,
      reason: 'Dispatched to retail clients',
      referenceNumber: 'SO-9021',
      user: 'Rohan Gupta (Warehouse Mgr)',
      createdAt: new Date(now.getTime() - 86400000).toISOString()
    },
    {
      _id: 'log_03',
      product: products[3],
      sku: products[3].sku,
      productName: products[3].name,
      type: 'OUT',
      quantity: 20,
      previousStock: 20,
      newStock: 0,
      reason: 'Bulk order dispatch',
      referenceNumber: 'SO-9044',
      user: 'Rohan Gupta (Warehouse Mgr)',
      createdAt: new Date(now.getTime() - 28800000).toISOString()
    }
  ];

  const activities = [
    {
      _id: 'act_01',
      action: 'WarehouseFlow Online',
      entityType: 'SYSTEM',
      details: 'Cloud workspace initialized with 11 SKUs and 5 suppliers.',
      badgeType: 'PRIMARY',
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString()
    },
    {
      _id: 'act_02',
      action: 'Stock Received',
      entityType: 'INVENTORY',
      details: 'Received 50 bags of Royal Basmati Rice (PO-20260825-1001).',
      badgeType: 'SUCCESS',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString()
    },
    {
      _id: 'act_03',
      action: 'Items Dispatched',
      entityType: 'INVENTORY',
      details: 'Dispatched 15 packs of Tata Tea Gold for customer dispatch.',
      badgeType: 'INFO',
      createdAt: new Date(now.getTime() - 86400000).toISOString()
    },
    {
      _id: 'act_04',
      action: 'Low Stock Alert',
      entityType: 'PRODUCT',
      details: 'Havells 9W LED Bulb reached 0 units (Out of Stock).',
      badgeType: 'DANGER',
      createdAt: new Date(now.getTime() - 28800000).toISOString()
    }
  ];

  const batches = [
    {
      _id: 'bat_01',
      batchNumber: 'BATCH-2026-AUG-01',
      product: products[0],
      productName: products[0].name,
      sku: products[0].sku,
      initialQuantity: 50,
      remainingQuantity: 50,
      unit: products[0].unit,
      mfgDate: new Date('2026-08-01'),
      expiryDate: new Date('2027-02-15'),
      costPrice: products[0].costPrice,
      supplier: suppliers[0],
      supplierName: suppliers[0].company,
      location: 'Aisle 1 - Section A',
      status: 'ACTIVE',
      notes: 'Freshly milled harvest'
    },
    {
      _id: 'bat_02',
      batchNumber: 'BATCH-2026-JUN-15',
      product: products[0],
      productName: products[0].name,
      sku: products[0].sku,
      initialQuantity: 35,
      remainingQuantity: 35,
      unit: products[0].unit,
      mfgDate: new Date('2026-06-15'),
      expiryDate: new Date(now.getTime() + 21 * 86400000),
      costPrice: products[0].costPrice,
      supplier: suppliers[0],
      supplierName: suppliers[0].company,
      location: 'Aisle 1 - Section A',
      status: 'ACTIVE',
      notes: 'FIFO Priority Batch'
    }
  ];

  return { suppliers, products, orders, logs, activities, batches };
}

class ClientMockStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    const fresh = getDefaultData();
    this.save(fresh);
    return fresh;
  }

  save(data) {
    this.data = data || this.data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      // ignore
    }
  }

  reset() {
    const fresh = getDefaultData();
    this.save(fresh);
    return fresh;
  }

  // --- Auth ---
  login(email, password) {
    const isManager = (email || '').toLowerCase().includes('manager');
    const user = {
      id: isManager ? 'usr_mgr_002' : 'usr_admin_001',
      name: isManager ? 'Rohan Gupta (Warehouse Mgr)' : 'Veer Goel (Admin)',
      email: email || 'admin@warehouseflow.com',
      role: isManager ? 'WAREHOUSE_MANAGER' : 'ADMIN'
    };
    return { success: true, token: 'mock_jwt_token_' + Date.now(), user };
  }

  // --- Dashboard ---
  getDashboard() {
    const { products, suppliers, orders, activities, logs } = this.data;
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

      if (stock === 0) outOfStockCount++;
      else if (stock <= safety) criticalCount++;
      else if (stock <= minAlert) lowStockCount++;
      else healthyCount++;

      const cat = p.category || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { category: cat, count: 0, units: 0, value: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].units += stock;
      categoryMap[cat].value += stock * cost;
    });

    const categoryDistribution = Object.values(categoryMap).sort((a, b) => b.value - a.value);
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

    const recommendations = this.getReorderRecommendations().recommendations;
    const pendingOrdersCount = orders.filter(o => ['PENDING', 'APPROVED', 'IN_TRANSIT'].includes(o.status)).length;

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
        monthlyMovements: [
          { label: 'May 2026', stockIn: 180, stockOut: 130 },
          { label: 'Jun 2026', stockIn: 210, stockOut: 160 },
          { label: 'Jul 2026', stockIn: 240, stockOut: 190 },
          { label: 'Aug 2026', stockIn: 290, stockOut: 220 },
          { label: 'Sep 2026', stockIn: 320, stockOut: 260 },
          { label: 'Oct 2026', stockIn: 350, stockOut: 290 }
        ],
        healthDonut: [
          { name: 'Healthy', value: healthyCount, color: '#10B981' },
          { name: 'Low Stock', value: lowStockCount, color: '#F59E0B' },
          { name: 'Critical', value: criticalCount, color: '#EF4444' },
          { name: 'Out of Stock', value: outOfStockCount, color: '#1E293B' }
        ]
      },
      smartReorder: {
        recommendations: recommendations.slice(0, 6),
        summary: {
          totalItemsToReorder: recommendations.length,
          criticalItemsCount: recommendations.filter(r => r.status === 'CRITICAL' || r.status === 'OUT_OF_STOCK').length,
          lowStockItemsCount: recommendations.filter(r => r.status === 'LOW').length,
          totalSuggestedUnits: recommendations.reduce((acc, r) => acc + r.suggestedQuantity, 0),
          totalEstimatedCapital: recommendations.reduce((acc, r) => acc + r.estimatedCost, 0)
        }
      },
      recentActivities: activities.slice(0, 8),
      recentLogs: logs.slice(0, 8)
    };
  }

  // --- Products ---
  getProducts(params = {}) {
    let list = [...this.data.products];
    const { search, category, healthStatus, sortBy = 'createdAt', order = 'desc' } = params;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
    }
    if (category && category !== 'ALL') {
      list = list.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (healthStatus && healthStatus !== 'ALL') {
      list = list.filter(p => {
        let h = 'HEALTHY';
        if (p.stock === 0) h = 'OUT_OF_STOCK';
        else if (p.stock <= (p.safetyStock || 5)) h = 'CRITICAL';
        else if (p.stock <= (p.minStockAlert || 15)) h = 'LOW';
        return h === healthStatus;
      });
    }

    list.sort((a, b) => {
      let va = a[sortBy] ?? '';
      let vb = b[sortBy] ?? '';
      if (typeof va === 'string') return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return order === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
    });

    return {
      success: true,
      count: list.length,
      data: list,
      pagination: { total: list.length, page: 1, limit: 100, totalPages: 1 }
    };
  }

  createProduct(data) {
    const supp = this.data.suppliers.find(s => String(s._id) === String(data.supplier)) || null;
    const newProd = {
      _id: 'prod_' + Date.now(),
      ...data,
      stock: Number(data.stock) || 0,
      costPrice: Number(data.costPrice) || 0,
      sellingPrice: Number(data.sellingPrice) || 0,
      weeklySales: Number(data.weeklySales) || 10,
      supplier: supp,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProd);
    this.data.activities.unshift({
      _id: 'act_' + Date.now(),
      action: 'Product Created',
      details: `Added new product "${newProd.name}" (${newProd.sku})`,
      badgeType: 'SUCCESS',
      createdAt: new Date().toISOString()
    });
    this.save();
    return newProd;
  }

  updateProduct(id, data) {
    const idx = this.data.products.findIndex(p => String(p._id) === String(id));
    if (idx === -1) return null;
    const updated = { ...this.data.products[idx], ...data, updatedAt: new Date().toISOString() };
    if (data.supplier) {
      updated.supplier = this.data.suppliers.find(s => String(s._id) === String(data.supplier)) || updated.supplier;
    }
    this.data.products[idx] = updated;
    this.save();
    return updated;
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => String(p._id) === String(id));
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Inventory Control ---
  stockIn(productId, quantity, opts = {}) {
    const p = this.data.products.find(x => String(x._id) === String(productId));
    if (!p) throw new Error('Product not found');
    const prev = p.stock;
    p.stock += Number(quantity);

    const log = {
      _id: 'log_' + Date.now(),
      product: p,
      sku: p.sku,
      productName: p.name,
      type: 'IN',
      quantity: Number(quantity),
      previousStock: prev,
      newStock: p.stock,
      reason: opts.reason || 'Goods Inward Receipt',
      referenceNumber: opts.referenceNumber || `IN-${Date.now().toString().slice(-6)}`,
      user: opts.user || 'Veer Goel (Admin)',
      createdAt: new Date().toISOString()
    };
    this.data.logs.unshift(log);
    this.data.activities.unshift({
      _id: 'act_' + Date.now(),
      action: 'Stock Received',
      details: `Added ${quantity} units of "${p.name}". New Stock: ${p.stock}`,
      badgeType: 'SUCCESS',
      createdAt: new Date().toISOString()
    });
    this.save();
    return { product: p, log };
  }

  stockOut(productId, quantity, opts = {}) {
    const p = this.data.products.find(x => String(x._id) === String(productId));
    if (!p) throw new Error('Product not found');
    if (p.stock < Number(quantity)) throw new Error(`Insufficient stock. Available: ${p.stock}`);
    const prev = p.stock;
    p.stock -= Number(quantity);

    const log = {
      _id: 'log_' + Date.now(),
      product: p,
      sku: p.sku,
      productName: p.name,
      type: 'OUT',
      quantity: Number(quantity),
      previousStock: prev,
      newStock: p.stock,
      reason: opts.reason || 'Sales Dispatch',
      referenceNumber: opts.referenceNumber || `OUT-${Date.now().toString().slice(-6)}`,
      user: opts.user || 'Rohan Gupta (Warehouse Mgr)',
      createdAt: new Date().toISOString()
    };
    this.data.logs.unshift(log);
    this.data.activities.unshift({
      _id: 'act_' + Date.now(),
      action: 'Stock Dispatched',
      details: `Dispatched ${quantity} units of "${p.name}". Remaining: ${p.stock}`,
      badgeType: 'INFO',
      createdAt: new Date().toISOString()
    });
    this.save();
    return { product: p, log };
  }

  adjustStock(productId, newStock, opts = {}) {
    const p = this.data.products.find(x => String(x._id) === String(productId));
    if (!p) throw new Error('Product not found');
    const prev = p.stock;
    p.stock = Number(newStock);

    const log = {
      _id: 'log_' + Date.now(),
      product: p,
      sku: p.sku,
      productName: p.name,
      type: 'ADJUSTMENT',
      quantity: p.stock - prev,
      previousStock: prev,
      newStock: p.stock,
      reason: opts.reason || 'Audit Adjustment',
      referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      user: opts.user || 'Veer Goel (Admin)',
      createdAt: new Date().toISOString()
    };
    this.data.logs.unshift(log);
    this.save();
    return { product: p, log };
  }

  // --- Suppliers ---
  getSuppliers() {
    return this.data.suppliers.map(s => {
      const productCount = this.data.products.filter(p => p.supplier && String(p.supplier._id) === String(s._id)).length;
      const pendingOrders = this.data.orders.filter(o => o.supplier && String(o.supplier._id) === String(s._id) && ['PENDING', 'APPROVED', 'IN_TRANSIT'].includes(o.status)).length;
      return { ...s, productCount, pendingOrders };
    });
  }

  createSupplier(data) {
    const newSupp = {
      _id: 'supp_' + Date.now(),
      ...data,
      active: true,
      leadTimeDays: Number(data.leadTimeDays) || 4,
      rating: Number(data.rating) || 4.8
    };
    this.data.suppliers.push(newSupp);
    this.save();
    return newSupp;
  }

  updateSupplier(id, data) {
    const idx = this.data.suppliers.findIndex(s => String(s._id) === String(id));
    if (idx === -1) return null;
    this.data.suppliers[idx] = { ...this.data.suppliers[idx], ...data };
    this.save();
    return this.data.suppliers[idx];
  }

  deleteSupplier(id) {
    const idx = this.data.suppliers.findIndex(s => String(s._id) === String(id));
    if (idx === -1) return false;
    this.data.suppliers.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Orders ---
  getOrders(status, search) {
    let list = [...this.data.orders];
    if (status && status !== 'ALL') list = list.filter(o => o.status === status.toUpperCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => o.poNumber.toLowerCase().includes(q));
    }
    return list;
  }

  createOrder(data) {
    const supp = this.data.suppliers.find(s => String(s._id) === String(data.supplier));
    let subtotal = 0;
    const items = (data.items || []).map(it => {
      const p = this.data.products.find(x => String(x._id) === String(it.product));
      const qty = Number(it.quantity) || 1;
      const unitCost = Number(it.unitCost || (p ? p.costPrice : 0));
      const total = qty * unitCost;
      subtotal += total;
      return {
        product: p || { _id: it.product, name: it.name, sku: it.sku },
        sku: p ? p.sku : (it.sku || 'SKU'),
        name: p ? p.name : (it.name || 'Item'),
        quantity: qty,
        unitCost,
        total
      };
    });

    const taxAmount = Number((subtotal * 0.18).toFixed(2));
    const shippingCost = Number(data.shippingCost || 0);
    const totalAmount = subtotal + taxAmount + shippingCost;
    const poNumber = `PO-${Date.now().toString().slice(-8)}`;

    const newOrder = {
      _id: 'po_' + Date.now(),
      poNumber,
      supplier: supp || { company: 'Vendor' },
      items,
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      status: 'PENDING',
      expectedDeliveryDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id, newStatus) {
    const o = this.data.orders.find(x => String(x._id) === String(id));
    if (!o) return null;
    const prev = o.status;
    o.status = newStatus.toUpperCase();

    if (o.status === 'DELIVERED' && prev !== 'DELIVERED') {
      o.deliveredAt = new Date().toISOString();
      o.items.forEach(it => {
        try {
          this.stockIn(it.product?._id || it.product, it.quantity, {
            reason: `Auto Receipt from PO ${o.poNumber}`,
            referenceNumber: o.poNumber
          });
        } catch (e) {}
      });
    }
    this.save();
    return o;
  }

  deleteOrder(id) {
    const idx = this.data.orders.findIndex(x => String(x._id) === String(id));
    if (idx === -1) return false;
    this.data.orders.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Smart Reorder ---
  getReorderRecommendations() {
    const list = this.data.products.map(p => {
      const stock = Number(p.stock) || 0;
      const weeklySales = Number(p.weeklySales) || 0;
      const leadTime = p.supplier?.leadTimeDays || 4;
      const dailyVelocity = Number((weeklySales / 7).toFixed(2));
      const leadTimeDemand = Math.ceil(dailyVelocity * leadTime);
      const safetyStock = Number(p.safetyStock) || 5;
      const reorderPoint = leadTimeDemand + safetyStock;
      const daysUntilStockout = dailyVelocity > 0 ? Number((stock / dailyVelocity).toFixed(1)) : 999;

      let status = 'HEALTHY';
      let reorderNeeded = false;
      let warningMessage = 'Optimal stock level';

      if (stock === 0) {
        status = 'OUT_OF_STOCK';
        reorderNeeded = true;
        warningMessage = '⚫ Out of Stock! Immediate reorder required.';
      } else if (stock <= safetyStock) {
        status = 'CRITICAL';
        reorderNeeded = true;
        warningMessage = `🔴 Critical safety stock alert! (${daysUntilStockout} days remaining)`;
      } else if (stock <= reorderPoint) {
        status = 'LOW';
        reorderNeeded = true;
        warningMessage = `🟡 Reorder recommended. Below Reorder Point (${reorderPoint}).`;
      }

      const suggestedQuantity = reorderNeeded ? Math.max(20, Math.ceil((dailyVelocity * 30 + safetyStock - stock) / 5) * 5) : 0;
      const urgencyScore = stock === 0 ? 1000 : (reorderPoint - stock) * 10;

      return {
        productId: p._id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        currentStock: stock,
        weeklySales,
        dailyVelocity,
        leadTimeDays: leadTime,
        safetyStock,
        reorderPoint,
        daysUntilStockout,
        status,
        urgencyLevel: status === 'OUT_OF_STOCK' || status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        urgencyScore,
        reorderNeeded,
        warningMessage,
        suggestedQuantity,
        costPrice: p.costPrice,
        estimatedCost: suggestedQuantity * p.costPrice,
        supplier: p.supplier
      };
    }).filter(r => r.reorderNeeded).sort((a, b) => b.urgencyScore - a.urgencyScore);

    return {
      recommendations: list,
      summary: {
        totalItemsToReorder: list.length,
        criticalItemsCount: list.filter(r => r.status === 'CRITICAL' || r.status === 'OUT_OF_STOCK').length,
        lowStockItemsCount: list.filter(r => r.status === 'LOW').length,
        totalSuggestedUnits: list.reduce((acc, r) => acc + r.suggestedQuantity, 0),
        totalEstimatedCapital: list.reduce((acc, r) => acc + r.estimatedCost, 0)
      }
    };
  }

  createReorderPO(productId, suggestedQuantity) {
    const p = this.data.products.find(x => String(x._id) === String(productId));
    if (!p) throw new Error('Product not found');
    const supp = p.supplier || this.data.suppliers[0];
    const qty = Number(suggestedQuantity) || 20;
    const unitCost = p.costPrice || 100;
    const subtotal = qty * unitCost;
    const taxAmount = Number((subtotal * 0.18).toFixed(2));
    const shippingCost = 350;
    const totalAmount = subtotal + taxAmount + shippingCost;
    const poNumber = `PO-${Date.now().toString().slice(-8)}`;

    const newOrder = {
      _id: 'po_' + Date.now(),
      poNumber,
      supplier: supp,
      items: [
        { product: p, sku: p.sku, name: p.name, quantity: qty, unitCost, total: subtotal }
      ],
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      status: 'PENDING',
      expectedDeliveryDate: new Date(Date.now() + (supp.leadTimeDays || 4) * 86400000).toISOString(),
      notes: `Automated Smart Reorder for ${p.name}`,
      createdAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);
    this.data.activities.unshift({
      _id: 'act_' + Date.now(),
      action: 'Reorder PO Created',
      details: `Generated ${poNumber} for ${qty} units of ${p.name}`,
      badgeType: 'PRIMARY',
      createdAt: new Date().toISOString()
    });
    this.save();
    return newOrder;
  }

  // --- Logs ---
  getLogs(type, limit = 100) {
    let list = [...this.data.logs];
    if (type && type !== 'ALL') {
      list = list.filter(l => l.type === type.toUpperCase());
    }
    return list.slice(0, Number(limit) || 100);
  }

  // --- Supplier Details & Scorecards ---
  getSupplierById(id) {
    const s = this.data.suppliers.find(x => String(x._id) === String(id));
    if (!s) return null;
    const suppliedProducts = this.data.products.filter(p => p.supplier && String(p.supplier._id) === String(s._id));
    const orders = this.data.orders.filter(o => o.supplier && String(o.supplier._id) === String(s._id));
    return {
      ...s,
      products: suppliedProducts,
      orders,
      onTimeDeliveryRate: s.onTimeDeliveryRate || 96.0,
      qualityDefectRate: s.qualityDefectRate || 1.0,
      priceStabilityScore: s.priceStabilityScore || 92.0,
      scorecardGrade: s.rating >= 4.8 ? 'A+' : s.rating >= 4.5 ? 'A' : s.rating >= 4.0 ? 'B' : 'C'
    };
  }

  getScorecards() {
    const suppliers = this.getSuppliers();
    return {
      summary: {
        totalSuppliers: suppliers.length,
        avgOnTimeRate: 96.1,
        avgDefectRate: 0.9,
        topSupplierName: suppliers[0]?.company || 'Punjab Food Mills & Grains Ltd',
        topSupplierRating: suppliers[0]?.rating || 4.9
      },
      suppliers
    };
  }

  recordInspection(id, data) {
    const s = this.data.suppliers.find(x => String(x._id) === String(id));
    if (!s) throw new Error('Supplier not found');
    if (data.onTimeDeliveryRate !== undefined) s.onTimeDeliveryRate = Number(data.onTimeDeliveryRate);
    if (data.qualityDefectRate !== undefined) s.qualityDefectRate = Number(data.qualityDefectRate);
    if (data.priceStabilityScore !== undefined) s.priceStabilityScore = Number(data.priceStabilityScore);
    this.save();
    return s;
  }

  // --- Orders By Id ---
  getOrderById(id) {
    return this.data.orders.find(o => String(o._id) === String(id)) || null;
  }

  // --- Batches & FIFO ---
  getBatches(params = {}) {
    let list = [...(this.data.batches || [])];
    const { status, search } = params;
    if (status && status !== 'ALL') {
      list = list.filter(b => b.status === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => 
        (b.batchNumber || '').toLowerCase().includes(q) || 
        (b.productName || '').toLowerCase().includes(q) || 
        (b.sku || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  getBatchSummary() {
    const batches = this.data.batches || [];
    const active = batches.filter(b => b.status === 'ACTIVE' && b.remainingQuantity > 0);
    const now = Date.now();
    let criticalCount = 0;
    let warningCount = 0;
    let healthyCount = 0;
    let capitalAtRisk = 0;

    const queue = active.map(b => {
      const exp = new Date(b.expiryDate).getTime();
      const daysLeft = Math.ceil((exp - now) / 86400000);
      let urgency = 'HEALTHY';
      if (daysLeft <= 15) {
        urgency = 'CRITICAL';
        criticalCount++;
        capitalAtRisk += (b.remainingQuantity * (b.costPrice || 100));
      } else if (daysLeft <= 45) {
        urgency = 'WARNING';
        warningCount++;
      } else {
        healthyCount++;
      }
      return { ...b, daysUntilExpiry: daysLeft, urgencyLevel: urgency };
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return {
      summary: {
        totalActiveBatches: active.length,
        criticalCount,
        warningCount,
        healthyCount,
        capitalAtRisk
      },
      fifoPriorityQueue: queue.slice(0, 5)
    };
  }

  createBatch(data) {
    const p = this.data.products.find(x => String(x._id) === String(data.productId));
    const supp = p?.supplier || this.data.suppliers[0];
    const qty = Number(data.quantity) || 50;

    const newBatch = {
      _id: 'bat_' + Date.now(),
      batchNumber: data.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
      product: p || { _id: data.productId, name: 'Item', sku: 'SKU' },
      productName: p ? p.name : 'Item',
      sku: p ? p.sku : 'SKU',
      initialQuantity: qty,
      remainingQuantity: qty,
      unit: p?.unit || 'Units',
      mfgDate: data.mfgDate || new Date().toISOString().split('T')[0],
      expiryDate: data.expiryDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      costPrice: p ? p.costPrice : 100,
      supplier: supp,
      supplierName: supp?.company || 'Supplier',
      location: data.location || p?.location || 'Aisle 1',
      status: 'ACTIVE',
      notes: data.notes || ''
    };

    if (!this.data.batches) this.data.batches = [];
    this.data.batches.unshift(newBatch);

    if (p) {
      try {
        this.stockIn(p._id, qty, {
          reason: `Batch Inward Receipt (${newBatch.batchNumber})`,
          referenceNumber: newBatch.batchNumber
        });
      } catch (e) {}
    }

    this.save();
    return newBatch;
  }

  dispatchFIFO(data) {
    const p = this.data.products.find(x => String(x._id) === String(data.productId));
    if (!p) throw new Error('Product not found');
    const qtyToDispatch = Number(data.quantity) || 1;

    const batches = (this.data.batches || [])
      .filter(b => (b.product?._id === p._id || b.sku === p.sku) && b.status === 'ACTIVE' && b.remainingQuantity > 0)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    let remaining = qtyToDispatch;
    for (const b of batches) {
      if (remaining <= 0) break;
      const deduct = Math.min(b.remainingQuantity, remaining);
      b.remainingQuantity -= deduct;
      remaining -= deduct;
      if (b.remainingQuantity === 0) b.status = 'DEPLETED';
    }

    this.stockOut(p._id, qtyToDispatch, {
      reason: data.reason || 'FIFO Oldest Stock Dispatch',
      referenceNumber: data.referenceNumber || `FIFO-${Date.now().toString().slice(-6)}`
    });

    this.save();
    return {
      success: true,
      dispatchedQuantity: qtyToDispatch,
      product: p
    };
  }
}

export const clientMockStore = new ClientMockStore();

export async function handleMockApiRequest(config) {
  const method = (config.method || 'get').toLowerCase();
  let url = config.url || '';

  // Clean base URL if present
  url = url.replace(/^https?:\/\/[^\/]+/, '');
  url = url.replace(/^\/api/, '');
  if (!url.startsWith('/')) url = '/' + url;

  const [pathname, queryString] = url.split('?');
  const params = { ...config.params };
  if (queryString) {
    const sp = new URLSearchParams(queryString);
    for (const [k, v] of sp.entries()) {
      params[k] = v;
    }
  }

  let body = config.data;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }
  body = body || {};

  try {
    // 1. Auth
    if (pathname === '/auth/login' && method === 'post') {
      const res = clientMockStore.login(body.email, body.password);
      return { data: res, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/auth/register' && method === 'post') {
      const user = {
        id: 'usr_' + Date.now(),
        name: body.name || 'User',
        email: body.email || 'user@warehouseflow.com',
        role: body.role || 'WAREHOUSE_MANAGER'
      };
      return { data: { success: true, token: 'mock_jwt_' + Date.now(), user }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 2. Dashboard
    if (pathname === '/dashboard' && method === 'get') {
      const data = clientMockStore.getDashboard();
      return { data: { success: true, data }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 3. Products
    if (pathname === '/products/meta/categories' && method === 'get') {
      const cats = Array.from(new Set(clientMockStore.data.products.map(p => p.category).filter(Boolean)));
      return { data: { success: true, data: cats }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/products\/([^\/]+)$/) && method === 'put') {
      const id = pathname.split('/')[2];
      const updated = clientMockStore.updateProduct(id, body);
      return { data: { success: true, data: updated }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/products\/([^\/]+)$/) && method === 'delete') {
      const id = pathname.split('/')[2];
      clientMockStore.deleteProduct(id);
      return { data: { success: true, message: 'Product deleted' }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/products' && method === 'get') {
      const res = clientMockStore.getProducts(params);
      return { data: res, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/products' && method === 'post') {
      const created = clientMockStore.createProduct(body);
      return { data: { success: true, data: created }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 4. Inventory
    if (pathname === '/inventory/in' && method === 'post') {
      const res = clientMockStore.stockIn(body.productId, body.quantity, {
        reason: body.reason,
        referenceNumber: body.referenceNumber,
        costPrice: body.costPrice
      });
      return { data: { success: true, data: res }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/inventory/out' && method === 'post') {
      const res = clientMockStore.stockOut(body.productId, body.quantity, {
        reason: body.reason,
        referenceNumber: body.referenceNumber
      });
      return { data: { success: true, data: res }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/inventory/adjust' && method === 'post') {
      const res = clientMockStore.adjustStock(body.productId, body.newStock, {
        reason: body.reason
      });
      return { data: { success: true, data: res }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/inventory/logs' && method === 'get') {
      const logs = clientMockStore.getLogs(params.type, params.limit);
      return { data: { success: true, data: logs }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 5. Suppliers
    if (pathname === '/suppliers/scorecards' && method === 'get') {
      const sc = clientMockStore.getScorecards();
      return { data: { success: true, data: sc }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/suppliers\/([^\/]+)\/inspection$/) && method === 'post') {
      const id = pathname.split('/')[2];
      const res = clientMockStore.recordInspection(id, body);
      return { data: { success: true, message: 'Delivery inspection recorded successfully!', data: res }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/suppliers\/([^\/]+)$/) && method === 'get') {
      const id = pathname.split('/')[2];
      const s = clientMockStore.getSupplierById(id);
      return { data: { success: true, data: s }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/suppliers\/([^\/]+)$/) && method === 'put') {
      const id = pathname.split('/')[2];
      const updated = clientMockStore.updateSupplier(id, body);
      return { data: { success: true, data: updated }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/suppliers\/([^\/]+)$/) && method === 'delete') {
      const id = pathname.split('/')[2];
      clientMockStore.deleteSupplier(id);
      return { data: { success: true, message: 'Supplier deleted' }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/suppliers' && method === 'get') {
      const suppliers = clientMockStore.getSuppliers();
      return { data: { success: true, data: suppliers }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/suppliers' && method === 'post') {
      const created = clientMockStore.createSupplier(body);
      return { data: { success: true, data: created }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 6. Orders
    if (pathname.match(/^\/orders\/([^\/]+)\/status$/) && method === 'patch') {
      const id = pathname.split('/')[2];
      const updated = clientMockStore.updateOrderStatus(id, body.status);
      return { data: { success: true, data: updated }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/orders\/([^\/]+)$/) && method === 'get') {
      const id = pathname.split('/')[2];
      const o = clientMockStore.getOrderById(id);
      return { data: { success: true, data: o }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname.match(/^\/orders\/([^\/]+)$/) && method === 'delete') {
      const id = pathname.split('/')[2];
      clientMockStore.deleteOrder(id);
      return { data: { success: true, message: 'Purchase Order deleted' }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/orders' && method === 'get') {
      const orders = clientMockStore.getOrders(params.status, params.search);
      return { data: { success: true, data: orders }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/orders' && method === 'post') {
      const newOrder = clientMockStore.createOrder(body);
      return { data: { success: true, data: newOrder }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 7. Reorder
    if (pathname === '/reorder/recommendations' && method === 'get') {
      const rec = clientMockStore.getReorderRecommendations();
      return { data: { success: true, data: rec }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/reorder/create-po' && method === 'post') {
      const newPO = clientMockStore.createReorderPO(body.productId, body.suggestedQuantity);
      return { data: { success: true, data: newPO }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 8. Batches
    if (pathname === '/batches/summary' && method === 'get') {
      const summary = clientMockStore.getBatchSummary();
      return { data: { success: true, data: summary }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/batches/dispatch-fifo' && method === 'post') {
      const res = clientMockStore.dispatchFIFO(body);
      return { data: { success: true, data: res }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/batches' && method === 'get') {
      const batches = clientMockStore.getBatches(params);
      return { data: { success: true, data: batches }, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (pathname === '/batches' && method === 'post') {
      const newBatch = clientMockStore.createBatch(body);
      return { data: { success: true, data: newBatch }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // Fallback for any unknown route
    console.warn(`[WarehouseFlow Mock Router] Unhandled endpoint: ${method.toUpperCase()} ${pathname}`);
    return { data: { success: true, data: [] }, status: 200, statusText: 'OK', headers: {}, config };
  } catch (err) {
    const errorObj = new Error(err.message || 'Operation failed');
    errorObj.response = {
      status: 400,
      data: { success: false, message: err.message || 'Operation failed' },
      headers: {},
      config
    };
    return Promise.reject(errorObj);
  }
}

