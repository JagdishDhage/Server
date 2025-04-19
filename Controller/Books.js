const Note = require('../Model/Books');
const path = require('path');
const fs = require('fs').promises; // Use Promises API for cleaner async handling

const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error.message);
  }
};

const generateFilePath = async (university, course, subject, filename) => {
  const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const basePath = path.join('uploads', 'notes');
  const structuredPath = path.join(
    sanitize(university),
    sanitize(course),
    sanitize(subject)
  );

  const fullDirPath = path.join(basePath, structuredPath);
  await ensureDirectoryExists(fullDirPath);

  return {
    fullPath: path.join(fullDirPath, filename),
    relativePath: path.join('/', basePath, structuredPath, filename),
  };
};

exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!req.user) return res.status(401).json({ error: 'User not authenticated' });

    const { university, course, subject, title, description, tags } = req.body;
    if (!university || !course || !subject) {
      return res.status(400).json({ error: 'University, course, and subject are required' });
    }

    const { relativePath, fullPath } = await generateFilePath(university, course, subject, req.file.filename);
    await fs.rename(req.file.path, fullPath);

    const note = new Note({
      title,
      description,
      university: university.toLowerCase(),
      course: course.toLowerCase(),
      subject: subject.toLowerCase(),
      contentURL: relativePath,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      uploadedBy: req.user._id,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const existingNote = await Note.findById(id);
    if (!existingNote) return res.status(404).json({ error: 'Note not found' });

    const { university, course, subject } = req.body;

    let newFilePath = existingNote.contentURL;
    if (req.file) {
      const { relativePath, fullPath } = await generateFilePath(
        university || existingNote.university,
        course || existingNote.course,
        subject || existingNote.subject,
        req.file.filename
      );

      if (existingNote.contentURL) {
        const oldFilePath = path.join(process.cwd(), existingNote.contentURL);
        if (await fs.stat(oldFilePath).catch(() => false)) {
          await fs.unlink(oldFilePath);
        }
      }

      await fs.rename(req.file.path, fullPath);
      newFilePath = relativePath;
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { ...req.body, contentURL: newFilePath, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getNoteById = async (req, res) => {
  try {
      const { id } = req.params;
      const note = await Note.findById(id);

      if (!note) {
          return res.status(404).json({ error: "Note not found" });
      }

      res.status(200).json(note);
  } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getNotesByUniversity = async (req, res) => {
  try {
    const { university, course, subject } = req.params;
    const notes = await Note.find({
      university: university.toLowerCase(),
      course: course.toLowerCase(),
      subject: subject.toLowerCase(),
    }).sort({ createdAt: -1 });

    if (notes.length === 0) {
      return res.status(404).json({ error: 'No notes found' });
    }
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotesBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const notes = await Note.find({
     
      subject: subject.toLowerCase(),
    }).sort({ createdAt: -1 });

    if (notes.length === 0) {
      return res.status(404).json({ error: 'No notes found' });
    }
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { q, university, course, subject } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    let query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    };

    if (university) query.university = university.toLowerCase();
    if (course) query.course = course.toLowerCase();
    if (subject) query.subject = subject.toLowerCase();

    const notes = await Note.find(query);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (note.contentURL) {
      const filePath = path.join(process.cwd(), note.contentURL);
      if (await fs.stat(filePath).catch(() => false)) {
        await fs.unlink(filePath);
      }
    }

    await Note.findByIdAndDelete(id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
