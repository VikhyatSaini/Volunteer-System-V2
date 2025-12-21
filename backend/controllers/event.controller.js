const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const Waitlist = require('../models/waitlist.model');
const { sendEmail } = require('../utils/mail');
const mongoose = require('mongoose');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin)
const createEvent = async (req, res) => {
  const { title, description, date, location, slotsAvailable, tags } = req.body;

  try {
    let bannerImage;
    if (req.file) {
      bannerImage = req.file.path; // Cloudinary puts the URL in 'path'
    }
    const event = new Event({
      title,
      description,
      date,
      location,
      slotsAvailable,
      tags,
      createdBy: req.user._id, // req.user comes from our 'protect' middleware
      bannerImage,
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events with pagination, filtering & REGISTRATION COUNTS
// @route   GET /api/events
const getAllEvents = async (req, res) => {
  try {
    // --- 1. FILTERING SETUP ---
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Add $ operator for advanced filtering (gte, lte, etc.)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    const parsedQuery = JSON.parse(queryStr);

    // --- 2. PAGINATION SETUP ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    // --- 3. EXECUTE QUERY ---
    let query = Event.find(parsedQuery)
                     .sort({ date: 1 }) // Default: Soonest events first
                     .skip(skip)
                     .limit(limit);

    const events = await query;

    // --- 4. ATTACH REGISTRATION COUNTS ---
    // We iterate over the fetched events and count real registrations for each
    const eventsWithCounts = await Promise.all(events.map(async (event) => {
      // Count how many docs in 'Registration' collection match this event ID
      const count = await Registration.countDocuments({ event: event._id });
      
      // Convert mongoose doc to plain object and add our new fields
      return { 
        ...event.toObject(), 
        registrationCount: count,
        remainingSlots: Math.max(0, event.slotsAvailable - count)
      };
    }));

    res.json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Add count for single event view
      const count = await Registration.countDocuments({ event: event._id });
      const eventData = {
        ...event.toObject(),
        registrationCount: count,
        remainingSlots: Math.max(0, event.slotsAvailable - count)
      };
      
      res.json(eventData);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register the logged-in user for an event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const volunteerId = req.user._id;

  try {
    // Optional: Check status if you require approval
    // if (req.user.status !== 'approved') {
    //   return res.status(403).json({ message: 'Your account must be approved to register for events.' });
    // }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 1. Check if slots are available
    const existingRegistrations = await Registration.countDocuments({ event: eventId });
    if (existingRegistrations >= event.slotsAvailable) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // 2. Check if user is already registered (using the unique index)
    const alreadyRegistered = await Registration.findOne({
      event: eventId,
      volunteer: volunteerId,
    });
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // 3. Create the registration
    const registration = new Registration({
      event: eventId,
      volunteer: volunteerId,
    });
    
    await registration.save();
    res.status(201).json({ message: 'Successfully registered for event' });

  } catch (error) {
    // Handle the 'duplicate key' error from the database index
    if (error.code === 11000) {
       return res.status(400).json({ message: 'You are already registered for this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unregister from event (with Waitlist Promotion)
// @route   DELETE /api/events/:id/unregister
// @access  Private
const unregisterForEvent = async (req, res) => {
  const eventId = req.params.id;
  const volunteerId = req.user._id;

  try {
    // 1. Remove the user's registration
    const registration = await Registration.findOneAndDelete({
      event: eventId,
      volunteer: volunteerId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // --- AUTO-PROMOTION LOGIC START ---
    
    // 2. Find the next person in line (Oldest waitlist entry first)
    const nextInLine = await Waitlist.findOne({ event: eventId })
                                     .sort({ createdAt: 1 })
                                     .populate('volunteer');

    if (nextInLine) {
      // 3. Create a new registration for them
      await Registration.create({
        event: eventId,
        volunteer: nextInLine.volunteer._id,
      });

      // 4. Remove them from the waitlist
      await Waitlist.findByIdAndDelete(nextInLine._id);

      // 5. Send Notification Email (Fire and forget)
      const eventDetails = await Event.findById(eventId);
      
      if (eventDetails && nextInLine.volunteer && nextInLine.volunteer.email) {
        try {
          const emailOptions = {
            to: nextInLine.volunteer.email,
            subject: `Good News! You're in: ${eventDetails.title}`,
            text: `Hi ${nextInLine.volunteer.name},\n\nA spot opened up for "${eventDetails.title}" and you have been automatically registered!\n\nDate: ${new Date(eventDetails.date).toLocaleDateString()}\nLocation: ${eventDetails.location}\n\nSee you there!`
          };
          sendEmail(emailOptions); 
        } catch (emailError) {
          console.error('Promotion email failed to send:', emailError);
        }
      }
    }
    // --- AUTO-PROMOTION LOGIC END ---

    res.json({ message: 'Successfully unregistered from event' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  const { title, description, date, location, slotsAvailable } = req.body;

  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;
      event.location = location || event.location;
      event.slotsAvailable = slotsAvailable || event.slotsAvailable;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Also delete all registrations for this event to verify clean state
      await Registration.deleteMany({ event: req.params.id });
      // Now delete the event itself
      await Event.findByIdAndDelete(req.params.id);

      res.json({ message: 'Event and associated registrations removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all volunteers registered for an event
// @route   GET /api/events/:id/volunteers
// @access  Private/Admin
const getVolunteersForEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
                                            .populate('volunteer', 'name email skills'); 

    if (!registrations || registrations.length === 0) {
      return res.json([]); 
    }
    
    const volunteers = registrations.map(reg => reg.volunteer);
    res.json(volunteers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get list of event IDs the current user is registered for
// @route   GET /api/events/my-registrations
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    // Find all registrations for this user
    const registrations = await Registration.find({ volunteer: req.user._id }).select('event');
    
    // Return just the array of Event IDs
    const eventIds = registrations.map(reg => reg.event);
    res.json(eventIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get list of events user is waitlisted for (Full Details)
// @route   GET /api/events/my-waitlist
// @access  Private
const getMyWaitlist = async (req, res) => {
  try {
    // 1. Find waitlist entries
    const waitlistItems = await Waitlist.find({ volunteer: req.user._id });
    
    // 2. Extract Event IDs
    const eventIds = waitlistItems.map(w => w.event);

    // 3. Fetch full event details (sorted by date)
    const events = await Event.find({ _id: { $in: eventIds } }).sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave the waitlist for an event
// @route   DELETE /api/events/:id/waitlist
// @access  Private
const leaveWaitlist = async (req, res) => {
  const eventId = req.params.id;
  const volunteerId = req.user._id;

  try {
    const deleted = await Waitlist.findOneAndDelete({
      event: eventId,
      volunteer: volunteerId
    });

    if (deleted) {
      res.json({ message: 'Removed from waitlist' });
    } else {
      res.status(404).json({ message: 'Waitlist entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin removes a specific volunteer from an event (Auto-promotes waitlist)
// @route   DELETE /api/events/:id/volunteers/:volunteerId
// @access  Private (Admin)
const removeVolunteer = async (req, res) => {
  const { id: eventId, volunteerId } = req.params;

  try {
    // 1. Remove the Registration
    const registration = await Registration.findOneAndDelete({
      event: eventId,
      volunteer: volunteerId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // 2. Logic: Auto-Promote from Waitlist (Reusing unregister logic)
    const nextInLine = await Waitlist.findOne({ event: eventId })
                                     .sort({ createdAt: 1 })
                                     .populate('volunteer');

    if (nextInLine) {
      // Create new registration for next in line
      await Registration.create({
        event: eventId,
        volunteer: nextInLine.volunteer._id,
      });

      // Remove from waitlist
      await Waitlist.findByIdAndDelete(nextInLine._id);

      // Send Email Notification
      const eventDetails = await Event.findById(eventId);
      if (eventDetails && nextInLine.volunteer && nextInLine.volunteer.email) {
        try {
          const emailOptions = {
            to: nextInLine.volunteer.email,
            subject: `Good News! You're in: ${eventDetails.title}`,
            text: `Hi ${nextInLine.volunteer.name},\n\nA spot opened up for "${eventDetails.title}" and you have been automatically registered!\n\nDate: ${new Date(eventDetails.date).toLocaleDateString()}\nLocation: ${eventDetails.location}\n\nSee you there!`
          };
          sendEmail(emailOptions); 
        } catch (emailError) {
          console.error('Promotion email failed to send:', emailError);
        }
      }
    }

    res.json({ message: 'Volunteer removed successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  unregisterForEvent,
  updateEvent, 
  deleteEvent, 
  getVolunteersForEvent,
  getMyRegistrations,
  getMyWaitlist,
  leaveWaitlist,
  removeVolunteer // Exported new function
};