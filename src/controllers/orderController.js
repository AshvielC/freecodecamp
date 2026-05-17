const Order = require('../models/Order');
const ProduceListing = require('../models/ProduceListing');
const Notification = require('../models/Notification');

const createOrder = async (req, res, next) => {
  try {
    const listing = await ProduceListing.findById(req.body.listingId);

    if (!listing) {
      res.status(404).json({ message: 'Produce listing not found.' });
      return;
    }

    if (req.body.quantity > listing.quantityAvailable) {
      res.status(400).json({ message: 'Requested quantity exceeds available stock.' });
      return;
    }

    const order = await Order.create({
      ...req.body,
      buyerId: req.user._id,
      farmerId: listing.farmerId,
      produceName: listing.produceName,
      unit: listing.unit,
      finalPrice: req.body.offeredPrice,
      traceability: {
        harvestDate: listing.harvestDate,
        batchCode: `${listing.produceName.slice(0, 3).toUpperCase()}-${Date.now()}`,
        farmLocation: [listing.location?.city, listing.location?.region].filter(Boolean).join(', '),
        farmer: listing.farmerId,
        buyer: req.user._id,
        produceBatch: listing._id.toString(),
        deliveryDate: req.body.requestedDate,
        quantity: req.body.quantity,
        buyerDestination: req.body.deliveryAddress
      }
    });

    await Notification.create({
      userId: listing.farmerId,
      type: 'order_request',
      title: 'New bulk order request',
      message: `${req.user.name} requested ${order.quantity} ${order.unit} of ${order.produceName}.`,
      metadata: { orderId: order._id }
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const query = req.user.role === 'farmer' ? { farmerId: req.user._id } : { buyerId: req.user._id };
    const orders = await Order.find(query).populate('listingId').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, farmerId: req.user._id };
    const update = { status: req.body.status };

    if (req.body.counterOfferPrice) {
      update.counterOfferPrice = req.body.counterOfferPrice;
      update.status = 'counter_offered';
    }

    if (['accepted', 'completed'].includes(update.status)) {
      update.finalPrice = req.body.finalPrice || req.body.counterOfferPrice;
    }

    const order = await Order.findOneAndUpdate(query, update, { new: true, runValidators: true });

    if (!order) {
      res.status(404).json({ message: 'Order not found or not available for this user.' });
      return;
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, updateOrderStatus };
