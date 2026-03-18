const Notification = require('../models/Notification');
const emailService = require('./emailService');
const { createLogger } = require('../utils/logger');

const logger = createLogger('notificationService');

async function record(userId, type, title, message, userEmail) {
  logger.info('record called', {
    userId,
    type,
    title,
    hasMessage: Boolean(message),
    hasUserEmail: Boolean(userEmail),
  });
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message: message || '',
    });

    if (userEmail) {
      logger.info('Attempting to send notification email', {
        userId,
        type,
        title,
        userEmail,
      });
      try {
        await emailService.sendMail({
          to: userEmail,
          subject: title,
          text: message || title,
        });
      } catch (emailErr) {
        // Log email error but do not fail notification creation.
        logger.error('Error sending email', {
          userId,
          type,
          title,
          userEmail,
          errorMessage: emailErr.message,
        });
      }
    }

    logger.info('Notification recorded successfully', {
      id: notification._id,
      userId,
      type,
      title,
    });
    return notification;
  } catch (err) {
    logger.error('Error recording notification', {
      userId,
      type,
      title,
      errorMessage: err.message,
    });
    throw new Error('Failed to record notification');
  }
}

async function projectCreated(userId, userEmail, project) {
  logger.info('projectCreated called', {
    userId,
    userEmail,
    projectId: project && project._id,
  });
  try {
    return await record(
      userId,
      'project_created',
      'Project created',
      `Project "${project.name}" (${project.code}) was created.`,
      userEmail
    );
  } catch (err) {
    logger.error('Error in projectCreated notification', {
      userId,
      userEmail,
      projectId: project && project._id,
      errorMessage: err.message,
    });
    throw err;
  }
}

async function projectUpdated(userId, userEmail, project) {
  logger.info('projectUpdated called', {
    userId,
    userEmail,
    projectId: project && project._id,
  });
  try {
    return await record(
      userId,
      'project_updated',
      'Project updated',
      `Project "${project.name}" (${project.code}) was updated.`,
      undefined
    );
  } catch (err) {
    logger.error('Error in projectUpdated notification', {
      userId,
      userEmail,
      projectId: project && project._id,
      errorMessage: err.message,
    });
    throw err;
  }
}

async function projectDeleted(userId, userEmail, name, code) {
  logger.info('projectDeleted called', {
    userId,
    userEmail,
    name,
    code,
  });
  try {
    return await record(
      userId,
      'project_deleted',
      'Project deleted',
      `Project "${name}" (${code}) was deleted.`,
      userEmail
    );
  } catch (err) {
    logger.error('Error in projectDeleted notification', {
      userId,
      userEmail,
      name,
      code,
      errorMessage: err.message,
    });
    throw err;
  }
}

async function taskCreated(userId, userEmail, task, projectName) {
  logger.info('taskCreated called', {
    userId,
    userEmail,
    taskId: task && task._id,
    projectName,
  });
  try {
    return await record(
      userId,
      'task_created',
      'Task created',
      `Task "${task.title}" was added${projectName ? ` to ${projectName}` : ''}.`,
      undefined
    );
  } catch (err) {
    logger.error('Error in taskCreated notification', {
      userId,
      userEmail,
      taskId: task && task._id,
      projectName,
      errorMessage: err.message,
    });
    throw err;
  }
}

async function taskUpdated(userId, userEmail, task, projectName) {
  logger.info('taskUpdated called', {
    userId,
    userEmail,
    taskId: task && task._id,
    projectName,
  });
  try {
    return await record(
      userId,
      'task_updated',
      'Task updated',
      `Task "${task.title}" was updated${projectName ? ` in ${projectName}` : ''}.`,
      undefined
    );
  } catch (err) {
    logger.error('Error in taskUpdated notification', {
      userId,
      userEmail,
      taskId: task && task._id,
      projectName,
      errorMessage: err.message,
    });
    throw err;
  }
}

async function taskDeleted(userId, userEmail, title, projectName) {
  logger.info('taskDeleted called', {
    userId,
    userEmail,
    title,
    projectName,
  });
  try {
    return await record(
      userId,
      'task_deleted',
      'Task deleted',
      `Task "${title}" was deleted${projectName ? ` from ${projectName}` : ''}.`,
      undefined
    );
  } catch (err) {
    logger.error('Error in taskDeleted notification', {
      userId,
      userEmail,
      title,
      projectName,
      errorMessage: err.message,
    });
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
