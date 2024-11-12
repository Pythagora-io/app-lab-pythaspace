const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const User = require('../../models/User'); // Added to use User model for fetching user's OpenAI API key
const { isAuthenticated } = require('../middleware/authMiddleware');
const { sendLLMRequest } = require('../../services/llm');

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

// Magic Helper endpoint
router.post('/magic-helper', isAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.openaiApiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    const formattedMessage = `Based on the following article title and content, generate 2-3 captivating headings, each with 3-4 sub-headings, and 4-5 killer content ideas for each sub-heading. Format the response as a JSON object with the following structure:

{
  "suggestions": [
    {
      "title": "Captivating Heading",
      "subHeadings": [
        {
          "title": "Engaging Sub-heading",
          "contentPoints": [
            "Specific and valuable content idea",
            "Specific and valuable content idea",
            "Specific and valuable content idea",
            "Specific and valuable content idea",
            "Specific and valuable content idea"
          ]
        },
        // Repeat for 3-4 sub-headings
      ]
    },
    // Repeat for 2-3 headings
  ]
}

Ensure that each heading is unique and captivating, each sub-heading is engaging and relevant to its main heading, and each content idea is specific and valuable to the reader. Do not include any numbering or prefixes in the titles or content points.

Title: ${title}

Content: ${content}`;

    const response = await sendLLMRequest('openai', 'gpt-3.5-turbo', formattedMessage, user.openaiApiKey);
    console.log('Raw AI response:', JSON.stringify(response, null, 2));
    const suggestions = parseSuggestions(response);

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Error generating suggestions', message: error.message });
  }
});

function parseSuggestions(response) {
  if (!response || !response.suggestions || !Array.isArray(response.suggestions)) {
    console.error('Invalid response format:', response);
    return { suggestions: [] };
  }

  return response;
}

module.exports = router;