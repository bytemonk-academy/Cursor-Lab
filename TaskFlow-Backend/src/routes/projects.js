const express = require('express');
const Project = require('../models/Project');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const projects = await Project.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json({ projects });
});

router.post('/', async (req, res) => {
  const { name, code, description } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: 'Name and code are required' });
  }

  const project = await Project.create({
    owner: req.userId,
    name,
    code,
    description: description || '',
  });

  res.status(201).json({ project });
});

router.get('/:id', async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.userId });

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json({ project });
});

router.put('/:id', async (req, res) => {
  const { name, code, description } = req.body;

  const update = {};
  if (name !== undefined) update.name = name;
  if (code !== undefined) update.code = code;
  if (description !== undefined) update.description = description;

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    update,
    { new: true }
  );

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json({ project });
});

router.delete('/:id', async (req, res) => {
  const result = await Project.deleteOne({ _id: req.params.id, owner: req.userId });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.status(204).end();
});

module.exports = router;

