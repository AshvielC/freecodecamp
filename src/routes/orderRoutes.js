const express = require('express');
const { body, param } = require('express-validator');
const { createOrder, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.get('/my', getMyOrders);
router.post(
  '/',
  restrictTo('buyer'),
  [
    body('listingId').isMongoId(),
    body('quantity').isFloat({ min: 0.01 }),
    body('offeredPrice').isFloat({ min: 0 }),
    body('deliveryMethod').isIn(['pickup', 'delivery']),
    body('requestedDate').isISO8601().toDate()
  ],
  validate,
  createOrder
);
router.patch(
  '/:id/status',
  restrictTo('farmer', 'admin'),
  [param('id').isMongoId(), body('status').optional().isIn(['pending', 'accepted', 'counter_offered', 'rejected', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'completed', 'cancelled'])],
  validate,
  updateOrderStatus
);

module.exports = router;
