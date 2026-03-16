const Notification = require('../models/Notification');
const emailService = require('./emailService');

async function record(userId, type, title, message, userEmail) {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message: message || '',
    });

    if (userEmail) {
      try {
        await emailService.sendMail({
          to: userEmail,
          subject: title,
          text: message || title,
        });
      } catch (emailErr) {
        // Log email error but do not fail notification creation.
        console.error(`Error sending email to ${userEmail}:`, emailErr);
      }
    }

    return notification;
  } catch (err) {
    console.error('Error recording notification:', err);
    throw new Error('Failed to record notification');
  }
}

async function projectCreated(userId, userEmail, project) {
  try {
    return await record(
      userId,
      'project_created',
      'Project created',
      `Project "${project.name}" (${project.code}) was created.`,
      userEmail
    );
  } catch (err) {
    console.error('Error in projectCreated notification:', err);
    throw err;
  }
}

async function projectUpdated(userId, userEmail, project) {
  try {
    return await record(
      userId,
      'project_updated',
      'Project updated',
      `Project "${project.name}" (${project.code}) was updated.`,
      undefined
    );
  } catch (err) {
    console.error('Error in projectUpdated notification:', err);
    throw err;
  }
}

async function projectDeleted(userId, userEmail, name, code) {
  try {
    return await record(
      userId,
      'project_deleted',
      'Project deleted',
      `Project "${name}" (${code}) was deleted.`,
      userEmail
    );
  } catch (err) {
    console.error('Error in projectDeleted notification:', err);
    throw err;
  }
}

async function taskCreated(userId, userEmail, task, projectName) {
  try {
    return await record(
      userId,
      'task_created',
      'Task created',
      `Task "${task.title}" was added${projectName ? ` to ${projectName}` : ''}.`,
      undefined
    );
  } catch (err) {
    console.error('Error in taskCreated notification:', err);
    throw err;
  }
}

async function taskUpdated(userId, userEmail, task, projectName) {
  try {
    return await record(
      userId,
      'task_updated',
      'Task updated',
      `Task "${task.title}" was updated${projectName ? ` in ${projectName}` : ''}.`,
      undefined
    );
  } catch (err) {
    console.error('Error in taskUpdated notification:', err);
    throw err;
  }
}

async function taskDeleted(userId, userEmail, title, projectName) {
  try {
    return await record(
      userId,
      'task_deleted',
      'Task deleted',
      `Task "${title}" was deleted${projectName ? ` from ${projectName}` : ''}.`,
      undefined
    );
  } catch (err) {
    console.error('Error in taskDeleted notification:', err);
    throw err;
  }
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
