const mongoose = require('mongoose');
const Department = require('../Model/Department');

// Controller to get an entire department (including its courses and subjects)
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find(); // Fetch all departments
    if (!departments.length) {
      return res.status(404).json({ error: "No departments found." });
    }
    res.status(200).json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to create a new department with courses and subjects
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, head, contactEmail, courses } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Department name is required.' });
    }
    
    // Create a new Department instance
    const newDepartment = new Department({
      name,
      description,
      head,
      contactEmail,
      courses // Expecting an array of courses, each with its subjects array
    });

    // Save the new department to the database
    const savedDepartment = await newDepartment.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Controller to get only the courses of a department
exports.getDepartmentCourses = async (req, res) => {
  try {
    const departmentId = req.params.departmentId.trim();
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ error: 'Invalid department id.' });
    }
    
    const department = await Department.findById(departmentId, 'courses');
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.status(200).json(department.courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller to get subjects for a specific course in a department


exports.getCourseSubjects = async (req, res) => {
  try {
    // Get raw parameters
    let { departmentId, courseId } = req.params;
    
    // Remove any surrounding quotes and trim whitespace/newline characters
    departmentId = departmentId.replace(/^"+|"+$/g, '').trim();
    courseId = courseId.replace(/^"+|"+$/g, '').trim();

    // Optional: Log sanitized IDs for debugging
    console.log("Sanitized departmentId:", departmentId);
    console.log("Sanitized courseId:", courseId);

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ error: 'Invalid department id.' });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course id.' });
    }
    
    const department = await Department.findById(departmentId, 'courses');
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Use Mongoose's subdocument getter to find the course by its ID
    const course = department.courses.id(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json(course.subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

