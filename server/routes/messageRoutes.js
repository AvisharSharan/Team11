const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/authMiddleware');

// GET /api/messages/:conversationId
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate('sender', 'name email bio profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/messages
router.post('/', protect, async (req, res) => {
  try {
    const { conversationId, content, fileUrl, filePublicId, fileType, fileName } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    if (!content && !fileUrl) {
      return res.status(400).json({ message: 'Message content or a file is required' });
    }

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content: content ? content.trim() : '',
      fileUrl,
      filePublicId,
      fileType,
      fileName,
      readBy: [req.user._id],
    });

    const populated = await Message.findById(message._id).populate('sender', 'name email bio profilePicture');

    // Update conversation's lastMessage and updatedAt
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
