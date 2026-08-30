import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  sku: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT', 'REORDER'],
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  referenceNumber: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: String,
    default: 'System Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('InventoryLog', inventoryLogSchema);
