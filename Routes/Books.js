const express = require('express');
const router = express.Router();
const noteController = require('../Controller/Books'); // Make sure this path is correct
const auth = require('../Middlewares/auth'); // Make sure this path is correct
const upload = require('../Middlewares/fileUpload'); // Make sure this path is correct



/**
 * File Upload Routes
 */
// Upload a new note with file
router.post(
  '/upload',
  auth,
  upload.single('file'), // 'file' is the field name in the form
  noteController.uploadNote // Make sure this function exists
);
router.get("/note/:id", noteController.getNoteById);
/**
 * CRUD Operations
 */
// Create a new note (without file upload)
// router.post(
//   '/',
//   auth,
//   noteController.createNote // Make sure this function exists
// );

// Get all notes (with optional filtering)
// router.get(
//   '/',
//   noteController.getAllNotes // Make sure this function exists
// );

// Update a note
router.put(
  '/:id',
  auth,
  upload.single('file'), // Optional file update
  noteController.updateNote // Make sure this function exists
);

// Delete a note
router.delete(
  '/:id',
  auth,
  noteController.deleteNote // Make sure this function exists
);

/**
 * Search Routes
 */
// Search notes
router.get(
  '/search',
  noteController.searchNotes // Make sure this function exists
);

/**
 * Hierarchical Routes
 */
// Get notes by university
// router.get(
//   '/university/:university',
//   noteController.getNotesByUniversity // Make sure this function exists
// );

// // Get notes by university and course
// router.get(
//   '/university/:university/course/:course',
//   noteController.getNotesByCourse // Make sure this function exists
// );

// Get notes by university, course and subject
router.get(
  '/university/:university/course/:course/subject/:subject',
  noteController.getNotesByUniversity // Make sure this function exists
);

// Legacy route for backward compatibility
router.get(
  '/subject/:subject',
  noteController.getNotesBySubject // Make sure this function exists
);

module.exports = router;