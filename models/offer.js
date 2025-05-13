const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Offer amount is required'],
    min: [0.01, 'Offer must be at least 0.01']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
