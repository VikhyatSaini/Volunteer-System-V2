const HourLog = require('../models/hourlog.model');
const Event = require('../models/event.model');

// @desc    Volunteer: Submit hours for an event
// @route   POST /api/events/:id/loghours
// @access  Private
const submitHours = async (req, res) => {
  const { hours, dateWorked } = req.body;
  const eventId = req.params.id;

  try {
    // 1. Check if user is approved
    if (req.user.status !== 'approved') {
      return res.status(403).json({ message: 'Your account must be approved to log hours.' });
    }
    
    // 2. Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 3. Check if event is in the past (can't log hours for future events)
    if (event.date > new Date()) {
      return res.status(400).json({ message: 'You can only log hours for past events.' });
    }

    // 4. Create and save the log
    const log = new HourLog({
      volunteer: req.user._id,
      event: eventId,
      hours,
      dateWorked,
    });

    const createdLog = await log.save();
    res.status(201).json(createdLog);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Volunteer: Get all my logged hours
// @route   GET /api/users/my-hours
// @access  Private
const getMyHours = async (req, res) => {
  try {
    const logs = await HourLog.find({ volunteer: req.user._id })
                             .populate('event', 'title date')
                             .sort({ dateWorked: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get all pending hour logs
// @route   GET /api/admin/pending-hours
// @access  Private/Admin
const getPendingHours = async (req, res) => {
  try {
    const logs = await HourLog.find({ status: 'pending' })
                             .populate('event', 'title date')
                             .populate('volunteer', 'name email')
                             .sort({ submittedAt: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Approve or reject an hour log
// @route   PUT /api/admin/hours/:logId/status
// @access  Private/Admin
const updateHourLogStatus = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  const { logId } = req.params;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    const log = await HourLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: 'Hour log not found' });
    }

    log.status = status;
    await log.save();
    res.json({ message: `Log status updated to ${status}` });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  submitHours,
  getMyHours,
  getPendingHours,
  updateHourLogStatus,
};