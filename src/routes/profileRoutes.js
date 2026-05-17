const express = require('express');
const { getMyProfile, updateMyProfile } = require('../controllers/profileController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/me', restrictTo('farmer', 'buyer'), getMyProfile);
router.patch('/me', restrictTo('farmer', 'buyer'), updateMyProfile);

module.exports = router;
