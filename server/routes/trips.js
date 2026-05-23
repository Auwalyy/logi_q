const router = require('express').Router();
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');
const { sendDepartureNotification, sendDelayNotification, sendBoardingAlert } = require('../services/africasTalking');

router.get('/', protect, async (req, res) => {
  const { status, route, date } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (route) filter.route = new RegExp(route, 'i');
  if (date) {
    const d = new Date(date);
    filter.scheduledDeparture = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }
  const trips = await Trip.find(filter).populate('driver', 'name phone').populate('vehicle', 'plateNumber type').sort('-createdAt').limit(100);
  res.json(trips);
});

router.post('/', protect, async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/depart', protect, async (req, res) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id,
    { status: 'departed', actualDeparture: new Date() }, { new: true }
  ).populate('driver', 'phone name');
  const time = trip.actualDeparture.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  await sendDepartureNotification(trip.driver.phone, `${trip.origin} → ${trip.destination}`, time);
  res.json(trip);
});

router.put('/:id/delay', protect, async (req, res) => {
  const { delayMinutes, passengerPhones } = req.body;
  const trip = await Trip.findByIdAndUpdate(req.params.id, { delayMinutes }, { new: true }).populate('driver', 'phone');
  await sendDelayNotification(trip.driver.phone, `${trip.origin} → ${trip.destination}`, delayMinutes);
  if (passengerPhones?.length) {
    for (const phone of passengerPhones)
      await sendDelayNotification(phone, `${trip.origin} → ${trip.destination}`, delayMinutes);
  }
  res.json(trip);
});

router.post('/:id/boarding-alert', protect, async (req, res) => {
  const { passengerPhones, bay } = req.body;
  const trip = await Trip.findById(req.params.id);
  const time = trip.scheduledDeparture?.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) || 'soon';
  for (const phone of passengerPhones)
    await sendBoardingAlert(phone, `${trip.origin} → ${trip.destination}`, time, bay || 'A1');
  res.json({ message: `Boarding alerts sent to ${passengerPhones.length} passengers` });
});

router.put('/:id/arrive', protect, async (req, res) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id,
    { status: 'arrived', actualArrival: new Date() }, { new: true }
  );
  res.json(trip);
});

module.exports = router;
