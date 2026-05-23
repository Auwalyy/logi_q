const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['truck', 'bus', 'minibus', 'cargo_van', 'tanker'], required: true },
  capacity: { type: Number, required: true },
  cargoCapacity: { type: Number, default: 0 }, // tonnes
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  company: { type: String },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  route: { type: String },
  lastInspection: Date,
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
