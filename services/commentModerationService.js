const { moderateContent } = require('./openaiService');

async function moderateComment(content, apiKey) {
  try {
    const moderationResult = await moderateContent(content, apiKey);
    console.log('Comment moderation result:', moderationResult);
    return moderationResult;
  } catch (error) {
    console.error('Error moderating comment:', error.message, error.stack);
    throw error;
  }
}

module.exports = { moderateComment };