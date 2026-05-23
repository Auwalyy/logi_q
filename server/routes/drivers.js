const router = require('express').Router();
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');
const { sendOTP } = require('../services/africasTalking');

router.get('/', protect, async (req, res) => {
  const drivers = await Driver.find().populate('vehicle').select('-password -otp');
  res.json(drivers);
});

router.get('/:id', protect, async (req, res) => {
  const driver = await Driver.findById(req.params.id).populate('vehicle').select('-password -otp');
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  res.json(driver);
});

router.post('/register', async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ message: 'Driver registered', id: driver._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/status', protect, async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(driver);
});

router.post('/:id/send-otp', protect, async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  driver.otp = otp;
  driver.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await driver.save();
  await sendOTP(driver.phone, otp);
  res.json({ message: 'OTP sent' });
});

router.post('/:id/verify-otp', protect, async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  if (driver.otp !== req.body.otp || driver.otpExpiry < new Date())
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  driver.isVerified = true;
  driver.otp = undefined;
  driver.otpExpiry = undefined;
  await driver.save();
  res.json({ message: 'Driver verified', verified: true });
});

module.exports = router;
