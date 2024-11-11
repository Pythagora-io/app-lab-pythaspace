const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticated } = require('./middleware/authMiddleware');
const Article = require('../models/Article');
const { saveFile } = require('../utils/fileUpload');

const upload = multer({ storage: multer.memoryStorage() });

// GET route for the article creation page
router.get('/create', isAuthenticated, (req, res) => {
  res.render('createArticle');
});

// POST route for handling article submission
router.post('/create', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const author = req.session.userId;

    let imagePath = null;
    if (req.file) {
      imagePath = saveFile(req.file);
    }

    const newArticle = new Article({
      title,
      content,
      author,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      image: imagePath,
      status: 'draft' // Set initial status as draft
    });

    await newArticle.save();

    res.redirect(`/articles/${newArticle._id}`); // Redirect to the new article page
  } catch (error) {
    console.error('Error handling article submission:', error);
    res.status(500).send('Error submitting article');
  }
});

module.exports = router;