const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// List of disposable email domains to block
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com', 
  'dispostable.com', '10minutemail.com', 'trashmail.com'
];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Block junk/disposable emails
    const domain = email.split('@')[1];
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return res.status(400).json({ message: 'Disposable email domains are not allowed' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate a simple 6-digit verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({ 
      name, 
      email, 
      password, 
      isVerified: false,
      verificationToken 
    });

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your SyncSphere Email',
        message: `Your verification code is ${verificationToken}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dfe8e4; border-radius: 12px; background-color: #f6faf8;">
            <h2 style="color: #0f7c5a; text-align: center;">Welcome to SyncSphere!</h2>
            <p style="font-size: 16px; color: #143327;">Hi ${user.name},</p>
            <p style="font-size: 16px; color: #143327;">Thank you for signing up. Please use the following code to verify your email address:</p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px solid #c8dcd3;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f7c5a;">${verificationToken}</span>
            </div>
            <p style="font-size: 14px; color: #55726a; text-align: center;">If you did not request this, please ignore this email.</p>
          </div>
        `
      });
    } catch (err) {
      console.error('Email could not be sent:', err);
      await User.findByIdAndDelete(user._id);
      return res.status(502).json({
        message: 'Account was not created because the verification email could not be sent. Please try again shortly.',
      });
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for the verification code.',
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ email, verificationToken: code });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      bio: user.bio,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address before logging in.',
        requiresVerification: true,
        email: user.email
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      bio: user.bio,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
