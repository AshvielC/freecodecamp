const express = require('express');
const { body, param } = require('express-validator');
const { sendMessage, getConversation } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.post('/', [body('recipientId').isMongoId(), body('body').trim().isLength({ min: 1, max: 2000 })], validate, sendMessage);
router.get('/conversations/:userId', [param('userId').isMongoId()], validate, getConversation);

module.exports = router;
