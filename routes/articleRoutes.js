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
    console.log('Article creation started');
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
      tags: tags ? JSON.parse(tags).map(tag => tag.value) : [],
      image: imagePath,
      status: moderationResult.flagged ? 'moderation_failed' : 'published',
      moderationStatus: {
        flagged: moderationResult.flagged,
        categories: moderationResult.categories,
        scores: moderationResult.category_scores
      }
    });

    await newArticle.save();
    console.log('Article saved successfully:', newArticle._id);

    if (moderationResult.flagged) {
      console.log('Moderation failed, rendering moderationFailed view');
      res.render('moderationFailed', { article: newArticle });
    } else {
      console.log('Moderation passed, redirecting to article page');
      res.redirect(`/articles/${newArticle._id}`);
    }
  } catch (error) {
    console.error('Error handling article submission:', error);
    res.status(500).send('Error submitting article');
  }
});

// GET route for listing all published articles
router.get('/list', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' }).sort({ createdAt: -1 });
    res.render('articleList', { articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).send('Error fetching articles');
  }
});

// GET route for displaying an individual article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'username');
    if (!article) {
      return res.status(404).send('Article not found');
    }
    res.render('article', { article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).send('Error fetching article');
  }
});

// GET route for displaying articles by category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const articles = await Article.find({ category: category, status: 'published' }).sort({ createdAt: -1 });
    res.render('categoryArticles', { category, articles });
  } catch (error) {
    console.error('Error fetching category articles:', error);
    res.status(500).send('Error fetching category articles');
  }
});

// GET route for displaying articles by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const tag = req.params.tag;
    const articles = await Article.find({ tags: tag, status: 'published' }).sort({ createdAt: -1 });
    res.render('tagArticles', { tag, articles });
  } catch (error) {
    console.error('Error fetching tag articles:', error);
    res.status(500).send('Error fetching tag articles');
  }
});

module.exports = router;