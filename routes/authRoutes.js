const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { isAuthenticated } = require('./middleware/authMiddleware');
const OpenAI = require('openai');
const Article = require('../models/Article');

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { error: 'Email already in use' });
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      res.redirect('/');
    } else {
      res.render('login', { error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'An error occurred' });
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
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