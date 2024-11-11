const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  status: { type: String, enum: ['draft', 'published', 'moderation_failed'], default: 'draft' },
  image: { type: String },
  moderationStatus: {
    flagged: { type: Boolean, default: false },
    categories: { type: Object, default: {} },
    scores: { type: Object, default: {} }
  }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;