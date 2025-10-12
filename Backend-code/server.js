require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'IMP.env') });

const app = express();

require('dotenv').config({ path: path.join(__dirname, 'IMP.env') });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from user-side folder
app.use(express.static(path.join(__dirname,  '..', 'Frontend', 'user-side')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/tracking', require('./routes/tracking'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Wellness Tracker API is running!' });
});

// Frontend routes
app.get('/Landing', (req, res) => {
  res.sendFile(path.join(__dirname,  '..', 'Frontend', 'user-side', 'landing.html'));
});

app.get('/Registration', (req, res) => {
  res.sendFile(path.join(__dirname,  '..', 'Frontend',  'user-side', 'registration2.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname,  '..', 'Frontend', 'user-side', 'login3.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname,  '..', 'Frontend', 'user-side', 'dashboardNew.html'));
});

app.get('/reset', (req, res) => {
  res.sendFile(path.join(__dirname,  '..', 'Frontend', 'user-side', 'resetpage.html'));
});

app.get('/setnew', (req, res) => {
  res.sendFile(path.join(__dirname,  '..','Frontend', 'user-side', 'setNew3.html'));
});

app.get('/afterpass', (req, res) => {
  res.sendFile(path.join(__dirname,  '..', 'Frontend', 'user-side', 'afterpass.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wellness-tracker');
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
