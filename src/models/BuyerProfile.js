const mongoose = require('mongoose');
const { BUYER_TYPES } = require('../utils/constants');

const buyerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true, maxlength: 120 },
    buyerType: { type: String, enum: BUYER_TYPES, required: true },
    description: { type: String, trim: true, maxlength: 1000 },
    deliveryDestination: {
      address: String,
      city: String,
      region: String,
      country: String
    },
    preferredCategories: [String],
    verified: { type: Boolean, default: false },
    completedOrders: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BuyerProfile', buyerProfileSchema);
