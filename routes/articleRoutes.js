const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticated } = require('./middleware/authMiddleware');
const Article = require('../models/Article');
const User = require('../models/User');
const { saveFile } = require('../utils/fileUpload');
const { moderateContent } = require('../services/openaiService');

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

    const user = await User.findById(author);
    if (!user.openaiApiKey) {
      return res.status(400).send('OpenAI API key is required. Please update your profile.');
    }

    // Moderate content
    const moderationResult = await moderateContent(content, user.openaiApiKey);

    const newArticle = new Article({
      title,
      content,
      author,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      image: imagePath,
      status: moderationResult.flagged ? 'moderation_failed' : 'published',
      moderationStatus: {
        flagged: moderationResult.flagged,
        categories: moderationResult.categories,
        scores: moderationResult.category_scores
      }
    });

    await newArticle.save();

    if (moderationResult.flagged) {
      res.render('moderationFailed', { article: newArticle });
    } else {
      res.redirect(`/articles/${newArticle._id}`);
    }
  } catch (error) {
    console.error('Error handling article submission:', error);
    res.status(500).send('Error submitting article');
  }
});

module.exports = router;