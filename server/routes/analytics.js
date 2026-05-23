const router = require('express').Router();
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const Queue = require('../models/Queue');
const Emergency = require('../models/Emergency');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, async (req, res) => {
  const [totalTrips, activeDrivers, activeQueues, emergencies, recentTrips] = await Promise.all([
    Trip.countDocuments(),
    Driver.countDocuments({ status: { $in: ['in_queue', 'loading'] } }),
    Queue.countDocuments({ status: 'active' }),
    Emergency.countDocuments({ status: { $ne: 'resolved' } }),
    Trip.find({ status: 'departed' }).sort('-actualDeparture').limit(5).populate('driver', 'name').populate('vehicle', 'plateNumber'),
  ]);

  const avgDelay = await Trip.aggregate([
    { $match: { delayMinutes: { $gt: 0 } } },
    { $group: { _id: null, avg: { $avg: '$delayMinutes' } } },
  ]);

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayDepartures = await Trip.countDocuments({ actualDeparture: { $gte: todayStart } });

  res.json({
    totalTrips, activeDrivers, activeQueues, emergencies,
    avgDelayMinutes: Math.round(avgDelay[0]?.avg || 0),
    todayDepartures,
    recentTrips,
  });
});

router.get('/routes', protect, async (req, res) => {
  const routes = await Trip.aggregate([
    { $group: { _id: '$route', count: { $sum: 1 }, avgDelay: { $avg: '$delayMinutes' }, totalPassengers: { $sum: '$passengerCount' } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  res.json(routes);
});

router.get('/departures-by-day', protect, async (req, res) => {
  const data = await Trip.aggregate([
    { $match: { actualDeparture: { $exists: true } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$actualDeparture' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);
  res.json(data);
});

router.get('/cargo', protect, async (req, res) => {
  const data = await Trip.aggregate([
    { $match: { type: { $in: ['cargo', 'mixed'] } } },
    { $group: { _id: '$destination', totalWeight: { $sum: '$cargoWeight' }, count: { $sum: 1 } } },
    { $sort: { totalWeight: -1 } },
    { $limit: 10 },
  ]);
  res.json(data);
});

module.exports = router;
