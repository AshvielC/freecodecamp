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

    if (!['available', 'low_stock'].includes(listing.status)) {
      res.status(400).json({ message: 'This produce is currently sold out or not available.' });
      return;
    }

    if (req.body.quantity > listing.quantityAvailable) {
      res.status(400).json({ message: 'Requested quantity exceeds available stock.' });
      return;
    }

    const requestedDate = new Date(req.body.requestedDate);
    const harvestDate = listing.harvestDate ? new Date(listing.harvestDate) : null;

    if (harvestDate && requestedDate < harvestDate) {
      res.status(400).json({ message: 'Requested delivery or pickup date cannot be before the harvest date.' });
      return;
    }

    const isPreorder = harvestDate ? harvestDate > new Date() : false;

    const order = await Order.create({
      ...req.body,
      buyerId: req.user._id,
      farmerId: listing.farmerId,
      produceName: listing.produceName,
      unit: listing.unit,
      finalPrice: req.body.offeredPrice,
      isPreorder,
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
      type: isPreorder ? 'preorder_request' : 'order_request',
      title: isPreorder ? 'New preorder request' : 'New bulk order request',
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
    const order = await Order.findOne(query);

    if (!order) {
      res.status(404).json({ message: 'Order not found or not available for this user.' });
      return;
    }

    const nextStatus = req.body.counterOfferPrice ? 'counter_offered' : req.body.status;
    order.status = nextStatus;
    order.farmerRespondedAt = new Date();

    if (req.body.counterOfferPrice) {
      order.counterOfferPrice = req.body.counterOfferPrice;
    }

    if (req.body.finalPrice || req.body.counterOfferPrice) {
      order.finalPrice = req.body.finalPrice || req.body.counterOfferPrice;
    }

    await order.save();

    if (nextStatus === 'accepted') {
      const listing = await ProduceListing.findById(order.listingId);
      if (listing) {
        listing.quantityAvailable = Math.max(0, listing.quantityAvailable - order.quantity);
        if (listing.quantityAvailable === 0) listing.status = 'sold_out';
        if (listing.quantityAvailable > 0 && listing.quantityAvailable <= listing.minimumOrderQuantity) listing.status = 'low_stock';
        await listing.save();
      }
    }

    await Notification.create({
      userId: order.buyerId,
      type: 'order_status',
      title: `Order ${nextStatus.replaceAll('_', ' ')}`,
      message: `Your ${order.produceName} order is now ${nextStatus.replaceAll('_', ' ')}.`,
      metadata: { orderId: order._id }
    });

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

const confirmDelivery = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });

    if (!order) {
      res.status(404).json({ message: 'Order not found or not available for this buyer.' });
      return;
    }

    if (!['delivered', 'out_for_delivery'].includes(order.status)) {
      res.status(400).json({ message: 'Only delivered or out-for-delivery orders can be confirmed.' });
      return;
    }

    order.status = 'completed';
    order.buyerConfirmedDeliveryAt = new Date();
    order.deliveryDate = order.deliveryDate || new Date();
    order.traceability.deliveryDate = order.deliveryDate;
    await order.save();

    await Notification.create({
      userId: order.farmerId,
      type: 'delivery_confirmed',
      title: 'Buyer confirmed delivery',
      message: `${req.user.name} confirmed delivery for ${order.produceName}. The transaction is complete.`,
      metadata: { orderId: order._id }
    });

    res.json({ order, message: 'Delivery confirmed and transaction closed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, updateOrderStatus, confirmDelivery };
