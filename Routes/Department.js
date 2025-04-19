const express = require('express');
const router = express.Router();
const departmentController = require('../Controller/Department');

// Route to get full department data including courses and subjects
router.get('/departments', departmentController.getAllDepartments);

// Route to get only the courses for a department
router.get('/departments/:departmentId/courses', departmentController.getDepartmentCourses);

router.post('/departments', departmentController.createDepartment);

// Route to get subjects for a specific course in a department
router.get('/departments/:departmentId/courses/:courseId/subjects', departmentController.getCourseSubjects);

module.exports = router;
