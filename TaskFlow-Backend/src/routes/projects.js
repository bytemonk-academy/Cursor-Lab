const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const projects = await Project.find({ owner: req.userId }).sort({ createdAt: -1 });
  const projectIds = projects.map((p) => p._id);
  const tasks = await Task.find({ project: { $in: projectIds } }).sort({ createdAt: 1 });
  const tasksByProject = {};
  for (const t of tasks) {
    const id = t.project.toString();
    if (!tasksByProject[id]) tasksByProject[id] = [];
    tasksByProject[id].push(t);
  }
  const projectsWithTasks = projects.map((p) => ({
    ...p.toObject(),
    tasks: tasksByProject[p._id.toString()] || [],
  }));
  res.json({ projects: projectsWithTasks });
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
  const project = await Project.findOne({ _id: req.params.id, owner: req.userId });
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  await Task.deleteMany({ project: req.params.id });
  await Project.deleteOne({ _id: req.params.id, owner: req.userId });
  res.status(204).end();
});

router.use('/:projectId/tasks', require('./tasks'));

module.exports = router;

