const express = require('express');
const router = express.Router();
const { 
  createMessage, 
  getAllMessages, 
  markAsRead,
  getMyMessages, // 👈 Import
  replyToMessage // 👈 Import
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// Volunteer Routes
router.post('/', protect, createMessage);
router.get('/my', protect, getMyMessages); // 👈 New Route for Volunteer History

// Admin Routes
router.get('/', protect, isAdmin, getAllMessages);
router.put('/:id/read', protect, isAdmin, markAsRead);
router.put('/:id/reply', protect, isAdmin, replyToMessage); // 👈 New Route for Admin Reply

module.exports = router;