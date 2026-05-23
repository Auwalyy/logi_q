const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const notifications = await Notification.find().sort('-createdAt').limit(50);
  res.json(notifications);
});

module.exports = router;
