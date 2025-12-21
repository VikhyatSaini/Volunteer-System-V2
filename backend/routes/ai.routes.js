const express = require('express');
const router = express.Router();
const { generateDescription, generateTags, recommendEvents } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// Protect this route so random people don't use up your API quota!
router.post('/generate', protect, isAdmin, generateDescription);
router.post('/generate', protect, isAdmin, generateDescription);
router.post('/classify', protect, isAdmin, generateTags);
router.get('/recommendations', protect, recommendEvents);

module.exports = router;