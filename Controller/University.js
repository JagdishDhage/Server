const University = require('../Model/University');

/* ---------------- University Operations ---------------- */

// GET /universities - Get all universities
exports.getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find();
    res.status(200).json(universities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /universities/:id - Get a single university by ID
exports.getUniversityById = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ error: "University not found" });
    res.status(200).json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /universities - Create a new university (with nested courses/subjects if desired)
exports.createUniversity = async (req, res) => {
  try {
    // Convert all string fields to lowercase
    const requestData = JSON.parse(JSON.stringify(req.body), (key, value) => 
      typeof value === "string" ? value.toLowerCase() : value
    );

    const newUniversity = new University(requestData);
    await newUniversity.save();
    
    res.status(201).json(newUniversity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// PUT /universities/:id - Update university details
exports.updateUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!university) return res.status(404).json({ error: "University not found" });
    res.status(200).json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /universities/:id - Delete a university
exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) return res.status(404).json({ error: "University not found" });
    res.status(200).json({ message: "University deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ---------------- Course Operations ---------------- */

// GET /universities/:id/courses - Get all courses for a university
exports.getAllCoursesInUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ error: "University not found" });
    res.status(200).json(university.courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /universities/:id/courses/:courseId - Get a specific course
exports.getCourseById = async (req, res) => {
  try {
    const { id, courseId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    const course = university.courses.id(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /universities/:id/courses - Add a new course to a university
exports.addCourseToUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ error: "University not found" });
    university.courses.push(req.body); // req.body should contain course details
    await university.save();
    res.status(201).json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /universities/:id/courses/:courseId - Update a course within a university
exports.updateCourseInUniversity = async (req, res) => {
  try {
    const { id, courseId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    const course = university.courses.id(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Merge updates
    course.set(req.body);
    await university.save();
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /universities/:id/courses/:courseId - Remove a course from a university
exports.deleteCourseFromUniversity = async (req, res) => {
  try {
    const { id, courseId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    university.courses.id(courseId).remove();
    await university.save();
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ---------------- Subject Operations ---------------- */


exports.getAllSubjects = async (req, res) => {
  try {
    const universities = await University.find();

    let allSubjects = [];

    universities.forEach(university => {
      university.courses.forEach(course => {
        allSubjects = allSubjects.concat(course.subjects);
      });
    });

    res.status(200).json(allSubjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /universities/:id/courses/:courseId/subjects - Get all subjects for a course
exports.getAllSubjectsInCourse = async (req, res) => {
  try {
    const { id, courseId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    const course = university.courses.id(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    res.status(200).json(course.subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /universities/:id/courses/:courseId/subjects/:subjectId - Get a specific subject
exports.getSubjectById = async (req, res) => {
  try {
    const { id, courseId, subjectId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    const course = university.courses.id(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    const subject = course.subjects.id(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /universities/:id/courses/:courseId/subjects - Add a new subject to a course
exports.addSubjectToCourse = async (req, res) => {
  try {
    const { id, courseId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    const course = university.courses.id(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    course.subjects.push(req.body); // req.body should contain subject details
    await university.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /universities/:id/courses/:courseId/subjects/:subjectId - Update a subject within a course
exports.updateSubjectInCourse = async (req, res) => {
  try {
    const { id, courseId, subjectId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    const course = university.courses.id(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    const subject = course.subjects.id(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    
    subject.set(req.body);
    await university.save();
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /universities/:id/courses/:courseId/subjects/:subjectId - Remove a subject from a course
exports.deleteSubjectFromCourse = async (req, res) => {
  try {
    const { id, courseId, subjectId } = req.params;
    const university = await University.findById(id);
    if (!university) return res.status(404).json({ error: "University not found" });
    
    const course = university.courses.id(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    course.subjects.id(subjectId).remove();
    await university.save();
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};