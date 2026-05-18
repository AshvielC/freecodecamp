const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    farmName: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
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
    deliveryAreas: [String],
    certifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certification' }],
    verified: { type: Boolean, default: false },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    photos: [String]
  },
  { timestamps: true }
);

farmerProfileSchema.index({ 'location.coordinates': '2dsphere' });
farmerProfileSchema.index({ farmName: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
