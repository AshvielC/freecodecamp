const express = require('express');
const { body, param } = require('express-validator');
const { getListings, getMyListings, createListing, getListing, updateListing, updateListingStatus } = require('../controllers/listingController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.get('/', getListings);
router.get('/mine', restrictTo('farmer'), getMyListings);
router.post(
  '/',
  restrictTo('farmer'),
  [
    body('produceName').trim().isLength({ min: 2, max: 120 }),
    body('category').trim().notEmpty(),
    body('quantityAvailable').isFloat({ min: 0 }),
    body('unit').trim().notEmpty(),
    body('pricePerUnit').isFloat({ min: 0 }),
    body('harvestDate').isISO8601().toDate(),
    body('photos').optional().isArray(),
    body('status').optional().isIn(['available', 'low_stock', 'sold_out', 'not_available'])
  ],
  validate,
  createListing
);
router.get('/:id', [param('id').isMongoId()], validate, getListing);
router.patch('/:id', restrictTo('farmer'), [param('id').isMongoId()], validate, updateListing);
router.patch(
  '/:id/status',
  restrictTo('farmer'),
  [param('id').isMongoId(), body('status').isIn(['available', 'low_stock', 'sold_out', 'not_available'])],
  validate,
  updateListingStatus
);

module.exports = router;
