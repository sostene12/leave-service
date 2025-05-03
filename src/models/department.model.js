import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  managerId: {
    type: String,
    required: true
  },
  managerName: {
    type: String,
    required: true
  },
  managerEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;