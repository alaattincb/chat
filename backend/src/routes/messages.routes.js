const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const {
  sendPrivateMessage,
  sendGroupMessage,
  getPrivateMessages,
  getGroupMessages,
  markMessageAsRead
} = require('../controllers/messages.controller');

// Tüm route'lar korumalı
router.use(auth);

// Özel mesaj route'ları
router.post('/private', sendPrivateMessage);
router.get('/private/:userId', getPrivateMessages);

// Grup mesaj route'ları
router.post('/group', sendGroupMessage);
router.get('/group/:groupId', getGroupMessages);

// Mesaj durumu
router.patch('/:messageId/read', markMessageAsRead);

module.exports = router; 