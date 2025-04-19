const mongoose = require('mongoose');

// Enhanced Subject Schema with extra validations and fields
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
    unique: true,          // Ensures each subject code is unique
    uppercase: true,       // Store in uppercase for consistency
    trim: true
  },
  credit: { 
    type: Number, 
    required: true,
    min: 0                // Ensure no negative credits
  },
  prerequisites: [{
    type: String,
    trim: true
  }]
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

// Enhanced Course Schema with additional fields and validations
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
  subjects: [SubjectSchema],  // Array of embedded Subject documents
  duration: {               // Duration in months (or change the unit as needed)
    type: Number,
    default: 12
  },
  level: {
    type: String,
    enum: ['Undergraduate', 'Postgraduate', 'Diploma'],
    default: 'Undergraduate'
  },
  faculty: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Enhanced Department Schema with additional details
const DepartmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    trim: true 
  },
  courses: [CourseSchema],    // Array of embedded Course documents
  head: {                     // Department head name
    type: String,
    trim: true
  },
  contactEmail: {             // Validates email format
    type: String,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  }
}, { timestamps: true });

// Export the Department model (which includes Courses and Subjects)
module.exports = mongoose.model('Department', DepartmentSchema);
