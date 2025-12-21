const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/admin.controller');
const { getPendingHours, updateHourLogStatus } = require('../controllers/hourlog.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// All routes in this file are admin-only
router.use(protect, isAdmin);

// Dashboard routes
router.get('/stats', getAdminStats);

// We will add routes for hour approval here
router.get('/pending-hours', getPendingHours); // <-- ADD THIS
router.put('/hours/:logId/status', updateHourLogStatus);

module.exports = router;