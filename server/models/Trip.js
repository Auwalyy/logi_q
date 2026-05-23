const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  route: { type: String },
  type: { type: String, enum: ['passenger', 'cargo', 'mixed'], default: 'passenger' },
  status: { type: String, enum: ['scheduled', 'loading', 'departed', 'arrived', 'cancelled'], default: 'scheduled' },
  scheduledDeparture: Date,
  actualDeparture: Date,
  actualArrival: Date,
  passengerCount: { type: Number, default: 0 },
  cargoWeight: { type: Number, default: 0 },
  cargoDescription: String,
  fare: { type: Number, default: 0 },
  delayMinutes: { type: Number, default: 0 },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
