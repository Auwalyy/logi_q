const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'driver' },
  status: { type: String, enum: ['available', 'in_queue', 'loading', 'departed', 'offline'], default: 'available' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  currentQueue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
  totalTrips: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
}, { timestamps: true });

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

driverSchema.methods.matchPassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('Driver', driverSchema);
