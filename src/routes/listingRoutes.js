const express = require('express');
const { body, param } = require('express-validator');
const { getListings, createListing, getListing, updateListing } = require('../controllers/listingController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getListings);
router.post(
  '/',
  protect,
  restrictTo('farmer'),
  [
    body('produceName').trim().isLength({ min: 2, max: 120 }),
    body('category').trim().notEmpty(),
    body('quantityAvailable').isFloat({ min: 0 }),
    body('unit').trim().notEmpty(),
    body('pricePerUnit').isFloat({ min: 0 }),
    body('harvestDate').isISO8601().toDate()
  ],
  validate,
  createListing
);
router.get('/:id', [param('id').isMongoId()], validate, getListing);
router.patch('/:id', protect, restrictTo('farmer'), [param('id').isMongoId()], validate, updateListing);

module.exports = router;
