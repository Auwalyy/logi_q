require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // required for AT USSD x-www-form-urlencoded
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/queues', require('./routes/queues'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/emergencies', require('./routes/emergencies'));
app.use('/api/ussd', require('./routes/ussd'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'Parka API running', timestamp: new Date() }));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
}

const MONGO_OPTS = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  family: 4,
};

mongoose.connect(process.env.MONGO_URI, MONGO_OPTS)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Parka server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('\n👉 Fix checklist:');
    console.error('   1. Go to MongoDB Atlas → Network Access → Add IP Address → Add Current IP');
    console.error('   2. Or set IP to 0.0.0.0/0 to allow all (dev only)');
    console.error('   3. Check your MONGO_URI in server/.env is correct');
    console.error('   4. Try switching to a mobile hotspot if your ISP blocks SRV DNS\n');
    process.exit(1);
  });
