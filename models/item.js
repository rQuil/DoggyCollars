const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Very Good', 'Good', 'Other'],
    required: [true, 'Condition is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be at least 0.01']
  },
  details: {
    type: String,
    required: [true, 'Details are required']
  },
  image: {
    type: String,
    required: [true, 'Image path is required']
  },
  active: {
    type: Boolean,
    default: true
  },
  totalOffers: {
    type: Number,
    default: 0
  },
  highestOffer: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Item', itemSchema);
