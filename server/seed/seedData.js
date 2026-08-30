import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import InventoryLog from '../models/InventoryLog.js';
import ActivityLog from '../models/ActivityLog.js';
import Batch from '../models/Batch.js';

dotenv.config();

export async function seedDatabase() {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await connectDB();

    console.log('🧹 Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      InventoryLog.deleteMany({}),
      ActivityLog.deleteMany({}),
      Batch.deleteMany({})
    ]);

    console.log('👤 Creating demo users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = await User.insertMany([
      {
        name: 'Veer Goel (Admin)',
        email: 'admin@warehouseflow.com',
        password: hashedPassword,
        role: 'ADMIN'
      },
      {
        name: 'Rohan Gupta (Warehouse Mgr)',
        email: 'manager@warehouseflow.com',
        password: hashedPassword,
        role: 'WAREHOUSE_MANAGER'
      }
    ]);
    const adminUser = users[0];

    console.log('🏭 Creating suppliers...');
    const suppliers = await Supplier.insertMany([
      {
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
        evaluationNotes: 'Exceptional grains supplier with 98.5% on-time truck arrival and 0.5% damage rate.'
      },
      {
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
        evaluationNotes: 'High reliability electronics vendor with excellent protective bubble wrap packaging.'
      },
      {
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
        evaluationNotes: 'Fast intra-state Maharashtra deliveries with consistent wholesale pricing.'
      },
      {
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
        evaluationNotes: 'Cost-effective packaging boxes, minor moisture defects noted during monsoon shipments.'
      },
      {
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
        evaluationNotes: 'Premium stationery vendor with virtually zero paper damages and on-time dispatch.'
      }
    ]);

    const [suppGrains, suppGadgets, suppHome, suppPack, suppStationery] = suppliers;

    console.log('📦 Creating warehouse products...');
    const products = await Product.insertMany([
      {
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
        supplier: suppGrains._id,
        unit: 'Bags',
        hsnCode: 'HSN 1006',
        gstRate: 5,
        location: 'Aisle 1 - Section A'
      },
      {
        sku: 'GRO-TEA-500G',
        name: 'Tata Tea Gold Leaf (500g Pack)',
        category: 'Groceries',
        description: 'Rich aroma CTC tea blend with gently rolled aromatic long leaves.',
        costPrice: 240,
        sellingPrice: 330,
        stock: 12, // LOW STOCK - TRIGGER
        minStockAlert: 25,
        safetyStock: 8,
        weeklySales: 28,
        supplier: suppGrains._id,
        unit: 'Packs',
        hsnCode: 'HSN 0902',
        gstRate: 5,
        location: 'Aisle 1 - Section B'
      },
      {
        sku: 'ELE-CBL-TYPEC',
        name: 'boAt Fast Charging Type-C USB Cable (1.5m)',
        category: 'Electronics',
        description: 'Braided tangle-free fast charging mobile data cable with 3A power delivery.',
        costPrice: 180,
        sellingPrice: 399,
        stock: 4, // CRITICAL STOCK - TRIGGER
        minStockAlert: 15,
        safetyStock: 6,
        weeklySales: 18,
        supplier: suppGadgets._id,
        unit: 'Pieces',
        hsnCode: 'HSN 8544',
        gstRate: 18,
        location: 'Aisle 3 - Shelf E-12'
      },
      {
        sku: 'ELE-LED-9W',
        name: 'Havells 9W Cool Day LED Bulb (Pack of 2)',
        category: 'Electrical',
        description: 'Energy saving bright LED light bulbs with 1 year replacement warranty.',
        costPrice: 160,
        sellingPrice: 270,
        stock: 0, // OUT OF STOCK - TRIGGER
        minStockAlert: 20,
        safetyStock: 5,
        weeklySales: 22,
        supplier: suppHome._id,
        unit: 'Packs',
        hsnCode: 'HSN 8539',
        gstRate: 18,
        location: 'Aisle 3 - Shelf E-05'
      },
      {
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
        supplier: suppHome._id,
        unit: 'Pieces',
        hsnCode: 'HSN 7323',
        gstRate: 18,
        location: 'Aisle 2 - Shelf B-01'
      },
      {
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
        supplier: suppStationery._id,
        unit: 'Packs',
        hsnCode: 'HSN 4820',
        gstRate: 12,
        location: 'Aisle 4 - Shelf D-02'
      },
      {
        sku: 'STA-PEN-GOLD',
        name: 'Parker Classic Gold Ball Pen',
        category: 'Stationery',
        description: 'Premium stainless steel gold-plated ballpoint pen with smooth blue ink refill.',
        costPrice: 190,
        sellingPrice: 320,
        stock: 6, // LOW STOCK
        minStockAlert: 12,
        safetyStock: 4,
        weeklySales: 10,
        supplier: suppStationery._id,
        unit: 'Pieces',
        hsnCode: 'HSN 9608',
        gstRate: 18,
        location: 'Aisle 4 - Shelf D-06'
      },
      {
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
        supplier: suppPack._id,
        unit: 'Bags',
        hsnCode: 'HSN 4819',
        gstRate: 18,
        location: 'Aisle 5 - Pallet Zone'
      },
      {
        sku: 'PCK-BUB-20M',
        name: 'Plastic Bubble Wrap Roll (20 Meters)',
        category: 'Packaging',
        description: 'Protective air cushion packaging wrap to safeguard fragile items during delivery.',
        costPrice: 320,
        sellingPrice: 520,
        stock: 8, // CRITICAL - TRIGGER
        minStockAlert: 20,
        safetyStock: 10,
        weeklySales: 30,
        supplier: suppPack._id,
        unit: 'Rolls',
        hsnCode: 'HSN 3923',
        gstRate: 18,
        location: 'Aisle 5 - Rack C'
      },
      {
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
        supplier: suppHome._id,
        unit: 'Pieces',
        hsnCode: 'HSN 8301',
        gstRate: 18,
        location: 'Aisle 2 - Shelf A-04'
      },
      {
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
        supplier: suppGrains._id,
        unit: 'Packs',
        hsnCode: 'HSN 3401',
        gstRate: 18,
        location: 'Aisle 1 - Section C'
      }
    ]);

    console.log('📋 Creating initial Purchase Orders...');
    const now = new Date();
    await PurchaseOrder.insertMany([
      {
        poNumber: 'PO-20260825-1001',
        supplier: suppGrains._id,
        items: [
          {
            product: products[0]._id,
            sku: products[0].sku,
            name: products[0].name,
            hsnCode: 'HSN 1006',
            unit: 'Bags',
            quantity: 50,
            unitCost: 420,
            total: 21000
          },
          {
            product: products[1]._id,
            sku: products[1].sku,
            name: products[1].name,
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
        createdBy: adminUser._id
      },
      {
        poNumber: 'PO-20260828-1002',
        supplier: suppGadgets._id,
        items: [
          {
            product: products[2]._id,
            sku: products[2].sku,
            name: products[2].name,
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
        createdBy: adminUser._id
      },
      {
        poNumber: 'PO-20260829-1003',
        supplier: suppHome._id,
        items: [
          {
            product: products[3]._id,
            sku: products[3].sku,
            name: products[3].name,
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
        createdBy: adminUser._id
      }
    ]);

    console.log('📝 Creating initial Inventory Logs...');
    await InventoryLog.insertMany([
      {
        product: products[0]._id,
        sku: products[0].sku,
        productName: products[0].name,
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
        product: products[1]._id,
        sku: products[1].sku,
        productName: products[1].name,
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
        product: products[3]._id,
        sku: products[3].sku,
        productName: products[3].name,
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
        product: products[8]._id,
        sku: products[8].sku,
        productName: products[8].name,
        type: 'OUT',
        quantity: 12,
        previousStock: 20,
        newStock: 8,
        reason: 'Used for packing outbound shipment orders',
        referenceNumber: 'INT-USE-44',
        user: 'Rohan Gupta (Warehouse Mgr)',
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
      }
    ]);

    console.log('⚡ Creating Activity Logs...');
    await ActivityLog.insertMany([
      {
        action: 'System Started',
        entityType: 'SYSTEM',
        details: 'Warehouse catalog loaded with 11 easy-to-manage products and 5 verified suppliers.',
        badgeType: 'PRIMARY',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'Stock Received',
        entityType: 'INVENTORY',
        details: 'Received 50 bags of Royal Basmati Rice (5kg) into warehouse.',
        badgeType: 'SUCCESS',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'Items Dispatched',
        entityType: 'INVENTORY',
        details: 'Dispatched 15 packs of Tata Tea Gold for customer orders.',
        badgeType: 'INFO',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'Low Stock Alert',
        entityType: 'PRODUCT',
        details: 'Havells 9W LED Bulbs reached 0 packs (Out of Stock). Need to reorder soon.',
        badgeType: 'DANGER',
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000)
      },
      {
        action: 'Order Placed',
        entityType: 'ORDER',
        details: 'Created order PO-20260828-1002 with Bangalore Gadgets (₹6,672).',
        badgeType: 'PRIMARY',
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
      }
    ]);

    console.log('⏳ Creating Inventory Batches with Expiry & FIFO Tracking...');
    await Batch.insertMany([
      {
        batchNumber: 'BATCH-2026-AUG-01',
        product: products[0]._id,
        productName: products[0].name,
        sku: products[0].sku,
        initialQuantity: 50,
        remainingQuantity: 50,
        unit: products[0].unit,
        mfgDate: new Date('2026-08-01'),
        expiryDate: new Date('2027-02-15'), // 165+ days safe
        costPrice: products[0].costPrice,
        supplier: suppGrains._id,
        supplierName: suppGrains.company,
        location: 'Aisle 1 - Section A',
        status: 'ACTIVE',
        notes: 'Freshly milled premium harvest'
      },
      {
        batchNumber: 'BATCH-2026-JUN-15',
        product: products[0]._id,
        productName: products[0].name,
        sku: products[0].sku,
        initialQuantity: 35,
        remainingQuantity: 35,
        unit: products[0].unit,
        mfgDate: new Date('2026-06-15'),
        expiryDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days left - FIFO PRIORITY
        costPrice: products[0].costPrice,
        supplier: suppGrains._id,
        supplierName: suppGrains.company,
        location: 'Aisle 1 - Section A',
        status: 'ACTIVE',
        notes: 'Sell this batch first (FIFO Pick)'
      },
      {
        batchNumber: 'BATCH-2026-JUL-10',
        product: products[1]._id,
        productName: products[1].name,
        sku: products[1].sku,
        initialQuantity: 12,
        remainingQuantity: 12,
        unit: products[1].unit,
        mfgDate: new Date('2026-07-10'),
        expiryDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000), // 16 days left - CRITICAL FIFO PRIORITY
        costPrice: products[1].costPrice,
        supplier: suppGrains._id,
        supplierName: suppGrains.company,
        location: 'Aisle 1 - Section B',
        status: 'ACTIVE',
        notes: 'Expiring soon! High priority dispatch'
      },
      {
        batchNumber: 'BATCH-2026-AUG-05',
        product: products[10]._id,
        productName: products[10].name,
        sku: products[10].sku,
        initialQuantity: 40,
        remainingQuantity: 40,
        unit: products[10].unit,
        mfgDate: new Date('2026-08-05'),
        expiryDate: new Date('2027-08-05'), // 1 year shelf life
        costPrice: products[10].costPrice,
        supplier: suppGrains._id,
        supplierName: suppGrains.company,
        location: 'Aisle 1 - Section C',
        status: 'ACTIVE',
        notes: 'Standard liquid handwash refill pack'
      },
      {
        batchNumber: 'BATCH-2026-MAY-01',
        product: products[10]._id,
        productName: products[10].name,
        sku: products[10].sku,
        initialQuantity: 30,
        remainingQuantity: 30,
        unit: products[10].unit,
        mfgDate: new Date('2026-05-01'),
        expiryDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000), // 40 days left - FIFO PRIORITY
        costPrice: products[10].costPrice,
        supplier: suppGrains._id,
        supplierName: suppGrains.company,
        location: 'Aisle 1 - Section C',
        status: 'ACTIVE',
        notes: 'Earlier batch stock'
      },
      {
        batchNumber: 'BATCH-2026-JUL-20',
        product: products[3]._id,
        productName: products[3].name,
        sku: products[3].sku,
        initialQuantity: 20,
        remainingQuantity: 0,
        unit: products[3].unit,
        mfgDate: new Date('2026-07-20'),
        expiryDate: new Date('2028-07-20'),
        costPrice: products[3].costPrice,
        supplier: suppHome._id,
        supplierName: suppHome.company,
        location: 'Aisle 3 - Shelf E-05',
        status: 'DEPLETED',
        notes: 'Completely sold out batch'
      },
      {
        batchNumber: 'BATCH-2026-AUG-12',
        product: products[2]._id,
        productName: products[2].name,
        sku: products[2].sku,
        initialQuantity: 4,
        remainingQuantity: 4,
        unit: products[2].unit,
        mfgDate: new Date('2026-08-12'),
        expiryDate: new Date('2029-08-12'),
        costPrice: products[2].costPrice,
        supplier: suppGadgets._id,
        supplierName: suppGadgets.company,
        location: 'Aisle 3 - Shelf E-12',
        status: 'ACTIVE',
        notes: 'Mobile accessories stock'
      }
    ]);

    console.log('✅ WarehouseFlow Database seeded successfully with realistic data!');
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// If run directly via node seed/seedData.js
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase().then(() => {
    console.log('Seeding finished. Exiting...');
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
