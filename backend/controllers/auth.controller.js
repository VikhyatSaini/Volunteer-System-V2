const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/mail'); 
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, mobileNumber } = req.body; // <--- 1. Accept mobileNumber

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      mobileNumber, // <--- 2. Save mobileNumber to DB
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber, // <--- 3. Return it to frontend
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.status === 'pending') {
            return res.status(401).json({ message: 'Your account is pending approval.' });
        }
        if (user.status === 'rejected') {
            return res.status(401).json({ message: 'Your account application has been rejected.' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber, // <--- 4. Return mobileNumber on login
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log(`Password reset attempt for non-existent email: ${req.body.email}`);
      return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); 

    // Point to Frontend Port (5173) so the React page opens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetURL = `${frontendUrl}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. \n\nPlease click the link below to reset your password:\n\n${resetURL}\n\nThis link is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: 'Your Password Reset Token (Valid for 10 min)',
      text: message,
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetURL}" target="_blank" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px;">Or copy this link: ${resetURL}</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('FORGOT_PASSWORD_ERROR:', error);
    res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.password = password; 
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber, // <--- 5. Return mobileNumber after reset
      role: user.role,
      token: generateToken(user._id, user.role),
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('RESET_PASSWORD_ERROR:', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

module.exports = { 
    registerUser, // <--- Don't forget to export this!
    loginUser,
    forgotPassword, 
    resetPassword,
};

























// const User = require('../models/user.model');
// const generateToken = require('../utils/generateToken');
// const { sendEmail } = require('../utils/mail'); 
// const crypto = require('crypto');

// // @desc    Auth user & get token (Login)
// // @route   POST /api/auth/login
// // @access  Public
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (user && (await user.matchPassword(password))) {
//         if (user.status === 'pending') {
//             return res.status(401).json({ message: 'Your account is pending approval.' });
//         }
//         if (user.status === 'rejected') {
//             return res.status(401).json({ message: 'Your account application has been rejected.' });
//         }
//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             token: generateToken(user._id, user.role),
//         });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Forgot password
// // @route   POST /api/auth/forgotpassword
// // @access  Public
// const forgotPassword = async (req, res) => {
//   try {
//     // 1. Find user by email
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       // Note: For security, we send a generic success response
//       // to prevent "email enumeration" (guessing valid emails).
//       console.log(`Password reset attempt for non-existent email: ${req.body.email}`);
//       return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
//     }

//     // 2. Generate the reset token (using the method we built on the model)
//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false }); // Saves the hashed token and expiry

//     // 3. Create the reset URL (for the FRONTEND)
//     // IMPORTANT: This must point to your React Frontend Port (usually 5173 for Vite)
//     // We check env variable first, otherwise default to localhost:5173
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     const resetURL = `${frontendUrl}/resetpassword/${resetToken}`;

//     // 4. Send the email
//     const message = `You are receiving this email because you (or someone else) have requested the reset of a password. \n\nPlease click the link below to reset your password:\n\n${resetURL}\n\nThis link is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

//     await sendEmail({
//       to: user.email,
//       subject: 'Your Password Reset Token (Valid for 10 min)',
//       text: message,
//       // Optional: Add HTML for a clickable link
//       html: `
//         <h3>Password Reset Request</h3>
//         <p>You requested a password reset. Click the link below to set a new password:</p>
//         <a href="${resetURL}" target="_blank" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
//         <p style="margin-top: 20px;">Or copy this link: ${resetURL}</p>
//         <p>If you did not request this, please ignore this email.</p>
//       `
//     });

//     res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
//   } catch (error) {
//     // Clean up if email sending fails
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     console.error('FORGOT_PASSWORD_ERROR:', error);
//     res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
//   }
// };

// // @desc    Reset password
// // @route   PUT /api/auth/resetpassword/:token
// // @access  Public
// const resetPassword = async (req, res) => {
//   try {
//     // 1. Get token from URL
//     const resetToken = req.params.token;
//     const { password } = req.body;

//     // 2. Hash the token from the URL to match the one in the DB
//     const hashedToken = crypto
//       .createHash('sha256')
//       .update(resetToken)
//       .digest('hex');

//     // 3. Find user by hashed token AND check if it's expired
//     const user = await User.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() }, // $gt = greater than
//     });

//     // 4. If token is invalid or expired
//     if (!user) {
//       return res.status(400).json({ message: 'Token is invalid or has expired' });
//     }

//     // 5. Set new password
//     user.password = password; // The 'pre-save' hook will automatically hash this
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save();

//     // 6. Log the user in immediately
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id, user.role),
//       message: 'Password reset successful'
//     });

//   } catch (error) {
//     console.error('RESET_PASSWORD_ERROR:', error);
//     res.status(500).json({ message: 'An error occurred.' });
//   }
// };

// module.exports = { 
//     loginUser,
//     forgotPassword, 
//     resetPassword,
// };