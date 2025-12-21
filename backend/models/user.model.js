const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Built-in Node.js module (Moved to top for cleaner scope)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['volunteer', 'admin'],
      default: 'volunteer',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    profilePicture: {
      type: String,
      // --- UPDATED DEFAULT IMAGE ---
      default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5TPu3HoTZkTyxzVY6h3fuKo-nPU85G5u4Vw&s', 
    },
    availability: {
      type: [String], // An array of strings, e.g., ["Monday AM", "Wednesday PM"]
      default: [],
    },
    skills: {
      type: [String], // An array of strings, e.g., ["Driving", "First Aid"]
      default: [],
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// --- Password Hashing ---
// This runs *before* saving a document
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Password Comparison Method ---
// Add a method to the user schema to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Password Reset Token Generator ---
userSchema.methods.createPasswordResetToken = function () {
  // 1. Generate the token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash the token and save it to the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set token expiration (e.g., 10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // 4. Return the *unhashed* token (to be emailed)
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;



