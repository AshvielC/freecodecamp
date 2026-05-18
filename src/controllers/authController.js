const crypto = require('crypto');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const BuyerProfile = require('../models/BuyerProfile');
const { signToken } = require('../middleware/auth');

const safeUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  verified: user.verified
});

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

    res.status(201).json({ token: signToken(user), user: safeUser(user) });
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

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      res.json({ message: 'If an account exists, password reset instructions have been generated.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // In production this token should be emailed or sent through a trusted notification provider.
    res.json({
      message: 'Password reset token generated. Use it within 15 minutes.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires +password');

    if (!user) {
      res.status(400).json({ message: 'Password reset token is invalid or expired.' });
      return;
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ token: signToken(user), user: safeUser(user), message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, forgotPassword, resetPassword, me };
