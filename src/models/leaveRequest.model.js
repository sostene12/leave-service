import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  leaveTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'canceled'],
    default: 'pending'
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  documentUrl: {
    type: String,
    default: null
  },
  numberOfDays: {
    type: Number,
    required: true
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
  userProfilePicture: {
    type: String,
    default: null
  },
  departmentId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;