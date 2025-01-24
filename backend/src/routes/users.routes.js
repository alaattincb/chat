const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const {
  getAllUsers,
  searchUsers,
  getUserProfile,
  updateUserStatus
} = require('../controllers/users.controller');

// Tüm route'lar korumalı
router.use(auth);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/:userId', getUserProfile);
router.patch('/status', updateUserStatus);

module.exports = router; 