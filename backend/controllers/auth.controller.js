const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/mail'); 
const crypto = require('crypto');

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
    // 1. Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Note: For security, we send a generic success response
      // to prevent "email enumeration" (guessing valid emails).
      console.log(`Password reset attempt for non-existent email: ${req.body.email}`);
      return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    // 2. Generate the reset token (using the method we built on the model)
    const resetToken = user.createPasswordResetToken();
    await user.save(); // This saves the hashed token and expiry to the DB

    // 3. Create the reset URL (for the frontend)
    // This URL will be handled by your React app
    const resetURL = `http://localhost:3000/resetpassword/${resetToken}`;

    // 4. Send the email
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetURL} \n\nIf you did not request this, please ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: 'Your Password Reset Token (Valid for 10 min)',
      text: message,
    });

    res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
  } catch (error) {
    // Clear the token fields if an error occurs (like email failing)
    // await User.findOneAndUpdate({ email: req.body.email }, {
    //   passwordResetToken: undefined,
    //   passwordResetExpires: undefined
    // });
    console.error('FORGOT_PASSWORD_ERROR:', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // 1. Get token from URL
    const resetToken = req.params.token;
    const { password } = req.body;

    // 2. Hash the token from the URL to match the one in the DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3. Find user by hashed token AND check if it's expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // $gt = greater than
    });

    // 4. If token is invalid or expired
    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // 5. Set new password
    user.password = password; // The 'pre-save' hook will automatically hash this
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 6. (Optional but recommended) Log the user in
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error('RESET_PASSWORD_ERROR:', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

module.exports = { 
    loginUser,
    forgotPassword, 
    resetPassword,
};