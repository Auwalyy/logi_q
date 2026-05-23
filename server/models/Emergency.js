const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  reporterPhone: { type: String, required: true },
  type: { type: String, enum: ['accident', 'breakdown', 'security', 'medical', 'fire', 'other'], required: true },
  description: String,
  location: { type: String, required: true },
  route: String,
  status: { type: String, enum: ['reported', 'acknowledged', 'responding', 'resolved'], default: 'reported' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  voiceAlertSent: { type: Boolean, default: false },
  smsSent: { type: Boolean, default: false },
  resolvedAt: Date,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
