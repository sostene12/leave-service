import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Store user information for display purposes
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  departmentId: {
    type: String,
    required: true
  },
  // Main balance tracking
  totalBalance: {
    type: Number,
    default: 0
  },
  usedBalance: {
    type: Number,
    default: 0
  },
  carryOverBalance: {
    type: Number,
    default: 0
  },
  carryOverExpiryDate: {
    type: Date,
    default: null
  },
  // Track monthly accruals
  lastAccrualDate: {
    type: Date,
    default: Date.now
  },
  // Balance history for tracking changes
  balanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['accrual', 'used', 'adjustment', 'carryover', 'expiry'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: null
    },
    performedBy: {
      type: String,
      default: 'system'
    }
  }]
}, {
  timestamps: true
});

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

export default LeaveBalance;