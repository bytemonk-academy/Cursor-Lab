const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

async function ensureProjectOwned(req, res, next) {
  const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId });
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  req.project = project;
  next();
}

router.use(ensureProjectOwned);

router.get('/', async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId }).sort({ createdAt: 1 });
  res.json({ tasks });
});

router.post('/', async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const task = await Task.create({
    project: req.params.projectId,
    title: title.trim(),
  });

  res.status(201).json({ task });
});

router.put('/:taskId', async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.taskId, project: req.params.projectId },
    { title: title.trim() },
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.json({ task });
});

router.delete('/:taskId', async (req, res) => {
  const result = await Task.deleteOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.status(204).end();
});

module.exports = router;
