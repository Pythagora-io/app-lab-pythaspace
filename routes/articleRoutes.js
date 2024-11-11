const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAuthenticated } = require('./middleware/authMiddleware');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Ensuring unique filenames
  }
});

const upload = multer({ storage: storage });

// GET route for the article creation page
router.get('/create', isAuthenticated, (req, res) => {
  res.render('createArticle', {
    script: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js' // Including TinyMCE script for client-side
  });
});

// POST route for handling article submission
router.post('/create', isAuthenticated, upload.single('image'), (req, res) => {
  // Handle article creation (to be implemented in the next task)
  try {
    // Placeholder for article creation logic
    console.log('Article creation request:', req.body, 'File:', req.file);
    res.redirect('/'); // Temporary redirect after successful submission
  } catch (error) {
    console.error('Error handling article submission:', error.message);
    console.error(error.stack);
    res.status(500).send('Error submitting article');
  }
});

module.exports = router;