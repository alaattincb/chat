const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { register, login, logout, getCurrentUser } = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(auth);
router.post('/logout', logout);
router.get('/me', getCurrentUser);

module.exports = router; 