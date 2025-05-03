import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  recurringDay: {
    type: Number, // Day of month for recurring holidays
    default: null
  },
  recurringMonth: {
    type: Number, // Month for recurring holidays
    default: null
  }
}, {
  timestamps: true
});

const Holiday = mongoose.model('Holiday', holidaySchema);

export default Holiday;