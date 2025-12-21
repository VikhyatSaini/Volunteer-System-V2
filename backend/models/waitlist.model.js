const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
  },
  {
    timestamps: true, // Crucial: createdAt determines their position in line
  }
);

// Prevent duplicate waitlist entries
waitlistSchema.index({ volunteer: 1, event: 1 }, { unique: true });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);
module.exports = Waitlist;