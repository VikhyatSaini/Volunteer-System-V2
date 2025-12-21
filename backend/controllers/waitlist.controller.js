const Waitlist = require('../models/waitlist.model');
const Event = require('../models/event.model');
const Registration = require('../models/registration.model');

// @desc    Join waitlist for a full event
// @route   POST /api/events/:id/waitlist
// @access  Private
const joinWaitlist = async (req, res) => {
  const eventId = req.params.id;
  const volunteerId = req.user._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 1. Verify Event is actually full (Optional, but good practice)
    const currentCount = await Registration.countDocuments({ event: eventId });
    if (currentCount < event.slotsAvailable) {
      return res.status(400).json({ message: 'Event has open slots. You can register directly.' });
    }

    // 2. Check if already registered
    const isRegistered = await Registration.findOne({ event: eventId, volunteer: volunteerId });
    if (isRegistered) {
      return res.status(400).json({ message: 'You are already registered.' });
    }

    // 3. Check if already on waitlist
    const onWaitlist = await Waitlist.findOne({ event: eventId, volunteer: volunteerId });
    if (onWaitlist) {
      return res.status(400).json({ message: 'You are already on the waitlist.' });
    }

    // 4. Add to Waitlist
    await Waitlist.create({
      event: eventId,
      volunteer: volunteerId,
    });

    res.status(201).json({ message: 'Added to waitlist. We will notify you if a spot opens up.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { joinWaitlist };