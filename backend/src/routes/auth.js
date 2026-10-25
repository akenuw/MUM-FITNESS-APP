const express = require('express');
const { register, login, verifyEmail, getMe, googleLogin } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
