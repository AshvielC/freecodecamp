const mongoose = require('mongoose');
const { ORDER_STATUSES, SUPPLY_FREQUENCIES } = require('../utils/constants');

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProduceListing', required: true },
    produceName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, required: true, trim: true },
    offeredPrice: { type: Number, required: true, min: 0 },
    finalPrice: { type: Number, min: 0 },
    counterOfferPrice: { type: Number, min: 0 },
    deliveryMethod: { type: String, enum: ['pickup', 'delivery'], required: true },
    deliveryAddress: { type: String, trim: true },
    requestedDate: { type: Date, required: true },
    deliveryDate: Date,
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    isPreorder: { type: Boolean, default: false },
    buyerConfirmedDeliveryAt: Date,
    farmerRespondedAt: Date,
    recurringSupply: {
      frequency: { type: String, enum: SUPPLY_FREQUENCIES, default: 'none' },
      preferredDeliveryDays: [String],
      standingQuantity: Number,
      negotiatedPrice: Number,
      startDate: Date,
      endDate: Date
    },
    traceability: {
      harvestDate: Date,
      batchCode: String,
      farmLocation: String,
      farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      produceBatch: String,
      deliveryDate: Date,
      quantity: Number,
      buyerDestination: String
    },
    notes: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ farmerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
