const router = require('express').Router();
const Emergency = require('../models/Emergency');
const { protect } = require('../middleware/auth');
const { sendEmergencyVoiceAlert } = require('../services/africasTalking');

router.get('/', protect, async (req, res) => {
  const emergencies = await Emergency.find().populate('reporter', 'name phone').sort('-createdAt');
  res.json(emergencies);
});

router.post('/', async (req, res) => {
  try {
    const emergency = await Emergency.create(req.body);
    // Trigger voice + SMS alerts
    const alertPhones = process.env.EMERGENCY_PHONES?.split(',') || [];
    if (alertPhones.length) {
      await sendEmergencyVoiceAlert(alertPhones, emergency.type, emergency.location);
      emergency.voiceAlertSent = true;
      emergency.smsSent = true;
      await emergency.save();
    }
    res.status(201).json(emergency);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/status', protect, async (req, res) => {
  const update = { status: req.body.status };
  if (req.body.status === 'resolved') update.resolvedAt = new Date();
  const emergency = await Emergency.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(emergency);
});

module.exports = router;
