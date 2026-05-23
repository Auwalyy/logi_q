const router = require('express').Router();
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const vehicles = await Vehicle.find().populate('owner', 'name phone');
  res.json(vehicles);
});

router.post('/', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(vehicle);
});

module.exports = router;
