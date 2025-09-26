const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        age: req.user.age,
        weight: req.user.weight,
        height: req.user.height,
        goals: req.user.goals
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('age').optional().isInt({ min: 1, max: 120 }),
  body('weight').optional().isFloat({ min: 1 }),
  body('height').optional().isFloat({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, weight, height } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (weight) updateData.weight = weight;
    if (height) updateData.height = height;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        goals: user.goals
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user goals
router.put('/goals', auth, [
  body('water').optional().isInt({ min: 500 }),
  body('food').optional().isInt({ min: 1000 }),
  body('sleep').optional().isFloat({ min: 4, max: 12 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { water, food, sleep } = req.body;
    const updateData = {};

    if (water) updateData['goals.water'] = water;
    if (food) updateData['goals.food'] = food;
    if (sleep) updateData['goals.sleep'] = sleep;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Goals updated successfully',
      goals: user.goals
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;