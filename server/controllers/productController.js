import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import { BaseService } from '../oop/BaseService.js';
import { SearchAndSortDSA } from '../oop/SearchAndSortDSA.js';
import { ReorderEngine } from '../oop/ReorderEngine.js';

const productService = new BaseService(Product, 'Product');

// @desc    Get all products with DSA Filtering, Sorting and Pagination
// @route   GET /api/products
export async function getProducts(req, res, next) {
  try {
    const {
      search = '',
      category = '',
      healthStatus = '',
      supplierId = '',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 100,
      all = 'false'
    } = req.query;

    const allProducts = await Product.find().populate('supplier').lean({ virtuals: true });

    // 1. Run DSA Filter Engine
    const filtered = SearchAndSortDSA.filterProducts(allProducts, {
      search,
      category,
      healthStatus,
      supplierId
    });

    // 2. Run DSA Sorter
    const sorted = SearchAndSortDSA.sortItems(filtered, sortBy, order);

    // If client asks for all (no pagination for dropdowns/exports)
    if (all === 'true') {
      return res.json({ success: true, count: sorted.length, data: sorted });
    }

    // 3. Run DSA Paginated Slicer
    const paginated = SearchAndSortDSA.paginate(sorted, page, limit);

    res.json({
      success: true,
      count: paginated.data.length,
      pagination: paginated.pagination,
      data: paginated.data
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get single product by ID
// @route   GET /api/products/:id
export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('supplier');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Include smart replenishment metrics
    const smartAnalysis = ReorderEngine.analyzeProduct(product, product.supplier);

    res.json({ success: true, data: product, smartAnalysis });
  } catch (error) {
    next(error);
  }
}

// @desc    Fast SKU search using Binary Search
// @route   GET /api/products/search/sku/:sku
export async function searchBySKU(req, res, next) {
  try {
    const targetSKU = req.params.sku;
    const allProducts = await Product.find().sort({ sku: 1 }).populate('supplier').lean();
    
    // Execute O(log N) Binary Search on sorted SKU array
    const matched = SearchAndSortDSA.binarySearch(allProducts, 'sku', targetSKU);

    if (!matched) {
      return res.status(404).json({ success: false, message: `Product with SKU "${targetSKU}" not found.` });
    }

    res.json({ success: true, data: matched });
  } catch (error) {
    next(error);
  }
}

// @desc    Create new product
// @route   POST /api/products
export async function createProduct(req, res, next) {
  try {
    const { sku, name, category, costPrice, sellingPrice, stock, minStockAlert, safetyStock, weeklySales, supplier, unit, location, hsnCode, gstRate } = req.body;

    const existingSKU = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (existingSKU) {
      return res.status(400).json({ success: false, message: `Product with SKU "${sku}" already exists.` });
    }

    const product = await productService.create({
      sku: sku.toUpperCase().trim(),
      name,
      category: category || 'General',
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 15,
      safetyStock: Number(safetyStock) || 5,
      weeklySales: Number(weeklySales) || 10,
      supplier: supplier || null,
      unit: unit || 'Pieces',
      location: location || 'Main Warehouse',
      hsnCode: hsnCode || 'HSN 8479',
      gstRate: Number(gstRate || 18)
    }, {
      details: `Added new product: "${name}" (${sku.toUpperCase()}) with initial stock of ${stock || 0}`,
      badge: 'SUCCESS'
    });

    const populated = await Product.findById(product._id).populate('supplier');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
export async function updateProduct(req, res, next) {
  try {
    const updated = await productService.update(req.params.id, req.body, {
      details: `Updated product details for ID: ${req.params.id}`,
      badge: 'INFO'
    });
    const populated = await Product.findById(updated._id).populate('supplier');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
export async function deleteProduct(req, res, next) {
  try {
    await productService.delete(req.params.id, {
      details: `Deleted product with ID: ${req.params.id}`,
      badge: 'DANGER'
    });
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// @desc    Get all distinct categories
// @route   GET /api/products/meta/categories
export async function getCategories(req, res, next) {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}
