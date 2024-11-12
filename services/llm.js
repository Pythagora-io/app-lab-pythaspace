const axios = require('axios');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendRequestToOpenAI(model, message, apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Error sending request to OpenAI (attempt ${i + 1}):`, error.message, error.stack);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendRequestToAnthropic(model, message) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Sending request to Anthropic with model: ${model} and message: ${message}`);
      const response = await anthropic.messages.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      console.log(`Received response from Anthropic: ${JSON.stringify(response.content)}`);
      return response.content[0].text;
    } catch (error) {
      console.error(`Error sending request to Anthropic (attempt ${i + 1}):`, error.message, error.stack);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendLLMRequest(provider, model, message, apiKey) {
  let response;
  switch (provider.toLowerCase()) {
    case 'openai':
      response = await sendRequestToOpenAI(model, message, apiKey);
      break;
    case 'anthropic':
      response = await sendRequestToAnthropic(model, message);
      break;
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  if (typeof response === 'string') {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return { suggestions: [] };
    }
  } else if (typeof response === 'object' && response !== null) {
    return response;
  } else {
    console.error('Invalid response format:', response);
    return { suggestions: [] };
  }
}

module.exports = {
  sendLLMRequest
};