const express = require('express');
const { param } = require('express-validator');
const { getAnalytics, verifyUser, approveCertification } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect, restrictTo('admin'));
router.get('/analytics', getAnalytics);
router.patch('/users/:id/verify', [param('id').isMongoId()], validate, verifyUser);
router.patch('/certifications/:id/approve', [param('id').isMongoId()], validate, approveCertification);

module.exports = router;
