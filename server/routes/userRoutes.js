const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/users/me
router.put('/me', protect, async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    req.user.name = name.trim();
    req.user.bio = typeof bio === 'string' ? bio.trim().slice(0, 240) : '';
    req.user.profilePicture = typeof profilePicture === 'string' ? profilePicture.trim() : '';

    const updatedUser = await req.user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/search?query=...
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
