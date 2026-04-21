const express = require('express');
const router = express.Router();

const Member = require('../models/Member');
const { protect } = require('../middleware/authMiddleware');

const parseHobbies = (hobbies) => {
  if (Array.isArray(hobbies)) {
    return hobbies.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof hobbies === 'string') {
    return hobbies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

router.get('/', protect, async (req, res) => {
  try {
    const members = await Member.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('createdBy', 'name email');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      year,
      degree,
      email,
      role,
      aboutProject,
      hobbies,
      certificate,
      internship,
      aboutAim,
      photoUrl,
      photoPublicId,
      photoName,
    } = req.body;

    if (!name || !rollNumber || !year || !degree || !email || !role || !aboutProject || !photoUrl) {
      return res.status(400).json({ message: 'Required member details are missing' });
    }

    const member = await Member.create({
      name,
      rollNumber,
      year,
      degree,
      email,
      role,
      aboutProject,
      hobbies: parseHobbies(hobbies),
      certificate,
      internship,
      aboutAim,
      photoUrl,
      photoPublicId,
      photoName,
      createdBy: req.user._id,
    });

    const savedMember = await Member.findById(member._id).populate('createdBy', 'name email');

    res.status(201).json(savedMember);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(409).json({ message: `${duplicateField} already exists` });
    }

    res.status(500).json({ message: error.message });
  }
});

module.exports = router;