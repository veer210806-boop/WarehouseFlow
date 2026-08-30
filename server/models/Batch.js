import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    batchNumber: {
      type: String,
      required: [true, 'Batch Number is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true,
      index: true
    },
    initialQuantity: {
      type: Number,
      required: [true, 'Initial quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: [0, 'Remaining quantity cannot be negative']
    },
    unit: {
      type: String,
      default: 'Pieces'
    },
    mfgDate: {
      type: Date,
      required: [true, 'Manufacturing date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true
    },
    costPrice: {
      type: Number,
      default: 0
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    supplierName: {
      type: String
    },
    location: {
      type: String,
      default: 'Aisle 1 - Section A'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DEPLETED', 'EXPIRED'],
      default: 'ACTIVE'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Helper virtual property to calculate days until expiry
batchSchema.virtual('daysToExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = new Date(this.expiryDate).getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

batchSchema.set('toJSON', { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;

