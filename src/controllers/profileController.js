const FarmerProfile = require('../models/FarmerProfile');
const BuyerProfile = require('../models/BuyerProfile');

const getMyProfile = async (req, res, next) => {
  try {
    const profile = req.user.role === 'farmer'
      ? await FarmerProfile.findOne({ userId: req.user._id }).populate('certifications')
      : await BuyerProfile.findOne({ userId: req.user._id });

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const Model = req.user.role === 'farmer' ? FarmerProfile : BuyerProfile;
    const profile = await Model.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateMyProfile };
