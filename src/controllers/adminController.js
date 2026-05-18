const User = require('../models/User');
const Order = require('../models/Order');
const ProduceListing = require('../models/ProduceListing');
const Certification = require('../models/Certification');

const getAnalytics = async (req, res, next) => {
  try {
    const [users, farmers, buyers, listings, orders, pendingCertifications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      ProduceListing.countDocuments(),
      Order.countDocuments(),
      Certification.countDocuments({ status: 'pending' })
    ]);

    const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    res.json({ users, farmers, buyers, listings, orders, pendingCertifications, ordersByStatus });
  } catch (error) {
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const approveCertification = async (req, res, next) => {
  try {
    const certification = await Certification.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    );

    if (!certification) {
      res.status(404).json({ message: 'Certification not found.' });
      return;
    }

    res.json({ certification });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, verifyUser, approveCertification };
