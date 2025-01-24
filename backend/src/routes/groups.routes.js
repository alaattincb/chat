const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/groups.controller');

// Tüm route'lar korumalı
router.use(auth);

router.post('/', createGroup);
router.get('/', getUserGroups);
router.get('/:groupId', getGroupDetails);
router.post('/:groupId/members', addMemberToGroup);
router.delete('/:groupId/members/:userId', removeMemberFromGroup);
router.put('/:groupId', updateGroup);
router.delete('/:groupId', deleteGroup);

module.exports = router; 