const express = require('express');
const { body, validationResult } = require('express-validator');
const Tracking = require('../models/tracking');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ Get today's tracking data (NO auto-reset)
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const tracking = await Tracking.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!tracking) {
      return res.status(404).json({ message: 'No record found for today' });
    }

    res.json({ tracking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Common function to get or create today's record
async function getOrCreateTodayRecord(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  let tracking = await Tracking.findOne({
    userId: user._id,
    date: { $gte: today, $lt: tomorrow }
  });

  if (!tracking) {
    tracking = new Tracking({
      userId: user._id,
      date: today,
      water: { goal: user.goals.water },
      food: { goal: user.goals.food },
      sleep: { goal: user.goals.sleep }
    });
    await tracking.save();
  }

  return tracking;
}

// ✅ Update water intake
router.put('/water', auth, [
  body('amount').isInt({ min: 0 }).withMessage('Water amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    let tracking = await getOrCreateTodayRecord(req.user);

    tracking.water.amount += amount;
    tracking.water.goal = req.user.goals.water;
    await tracking.save();

    res.json({
      message: 'Water intake updated',
      water: tracking.water
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Update food intake
router.put('/food', auth, [
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive number'),
  body('meals').optional().isInt({ min: 0 }).withMessage('Meals must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { calories, meals = 1 } = req.body;
    let tracking = await getOrCreateTodayRecord(req.user);

    tracking.food.calories += calories;
    tracking.food.meals += meals;
    tracking.food.goal = req.user.goals.food;
    await tracking.save();

    res.json({
      message: 'Food intake updated',
      food: tracking.food
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Update sleep hours (incremental)
router.put('/sleep', auth, [
  body('hours').isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0-24')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hours } = req.body;
    let tracking = await getOrCreateTodayRecord(req.user);

    // 🔧 Fix here (increment instead of overwrite)
    tracking.sleep.hours = (tracking.sleep.hours || 0) + hours;
    tracking.sleep.goal = req.user.goals.sleep;
    await tracking.save();

    res.json({
      message: 'Sleep updated',
      sleep: tracking.sleep
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// // ✅ Overwrite sleep hours
// router.put('/sleep/set', auth, [
//   body('hours').isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0-24')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { hours } = req.body;
//     let tracking = await getOrCreateTodayRecord(req.user);

//     // ⬇️ Overwrite (set exact value)
//     tracking.sleep.hours = hours;
//     tracking.sleep.goal = req.user.goals.sleep;
//     await tracking.save();

//     res.json({
//       message: 'Sleep updated (set)',
//       sleep: tracking.sleep
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


// ✅ Get weekly tracking data
router.get('/weekly', auth, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const trackingData = await Tracking.find({
      userId: req.user._id,
      date: { $gte: weekAgo, $lte: today }
    }).sort({ date: 1 });

    res.json({ trackingData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Reset daily data (manual only)
// Reset only water
router.delete("/water", auth, async (req, res) => {
  try {
    let tracking = await Tracking.findOne({
      user: req.user.userId,
      date: new Date().toDateString()
    });

    if (!tracking) {
      return res.status(404).json({ message: "No tracking found" });
    }

    tracking.water.amount = 0;
    await tracking.save();

    res.json({ message: "Water intake reset", water: tracking.water });
  } catch (err) {
    console.error("Reset water error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset only food
router.delete("/food", auth, async (req, res) => {
  try {
    let tracking = await Tracking.findOne({
      user: req.user.userId,
      date: new Date().toDateString()
    });

    if (!tracking) {
      return res.status(404).json({ message: "No tracking found" });
    }

    tracking.food.calories = 0;
    tracking.food.meals = 0;
    await tracking.save();

    res.json({ message: "Food intake reset", food: tracking.food });
  } catch (err) {
    console.error("Reset food error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset only sleep
router.delete("/sleep", auth, async (req, res) => {
  try {
    let tracking = await Tracking.findOne({
      user: req.user.userId,
      date: new Date().toDateString()
    });

    if (!tracking) {
      return res.status(404).json({ message: "No tracking found" });
    }

    tracking.sleep.hours = 0;
    await tracking.save();

    res.json({ message: "Sleep hours reset", sleep: tracking.sleep });
  } catch (err) {
    console.error("Reset sleep error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
