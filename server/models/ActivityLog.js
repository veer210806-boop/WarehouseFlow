import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    enum: ['PRODUCT', 'INVENTORY', 'ORDER', 'SUPPLIER', 'SYSTEM'],
    required: true,
    index: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  badgeType: {
    type: String,
    enum: ['SUCCESS', 'WARNING', 'DANGER', 'INFO', 'PRIMARY'],
    default: 'INFO'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('ActivityLog', activityLogSchema);
