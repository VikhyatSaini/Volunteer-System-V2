const User = require('../models/user.model');
const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/mail');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      mobileNumber,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        token: generateToken(user._id, user.role),
      });

      // Send welcome email (fire and forget)
      try {
        await sendEmail({
          to: user.email,
          subject: 'Welcome to the Volunteer Registration System!',
          text: `Hi ${user.name}, \n\nThank you for registering. We're excited to have you on board. \n\n- The Team`,
        });
      } catch (emailError) {
        console.error('Email failed to send:', emailError);
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        profilePicture: user.profilePicture, 
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;

      if (req.file) {
        user.profilePicture = req.file.path; 
      }

      if (req.body.skills) {
        user.skills = Array.isArray(req.body.skills) 
          ? req.body.skills 
          : req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (req.body.availability) {
        user.availability = Array.isArray(req.body.availability) 
          ? req.body.availability 
          : req.body.availability.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (req.body.newPassword) {
         if (!req.body.currentPassword) {
             return res.status(400).json({ message: 'Please provide your current password to make changes.' });
         }
         
         if (await user.matchPassword(req.body.currentPassword)) {
             user.password = req.body.newPassword;
         } else {
             return res.status(401).json({ message: 'Incorrect current password.' });
         }
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role,
        status: updatedUser.status,
        availability: updatedUser.availability,
        skills: updatedUser.skills,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id, updatedUser.role),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get events a user is registered for
// @route   GET /api/users/my-events
// @access  Private
const getMyRegisteredEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({ volunteer: req.user._id });
    const eventIds = registrations.map(reg => reg.event);
    const events = await Event.find({ _id: { $in: eventIds } }).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Volunteers & Admins) WITH Calculated Hours
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    // --- UPDATED LOGIC: Using Aggregation to Join HourLogs ---
    const users = await User.aggregate([
      {
        // 1. Join with the 'hourlogs' collection
        $lookup: {
          from: 'hourlogs', // Must match your MongoDB collection name (lowercase plural)
          localField: '_id',
          foreignField: 'volunteer',
          as: 'hourLogs'
        }
      },
      {
        // 2. Calculate the sum of hours where status is 'approved'
        $addFields: {
          volunteerHours: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$hourLogs",
                    as: "log",
                    cond: { $eq: ["$$log.status", "approved"] }
                  }
                },
                as: "approvedLog",
                in: "$$approvedLog.hours"
              }
            }
          }
        }
      },
      {
        // 3. Remove sensitive fields and the heavy logs array
        $project: {
          password: 0,
          hourLogs: 0, // We don't need the full logs array in the user list
          __v: 0
        }
      },
      {
        // 4. Sort by newest users first
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user's status (Specific for Approval Workflow)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  const { status } = req.body; 

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;
      await user.save();
      res.json({ message: `User status updated to ${status}` });
    } else {
      res.status(440).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin updates any user (Role, Status, Info)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber; 
      user.role = req.body.role || user.role;
      
      if (req.body.status) {
        user.status = req.body.status;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber, 
        role: updatedUser.role,
        status: updatedUser.status,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getMyRegisteredEvents,
  getAllUsers, // <--- Now uses aggregation
  updateUserStatus,
  updateUser, 
  deleteUser, 
};