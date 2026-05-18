const Message = require('../models/Message');

const sendMessage = async (req, res, next) => {
  try {
    const message = await Message.create({ ...req.body, senderId: req.user._id });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getConversation };
