const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 32,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1, code: 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

