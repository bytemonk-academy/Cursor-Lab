const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const requireAuth = require('../middleware/requireAuth');
const notificationService = require('../services/notificationService');

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

  await notificationService.taskCreated(req.userId, req.userEmail, task, req.project?.name);

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

  await notificationService.taskUpdated(req.userId, req.userEmail, task, req.project?.name);

  res.json({ task });
});

router.delete('/:taskId', async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const title = task.title;
  await Task.deleteOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  });

  await notificationService.taskDeleted(req.userId, req.userEmail, title, req.project?.name);

  res.status(204).end();
});

module.exports = router;
