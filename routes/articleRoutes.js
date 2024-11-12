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
  console.log('Received article creation request');
  console.log('Request body:', req.body);
  console.log('File:', req.file);

  try {
    console.log('Article creation started');
    const { title, content, category, tags, action } = req.body;
    console.log('Parsed data:', { title, content, category, tags, action });
    const author = req.session.userId;

    let imagePath = null;
    if (req.file) {
      imagePath = await saveFile(req.file);
    }

    const user = await User.findById(author);
    if (!user) {
      return res.status(400).send('User not found');
    }

    if (!user.openaiApiKey) {
      return res.status(400).json({
        error: 'OpenAI API key is required',
        message: 'Please set your OpenAI API key in your profile settings.',
        redirectUrl: '/profile'
      });
    }

    let status = 'draft';
    let moderationResult = null;

    if (action === 'publish') {
      try {
        // Moderate content only if publishing
        moderationResult = await moderateContent(content, user.openaiApiKey);
        status = moderationResult.flagged ? 'moderation_failed' : 'published';
      } catch (moderationError) {
        console.error('Error during content moderation:', moderationError);
        return res.status(400).send('Error during content moderation. Please try again.');
      }
    }

    const newArticle = new Article({
      title,
      content,
      author,
      category,
      tags: tags ? JSON.parse(tags).map(tag => tag.value) : [],
      image: imagePath,
      status: status,
      moderationStatus: moderationResult ? {
        flagged: moderationResult.flagged,
        categories: moderationResult.categories,
        scores: moderationResult.category_scores
      } : null
    });

    await newArticle.save();
    console.log('Article saved successfully:', newArticle._id);

    if (action === 'publish' && moderationResult && moderationResult.flagged) {
      console.log('Moderation failed, rendering moderationFailed view');
      res.render('moderationFailed', { article: newArticle });
    } else {
      console.log(`Article ${action === 'save_draft' ? 'saved as draft' : 'published'}, redirecting to article page`);
      res.redirect(`/articles/${newArticle._id}`);
    }
  } catch (error) {
    console.error('Error in article creation:', error);
    res.status(400).json({
      error: 'Error submitting article',
      message: error.message
    });
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
    const showModeration = req.query.showModeration === 'true';
    res.render('article', { article, showModeration });
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

// Get edit article page
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    console.log('Attempting to edit article:', req.params.id);
    console.log('User ID:', req.session.userId);
    const article = await Article.findById(req.params.id);
    if (!article) {
      console.log('Article not found');
      return res.status(404).send('Article not found');
    }
    console.log('Article author:', article.author);
    console.log('Session user ID:', req.session.userId);
    if (article.author._id.toString() !== req.session.userId) {
      console.log('Authorization failed');
      return res.status(403).send('You are not authorized to edit this article');
    }
    console.log('Authorization successful, rendering edit page');
    res.render('editArticle', { article });
  } catch (error) {
    console.error('Error fetching article for editing:', error);
    res.status(500).send('Error fetching article for editing');
  }
});

// Update article
router.post('/:id/edit', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, tags, action } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).send('Article not found');
    }
    if (article.author._id.toString() !== req.session.userId) {
      return res.status(403).send('You are not authorized to edit this article');
    }

    article.title = title;
    article.content = content;
    article.category = category;
    article.tags = tags.split(',').map(tag => tag.trim());

    if (req.file) {
      const imagePath = await saveFile(req.file);
      article.image = imagePath;
    }

    if (action === 'save_draft') {
      article.status = 'draft';
    } else if (action === 'publish') {
      article.status = 'published';
    }

    await article.save();
    console.log(`Article ${action === 'save_draft' ? 'saved as draft' : 'published'} successfully:`, article._id);
    res.redirect(`/articles/${article._id}`);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).send('Error updating article');
  }
});

// Publish article
router.post('/:id/publish', isAuthenticated, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).send('Article not found');
    }
    if (article.author._id.toString() !== req.session.userId) {
      return res.status(403).send('You are not authorized to publish this article');
    }

    const user = await User.findById(req.session.userId);
    const moderationResult = await moderateContent(article.content, user.openaiApiKey);

    if (moderationResult.flagged) {
      article.status = 'moderation_failed';
      article.moderationStatus = {
        flagged: moderationResult.flagged,
        categories: moderationResult.categories,
        scores: moderationResult.category_scores
      };
      await article.save();
      return res.render('moderationFailed', { article });
    }

    article.status = 'published';
    await article.save();
    res.redirect(`/articles/${article._id}`);
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).send('Error publishing article');
  }
});

module.exports = router;