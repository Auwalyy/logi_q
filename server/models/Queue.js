const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  position: { type: Number, required: true },
  joinedAt: { type: Date, default: Date.now },
  estimatedLoadTime: Date,
  estimatedDepartureTime: Date,
  status: { type: String, enum: ['waiting', 'loading', 'ready', 'departed', 'cancelled'], default: 'waiting' },
  cargo: { type: String },
  destination: { type: String },
  passengerCount: { type: Number, default: 0 },
});

const queueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  route: { type: String, required: true },
  park: { type: String, required: true },
  type: { type: String, enum: ['passenger', 'cargo', 'mixed'], default: 'mixed' },
  status: { type: String, enum: ['active', 'paused', 'closed'], default: 'active' },
  entries: [queueEntrySchema],
  maxCapacity: { type: Number, default: 50 },
  avgLoadTimeMinutes: { type: Number, default: 30 },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

queueSchema.virtual('activeCount').get(function () {
  return this.entries.filter(e => ['waiting', 'loading'].includes(e.status)).length;
});

module.exports = mongoose.model('Queue', queueSchema);
