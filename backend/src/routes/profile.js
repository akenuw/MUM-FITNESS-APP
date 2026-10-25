const express = require('express');
const {
  createProfile,
  getProfile,
  updateStats,
  updateGoals
} = require('../controllers/profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(createProfile)
  .get(getProfile);

router.put('/stats', updateStats);
router.put('/goals', updateGoals);

module.exports = router;
