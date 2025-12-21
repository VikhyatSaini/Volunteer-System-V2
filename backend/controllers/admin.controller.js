const User = require('../models/user.model');
const Event = require('../models/event.model');
const HourLog = require('../models/hourlog.model');
// We will add HourLog later

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    // Run queries in parallel for efficiency
    const [
      totalVolunteers,
      pendingVolunteers,
      upcomingEvents,
      approvedLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'volunteer', status: 'pending' }),
      Event.countDocuments({ date: { $gte: new Date() } }),
      HourLog.find({ status: 'approved' }),
    ]);

    const totalHoursLogged = approvedLogs.reduce((acc, log) => acc + log.hours, 0); // <-- ADD THIS

    res.json({
      totalVolunteers,
      pendingVolunteers,
      upcomingEvents,
      totalHoursLogged,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
};