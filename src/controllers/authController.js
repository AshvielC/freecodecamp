const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const BuyerProfile = require('../models/BuyerProfile');
const { signToken } = require('../middleware/auth');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, profile = {} } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({ name, email, password, role, phone });

    if (role === 'farmer') {
      await FarmerProfile.create({
        userId: user._id,
        farmName: profile.farmName || `${name}'s Farm`,
        description: profile.description,
        location: profile.location || {},
        deliveryAreas: profile.deliveryAreas || []
      });
    }

    if (role === 'buyer') {
      await BuyerProfile.create({
        userId: user._id,
        businessName: profile.businessName || name,
        buyerType: profile.buyerType || 'other',
        description: profile.description,
        deliveryDestination: profile.deliveryDestination || {},
        preferredCategories: profile.preferredCategories || []
      });
    }

    res.status(201).json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
