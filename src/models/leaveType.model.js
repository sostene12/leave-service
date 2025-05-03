import mongoose from 'mongoose';

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requiresDocumentation: {
    type: Boolean,
    default: false
  },
  maxDuration: {
    type: Number, // Maximum number of days allowed for this leave type
    default: null // null means no limit
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String, // For calendar visualization
    default: '#3498db'
  }
}, {
  timestamps: true
});

const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);

export default LeaveType;