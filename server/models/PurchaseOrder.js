import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hsnCode: {
    type: String,
    default: 'HSN 8479'
  },
  unit: {
    type: String,
    default: 'Pieces'
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  gstRate: {
    type: Number,
    default: 18
  },
  gstType: {
    type: String,
    enum: ['INTRA_STATE', 'INTER_STATE'],
    default: 'INTRA_STATE'
  },
  cgstAmount: {
    type: Number,
    default: 0
  },
  sgstAmount: {
    type: Number,
    default: 0
  },
  igstAmount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  placeOfSupply: {
    type: String,
    default: 'Maharashtra (27)'
  },
  ewayBillNo: {
    type: String,
    default: '',
    trim: true
  },
  warehouseGSTIN: {
    type: String,
    default: '27AAACW8899F1Z4'
  },
  warehouseAddress: {
    type: String,
    default: 'Bhiwandi Logistics Hub, Building C-4, Thane, Maharashtra - 421302'
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  expectedDeliveryDate: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
