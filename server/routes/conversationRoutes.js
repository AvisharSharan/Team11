const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// GET /api/conversations — all conversations for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', '-password')
      .populate('groupAdmin', 'name email')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' },
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/conversations/group — create a new group conversation (must be before POST / route)
router.post('/group', protect, async (req, res) => {
  try {
    const { name, participantIds } = req.body;

    if (!name || !Array.isArray(participantIds)) {
      return res.status(400).json({ message: 'name and participantIds are required' });
    }

    const uniqueParticipantIds = [...new Set(participantIds.map(String))].filter(
      (id) => id !== String(req.user._id)
    );

    const participants = [String(req.user._id), ...uniqueParticipantIds];
    if (participants.length < 3) {
      return res.status(400).json({ message: 'Group chat requires at least 3 members including you' });
    }

    const group = await Conversation.create({
      participants,
      isGroup: true,
      groupName: name.trim(),
      groupAdmin: req.user._id,
    });

    const populated = await Conversation.findById(group._id)
      .populate('participants', '-password')
      .populate('groupAdmin', 'name email')
      .populate('lastMessage');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/conversations — start or fetch existing one-on-one conversation
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId], $size: 2 },
      isGroup: { $ne: true },
    })
      .populate('participants', '-password')
      .populate('lastMessage');

    if (conversation) {
      return res.json(conversation);
    }

    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
    });

    conversation = await Conversation.findById(conversation._id).populate(
      'participants',
      '-password'
    );

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Authorization check
    const isParticipant = conversation.participants.includes(req.user._id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }

    // For groups, maybe only admin can delete? Or anyone can "leave"?
    // For this requirement, we'll implement full deletion from DB.
    if (conversation.isGroup && String(conversation.groupAdmin) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only group admin can delete the group' });
    }

    // Delete all messages in this conversation
    await Message.deleteMany({ conversationId: req.params.id });
    
    // Delete the conversation itself
    await Conversation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
