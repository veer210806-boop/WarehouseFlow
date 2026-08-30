import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { BaseService } from '../oop/BaseService.js';

const supplierService = new BaseService(Supplier, 'Supplier');

// @desc    Get all suppliers with supplied product counts
// @route   GET /api/suppliers
export async function getSuppliers(req, res, next) {
  try {
    const { search = '', active } = req.query;
    const filter = {};

    if (active !== undefined) {
      filter.active = active === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(filter).sort({ company: 1 });

    // Attach product counts and active PO counts
    const suppliersWithCounts = await Promise.all(
      suppliers.map(async s => {
        const productCount = await Product.countDocuments({ supplier: s._id });
        const pendingOrders = await PurchaseOrder.countDocuments({
          supplier: s._id,
          status: { $in: ['PENDING', 'APPROVED', 'IN_TRANSIT'] }
        });
        return {
          ...s.toObject(),
          productCount,
          pendingOrders
        };
      })
    );

    res.json({ success: true, count: suppliersWithCounts.length, data: suppliersWithCounts });
  } catch (error) {
    next(error);
  }
}

// @desc    Get single supplier with product catalog & PO history
// @route   GET /api/suppliers/:id
export async function getSupplierById(req, res, next) {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    const [products, orders] = await Promise.all([
      Product.find({ supplier: supplier._id }),
      PurchaseOrder.find({ supplier: supplier._id }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      success: true,
      data: {
        ...supplier.toObject(),
        products,
        orders
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Create supplier
// @route   POST /api/suppliers
export async function createSupplier(req, res, next) {
  try {
    const supplier = await supplierService.create(req.body, {
      details: `Created new supplier: ${req.body.company || req.body.name}`,
      badge: 'SUCCESS'
    });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
}

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
export async function updateSupplier(req, res, next) {
  try {
    const supplier = await supplierService.update(req.params.id, req.body, {
      details: `Updated supplier details: ${req.body.company || req.body.name || req.params.id}`,
      badge: 'INFO'
    });
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
export async function deleteSupplier(req, res, next) {
  try {
    // Unlink products associated with this supplier
    await Product.updateMany({ supplier: req.params.id }, { $set: { supplier: null } });

    await supplierService.delete(req.params.id, {
      details: `Deleted supplier with ID: ${req.params.id}`,
      badge: 'DANGER'
    });
    res.json({ success: true, message: 'Supplier deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// @desc    Get comprehensive Supplier Scorecard analytics & rankings
// @route   GET /api/suppliers/scorecards
export async function getSupplierScorecards(req, res, next) {
  try {
    const suppliers = await Supplier.find({ active: true }).sort({ rating: -1 });

    const totalSuppliers = suppliers.length;
    const avgOnTime = totalSuppliers > 0
      ? Number((suppliers.reduce((sum, s) => sum + (s.onTimeDeliveryRate || 95), 0) / totalSuppliers).toFixed(1))
      : 95;
    const avgDefect = totalSuppliers > 0
      ? Number((suppliers.reduce((sum, s) => sum + (s.qualityDefectRate || 1.0), 0) / totalSuppliers).toFixed(1))
      : 1.0;
    const topSupplier = suppliers[0] || null;

    res.json({
      success: true,
      data: {
        summary: {
          totalSuppliers,
          avgOnTimeRate: avgOnTime,
          avgDefectRate: avgDefect,
          topSupplierName: topSupplier ? topSupplier.company : 'N/A',
          topSupplierRating: topSupplier ? topSupplier.rating : 5.0
        },
        suppliers
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Record a delivery quality & on-time inspection to dynamically update supplier score
// @route   POST /api/suppliers/:id/inspection
export async function recordQualityInspection(req, res, next) {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const { wasOnTime = true, totalUnits = 50, damagedUnits = 0, priceHikePercent = 0, notes } = req.body;

    const updatedFields = (await import('../oop/SupplierScorecardEngine.js')).default.applyDeliveryInspection(
      supplier,
      { wasOnTime: Boolean(wasOnTime), totalUnits: Number(totalUnits), damagedUnits: Number(damagedUnits), priceHikePercent: Number(priceHikePercent) }
    );

    Object.assign(supplier, updatedFields);
    await supplier.save();

    res.json({
      success: true,
      message: `Inspection recorded! New rating for ${supplier.company}: ${supplier.rating} Stars (Grade ${supplier.grade})`,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
}
