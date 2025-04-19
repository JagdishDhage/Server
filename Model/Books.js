const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  university: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  course: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  contentURL: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for search functionality
noteSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  subject: 'text'
});

module.exports = mongoose.model('Note', noteSchema);