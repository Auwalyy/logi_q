const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // phone number
  recipientType: { type: String, enum: ['driver', 'passenger', 'manager'], default: 'driver' },
  type: { type: String, enum: ['queue_update', 'loading_alert', 'departure', 'delay', 'otp', 'emergency', 'boarding'], required: true },
  channel: { type: String, enum: ['sms', 'voice', 'ussd'], default: 'sms' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  reference: String,
  relatedTrip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  relatedQueue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
