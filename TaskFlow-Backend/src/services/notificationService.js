const Notification = require('../models/Notification');
const emailService = require('./emailService');

async function record(userId, type, title, message, userEmail) {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message: message || '',
  });
  if (userEmail) {
    await emailService.sendMail({
      to: userEmail,
      subject: title,
      text: message || title,
    });
  }
  return notification;
}

async function projectCreated(userId, userEmail, project) {
  return record(
    userId,
    'project_created',
    'Project created',
    `Project "${project.name}" (${project.code}) was created.`,
    userEmail
  );
}

async function projectUpdated(userId, userEmail, project) {
  return record(
    userId,
    'project_updated',
    'Project updated',
    `Project "${project.name}" (${project.code}) was updated.`,
    undefined
  );
}

async function projectDeleted(userId, userEmail, name, code) {
  return record(
    userId,
    'project_deleted',
    'Project deleted',
    `Project "${name}" (${code}) was deleted.`,
    userEmail
  );
}

async function taskCreated(userId, userEmail, task, projectName) {
  return record(
    userId,
    'task_created',
    'Task created',
    `Task "${task.title}" was added${projectName ? ` to ${projectName}` : ''}.`,
    undefined
  );
}

async function taskUpdated(userId, userEmail, task, projectName) {
  return record(
    userId,
    'task_updated',
    'Task updated',
    `Task "${task.title}" was updated${projectName ? ` in ${projectName}` : ''}.`,
    undefined
  );
}

async function taskDeleted(userId, userEmail, title, projectName) {
  return record(
    userId,
    'task_deleted',
    'Task deleted',
    `Task "${title}" was deleted${projectName ? ` from ${projectName}` : ''}.`,
    undefined
  );
}

module.exports = {
  record,
  projectCreated,
  projectUpdated,
  projectDeleted,
  taskCreated,
  taskUpdated,
  taskDeleted,
};
