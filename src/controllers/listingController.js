const ProduceListing = require('../models/ProduceListing');
const FarmerProfile = require('../models/FarmerProfile');

const getListings = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minQuantity,
      harvestDate,
      deliveryAvailable,
      organicCertified,
      qualityGrade,
      farmerRating,
      minimumOrderQuantity,
      status = 'available',
      limit = 24,
      page = 1
    } = req.query;

    const query = {};

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (location) query.$or = [{ 'location.city': new RegExp(location, 'i') }, { 'location.region': new RegExp(location, 'i') }];
    if (status) query.status = status;
    if (qualityGrade) query.qualityGrade = qualityGrade;
    if (deliveryAvailable !== undefined) query.deliveryAvailable = deliveryAvailable === 'true';
    if (organicCertified !== undefined) query.organicCertified = organicCertified === 'true';
    if (minPrice || maxPrice) query.pricePerUnit = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    if (minQuantity) query.quantityAvailable = { $gte: Number(minQuantity) };
    if (farmerRating) query.farmerRating = { $gte: Number(farmerRating) };
    if (minimumOrderQuantity) query.minimumOrderQuantity = { $lte: Number(minimumOrderQuantity) };
    if (harvestDate) query.harvestDate = { $gte: new Date(harvestDate) };

    const pageSize = Math.min(Number(limit), 50);
    const skip = (Math.max(Number(page), 1) - 1) * pageSize;
    const [items, total] = await Promise.all([
      ProduceListing.find(query).populate('farmerProfileId').sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      ProduceListing.countDocuments(query)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / pageSize) });
  } catch (error) {
    next(error);
  }
};

const createListing = async (req, res, next) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    const listing = await ProduceListing.create({
      ...req.body,
      farmerId: req.user._id,
      farmerProfileId: profile?._id,
      location: req.body.location || profile?.location || {},
      verifiedFarmer: Boolean(profile?.verified || req.user.verified),
      farmerRating: profile?.ratingAverage || 0
    });

    res.status(201).json({ listing });
  } catch (error) {
    next(error);
  }
};

const getListing = async (req, res, next) => {
  try {
    const listing = await ProduceListing.findById(req.params.id)
      .populate('farmerProfileId')
      .populate('certificationIds');

    if (!listing) {
      res.status(404).json({ message: 'Listing not found.' });
      return;
    }

    res.json({ listing });
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await ProduceListing.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!listing) {
      res.status(404).json({ message: 'Listing not found or not owned by you.' });
      return;
    }

    res.json({ listing });
  } catch (error) {
    next(error);
  }
};

module.exports = { getListings, createListing, getListing, updateListing };
