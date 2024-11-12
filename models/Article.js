const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Science', 'Health & Wellness', 'Business & Finance', 'Arts & Culture', 'Lifestyle']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'moderation_failed'],
    default: 'draft'
  },
  image: {
    type: String
  },
  moderationStatus: {
    flagged: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Object,
      default: {}
    },
    scores: {
      type: Object,
      default: {}
    }
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, { timestamps: true });

// Add a method to populate author information
articleSchema.pre('find', function() {
  this.populate('author', 'username');
});

articleSchema.pre('findOne', function() {
  this.populate('author', 'username');
});

articleSchema.index({ tags: 1 });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;