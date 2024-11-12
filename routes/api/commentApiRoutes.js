const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const Article = require('../../models/Article');
const User = require('../../models/User');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { moderateComment } = require('../../services/commentModerationService');

// Create a new comment
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { content, articleId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.openaiApiKey) {
      return res.status(400).json({ message: "OpenAI API key is required to post comments." });
    }

    const moderationResult = await moderateComment(content, user.openaiApiKey);

    if (moderationResult.flagged) {
      return res.status(400).json({
        message: "Comment flagged by moderation system",
        moderationResult
      });
    }

    const newComment = new Comment({
      content,
      author: req.user._id,
      article: articleId
    });
    await newComment.save();

    const article = await Article.findById(articleId);
    article.comments.push(newComment._id);
    await article.save();

    const populatedComment = await Comment.findById(newComment._id).populate('author', 'username');
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error creating a new comment:', error);
    console.error(error.stack);
    res.status(400).json({ message: error.message });
  }
});

// Get comments for an article
router.get('/article/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId })
      .populate('author', 'username')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;