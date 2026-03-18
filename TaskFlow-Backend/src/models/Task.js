const mongoose = require('mongoose');

const TASK_PRIORITIES = ['urgent', 'blocked', 'in_review'];

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'in_review',
    },
  },
  { timestamps: true }
);

taskSchema.statics.PRIORITIES = TASK_PRIORITIES;

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
