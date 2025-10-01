const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  water: {
    amount: { type: Number, default: 0 }, // ml
    goal: { type: Number, default: 2000 }
  },
  food: {
    calories: { type: Number, default: 0 },
    meals: { type: Number, default: 0 },
    goal: { type: Number, default: 2000 }
  },
  sleep: {
    hours: { type: Number, default: 0 },
    goal: { type: Number, default: 8 }
  }
}, {
  timestamps: true
});

// Create compound index for user and date
trackingSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Tracking', trackingSchema);