const OpenAI = require("openai");

async function moderateContent(content, apiKey) {
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.moderations.create({
      input: content,
    });
    console.log('Moderation response received:', response);
    return {
      flagged: response.results[0].flagged,
      categories: response.results[0].categories,
      category_scores: response.results[0].category_scores
    };
  } catch (error) {
    console.error('Error in content moderation:', error.message, error.stack);
    throw error;
  }
}

module.exports = { moderateContent };