const Notification = require('../models/Notification');
const emailService = require('./emailService');

jest.mock('../models/Notification');
jest.mock('./emailService');
jest.mock('../utils/logger', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  };

  return {
    createLogger: jest.fn(() => loggerMock),
    loggerMock,
  };
});

const { createLogger, loggerMock } = require('../utils/logger');
const notificationService = require('./notificationService');

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('record', () => {
    const userId = 'user-1';
    const type = 'test_type';
    const title = 'Test Title';
    const message = 'Test Message';
    const userEmail = 'user@example.com';

    it('creates a notification with expected fields and returns it', async () => {
      const createdNotification = { _id: 'notif-1' };
      Notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.record(
        userId,
        type,
        title,
        message,
        undefined
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type,
        title,
        message,
      });
      expect(result).toBe(createdNotification);
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Notification recorded successfully',
        expect.objectContaining({
          id: createdNotification._id,
          userId,
          type,
          title,
        })
      );
    });

    it('sends an email when userEmail is provided', async () => {
      const createdNotification = { _id: 'notif-2' };
      Notification.create.mockResolvedValue(createdNotification);
      emailService.sendMail.mockResolvedValue();

      await notificationService.record(
        userId,
        type,
        title,
        message,
        userEmail
      );

      expect(emailService.sendMail).toHaveBeenCalledWith({
        to: userEmail,
        subject: title,
        text: message,
      });
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Attempting to send notification email',
        expect.objectContaining({
          userId,
          type,
          title,
          userEmail,
        })
      );
    });

    it('uses title as email text when message is falsy', async () => {
      const createdNotification = { _id: 'notif-3' };
      Notification.create.mockResolvedValue(createdNotification);
      emailService.sendMail.mockResolvedValue();

      await notificationService.record(
        userId,
        type,
        title,
        '',
        userEmail
      );

      expect(emailService.sendMail).toHaveBeenCalledWith({
        to: userEmail,
        subject: title,
        text: title,
      });
    });

    it('logs email error but still resolves when email sending fails', async () => {
      const createdNotification = { _id: 'notif-4' };
      Notification.create.mockResolvedValue(createdNotification);
      const emailError = new Error('SMTP failure');
      emailService.sendMail.mockRejectedValue(emailError);

      const result = await notificationService.record(
        userId,
        type,
        title,
        message,
        userEmail
      );

      expect(result).toBe(createdNotification);
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error sending email',
        expect.objectContaining({
          userId,
          type,
          title,
          userEmail,
          errorMessage: emailError.message,
        })
      );
    });

    it('throws a generic error when notification creation fails', async () => {
      const createError = new Error('DB failure');
      Notification.create.mockRejectedValue(createError);

      await expect(
        notificationService.record(userId, type, title, message, userEmail)
      ).rejects.toThrow('Failed to record notification');

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error recording notification',
        expect.objectContaining({
          userId,
          type,
          title,
          errorMessage: createError.message,
        })
      );
    });
  });

  describe('projectCreated', () => {
    it('delegates to record with correct parameters', async () => {
      const userId = 'user-1';
      const userEmail = 'user@example.com';
      const project = { _id: 'proj-1', name: 'Proj', code: 'P1' };

      const createdNotification = { _id: 'notif-proj-created' };
      Notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.projectCreated(
        userId,
        userEmail,
        project
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type: 'project_created',
        title: 'Project created',
        message: 'Project "Proj" (P1) was created.',
      });
      expect(result).toEqual(createdNotification);
    });

    it('logs and rethrows when record throws', async () => {
      const userId = 'user-1';
      const userEmail = 'user@example.com';
      const project = { _id: 'proj-1', name: 'Proj', code: 'P1' };
      const err = new Error('DB failure');
      Notification.create.mockRejectedValue(err);

      await expect(
        notificationService.projectCreated(userId, userEmail, project)
      ).rejects.toThrow('Failed to record notification');

      expect(loggerMock.error).toHaveBeenNthCalledWith(
        2,
        'Error in projectCreated notification',
        expect.objectContaining({
          userId,
          userEmail,
          projectId: project._id,
          errorMessage: 'Failed to record notification',
        })
      );
    });
  });

  describe('projectUpdated', () => {
    it('delegates to record with correct parameters and no email', async () => {
      const userId = 'user-2';
      const userEmail = 'user2@example.com';
      const project = { _id: 'proj-2', name: 'Proj2', code: 'P2' };

      const createdNotification = { _id: 'notif-proj-updated' };
      Notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.projectUpdated(
        userId,
        userEmail,
        project
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type: 'project_updated',
        title: 'Project updated',
        message: 'Project "Proj2" (P2) was updated.',
      });
      expect(result).toEqual(createdNotification);
    });
  });

  describe('projectDeleted', () => {
    it('delegates to record with correct parameters', async () => {
      const userId = 'user-3';
      const userEmail = 'user3@example.com';
      const name = 'Proj3';
      const code = 'P3';

      const createdNotification = { _id: 'notif-proj-deleted' };
      Notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.projectDeleted(
        userId,
        userEmail,
        name,
        code
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type: 'project_deleted',
        title: 'Project deleted',
        message: 'Project "Proj3" (P3) was deleted.',
      });
      expect(result).toEqual(createdNotification);
    });
  });

  describe('taskCreated', () => {
    it('delegates to record with correct parameters and no email', async () => {
      const userId = 'user-4';
      const userEmail = 'user4@example.com';
      const task = { _id: 'task-1', title: 'Task 1' };
      const projectName = 'Project A';

      const createdNotification = { _id: 'notif-task-created' };
      Notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.taskCreated(
        userId,
        userEmail,
        task,
        projectName
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type: 'task_created',
        title: 'Task created',
        message: 'Task "Task 1" was added to Project A.',
      });
      expect(result).toEqual(createdNotification);
    });
  });

  describe('taskUpdated', () => {
    it('delegates to record with correct parameters and no email', async () => {
      const userId = 'user-5';
      const userEmail = 'user5@example.com';
      const task = { _id: 'task-2', title: 'Task 2' };
      const projectName = 'Project B';

      const createdNotification = { _id: 'notif-task-updated' };
      Notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.taskUpdated(
        userId,
        userEmail,
        task,
        projectName
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type: 'task_updated',
        title: 'Task updated',
        message: 'Task "Task 2" was updated in Project B.',
      });
      expect(result).toEqual(createdNotification);
    });
  });

  describe('taskDeleted', () => {
    it('delegates to record with correct parameters and no email', async () => {
      const userId = 'user-6';
      const userEmail = 'user6@example.com';
      const title = 'Task 3';
      const projectName = 'Project C';

      const createdNotification = { _id: 'notif-task-deleted' };
      Notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.taskDeleted(
        userId,
        userEmail,
        title,
        projectName
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type: 'task_deleted',
        title: 'Task deleted',
        message: 'Task "Task 3" was deleted from Project C.',
      });
      expect(result).toEqual(createdNotification);
    });
  });
});
