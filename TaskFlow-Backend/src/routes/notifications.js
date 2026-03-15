const express = require('express');
const Notification = require('../models/Notification');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const notifications = await Notification.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  res.json({ notifications });
});

router.delete('/', async (req, res) => {
  await Notification.deleteMany({ user: req.userId });
  res.status(204).end();
});

module.exports = router;
