const mongoose = require('mongoose');
const { LISTING_STATUSES, QUALITY_GRADES } = require('../utils/constants');

const produceListingSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmerProfile' },
    produceName: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 1500 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, maxlength: 30 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    harvestDate: { type: Date, required: true },
    availableFrom: Date,
    availableUntil: Date,
    location: {
      address: String,
      city: String,
      region: String,
      country: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
      }
    },
    deliveryAvailable: { type: Boolean, default: false },
    deliveryRadius: { type: Number, default: 0, min: 0 },
    pickupAvailable: { type: Boolean, default: true },
    minimumOrderQuantity: { type: Number, default: 1, min: 0 },
    qualityGrade: { type: String, enum: QUALITY_GRADES, default: 'grade_a' },
    photos: [String],
    certificationIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certification' }],
    organicCertified: { type: Boolean, default: false },
    verifiedFarmer: { type: Boolean, default: false },
    farmerRating: { type: Number, default: 0, min: 0, max: 5 },
    status: { type: String, enum: LISTING_STATUSES, default: 'available' }
  },
  { timestamps: true }
);

produceListingSchema.index({ produceName: 'text', category: 'text', description: 'text', 'location.city': 'text' });
produceListingSchema.index({ 'location.coordinates': '2dsphere' });
produceListingSchema.index({ category: 1, pricePerUnit: 1, quantityAvailable: 1, status: 1 });

module.exports = mongoose.model('ProduceListing', produceListingSchema);
