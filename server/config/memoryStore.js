/**
 * In-Memory Database Store for WarehouseFlow
 * Provides an automatic zero-config fallback for cloud deployments (e.g. Vercel Live Demo)
 * when a MongoDB connection is not available, while preserving the exact same schemas and behavior.
 */

class MemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    const now = new Date();

    // 1. Demo Users
    this.users = [
      {
        _id: 'usr_admin_001',
        name: 'Veer Goel (Admin)',
        email: 'admin@warehouseflow.com',
        role: 'ADMIN',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'usr_mgr_002',
        name: 'Rohan Gupta (Warehouse Mgr)',
        email: 'manager@warehouseflow.com',
        role: 'WAREHOUSE_MANAGER',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
      }
    ];

    // 2. Verified Indian Suppliers
    this.suppliers = [
      {
        _id: 'supp_grains_01',
        name: 'Rajesh Malhotra',
        company: 'Punjab Food Mills & Grains Ltd',
        email: 'sales@punjabfoodmills.in',
        phone: '+91 98201 45678',
        address: 'Plot 42, GT Road Industrial Area, Ludhiana, Punjab - 141003',
        gstin: '03AABCB1234F1Z2',
        state: 'Punjab',
        stateCode: '03',
        pan: 'AABCB1234F',
        leadTimeDays: 4,
        paymentTerms: 'Net 30 (RTGS/NEFT)',
        rating: 4.9,
        onTimeDeliveryRate: 98.5,
        qualityDefectRate: 0.5,
        priceStabilityScore: 96.0,
        totalOrdersCompleted: 24,
        grade: 'A+',
        active: true,
        evaluationNotes: 'Exceptional grains supplier with 98.5% on-time truck arrival and 0.5% damage rate.'
      },
      {
        _id: 'supp_gadgets_02',
        name: 'Sunita Venkatesh',
        company: 'Bangalore Gadgets & Mobile Tech',
        email: 'orders@bangaloregadgets.com',
        phone: '+91 80234 56789',
        address: '14/B Electronic City Phase 1, Bengaluru, Karnataka - 560100',
        gstin: '29AAACM5678G1Z9',
        state: 'Karnataka',
        stateCode: '29',
        pan: 'AAACM5678G',
        leadTimeDays: 5,
        paymentTerms: 'Net 15 (UPI/NEFT)',
        rating: 4.8,
        onTimeDeliveryRate: 95.0,
        qualityDefectRate: 0.8,
        priceStabilityScore: 92.0,
        totalOrdersCompleted: 18,
        grade: 'A+',
        active: true,
        evaluationNotes: 'High reliability electronics vendor with excellent protective bubble wrap packaging.'
      },
      {
        _id: 'supp_home_03',
        name: 'Vikram Joshi',
        company: 'Mumbai Home Essentials & Lighting',
        email: 'contact@mumbaihome.co.in',
        phone: '+91 94251 12345',
        address: 'B-108, MIDC Industrial Area, Pune, Maharashtra - 411026',
        gstin: '27AAACA9012H1Z5',
        state: 'Maharashtra',
        stateCode: '27',
        pan: 'AAACA9012H',
        leadTimeDays: 3,
        paymentTerms: 'Net 30',
        rating: 4.7,
        onTimeDeliveryRate: 96.0,
        qualityDefectRate: 1.2,
        priceStabilityScore: 90.0,
        totalOrdersCompleted: 16,
        grade: 'A',
        active: true,
        evaluationNotes: 'Fast intra-state Maharashtra deliveries with consistent wholesale pricing.'
      },
      {
        _id: 'supp_pack_04',
        name: 'Deepak Agarwal',
        company: 'Surat Eco Packaging & Boxes',
        email: 'support@suratpack.in',
        phone: '+91 98790 33445',
        address: 'Plot 88, GIDC Industrial Estate, Surat, Gujarat - 395006',
        gstin: '24AAACD3456J1Z1',
        state: 'Gujarat',
        stateCode: '24',
        pan: 'AAACD3456J',
        leadTimeDays: 3,
        paymentTerms: 'Immediate UPI/RTGS',
        rating: 4.6,
        onTimeDeliveryRate: 94.0,
        qualityDefectRate: 1.5,
        priceStabilityScore: 88.0,
        totalOrdersCompleted: 22,
        grade: 'A',
        active: true,
        evaluationNotes: 'Cost-effective packaging boxes, minor moisture defects noted during monsoon shipments.'
      },
      {
        _id: 'supp_stat_05',
        name: 'Ananya Roy',
        company: 'Delhi Stationery & Office Supplies',
        email: 'info@delhistationery.com',
        phone: '+91 93310 99887',
        address: 'Sector 5, Connaught Place, New Delhi - 110001',
        gstin: '07AAACE7890K1Z3',
        state: 'Delhi',
        stateCode: '07',
        pan: 'AAACE7890K',
        leadTimeDays: 4,
        paymentTerms: 'Net 30',
        rating: 4.8,
        onTimeDeliveryRate: 97.0,
        qualityDefectRate: 0.7,
        priceStabilityScore: 94.0,
        totalOrdersCompleted: 14,
        grade: 'A+',
        active: true,
        evaluationNotes: 'Premium stationery vendor with virtually zero paper damages and on-time dispatch.'
      }
    ];

    // Helper map
    const suppMap = {};
    this.suppliers.forEach(s => { suppMap[s._id] = s; });

    // 3. Warehouse Products Catalog
    this.products = [
      {
        _id: 'prod_001',
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
        supplier: suppMap['supp_grains_01'],
        unit: 'Bags',
        hsnCode: 'HSN 1006',
        gstRate: 5,
        location: 'Aisle 1 - Section A',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_002',
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
        supplier: suppMap['supp_grains_01'],
        unit: 'Packs',
        hsnCode: 'HSN 0902',
        gstRate: 5,
        location: 'Aisle 1 - Section B',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_003',
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
        supplier: suppMap['supp_gadgets_02'],
        unit: 'Pieces',
        hsnCode: 'HSN 8544',
        gstRate: 18,
        location: 'Aisle 3 - Shelf E-12',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_004',
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
        supplier: suppMap['supp_home_03'],
        unit: 'Packs',
        hsnCode: 'HSN 8539',
        gstRate: 18,
        location: 'Aisle 3 - Shelf E-05',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_005',
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
        supplier: suppMap['supp_home_03'],
        unit: 'Pieces',
        hsnCode: 'HSN 7323',
        gstRate: 18,
        location: 'Aisle 2 - Shelf B-01',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_006',
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
        supplier: suppMap['supp_stat_05'],
        unit: 'Packs',
        hsnCode: 'HSN 4820',
        gstRate: 12,
        location: 'Aisle 4 - Shelf D-02',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_007',
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
        supplier: suppMap['supp_stat_05'],
        unit: 'Pieces',
        hsnCode: 'HSN 9608',
        gstRate: 18,
        location: 'Aisle 4 - Shelf D-06',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_008',
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
        supplier: suppMap['supp_pack_04'],
        unit: 'Bags',
        hsnCode: 'HSN 4819',
        gstRate: 18,
        location: 'Aisle 5 - Pallet Zone',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_009',
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
        supplier: suppMap['supp_pack_04'],
        unit: 'Rolls',
        hsnCode: 'HSN 3923',
        gstRate: 18,
        location: 'Aisle 5 - Rack C',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_010',
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
        supplier: suppMap['supp_home_03'],
        unit: 'Pieces',
        hsnCode: 'HSN 8301',
        gstRate: 18,
        location: 'Aisle 2 - Shelf A-04',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'prod_011',
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
        supplier: suppMap['supp_grains_01'],
        unit: 'Packs',
        hsnCode: 'HSN 3401',
        gstRate: 18,
        location: 'Aisle 1 - Section C',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    // Compute virtuals
    this.products.forEach(p => this._attachVirtuals(p));

    // 4. Purchase Orders
    this.orders = [
      {
        _id: 'po_1001',
        poNumber: 'PO-20260825-1001',
        supplier: suppMap['supp_grains_01'],
        items: [
          {
            product: this.products[0],
            sku: this.products[0].sku,
            name: this.products[0].name,
            hsnCode: 'HSN 1006',
            unit: 'Bags',
            quantity: 50,
            unitCost: 420,
            total: 21000
          },
          {
            product: this.products[1],
            sku: this.products[1].sku,
            name: this.products[1].name,
            hsnCode: 'HSN 0902',
            unit: 'Packs',
            quantity: 40,
            unitCost: 240,
            total: 9600
          }
        ],
        subtotal: 30600,
        gstRate: 5,
        gstType: 'INTER_STATE',
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 1530,
        taxAmount: 1530,
        shippingCost: 800,
        placeOfSupply: 'Punjab (03)',
        ewayBillNo: 'EWB-2026-9021884',
        warehouseGSTIN: '27AAACW8899F1Z4',
        warehouseAddress: 'Bhiwandi Logistics Hub, Building C-4, Thane, Maharashtra - 421302',
        totalAmount: 32930,
        status: 'DELIVERED',
        deliveredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Stock delivery for Rice and Tea aisle',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'po_1002',
        poNumber: 'PO-20260828-1002',
        supplier: suppMap['supp_gadgets_02'],
        items: [
          {
            product: this.products[2],
            sku: this.products[2].sku,
            name: this.products[2].name,
            hsnCode: 'HSN 8544',
            unit: 'Pieces',
            quantity: 30,
            unitCost: 180,
            total: 5400
          }
        ],
        subtotal: 5400,
        gstRate: 18,
        gstType: 'INTER_STATE',
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 972,
        taxAmount: 972,
        shippingCost: 300,
        placeOfSupply: 'Karnataka (29)',
        ewayBillNo: 'EWB-2026-7845120',
        warehouseGSTIN: '27AAACW8899F1Z4',
        warehouseAddress: 'Bhiwandi Logistics Hub, Building C-4, Thane, Maharashtra - 421302',
        totalAmount: 6672,
        status: 'IN_TRANSIT',
        expectedDeliveryDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        notes: 'Mobile cables replenishment',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'po_1003',
        poNumber: 'PO-20260829-1003',
        supplier: suppMap['supp_home_03'],
        items: [
          {
            product: this.products[3],
            sku: this.products[3].sku,
            name: this.products[3].name,
            hsnCode: 'HSN 8539',
            unit: 'Packs',
            quantity: 50,
            unitCost: 160,
            total: 8000
          }
        ],
        subtotal: 8000,
        gstRate: 18,
        gstType: 'INTRA_STATE',
        cgstAmount: 720,
        sgstAmount: 720,
        igstAmount: 0,
        taxAmount: 1440,
        shippingCost: 400,
        placeOfSupply: 'Maharashtra (27)',
        ewayBillNo: 'EWB-2026-5541098',
        warehouseGSTIN: '27AAACW8899F1Z4',
        warehouseAddress: 'Bhiwandi Logistics Hub, Building C-4, Thane, Maharashtra - 421302',
        totalAmount: 9840,
        status: 'PENDING',
        expectedDeliveryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        notes: 'Intra-state order from Pune for LED Bulbs with CGST & SGST',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    // 5. Inventory Logs
    this.logs = [
      {
        _id: 'log_01',
        product: this.products[0],
        sku: this.products[0].sku,
        productName: this.products[0].name,
        type: 'IN',
        quantity: 50,
        previousStock: 35,
        newStock: 85,
        reason: 'Received new stock shipment from Punjab Food Mills (PO-20260825-1001)',
        referenceNumber: 'PO-20260825-1001',
        user: 'Veer Goel (Admin)',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'log_02',
        product: this.products[1],
        sku: this.products[1].sku,
        productName: this.products[1].name,
        type: 'OUT',
        quantity: 15,
        previousStock: 27,
        newStock: 12,
        reason: 'Sold / Dispatched to local retail stores',
        referenceNumber: 'SO-9021',
        user: 'Rohan Gupta (Warehouse Mgr)',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'log_03',
        product: this.products[3],
        sku: this.products[3].sku,
        productName: this.products[3].name,
        type: 'OUT',
        quantity: 20,
        previousStock: 20,
        newStock: 0,
        reason: 'Bulk dispatch for office lighting setup',
        referenceNumber: 'SO-9044',
        user: 'Rohan Gupta (Warehouse Mgr)',
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000)
      },
      {
        _id: 'log_04',
        product: this.products[8],
        sku: this.products[8].sku,
        productName: this.products[8].name,
        type: 'OUT',
        quantity: 12,
        previousStock: 20,
        newStock: 8,
        reason: 'Used for packing outbound shipment orders',
        referenceNumber: 'INT-USE-44',
        user: 'Rohan Gupta (Warehouse Mgr)',
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
      }
    ];

    // 6. Activities
    this.activities = [
      {
        _id: 'act_01',
        action: 'System Online',
        entityType: 'SYSTEM',
        details: 'Warehouse catalog loaded with 11 products and 5 verified suppliers.',
        badgeType: 'PRIMARY',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'act_02',
        action: 'Stock Received',
        entityType: 'INVENTORY',
        details: 'Received 50 bags of Royal Basmati Rice (5kg) into warehouse.',
        badgeType: 'SUCCESS',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'act_03',
        action: 'Items Dispatched',
        entityType: 'INVENTORY',
        details: 'Dispatched 15 packs of Tata Tea Gold for customer orders.',
        badgeType: 'INFO',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'act_04',
        action: 'Low Stock Alert',
        entityType: 'PRODUCT',
        details: 'Havells 9W LED Bulbs reached 0 packs (Out of Stock). Replenish soon.',
        badgeType: 'DANGER',
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000)
      },
      {
        _id: 'act_05',
        action: 'Order Placed',
        entityType: 'ORDER',
        details: 'Created order PO-20260828-1002 with Bangalore Gadgets (₹6,672).',
        badgeType: 'PRIMARY',
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
      }
    ];

    // 7. Inventory Batches (FIFO)
    this.batches = [
      {
        _id: 'bat_01',
        batchNumber: 'BATCH-2026-AUG-01',
        product: this.products[0],
        productName: this.products[0].name,
        sku: this.products[0].sku,
        initialQuantity: 50,
        remainingQuantity: 50,
        unit: this.products[0].unit,
        mfgDate: new Date('2026-08-01'),
        expiryDate: new Date('2027-02-15'),
        costPrice: this.products[0].costPrice,
        supplier: suppMap['supp_grains_01'],
        supplierName: suppMap['supp_grains_01'].company,
        location: 'Aisle 1 - Section A',
        status: 'ACTIVE',
        notes: 'Freshly milled premium harvest'
      },
      {
        _id: 'bat_02',
        batchNumber: 'BATCH-2026-JUN-15',
        product: this.products[0],
        productName: this.products[0].name,
        sku: this.products[0].sku,
        initialQuantity: 35,
        remainingQuantity: 35,
        unit: this.products[0].unit,
        mfgDate: new Date('2026-06-15'),
        expiryDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        costPrice: this.products[0].costPrice,
        supplier: suppMap['supp_grains_01'],
        supplierName: suppMap['supp_grains_01'].company,
        location: 'Aisle 1 - Section A',
        status: 'ACTIVE',
        notes: 'Sell this batch first (FIFO Pick)'
      },
      {
        _id: 'bat_03',
        batchNumber: 'BATCH-2026-JUL-10',
        product: this.products[1],
        productName: this.products[1].name,
        sku: this.products[1].sku,
        initialQuantity: 12,
        remainingQuantity: 12,
        unit: this.products[1].unit,
        mfgDate: new Date('2026-07-10'),
        expiryDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
        costPrice: this.products[1].costPrice,
        supplier: suppMap['supp_grains_01'],
        supplierName: suppMap['supp_grains_01'].company,
        location: 'Aisle 1 - Section B',
        status: 'ACTIVE',
        notes: 'Expiring soon! High priority dispatch'
      }
    ];
  }

  _attachVirtuals(p) {
    p.totalValue = (p.stock || 0) * (p.costPrice || 0);
    if (p.stock === 0) p.healthStatus = 'OUT_OF_STOCK';
    else if (p.stock <= (p.safetyStock || 5)) p.healthStatus = 'CRITICAL';
    else if (p.stock <= (p.minStockAlert || 15)) p.healthStatus = 'LOW';
    else p.healthStatus = 'HEALTHY';
    return p;
  }

  // --- Products ---
  getProducts() {
    return this.products.map(p => this._attachVirtuals({ ...p }));
  }

  getProductById(id) {
    const p = this.products.find(x => String(x._id) === String(id));
    return p ? this._attachVirtuals({ ...p }) : null;
  }

  createProduct(data) {
    const newProd = {
      _id: 'prod_' + Date.now(),
      ...data,
      stock: Number(data.stock) || 0,
      costPrice: Number(data.costPrice) || 0,
      sellingPrice: Number(data.sellingPrice) || 0,
      createdAt: new Date()
    };
    if (data.supplier) {
      newProd.supplier = this.suppliers.find(s => String(s._id) === String(data.supplier)) || null;
    }
    this._attachVirtuals(newProd);
    this.products.unshift(newProd);
    this.addActivity('Product Created', `Added new product "${newProd.name}" (${newProd.sku})`, 'SUCCESS');
    return newProd;
  }

  updateProduct(id, data) {
    const idx = this.products.findIndex(x => String(x._id) === String(id));
    if (idx === -1) return null;
    const existing = this.products[idx];
    const updated = { ...existing, ...data, updatedAt: new Date() };
    if (data.supplier) {
      updated.supplier = this.suppliers.find(s => String(s._id) === String(data.supplier)) || updated.supplier;
    }
    this._attachVirtuals(updated);
    this.products[idx] = updated;
    this.addActivity('Product Updated', `Updated product "${updated.name}" (${updated.sku})`, 'INFO');
    return updated;
  }

  deleteProduct(id) {
    const idx = this.products.findIndex(x => String(x._id) === String(id));
    if (idx === -1) return false;
    const removed = this.products.splice(idx, 1)[0];
    this.addActivity('Product Deleted', `Deleted product "${removed.name}"`, 'DANGER');
    return true;
  }

  getCategories() {
    const set = new Set(this.products.map(p => p.category).filter(Boolean));
    return Array.from(set);
  }

  // --- Suppliers ---
  getSuppliers() {
    return this.suppliers.map(s => {
      const productCount = this.products.filter(p => p.supplier && String(p.supplier._id) === String(s._id)).length;
      const pendingOrders = this.orders.filter(o => o.supplier && String(o.supplier._id) === String(s._id) && ['PENDING', 'APPROVED', 'IN_TRANSIT'].includes(o.status)).length;
      return { ...s, productCount, pendingOrders };
    });
  }

  getSupplierById(id) {
    const supp = this.suppliers.find(s => String(s._id) === String(id));
    if (!supp) return null;
    const prods = this.products.filter(p => p.supplier && String(p.supplier._id) === String(id));
    const ords = this.orders.filter(o => o.supplier && String(o.supplier._id) === String(id));
    return { ...supp, products: prods, orders: ords };
  }

  createSupplier(data) {
    const newSupp = {
      _id: 'supp_' + Date.now(),
      ...data,
      active: true,
      leadTimeDays: Number(data.leadTimeDays) || 4,
      rating: Number(data.rating) || 4.5,
      createdAt: new Date()
    };
    this.suppliers.push(newSupp);
    this.addActivity('Supplier Created', `Added vendor ${newSupp.company}`, 'SUCCESS');
    return newSupp;
  }

  updateSupplier(id, data) {
    const idx = this.suppliers.findIndex(s => String(s._id) === String(id));
    if (idx === -1) return null;
    this.suppliers[idx] = { ...this.suppliers[idx], ...data, updatedAt: new Date() };
    this.addActivity('Supplier Updated', `Updated vendor ${this.suppliers[idx].company}`, 'INFO');
    return this.suppliers[idx];
  }

  deleteSupplier(id) {
    const idx = this.suppliers.findIndex(s => String(s._id) === String(id));
    if (idx === -1) return false;
    const removed = this.suppliers.splice(idx, 1)[0];
    this.addActivity('Supplier Deleted', `Removed vendor ${removed.company}`, 'DANGER');
    return true;
  }

  // --- Inventory Control ---
  stockIn(productId, quantity, opts = {}) {
    const p = this.products.find(x => String(x._id) === String(productId));
    if (!p) throw new Error('Product not found');
    const qty = Number(quantity);
    const prev = p.stock;
    p.stock = prev + qty;
    this._attachVirtuals(p);

    const log = {
      _id: 'log_' + Date.now(),
      product: p,
      sku: p.sku,
      productName: p.name,
      type: 'IN',
      quantity: qty,
      previousStock: prev,
      newStock: p.stock,
      reason: opts.reason || 'Goods Inward Receipt',
      referenceNumber: opts.referenceNumber || `IN-${Date.now().toString().slice(-6)}`,
      user: opts.user || 'Veer Goel (Admin)',
      createdAt: new Date()
    };
    this.logs.unshift(log);
    this.addActivity('Stock Received', `Added ${qty} units of "${p.name}". Stock: ${p.stock}`, 'SUCCESS');
    return { product: p, log };
  }

  stockOut(productId, quantity, opts = {}) {
    const p = this.products.find(x => String(x._id) === String(productId));
    if (!p) throw new Error('Product not found');
    const qty = Number(quantity);
    if (p.stock < qty) throw new Error(`Insufficient stock. Available: ${p.stock}, Requested: ${qty}`);
    const prev = p.stock;
    p.stock = prev - qty;
    this._attachVirtuals(p);

    const log = {
      _id: 'log_' + Date.now(),
      product: p,
      sku: p.sku,
      productName: p.name,
      type: 'OUT',
      quantity: qty,
      previousStock: prev,
      newStock: p.stock,
      reason: opts.reason || 'Sales Dispatch',
      referenceNumber: opts.referenceNumber || `OUT-${Date.now().toString().slice(-6)}`,
      user: opts.user || 'Rohan Gupta (Warehouse Mgr)',
      createdAt: new Date()
    };
    this.logs.unshift(log);
    this.addActivity('Stock Dispatched', `Dispatched ${qty} units of "${p.name}". Remaining: ${p.stock}`, 'INFO');
    return { product: p, log };
  }

  adjustStock(productId, newStock, opts = {}) {
    const p = this.products.find(x => String(x._id) === String(productId));
    if (!p) throw new Error('Product not found');
    const target = Number(newStock);
    const prev = p.stock;
    const delta = target - prev;
    p.stock = target;
    this._attachVirtuals(p);

    const log = {
      _id: 'log_' + Date.now(),
      product: p,
      sku: p.sku,
      productName: p.name,
      type: 'ADJUSTMENT',
      quantity: delta,
      previousStock: prev,
      newStock: target,
      reason: opts.reason || 'Audit Adjustment',
      referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      user: opts.user || 'Veer Goel (Admin)',
      createdAt: new Date()
    };
    this.logs.unshift(log);
    this.addActivity('Stock Adjusted', `Adjusted "${p.name}" from ${prev} to ${target}`, 'WARNING');
    return { product: p, log };
  }

  getLogs(type, productId) {
    let list = [...this.logs];
    if (type && type !== 'ALL') {
      list = list.filter(l => l.type === type.toUpperCase());
    }
    if (productId) {
      list = list.filter(l => l.product && String(l.product._id) === String(productId));
    }
    return list;
  }

  // --- Purchase Orders ---
  getOrders(status, supplierId, search) {
    let list = [...this.orders];
    if (status && status !== 'ALL') {
      list = list.filter(o => o.status === status.toUpperCase());
    }
    if (supplierId && supplierId !== 'ALL') {
      list = list.filter(o => o.supplier && String(o.supplier._id) === String(supplierId));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => o.poNumber.toLowerCase().includes(q));
    }
    return list;
  }

  getOrderById(id) {
    return this.orders.find(o => String(o._id) === String(id)) || null;
  }

  createOrder(data) {
    const supp = this.suppliers.find(s => String(s._id) === String(data.supplier));
    if (!supp) throw new Error('Supplier not found');

    let subtotal = 0;
    const items = (data.items || []).map(it => {
      const p = this.products.find(x => String(x._id) === String(it.product));
      const unitCost = Number(it.unitCost ?? (p ? p.costPrice : 0));
      const qty = Number(it.quantity) || 1;
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
    const poNumber = data.poNumber || `PO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      _id: 'po_' + Date.now(),
      poNumber,
      supplier: supp,
      items,
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      status: data.status || 'PENDING',
      expectedDeliveryDate: data.expectedDeliveryDate || new Date(Date.now() + (supp.leadTimeDays || 4) * 24 * 60 * 60 * 1000),
      notes: data.notes || '',
      createdAt: new Date()
    };
    this.orders.unshift(newOrder);
    this.addActivity('Purchase Order Created', `Created ${poNumber} for ${supp.company} (₹${totalAmount.toLocaleString('en-IN')})`, 'PRIMARY');
    return newOrder;
  }

  updateOrderStatus(id, newStatus, user = 'Veer Goel (Admin)') {
    const o = this.orders.find(x => String(x._id) === String(id));
    if (!o) throw new Error('Purchase Order not found');
    const prev = o.status;
    o.status = newStatus.toUpperCase();

    // Auto receive stock on delivery
    if (o.status === 'DELIVERED' && prev !== 'DELIVERED') {
      o.deliveredAt = new Date();
      o.items.forEach(it => {
        const prodId = it.product?._id || it.product;
        try {
          this.stockIn(prodId, it.quantity, {
            reason: `Auto PO Delivery Receipt (${o.poNumber})`,
            referenceNumber: o.poNumber,
            user
          });
        } catch (e) {
          // ignore
        }
      });
      this.addActivity('PO Delivered & Stocked', `PO ${o.poNumber} marked as Delivered. Inventory auto-replenished.`, 'SUCCESS');
    } else {
      this.addActivity('PO Status Updated', `PO ${o.poNumber} status updated to ${o.status}`, 'INFO');
    }

    return o;
  }

  deleteOrder(id) {
    const idx = this.orders.findIndex(x => String(x._id) === String(id));
    if (idx === -1) return false;
    this.orders.splice(idx, 1);
    return true;
  }

  // --- Batches ---
  getBatches() {
    return this.batches;
  }

  // --- Activity Logs ---
  addActivity(action, details, badgeType = 'INFO') {
    const item = {
      _id: 'act_' + Date.now(),
      action,
      details,
      badgeType,
      createdAt: new Date()
    };
    this.activities.unshift(item);
    if (this.activities.length > 50) this.activities.pop();
    return item;
  }

  getActivities(limit = 10) {
    return this.activities.slice(0, limit);
  }

  // --- Users ---
  getUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getUserById(id) {
    return this.users.find(u => String(u._id) === String(id)) || null;
  }
}

export const memoryStore = new MemoryStore();
