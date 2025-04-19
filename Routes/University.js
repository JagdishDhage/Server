const express = require('express');
const router = express.Router();
const uniController = require('../Controller/University');

/* ---------- University Routes ---------- */
router.get('/universities', uniController.getAllUniversities);
router.get('/universities/:id', uniController.getUniversityById);
router.post('/universities', uniController.createUniversity);
router.put('/universities/:id', uniController.updateUniversity);
router.delete('/universities/:id', uniController.deleteUniversity);

/* ---------- Course Routes (Nested in University) ---------- */
router.post('/universities/:id/courses', uniController.addCourseToUniversity);
router.put('/universities/:id/courses/:courseId', uniController.updateCourseInUniversity);
router.delete('/universities/:id/courses/:courseId', uniController.deleteCourseFromUniversity);

/* ---------- Subject Routes (Nested in Course) ---------- */
router.get('/subjects', uniController.getAllSubjects);
router.get('/universities/:id/courses/:courseId/subjects', uniController.getAllSubjectsInCourse);
router.get('/universities/:id/courses/:courseId/subjects/:subjectId', uniController.getSubjectById);
router.post('/universities/:id/courses/:courseId/subjects', uniController.addSubjectToCourse);
router.put('/universities/:id/courses/:courseId/subjects/:subjectId', uniController.updateSubjectInCourse);
router.delete('/universities/:id/courses/:courseId/subjects/:subjectId', uniController.deleteSubjectFromCourse);

module.exports = router;
