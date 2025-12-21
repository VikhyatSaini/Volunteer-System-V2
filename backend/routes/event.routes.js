const express = require('express');
const router = express.Router();
const {
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
  removeVolunteer, // 👈 1. IMPORT THIS NEW FUNCTION
} = require('../controllers/event.controller');
const { submitHours } = require('../controllers/hourlog.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const upload = require('../config/cloudinary');
const { joinWaitlist } = require('../controllers/waitlist.controller');

// --- 1. Specific/Static Routes FIRST ---

// Public: Get all events
router.get('/', getAllEvents); 

// Private: Get logged-in user's registrations 
// (MUST be before /:id to avoid conflict)
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/my-waitlist', protect, getMyWaitlist);

// --- 2. Dynamic /:id Routes SECOND ---

// Public: Get single event by ID
router.get('/:id', getEventById); 


// --- 3. Protected / Admin Routes ---

// Create Event (Admin Only)
router.post('/', protect, isAdmin, upload.single('image'), createEvent);

// Update/Delete Event (Admin Only)
router.put('/:id', protect, isAdmin, updateEvent);
router.delete('/:id', protect, isAdmin, deleteEvent); 

// Get Volunteers for Event (Admin Only)
router.get('/:id/volunteers', protect, isAdmin, getVolunteersForEvent);

// Remove specific volunteer from event (Admin Only)
router.delete('/:id/volunteers/:volunteerId', protect, isAdmin, removeVolunteer); // 👈 2. ADD THIS ROUTE

// Volunteer Actions
router.post('/:id/register', protect, registerForEvent); 
router.delete('/:id/unregister', protect, unregisterForEvent); 
router.post('/:id/waitlist', protect, joinWaitlist); 
router.delete('/:id/waitlist', protect, leaveWaitlist);
router.post('/:id/loghours', protect, submitHours);

module.exports = router;