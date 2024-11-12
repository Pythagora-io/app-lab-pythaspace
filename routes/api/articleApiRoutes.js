const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Create a new article
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const newArticle = new Article({
      title,
      content,
      author: req.user._id,
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      status: 'draft'
    });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating a new article:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'username');
    res.json(articles);
  } catch (error) {
    console.error('Error fetching all articles:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'username');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    console.error('Error fetching a single article:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update an article
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own articles' });
    }

    article.title = title;
    article.content = content;
    article.category = category;
    article.tags = tags.split(',').map(tag => tag.trim());
    article.status = status;

    await article.save();
    res.json(article);
  } catch (error) {
    console.error('Error updating an article:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete an article
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own articles' });
    }

    await article.remove();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting an article:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;