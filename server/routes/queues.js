const router = require('express').Router();
const Queue = require('../models/Queue');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');
const { sendQueueUpdate, sendLoadingAlert } = require('../services/africasTalking');

router.get('/', protect, async (req, res) => {
  const queues = await Queue.find({ status: { $ne: 'closed' } })
    .populate('entries.driver', 'name phone status')
    .populate('entries.vehicle', 'plateNumber type');
  res.json(queues);
});

router.post('/', protect, async (req, res) => {
  try {
    const queue = await Queue.create(req.body);
    res.status(201).json(queue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  const queue = await Queue.findById(req.params.id)
    .populate('entries.driver', 'name phone licenseNumber status')
    .populate('entries.vehicle', 'plateNumber type capacity');
  if (!queue) return res.status(404).json({ message: 'Queue not found' });
  res.json(queue);
});

// Driver joins queue
router.post('/:id/join', protect, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue || queue.status !== 'active')
      return res.status(400).json({ message: 'Queue not available' });

    const { driverId, vehicleId, destination, cargo, passengerCount } = req.body;
    const position = queue.entries.filter(e => e.status !== 'cancelled').length + 1;
    const eta = new Date(Date.now() + position * queue.avgLoadTimeMinutes * 60 * 1000);

    queue.entries.push({
      driver: driverId, vehicle: vehicleId, position,
      estimatedDepartureTime: eta, destination, cargo,
      passengerCount: passengerCount || 0,
    });
    await queue.save();

    const driver = await Driver.findByIdAndUpdate(driverId, { status: 'in_queue', currentQueue: queue._id }, { new: true });
    await sendQueueUpdate(driver.phone, position, queue.route, eta.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }));

    res.json({ message: 'Joined queue', position, estimatedDeparture: eta });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Advance queue entry to loading
router.put('/:id/entries/:entryId/load', protect, async (req, res) => {
  const queue = await Queue.findById(req.params.id).populate('entries.driver', 'phone name');
  const entry = queue.entries.id(req.params.entryId);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  entry.status = 'loading';
  await queue.save();

  const driver = await Driver.findByIdAndUpdate(entry.driver._id, { status: 'loading' }, { new: true });
  await sendLoadingAlert(entry.driver.phone, req.body.plateNumber || 'your vehicle');

  res.json({ message: 'Loading started', entry });
});

// Mark departed
router.put('/:id/entries/:entryId/depart', protect, async (req, res) => {
  const queue = await Queue.findById(req.params.id);
  const entry = queue.entries.id(req.params.entryId);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  entry.status = 'departed';
  await queue.save();
  await Driver.findByIdAndUpdate(entry.driver, { status: 'departed', currentQueue: null });

  // Notify remaining drivers of updated positions
  const waiting = queue.entries.filter(e => e.status === 'waiting');
  for (let i = 0; i < waiting.length; i++) {
    const d = await Driver.findById(waiting[i].driver);
    if (d) await sendQueueUpdate(d.phone, i + 1, queue.route, waiting[i].estimatedDepartureTime?.toLocaleTimeString() || 'TBD');
  }

  res.json({ message: 'Departed', entry });
});

router.put('/:id/status', protect, async (req, res) => {
  const queue = await Queue.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(queue);
});

module.exports = router;
