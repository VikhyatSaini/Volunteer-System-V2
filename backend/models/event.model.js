const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String, // This will hold the URL from Cloudinary
      default: 'https://via.placeholder.com/800x400.png?text=Event+Banner', // A default placeholder
    },
    tags: {
      type: [String], // An array of strings
      default: [],
    },
    slotsAvailable: {
      type: Number,
      required: true,
      default: 10, // Default to 10 slots if not specified
    },
    // This will be important for Phase 3 (Admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;