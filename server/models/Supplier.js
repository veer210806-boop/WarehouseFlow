import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier contact person or title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  gstin: {
    type: String,
    default: '',
    uppercase: true,
    trim: true,
    index: true
  },
  state: {
    type: String,
    default: 'Maharashtra',
    trim: true
  },
  stateCode: {
    type: String,
    default: '27',
    trim: true
  },
  pan: {
    type: String,
    default: '',
    uppercase: true,
    trim: true
  },
  leadTimeDays: {
    type: Number,
    required: true,
    default: 5,
    min: [1, 'Lead time must be at least 1 day']
  },
  paymentTerms: {
    type: String,
    default: 'Net 30',
    trim: true
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  onTimeDeliveryRate: {
    type: Number,
    default: 96.0,
    min: 0,
    max: 100
  },
  qualityDefectRate: {
    type: Number,
    default: 1.2,
    min: 0,
    max: 100
  },
  priceStabilityScore: {
    type: Number,
    default: 94.0,
    min: 0,
    max: 100
  },
  totalOrdersCompleted: {
    type: Number,
    default: 15
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B', 'C'],
    default: 'A+'
  },
  evaluationNotes: {
    type: String,
    default: 'Highly consistent supplier with minimal shipment defects.'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('Supplier', supplierSchema);
