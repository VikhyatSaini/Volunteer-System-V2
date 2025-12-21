const Message = require('../models/message.model');

// @desc    Create a new support message
// @route   POST /api/messages
// @access  Private
const createMessage = async (req, res) => {
  const { subject, message } = req.body;

  try {
    const newMessage = await Message.create({
      user: req.user._id,
      subject,
      message
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/messages
// @access  Private/Admin
const getAllMessages = async (req, res) => {
  try {
    // Populate user details to see who sent it
    const messages = await Message.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 }); // Newest first
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's messages (Volunteer History)
// @route   GET /api/messages/my
// @access  Private
const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (message) {
      message.status = 'read';
      await message.save();
      res.json(message);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin replies to a message
// @route   PUT /api/messages/:id/reply
// @access  Private/Admin
const replyToMessage = async (req, res) => {
  const { replyText } = req.body;

  try {
    const message = await Message.findById(req.params.id);

    if (message) {
      message.adminReply = replyText;
      message.status = 'replied';
      message.repliedAt = Date.now();
      
      await message.save();
      res.json(message);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createMessage, 
  getAllMessages, 
  getMyMessages, // 👈 New export
  markAsRead, 
  replyToMessage // 👈 New export
};