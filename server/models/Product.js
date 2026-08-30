import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    default: 'General',
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  minStockAlert: {
    type: Number,
    default: 15,
    min: [0, 'Min stock alert cannot be negative']
  },
  safetyStock: {
    type: Number,
    default: 5,
    min: [0, 'Safety stock cannot be negative']
  },
  weeklySales: {
    type: Number,
    default: 10,
    min: [0, 'Weekly sales cannot be negative']
  },
  unit: {
    type: String,
    default: 'Pieces',
    trim: true
  },
  hsnCode: {
    type: String,
    default: 'HSN 8479',
    trim: true,
    index: true
  },
  gstRate: {
    type: Number,
    default: 18,
    min: [0, 'GST rate cannot be negative']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    default: null
  },
  location: {
    type: String,
    default: 'Main Warehouse (Aisle 1)',
    trim: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DISCONTINUED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for inventory value
productSchema.virtual('totalValue').get(function() {
  return (this.stock || 0) * (this.costPrice || 0);
});

// Virtual for Stock Health status: HEALTHY, LOW, CRITICAL, OUT_OF_STOCK
productSchema.virtual('healthStatus').get(function() {
  if (this.stock === 0) return 'OUT_OF_STOCK';
  if (this.stock <= this.safetyStock) return 'CRITICAL';
  if (this.stock <= this.minStockAlert) return 'LOW';
  return 'HEALTHY';
});

export default mongoose.model('Product', productSchema);
