const mongoose = require('mongoose');

/**
 * Subject Schema (Embedded)
 * Contains details about each subject within a course.
 */
const SubjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  code: {       
    type: String,       
    required: true,
    unique: true,         // Each subject code must be unique
    uppercase: true,      // Stored in uppercase for consistency
    trim: true
  },
  credit: { 
    type: Number, 
    required: true,
    min: 0                // No negative credits allowed
  },
  prerequisites: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });


const CourseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  duration: { 
    type: Number, 
    default: 12  // Duration in months
  },
  level: { 
    type: String, 
    enum: ['undergraduate', 'postgraduate', 'diploma'], 
    default: 'undergraduate' 
  },
  faculty: [{
    type: String,
    trim: true
  }],
  subjects: [SubjectSchema]  // Array of subjects for this course
}, { timestamps: true });


const UniversitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  location: { 
    type: String, 
    trim: true 
  },
  contactEmail: { 
    type: String,
    lowercase: true, 
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  website: { 
    type: String, 
    trim: true 
  },
  established: { 
    type: Date 
  },
  courses: [CourseSchema]   // Array of courses offered by the university
}, { timestamps: true });


module.exports = mongoose.model('University', UniversitySchema);
 