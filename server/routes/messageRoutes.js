const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/authMiddleware');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/messages/search?query=...
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.json([]);
    }

    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    }).select('_id');

    const conversationIds = conversations.map((conversation) => conversation._id);
    if (conversationIds.length === 0) {
      return res.json([]);
    }

    const messages = await Message.find({
      conversationId: { $in: conversationIds },
      content: { $regex: escapeRegex(query.trim()), $options: 'i' },
    })
      .populate('sender', 'name email bio profilePicture')
      .populate({
        path: 'conversationId',
        populate: [
          { path: 'participants', select: '-password' },
          { path: 'groupAdmin', select: 'name email' },
          { path: 'lastMessage', populate: { path: 'sender', select: 'name' } },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(40);

    const results = messages
      .filter((message) => message.conversationId)
      .map((message) => ({
        _id: message._id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
        conversation: message.conversationId,
      }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
