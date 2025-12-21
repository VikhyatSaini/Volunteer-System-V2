const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes'); 
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---

// A simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Volunteer Registration API' });
});

// Use the imported routes
app.use('/api/users', userRoutes); // e.g., /api/users/register
app.use('/api/auth', authRoutes);   // e.g., /api/auth/login
app.use('/api/events', eventRoutes); 
app.use('/api/admin', adminRoutes);

app.use('/api/ai', aiRoutes);
app.use('/api/messages', require('./routes/message.routes'));

// (We will add error middleware here later for a cleaner setup)

// const app = require('./app');   //jest

// --- Start the Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      .yellow.bold // (Requires 'colors' package)
  );
});