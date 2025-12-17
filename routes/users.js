const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Get current user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update current user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { email, fullName } = req.body;

    // Validate required fields
    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.session.userId }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { email, fullName },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
