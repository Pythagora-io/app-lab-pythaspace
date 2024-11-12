const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const bcrypt = require('bcrypt');
const { isAuthenticated } = require('./middleware/authMiddleware');
const OpenAI = require('openai');

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // User model will automatically hash the password using bcrypt
    await User.create({ username, password });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      return res.redirect('/');
    } else {
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/auth/login');
  });
});

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    delete req.session.errorMessage;
    delete req.session.successMessage;

    res.render('profile', { user, errorMessage, successMessage });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile');
  }
});

router.get('/user-profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const publishedArticles = await Article.find({ author: user._id, status: 'published' }).sort({ createdAt: -1 });
    const draftArticles = await Article.find({ author: user._id, status: 'draft' }).sort({ createdAt: -1 });
    const failedModerationArticles = await Article.find({ author: user._id, status: 'moderation_failed' }).sort({ createdAt: -1 });

    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    delete req.session.errorMessage;
    delete req.session.successMessage;

    res.render('userProfile', {
      user,
      publishedArticles,
      draftArticles,
      failedModerationArticles,
      errorMessage,
      successMessage
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile');
  }
});

router.post('/update-profile', isAuthenticated, async (req, res) => {
  try {
    const { openaiApiKey } = req.body;

    // Verify the OpenAI API key
    const openai = new OpenAI({ apiKey: openaiApiKey });
    await openai.models.list(); // This will throw an error if the key is invalid

    await User.findByIdAndUpdate(req.session.userId, { openaiApiKey });
    req.session.successMessage = 'Profile updated successfully';
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    req.session.errorMessage = 'Invalid OpenAI API key or error updating profile';
    res.redirect('/profile');
  }
});

module.exports = router;